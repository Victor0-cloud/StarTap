import { cancelEntitlement, entitlementIsActive, extendEntitlement, type EntitlementRow } from "./entitlement.ts";
import { hashesMatch } from "./hash.ts";
import { moneyEqual } from "./money.ts";
import { isCurrency, isPlanId, planForAmount, planIdMatches, type CurrencyCode, type PlanId } from "./plans.ts";
import { parseTxRef, publicWebhookFields, type PaymentRow, type SafeEvent, type VerifiedTx } from "./fields.ts";

export type ProfileRow = { id: string; email: string };

export type WebhookState = {
  events: string[];
  payments: PaymentRow[];
  entitlements: EntitlementRow[];
  profiles: ProfileRow[];
};

export type WebhookWrite = {
  eventKey: string;
  eventType: string;
  payment: PaymentRow | null;
  entitlement: EntitlementRow | null;
};

export type WebhookOutcome = {
  status: number;
  body: Record<string, unknown>;
  state: WebhookState;
  write: WebhookWrite | null;
};

const empty = (state: WebhookState, status: number, body: Record<string, unknown>): WebhookOutcome =>
  ({ status, body, state, write: null });

const clone = (state: WebhookState): WebhookState => ({
  events: [...state.events],
  payments: state.payments.map(row => ({ ...row })),
  entitlements: state.entitlements.map(row => ({ ...row })),
  profiles: state.profiles.map(row => ({ ...row })),
});

function applyWrite(state: WebhookState, write: WebhookWrite): WebhookState {
  const next = clone(state);
  if (!next.events.includes(write.eventKey)) next.events.push(write.eventKey);
  if (write.payment) {
    const index = next.payments.findIndex(row => row.txRef === write.payment!.txRef);
    if (index >= 0) next.payments[index] = write.payment;
    else next.payments.push(write.payment);
  }
  if (write.entitlement) {
    const index = next.entitlements.findIndex(row => row.userId === write.entitlement!.userId);
    if (index >= 0) next.entitlements[index] = write.entitlement;
    else next.entitlements.push(write.entitlement);
  }
  return next;
}

function finish(state: WebhookState, write: WebhookWrite, body: Record<string, unknown>): WebhookOutcome {
  if (state.events.includes(write.eventKey)) return empty(state, 200, { received: true, duplicate: true });
  return { status: 200, body, state: applyWrite(state, write), write };
}

function profileByEmail(state: WebhookState, email: string | null): ProfileRow | null {
  if (!email) return null;
  return state.profiles.find(row => row.email.toLowerCase() === email) ?? null;
}

/**
 * The provider email is not an identity check. Test mode rewrites it (ravesb_<hex>_…),
 * and the StarTap user is the one already stored on the payment row.
 * meta.user_id is accepted only when it matches that stored user.
 */
function mismatches(tx: VerifiedTx, payment: PaymentRow, env: Record<string, string | undefined>): string | null {
  if (tx.status !== "successful") return "status";
  if (!moneyEqual(tx.amount, payment.amount)) return "amount";
  if (tx.currency.toUpperCase() !== payment.currency) return "currency";
  const parsed = parseTxRef(payment.txRef);
  if (!parsed || parsed.userId !== payment.userId.toLowerCase() || parsed.plan !== payment.plan || parsed.currency !== payment.currency) return "reference";
  if (tx.txRef !== payment.txRef) return "reference";
  if (payment.flwId && payment.flwId !== tx.id) return "transaction";
  if (tx.metaUserId && tx.metaUserId.toLowerCase() !== payment.userId.toLowerCase()) return "user";
  if (tx.metaPlan && tx.metaPlan !== payment.plan) return "plan";
  if (tx.paymentPlanId === null || !planIdMatches(payment.plan, payment.currency, tx.paymentPlanId, env)) return "plan";
  return null;
}

