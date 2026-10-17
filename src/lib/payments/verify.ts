import type { VerifiedTx } from "./fields.ts";
import { finalizeVerifiedCharge, type WebhookOutcome, type WebhookState } from "./webhook.ts";

export type VerifyUser = { id: string; email: string };

const DIGITS = /^\d{1,20}$/;

/** The only browser fields this route reads. Status, amount, currency, plan and user are ignored. */
export function browserPaymentReference(body: unknown): { transactionId: string | null; txRef: string | null } {
  const record = body !== null && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : {};
  const rawId = record.transaction_id;
  const transactionId = typeof rawId === "string" ? rawId.trim() : typeof rawId === "number" && Number.isSafeInteger(rawId) ? String(rawId) : "";
  const rawRef = record.tx_ref;
  const txRef = typeof rawRef === "string" ? rawRef.trim() : "";
  return {
    transactionId: transactionId.length > 0 && transactionId.length <= 20 ? transactionId : null,
    txRef: txRef.length > 0 && txRef.length <= 200 ? txRef : null,
  };
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
  reload?: (txRef: string) => Promise<WebhookState>;
}): Promise<WebhookOutcome> {
  const deny = (status: number, body: Record<string, unknown>, state: WebhookState = input.state): WebhookOutcome =>
    ({ status, body, state, write: null });
  if (!input.user?.id || !input.user.email) return deny(401, { error: "Sign in required" });
  const raw = input.body !== null && typeof input.body === "object" && !Array.isArray(input.body) ? input.body as Record<string, unknown> : {};
  if (typeof raw.transaction_id === "string" && raw.transaction_id.trim().length > 20) return deny(400, { error: "Invalid request" });
  if (typeof raw.tx_ref === "string" && raw.tx_ref.trim().length > 200) return deny(400, { error: "Invalid request" });
  const ref = browserPaymentReference(input.body);
  if ((typeof raw.transaction_id === "string" && raw.transaction_id.trim() && !ref.transactionId) || (typeof raw.transaction_id === "number" && !ref.transactionId)) {
    return deny(400, { error: "Invalid request" });
  }
  if (ref.transactionId && !DIGITS.test(ref.transactionId)) return deny(400, { error: "Invalid request" });
  if (!ref.txRef && !ref.transactionId) return deny(400, { error: "Invalid request" });

  let state = input.state;
  if (ref.txRef) {
    const owned = state.payments.find(row => row.txRef === ref.txRef);
    if (!owned || owned.userId.toLowerCase() !== input.user.id.toLowerCase()) return deny(404, { error: "Payment not found" });
  }

  const storedId = ref.txRef ? state.payments.find(row => row.txRef === ref.txRef)?.flwId ?? null : null;
  const id = ref.transactionId ?? storedId;
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
