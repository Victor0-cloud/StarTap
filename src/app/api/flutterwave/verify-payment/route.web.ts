import { userFromRequest } from "@/lib/payments/auth";
import { applyWebhookWrite, loadBillingState } from "@/lib/payments/db";
import { readServerEnv } from "@/lib/payments/env";
import { requestVerification } from "@/lib/payments/flutterwave";
import { clientIp, rateLimit } from "@/lib/payments/rate-limit";
import { confirmationStatus, verifySignedInPayment } from "@/lib/payments/verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: Record<string, unknown>, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function log(result: string) {
  console.info(JSON.stringify({ scope: "startap-payments", event: "verify-payment", result }));
}

export async function POST(request: Request) {
  if (!rateLimit(`verify:${clientIp(request)}`, 30, 60_000)) return json({ error: "Too many requests" }, 429);
  const env = readServerEnv();
  if (!env) return json({ error: "Payments are not available" }, 503);
  let text = "";
  try { text = await request.text(); } catch { return json({ error: "Invalid request" }, 400); }
  if (text.length > 4000) return json({ error: "Invalid request" }, 413);
  let body: unknown = {};
  if (text) {
    try { body = JSON.parse(text); } catch { return json({ error: "Invalid request" }, 400); }
  }
  const user = await userFromRequest(request, env);
  if (!user) return json({ error: "Sign in required" }, 401);
  if (!rateLimit(`verify:user:${user.id}`, 12, 60_000)) return json({ error: "Too many requests" }, 429);
  const hinted = body !== null && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : {};
  const hintedRef = typeof hinted.tx_ref === "string" ? hinted.tx_ref.trim() : null;
  const hintedId = typeof hinted.transaction_id === "string" ? hinted.transaction_id.trim() : typeof hinted.transaction_id === "number" && Number.isSafeInteger(hinted.transaction_id) ? String(hinted.transaction_id) : null;
  try {
    const state = await loadBillingState(env, {
      txRef: hintedRef,
      email: null,
      userId: user.id,
      eventKey: hintedId && /^\d+$/.test(hintedId) ? `charge.completed:${hintedId}` : null,
    });
    const outcome = await verifySignedInPayment({
      user,
      body,
      state,
      env: process.env,
      verify: id => requestVerification(id, env.flwSecretKey),
      reload: txRef => loadBillingState(env, { txRef, email: null, userId: user.id, eventKey: hintedId && /^\d+$/.test(hintedId) ? `charge.completed:${hintedId}` : null }),
    });
    if (outcome.write) {
      const saved = await applyWebhookWrite(env, outcome.write);
      if (saved === "error") {
        log("error");
        return json({ error: "Verification unavailable" }, 500);
      }
    }
    if (outcome.status !== 200) {
      log("rejected");
      const error = typeof outcome.body.error === "string" ? outcome.body.error : "Invalid request";
      return json({ error }, outcome.status);
    }
    const txRef = outcome.write?.payment?.txRef ?? hintedRef;
    const finalState = await loadBillingState(env, { txRef, email: null, userId: user.id, eventKey: null });
    const status = confirmationStatus(finalState, user.id, txRef, new Date());
    log(status);
    return json({ status }, 200);
  } catch {
    log("error");
    return json({ error: "Verification unavailable" }, 500);
  }
}