function grant(state: WebhookState, payment: PaymentRow, tx: VerifiedTx, now: Date, env: Record<string, string | undefined>): WebhookOutcome {
  const key = `charge.completed:${tx.id}`;
  const reason = mismatches(tx, payment, env);
  if (reason) {
    return finish(state, {
      eventKey: key,
      eventType: "charge.completed",
      payment: { ...payment, status: "failed", flwId: null, verifiedAt: null },
      entitlement: null,
    }, { received: true, granted: false, reason });
  }
  if (payment.status === "successful") {
    return finish(state, { eventKey: key, eventType: "charge.completed", payment: null, entitlement: null }, { received: true, duplicate: payment.flwId === tx.id, granted: false });
  }
  const existing = state.entitlements.find(row => row.userId === payment.userId) ?? null;
  const entitlement = { ...extendEntitlement(existing, payment.plan, now), userId: payment.userId };
  // Touch env so a mis-configured catalogue cannot grant a plan that no longer resolves.
  if (!planForAmount(payment.amount, payment.currency, env)) {
    return finish(state, {
      eventKey: key,
      eventType: "charge.completed",
      payment: { ...payment, status: "failed" },
      entitlement: null,
    }, { received: true, granted: false, reason: "catalogue" });
  }
  return finish(state, {
    eventKey: key,
    eventType: "charge.completed",
    payment: { ...payment, status: "successful", flwId: tx.id, verifiedAt: now.toISOString() },
    entitlement,
  }, { received: true, granted: true });
}

function storedAssociation(state: WebhookState, userId: string): boolean {
  const id = userId.toLowerCase();
  return state.payments.some(row => row.userId.toLowerCase() === id) || state.entitlements.some(row => row.userId.toLowerCase() === id);
}

function renewal(state: WebhookState, tx: VerifiedTx, now: Date, env: Record<string, string | undefined>): WebhookOutcome {
  const key = `charge.completed:${tx.id}`;
  const reject = (reason: string) => finish(state, { eventKey: key, eventType: "charge.completed", payment: null, entitlement: null }, { received: true, granted: false, reason });
  const parsed = tx.txRef ? parseTxRef(tx.txRef) : null;
  // No email match. A charge with no row for this tx_ref is a renewal only when the tx_ref is one we
  // minted and that user already has a stored payment or entitlement. meta.user_id cannot choose the user.
  if (!parsed || !storedAssociation(state, parsed.userId)) return reject("reference");
  if (tx.metaUserId && tx.metaUserId.toLowerCase() !== parsed.userId) return reject("user");
  const plan = planForAmount(tx.amount, tx.currency, env);
  if (!plan || !isCurrency(tx.currency) || plan.plan !== parsed.plan || plan.currency !== parsed.currency) return reject("reference");
  if (tx.metaPlan && tx.metaPlan !== plan.plan) return reject("plan");
  if (tx.paymentPlanId === null || !planIdMatches(parsed.plan, parsed.currency, tx.paymentPlanId, env)) return reject("plan");
  const profile = state.profiles.find(row => row.id.toLowerCase() === parsed.userId);
  const existing = state.entitlements.find(row => row.userId.toLowerCase() === parsed.userId) ?? null;
  const payment: PaymentRow = {
    txRef: tx.txRef,
    flwId: tx.id,
    userId: parsed.userId,
    plan: plan.plan,
    amount: plan.amount,
    currency: plan.currency,
    status: "successful",
    verifiedAt: now.toISOString(),
    email: profile?.email.toLowerCase() ?? "",
  };
  return finish(state, {
    eventKey: key,
    eventType: "charge.completed",
    payment,
    entitlement: { ...extendEntitlement(existing, plan.plan, now), userId: parsed.userId },
  }, { received: true, granted: true });
}

/**
 * One grant path for the webhook and the signed-in verify route.
 * The event key is charge.completed:<transaction id>. A second call sees that key and does not extend.
 * Passing userId (the verify route) refuses any row that is not already stored for that user.
 */
export function finalizeVerifiedCharge(input: {
  state: WebhookState;
  tx: VerifiedTx;
  env: Record<string, string | undefined>;
  now?: Date;
  userId?: string;
}): WebhookOutcome {
  const now = input.now ?? new Date();
  const key = `charge.completed:${input.tx.id}`;
  if (input.state.events.includes(key)) return empty(input.state, 200, { received: true, duplicate: true });
  if (input.tx.status !== "successful") return empty(input.state, 200, { received: true, granted: false, reason: "status" });
  const payment = input.state.payments.find(row => row.txRef === input.tx.txRef);
  if (input.userId) {
    if (!payment || payment.userId.toLowerCase() !== input.userId.toLowerCase()) return empty(input.state, 404, { error: "Payment not found" });
    return grant(input.state, payment, input.tx, now, input.env);
  }
  if (payment) return grant(input.state, payment, input.tx, now, input.env);
  return renewal(input.state, input.tx, now, input.env);
}

