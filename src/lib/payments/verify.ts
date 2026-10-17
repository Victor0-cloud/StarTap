import { entitlementIsActive } from "./entitlement.ts";
import { parseTxRef, type VerifiedTx } from "./fields.ts";
import { cancelUnresolvedPayment, finalizeVerifiedCharge, type WebhookOutcome, type WebhookState } from "./webhook.ts";
import type { ReferenceLookup } from "./flutterwave.ts";

export type VerifyUser = { id: string; email: string };

const DIGITS = /^\d{1,20}$/;

/** What the success page may show. Read from stored rows, never from the provider payload. */
export function confirmationStatus(state: WebhookState, userId: string, txRef: string | null, now: Date): "active" | "pending" | "failed" | "cancelled" {
  const payment = state.payments.find(row => row.userId.toLowerCase() === userId.toLowerCase() && (!txRef || row.txRef === txRef));
  if (payment?.status === "cancelled") return "cancelled";
  if (payment?.status === "failed") return "failed";
  const entitlement = state.entitlements.find(row => row.userId.toLowerCase() === userId.toLowerCase()) ?? null;
  if (entitlementIsActive(entitlement, now)) return "active";
  if (payment?.status === "successful") return "active";
  return "pending";
}

/**
 * The only browser fields this route reads. Status, amount, currency, plan and user are ignored.
 * Returns null when tx_ref is not one we minted or transaction_id is not a short digit string.
 */
export function browserPaymentReference(body: unknown): { transactionId: string | null; txRef: string | null } | null {
  if (body === null || typeof body !== "object" || Array.isArray(body)) return null;
  const record = body as Record<string, unknown>;
  if ("tx_ref" in record && record.tx_ref !== null && typeof record.tx_ref !== "string") return null;
  if ("transaction_id" in record && record.transaction_id !== null && typeof record.transaction_id !== "string" && typeof record.transaction_id !== "number") return null;
  const txRef = typeof record.tx_ref === "string" ? record.tx_ref.trim() : "";
  const rawId = record.transaction_id;
  const transactionId = typeof rawId === "string" ? rawId.trim() : typeof rawId === "number" && Number.isSafeInteger(rawId) && rawId > 0 ? String(rawId) : "";
  if ((typeof rawId === "string" && rawId.trim() && !transactionId) || (typeof rawId === "number" && !transactionId && rawId !== undefined)) return null;
  if (txRef.length > 200 || transactionId.length > 20) return null;
  if (txRef && !parseTxRef(txRef)) return null;
  if (transactionId && !/^\d{1,20}$/.test(transactionId)) return null;
  if (!txRef && !transactionId) return null;
  return { transactionId: transactionId || null, txRef: txRef || null };
}

/**
 * Signed-in confirmation for the success page. Grants only through finalizeVerifiedCharge.
 * The payment row's user_id is the StarTap user. The browser cannot name a different one.
 */
export async function verifySignedInPayment(input: {
  user: VerifyUser | null;
  body: unknown;
  state: WebhookState;
  env: Record<string, string | undefined>;
  now?: Date;
  verify: (id: string) => Promise<{ ok: true; tx: VerifiedTx } | { ok: false; retry: boolean }>;
  verifyReference?: (txRef: string) => Promise<ReferenceLookup>;
  reload?: (txRef: string) => Promise<WebhookState>;
}): Promise<WebhookOutcome> {
  const deny = (status: number, body: Record<string, unknown>, state: WebhookState = input.state): WebhookOutcome =>
    ({ status, body, state, write: null });
  if (!input.user?.id || !input.user.email) return deny(401, { error: "Sign in required" });
  const ref = browserPaymentReference(input.body);
  if (!ref) return deny(400, { error: "Invalid request" });

  let state = input.state;
  if (ref.txRef) {
    const owned = state.payments.find(row => row.txRef === ref.txRef);
    if (!owned || owned.userId.toLowerCase() !== input.user.id.toLowerCase()) return deny(404, { error: "Payment not found" });
  }

  if (!ref.transactionId && ref.txRef) {
    if (!input.verifyReference) return deny(400, { error: "Invalid request" });
    const looked = await input.verifyReference(ref.txRef);
    if (!looked.ok && looked.retry) return deny(503, { error: "Verification unavailable" });
    if (!looked.ok && !looked.absent) return deny(503, { error: "Verification unavailable" });
    if (!looked.ok) return cancelUnresolvedPayment(state, ref.txRef, input.user.id);
    if (looked.tx.txRef !== ref.txRef) return deny(400, { error: "Invalid request" });
    if (looked.tx.status !== "successful" && looked.tx.status !== "failed" && looked.tx.status !== "cancelled") {
      return deny(200, { received: true, granted: false, reason: "pending" });
    }
    return finalizeVerifiedCharge({ state, tx: looked.tx, env: input.env, now: input.now, userId: input.user.id });
  }

  const id = ref.transactionId;
  if (!id || !DIGITS.test(id)) return deny(400, { error: "Invalid request" });

  const verified = await input.verify(id);
  if (!verified.ok) return deny(verified.retry ? 503 : 400, { error: verified.retry ? "Verification unavailable" : "Invalid request" });
  if (verified.tx.id !== id || (ref.transactionId && verified.tx.id !== ref.transactionId)) return deny(400, { error: "Invalid request" });
  if (ref.txRef && verified.tx.txRef !== ref.txRef) return deny(400, { error: "Invalid request" });

  if (!state.payments.some(row => row.txRef === verified.tx.txRef) && input.reload) state = await input.reload(verified.tx.txRef);
  const payment = state.payments.find(row => row.txRef === verified.tx.txRef);
  if (!payment || payment.userId.toLowerCase() !== input.user.id.toLowerCase()) return deny(404, { error: "Payment not found" }, state);
  return finalizeVerifiedCharge({ state, tx: verified.tx, env: input.env, now: input.now, userId: input.user.id });
}
