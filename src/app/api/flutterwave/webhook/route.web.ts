import { applyWebhookWrite, loadBillingState } from "@/lib/payments/db";
import { readServerEnv } from "@/lib/payments/env";
import { parseTxRef, publicWebhookFields } from "@/lib/payments/fields";
import { requestVerification } from "@/lib/payments/flutterwave";
import { hashesMatch } from "@/lib/payments/hash";
import { clientIp, rateLimit } from "@/lib/payments/rate-limit";
import { handleWebhook } from "@/lib/payments/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: Record<string, unknown>, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function log(event: string, fields: Record<string, string | boolean | null>) {
  console.info(JSON.stringify({ scope: "startap-payments", event, ...fields }));
}

export async function POST(request: Request) {
  if (!rateLimit(`webhook:${clientIp(request)}`, 120, 60_000)) return json({ error: "Too many requests" }, 429);
  const env = readServerEnv();
  if (!env) return json({ error: "Payments are not available" }, 503);
  const headerHash = request.headers.get("verif-hash");
  if (!hashesMatch(headerHash, env.flwSecretHash)) {
    log("webhook", { result: "bad-signature" });
    return json({ error: "Invalid signature" }, 401);
  }
  let text = "";
  try { text = await request.text(); } catch { return json({ error: "Invalid payload" }, 400); }
  if (text.length > 65536) return json({ error: "Invalid payload" }, 413);
  let payload: unknown;
  try { payload = JSON.parse(text); } catch { return json({ error: "Invalid payload" }, 400); }
  const safe = publicWebhookFields(payload);
  if (!safe) return json({ error: "Invalid payload" }, 400);
  try {
    if (safe.event === "charge.completed") {
      if (!safe.id || !/^\d+$/.test(safe.id)) return json({ error: "Invalid payload" }, 400);
      const verified = await requestVerification(safe.id, env.flwSecretKey);
      if (!verified.ok) {
        log("webhook", { result: verified.retry ? "verify-retry" : "verify-rejected", txRef: safe.txRef });
        return json({ error: verified.retry ? "Verification unavailable" : "Invalid payload" }, verified.retry ? 500 : 400);
      }
      const state = await loadBillingState(env, {
        txRef: verified.tx.txRef,
        email: null,
        userId: parseTxRef(verified.tx.txRef)?.userId ?? null,
        eventKey: `charge.completed:${verified.tx.id}`,
      });
      const outcome = await handleWebhook({
        headerHash,
        secretHash: env.flwSecretHash,
        payload,
        state,
        env: process.env,
        verify: async () => verified,
      });
      if (outcome.write) {
        const saved = await applyWebhookWrite(env, outcome.write);
        if (saved === "error") return json({ error: "Verification unavailable" }, 500);
        if (saved === "duplicate") return json({ received: true, duplicate: true }, 200);
      }
      log("webhook", { result: outcome.body.granted === true ? "granted" : "recorded", txRef: verified.tx.txRef });
      return json(outcome.body, outcome.status);
    }
    const eventKey = safe.event === "subscription.cancelled"
      ? `subscription.cancelled:${safe.email ?? "none"}:${safe.planId ?? "none"}`
      : `ignored:${safe.event}:${safe.id ?? safe.txRef ?? "none"}`;
    const state = await loadBillingState(env, { txRef: safe.txRef, email: safe.email, eventKey });
    const outcome = await handleWebhook({
      headerHash,
      secretHash: env.flwSecretHash,
      payload,
      state,
      env: process.env,
      verify: async () => ({ ok: false, retry: false }),
    });
    if (outcome.write) {
      const saved = await applyWebhookWrite(env, outcome.write);
      if (saved === "error") return json({ error: "Verification unavailable" }, 500);
      if (saved === "duplicate") return json({ received: true, duplicate: true }, 200);
    }
    log("webhook", { result: safe.event === "subscription.cancelled" ? "cancel" : "ignored", txRef: null });
    return json(outcome.body, outcome.status);
  } catch {
    log("webhook", { result: "error", txRef: safe.txRef });
    return json({ error: "Verification unavailable" }, 500);
  }
}
