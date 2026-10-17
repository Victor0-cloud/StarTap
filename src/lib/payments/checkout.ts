import { entitlementIsActive, type EntitlementRow } from "./entitlement.ts";
import type { ServerEnv } from "./env.ts";
import { paymentsLive } from "./env.ts";
import { readPreference, resolveQuote } from "./pricing.ts";
import type { ResolvedPlan } from "./plans.ts";
import { successRedirect } from "./redirect.ts";
import { txRefFor, type PaymentRow } from "./fields.ts";

export type CheckoutUser = { id: string; email: string };

export type ProviderCheckout = {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  payment_plan: number;
  customer: { email: string; name: string };
  customizations: { title: string; description: string };
  meta: { user_id: string; plan: string; currency: string };
};

export type CheckoutResult = {
  status: number;
  body: Record<string, unknown>;
  providerBody?: ProviderCheckout;
  pending?: PaymentRow;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Build a hosted-checkout request from the server catalogue.
 * `amount`, `price`, `country`, `redirect_url`, `successUrl` and `tx_ref` on the client body are ignored.
 * `currency` may only be "local" or "USD".
 */
export function buildCheckout(input: {
  user: CheckoutUser | null;
  body: unknown;
  env: Record<string, string | undefined>;
  requestUrl: string;
  /** Platform geo header. Ignored when STARTAP_GEO_COUNTRY is set. Never read from the body. */
  countryHeader?: string | null;
  id?: string;
}): { ok: true; plan: ResolvedPlan; txRef: string; providerBody: ProviderCheckout; pending: PaymentRow } | { ok: false; status: number; error: string } {
  if (!paymentsLive(input.env)) return { ok: false, status: 503, error: "Payments are not available" };
  if (!input.user?.id || !input.user.email || !UUID.test(input.user.id)) return { ok: false, status: 401, error: "Sign in required" };
  const record = input.body !== null && typeof input.body === "object" ? input.body as Record<string, unknown> : {};
  const preference = readPreference(record.currency);
  if (preference === "invalid") return { ok: false, status: 400, error: "Choose local or USD" };
  const quote = resolveQuote({ env: input.env, countryHeader: input.countryHeader, preference, plan: record.plan });
  if (!quote.ok || !quote.selected) return { ok: false, status: quote.ok ? 400 : quote.status, error: quote.ok ? "Choose a monthly or yearly plan" : quote.error };
  const plan = quote.selected;
  const id = input.id ?? crypto.randomUUID();
  const txRef = txRefFor(input.user.id, plan.plan, plan.currency, id);
  const email = input.user.email.trim().toLowerCase();
  const providerBody: ProviderCheckout = {
    tx_ref: txRef,
    amount: plan.amount,
    currency: plan.currency,
    redirect_url: successRedirect(input.requestUrl),
    payment_plan: plan.paymentPlanId,
    customer: { email, name: email },
    customizations: { title: "StarTap Premium", description: `${plan.label} · ${plan.currency}` },
    meta: { user_id: input.user.id, plan: plan.plan, currency: plan.currency },
  };
  const pending: PaymentRow = {
    txRef,
    flwId: null,
    userId: input.user.id,
    plan: plan.plan,
    amount: plan.amount,
    currency: plan.currency,
    status: "pending",
    verifiedAt: null,
    email,
  };
  return { ok: true, plan, txRef, providerBody, pending };
}

export async function createCheckout(input: {
  user: CheckoutUser | null;
  body: unknown;
  env: Record<string, string | undefined>;
  requestUrl: string;
  id?: string;
  countryHeader?: string | null;
  insertPending: (row: PaymentRow) => Promise<void>;
  markFailed: (txRef: string) => Promise<void>;
  createLink: (payload: ProviderCheckout, secretKey: string) => Promise<{ ok: true; link: string } | { ok: false }>;
  server?: ServerEnv | null;
  entitlement?: EntitlementRow | null;
  now?: Date;
}): Promise<CheckoutResult> {
  const built = buildCheckout(input);
  if (!built.ok) return { status: built.status, body: { error: built.error } };
  if (entitlementIsActive(input.entitlement ?? null, input.now ?? new Date())) {
    return { status: 409, body: { error: "already_premium" } };
  }
  const secret = input.server?.flwSecretKey ?? input.env.FLW_SECRET_KEY;
  if (!secret) return { status: 503, body: { error: "Payments are not available" } };
  try {
    await input.insertPending(built.pending);
  } catch {
    return { status: 500, body: { error: "Checkout could not be started" } };
  }
  const link = await input.createLink(built.providerBody, secret);
  if (!link.ok) {
    try { await input.markFailed(built.txRef); } catch { /* the pending row stays pending and is never granted */ }
    return { status: 502, body: { error: "Checkout could not be started" }, providerBody: built.providerBody, pending: built.pending };
  }
  return { status: 200, body: { link: link.link }, providerBody: built.providerBody, pending: built.pending };
}
