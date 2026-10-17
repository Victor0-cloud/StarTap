import type { CurrencyCode, PlanId } from "./plans.ts";

/** Fields we are willing to keep from a webhook. Card, token, phone and account numbers are dropped. */
export type SafeEvent = {
  event: string;
  id: string | null;
  txRef: string | null;
  status: string | null;
  amount: number | null;
  currency: string | null;
  email: string | null;
  planId: number | null;
  metaUserId: string | null;
  metaPlan: string | null;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;

const asString = (value: unknown): string | null => typeof value === "string" && value.trim() ? value.trim() : null;

const asNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
};

/** Read only the fields the billing logic needs. The card object is never copied. */
export function publicWebhookFields(payload: unknown): SafeEvent | null {
  const root = asRecord(payload);
  if (!root) return null;
  const event = asString(root.event);
  if (!event) return null;
  const data = asRecord(root.data) ?? {};
  const customer = asRecord(data.customer);
  const plan = asRecord(data.plan);
  const meta = asRecord(data.meta);
  const idNumber = asNumber(data.id);
  return {
    event,
    id: idNumber !== null && Number.isSafeInteger(idNumber) ? String(idNumber) : asString(data.id),
    txRef: asString(data.tx_ref),
    status: asString(data.status),
    amount: asNumber(data.amount),
    currency: asString(data.currency)?.toUpperCase() ?? null,
    email: asString(customer?.email)?.toLowerCase() ?? null,
    planId: asNumber(plan?.id),
    metaUserId: asString(meta?.user_id),
    metaPlan: asString(meta?.plan),
  };
}

export type VerifiedTx = {
  id: string;
  txRef: string;
  amount: number;
  currency: string;
  status: string;
  email: string | null;
  metaUserId: string | null;
  metaPlan: string | null;
  /** Flutterwave payment_plan id from the verify response. Null when the provider omits it. */
  paymentPlanId: number | null;
};

function paymentPlanId(data: Record<string, unknown>): number | null {
  const direct = asNumber(data.payment_plan);
  if (direct !== null && Number.isSafeInteger(direct) && direct > 0) return direct;
  const nested = asNumber(asRecord(data.plan)?.id);
  if (nested !== null && Number.isSafeInteger(nested) && nested > 0) return nested;
  return null;
}

/** Map a verify-transaction JSON body. Card and token fields are ignored. */
export function publicVerifiedTransaction(payload: unknown): VerifiedTx | null {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  if (!data) return null;
  const id = asNumber(data.id);
  const txRef = asString(data.tx_ref);
  const amount = asNumber(data.amount);
  const currency = asString(data.currency);
  const status = asString(data.status);
  if (id === null || !Number.isSafeInteger(id) || !txRef || amount === null || !currency || !status) return null;
  const customer = asRecord(data.customer);
  const meta = asRecord(data.meta);
  return {
    id: String(id),
    txRef,
    amount,
    currency: currency.toUpperCase(),
    status: status.toLowerCase(),
    email: asString(customer?.email)?.toLowerCase() ?? null,
    metaUserId: asString(meta?.user_id),
    metaPlan: asString(meta?.plan),
    paymentPlanId: paymentPlanId(data),
  };
}

/** payments.status check: pending, successful, failed, cancelled. */
export type PaymentStatus = "pending" | "successful" | "failed" | "cancelled";

export type PaymentRow = {
  txRef: string;
  flwId: string | null;
  userId: string;
  plan: PlanId;
  amount: number;
  currency: CurrencyCode;
  status: PaymentStatus;
  verifiedAt: string | null;
  email: string;
};

export function txRefFor(userId: string, plan: PlanId, currency: CurrencyCode, id: string): string {
  return `st.${userId}.${plan}.${currency}.${id}`;
}

export function parseTxRef(txRef: string): { userId: string; plan: PlanId; currency: CurrencyCode } | null {
  const match = /^st\.([0-9a-f-]{36})\.(premium_monthly|premium_yearly)\.(NGN|USD)\.[0-9a-f-]{36}$/i.exec(txRef);
  if (!match) return null;
  const plan = match[2]!.toLowerCase();
  const currency = match[3]!.toUpperCase();
  if (plan !== "premium_monthly" && plan !== "premium_yearly") return null;
  if (currency !== "NGN" && currency !== "USD") return null;
  return { userId: match[1]!.toLowerCase(), plan, currency };
}
