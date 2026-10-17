import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { EntitlementRow } from "./entitlement.ts";
import type { ServerEnv } from "./env.ts";
import type { PaymentRow } from "./fields.ts";
import type { PlanId, CurrencyCode } from "./plans.ts";
import type { WebhookState, WebhookWrite } from "./webhook.ts";

export function serviceClient(env: ServerEnv): SupabaseClient {
  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

type PaymentRecord = {
  tx_ref: string;
  flutterwave_transaction_id: string | null;
  user_id: string;
  plan: PlanId;
  amount: number | string;
  currency: CurrencyCode;
  status: PaymentRow["status"];
  verified_at: string | null;
};

type EntitlementRecord = {
  user_id: string;
  plan: PlanId;
  status: EntitlementRow["status"];
  provider: string;
  current_period_start: string | null;
  current_period_end: string | null;
};

const toPayment = (row: PaymentRecord, email: string): PaymentRow => ({
  txRef: row.tx_ref,
  flwId: row.flutterwave_transaction_id,
  userId: row.user_id,
  plan: row.plan,
  amount: Number(row.amount),
  currency: row.currency,
  status: row.status,
  verifiedAt: row.verified_at,
  email,
});

const toEntitlement = (row: EntitlementRecord): EntitlementRow => ({
  userId: row.user_id,
  plan: row.plan,
  status: row.status,
  provider: row.provider,
  currentPeriodStart: row.current_period_start,
  currentPeriodEnd: row.current_period_end,
});

export async function upsertProfile(env: ServerEnv, user: { id: string; email: string }): Promise<void> {
  const db = serviceClient(env);
  const { error } = await db.from("profiles").upsert({ user_id: user.id, email: user.email.toLowerCase() }, { onConflict: "user_id" });
  if (error) throw new Error("profile");
}

export async function insertPendingPayment(env: ServerEnv, row: PaymentRow): Promise<void> {
  const db = serviceClient(env);
  const { error } = await db.from("payments").insert({
    tx_ref: row.txRef,
    flutterwave_transaction_id: null,
    user_id: row.userId,
    plan: row.plan,
    amount: row.amount,
    currency: row.currency,
    status: "pending",
  });
  if (error) throw new Error("payment");
}

export async function markPaymentFailed(env: ServerEnv, txRef: string): Promise<void> {
  const db = serviceClient(env);
  await db.from("payments").update({ status: "failed" }).eq("tx_ref", txRef).eq("status", "pending");
}

export async function loadBillingState(env: ServerEnv, input: { txRef: string | null; email: string | null; eventKey: string | null }): Promise<WebhookState> {
  const db = serviceClient(env);
  const payments: PaymentRow[] = [];
  const profiles: { id: string; email: string }[] = [];
  if (input.txRef) {
    const { data, error } = await db.from("payments").select("tx_ref,flutterwave_transaction_id,user_id,plan,amount,currency,status,verified_at").eq("tx_ref", input.txRef);
    if (error) throw new Error("payments");
    for (const row of (data ?? []) as PaymentRecord[]) {
      const { data: profile } = await db.from("profiles").select("user_id,email").eq("user_id", row.user_id).maybeSingle();
      const email = (profile as { email?: string | null } | null)?.email?.toLowerCase() ?? "";
      if (profile && email) profiles.push({ id: row.user_id, email });
      payments.push(toPayment(row, email));
    }
  }
  if (input.email) {
    const { data, error } = await db.from("profiles").select("user_id,email").ilike("email", input.email.toLowerCase());
    if (error) throw new Error("profiles");
    for (const row of (data ?? []) as { user_id: string; email: string | null }[]) {
      const email = row.email?.toLowerCase() ?? "";
      if (email === input.email.toLowerCase() && !profiles.some(profile => profile.id === row.user_id)) profiles.push({ id: row.user_id, email });
    }
  }
  const userIds = [...new Set([...payments.map(row => row.userId), ...profiles.map(row => row.id)])];
  let entitlements: EntitlementRow[] = [];
  if (userIds.length) {
    const { data, error } = await db.from("entitlements").select("user_id,plan,status,provider,current_period_start,current_period_end").in("user_id", userIds);
    if (error) throw new Error("entitlements");
    entitlements = ((data ?? []) as EntitlementRecord[]).map(toEntitlement);
  }
  const events: string[] = [];
  if (input.eventKey) {
    const { data } = await db.from("webhook_events").select("event_key").eq("event_key", input.eventKey).maybeSingle();
    if (data) events.push(input.eventKey);
  }
  return { events, payments, entitlements, profiles };
}

const duplicateKey = (error: { code?: string; message?: string } | null) =>
  error?.code === "23505" || /duplicate key/i.test(error?.message ?? "");

/**
 * Service-role writes. The applied schema has no browser write policies and no apply function.
 * event_key is inserted first. A unique violation is a replay and does not change billing.
 * If a later write fails, the event row is removed so Flutterwave can retry.
 */
export async function applyWebhookWrite(env: ServerEnv, write: WebhookWrite): Promise<"applied" | "duplicate" | "error"> {
  const db = serviceClient(env);
  const { error: eventError } = await db.from("webhook_events").insert({ event_key: write.eventKey });
  if (duplicateKey(eventError)) return "duplicate";
  if (eventError) return "error";
  const payment = write.payment ? {
    tx_ref: write.payment.txRef,
    flutterwave_transaction_id: write.payment.flwId,
    user_id: write.payment.userId,
    plan: write.payment.plan,
    amount: write.payment.amount,
    currency: write.payment.currency,
    status: write.payment.status,
    verified_at: write.payment.verifiedAt,
  } : null;
  const entitlement = write.entitlement ? {
    user_id: write.entitlement.userId,
    plan: write.entitlement.plan,
    status: write.entitlement.status,
    provider: write.entitlement.provider,
    current_period_start: write.entitlement.currentPeriodStart,
    current_period_end: write.entitlement.currentPeriodEnd,
  } : null;
  const paymentResult = payment ? await db.from("payments").upsert(payment, { onConflict: "tx_ref" }) : { error: null };
  const entitlementResult = !paymentResult.error && entitlement
    ? await db.from("entitlements").upsert(entitlement, { onConflict: "user_id" })
    : { error: paymentResult.error };
  if (paymentResult.error || entitlementResult.error) {
    await db.from("webhook_events").delete().eq("event_key", write.eventKey);
    return "error";
  }
  await db.from("webhook_events").update({ processed_at: new Date().toISOString() }).eq("event_key", write.eventKey);
  return "applied";
}

export async function readOwnStatus(env: ServerEnv, userId: string): Promise<EntitlementRow | null> {
  const db = serviceClient(env);
  const { data, error } = await db.from("entitlements").select("user_id,plan,status,provider,current_period_start,current_period_end").eq("user_id", userId).maybeSingle();
  if (error) throw new Error("status");
  if (!data) return null;
  return toEntitlement(data as EntitlementRecord);
}