function failCharge(state: WebhookState, event: SafeEvent): WebhookOutcome {
  const key = `charge.completed:${event.id ?? event.txRef ?? "none"}`;
  const payment = event.txRef ? state.payments.find(row => row.txRef === event.txRef) : undefined;
  return finish(state, {
    eventKey: key,
    eventType: "charge.completed",
    payment: payment && payment.status !== "successful" ? { ...payment, status: event.status === "cancelled" ? "cancelled" : "failed", verifiedAt: null } : null,
    entitlement: null,
  }, { received: true, granted: false, reason: "failed" });
}

function cancel(state: WebhookState, event: SafeEvent, env: Record<string, string | undefined>): WebhookOutcome {
  const planId = event.planId;
  const profile = profileByEmail(state, event.email);
  const key = `subscription.cancelled:${event.email ?? "none"}:${planId ?? "none"}`;
  if (!profile || planId === null) {
    return finish(state, { eventKey: key, eventType: "subscription.cancelled", payment: null, entitlement: null }, { received: true, cancelled: false });
  }
  // Only our configured plan ids can cancel. A hash-valid event for some other plan is ignored.
  const configured = Object.entries(env).some(([name, value]) => name.startsWith("FLW_PLAN_") && value?.trim() === String(planId));
  if (!configured) {
    return finish(state, { eventKey: key, eventType: "subscription.cancelled", payment: null, entitlement: null }, { received: true, cancelled: false });
  }
  const existing = state.entitlements.find(row => row.userId === profile.id);
  if (!existing) {
    return finish(state, { eventKey: key, eventType: "subscription.cancelled", payment: null, entitlement: null }, { received: true, cancelled: false });
  }
  return finish(state, {
    eventKey: key,
    eventType: "subscription.cancelled",
    payment: null,
    entitlement: cancelEntitlement(existing),
  }, { received: true, cancelled: true });
}

export async function handleWebhook(input: {
  headerHash: string | null;
  secretHash: string;
  payload: unknown;
  state: WebhookState;
  env: Record<string, string | undefined>;
  now?: Date;
  verify: (id: string) => Promise<{ ok: true; tx: VerifiedTx } | { ok: false; retry: boolean }>;
}): Promise<WebhookOutcome> {
  if (!hashesMatch(input.headerHash, input.secretHash)) return empty(input.state, 401, { error: "Invalid signature" });
  const event = publicWebhookFields(input.payload);
  if (!event) return empty(input.state, 400, { error: "Invalid payload" });
  const now = input.now ?? new Date();
  if (event.event === "subscription.cancelled") return cancel(input.state, event, input.env);
  if (event.event !== "charge.completed") {
    const key = `ignored:${event.event}:${event.id ?? event.txRef ?? "none"}`;
    return finish(input.state, { eventKey: key, eventType: event.event, payment: null, entitlement: null }, { received: true, ignored: true });
  }
  if (!event.id || !/^\d+$/.test(event.id)) return empty(input.state, 400, { error: "Invalid payload" });
  const verified = await input.verify(event.id);
  if (!verified.ok) return empty(input.state, verified.retry ? 500 : 400, { error: verified.retry ? "Verification unavailable" : "Invalid payload" });
  const tx = verified.tx;
  if (tx.id !== event.id) return empty(input.state, 400, { error: "Invalid payload" });
  if (input.state.events.includes(`charge.completed:${tx.id}`)) return empty(input.state, 200, { received: true, duplicate: true });
  if (tx.status !== "successful") return failCharge(input.state, { ...event, txRef: tx.txRef, id: tx.id, status: tx.status });
  return finalizeVerifiedCharge({ state: input.state, tx, now, env: input.env });
}

export function premiumFromState(state: WebhookState, userId: string, now: Date): { isPremium: boolean; entitlement: EntitlementRow | null } {
  const entitlement = state.entitlements.find(row => row.userId === userId) ?? null;
  return { isPremium: entitlementIsActive(entitlement, now), entitlement };
}

export function isPlan(value: string | null | undefined): value is PlanId {
  return isPlanId(value);
}

export function isKnownCurrency(value: string | null | undefined): value is CurrencyCode {
  return isCurrency(value);
}
