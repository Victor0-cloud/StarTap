import { userFromRequest } from "@/lib/payments/auth";
import { createCheckout } from "@/lib/payments/checkout";
import { insertPendingPayment, markPaymentFailed, readOwnStatus, upsertProfile } from "@/lib/payments/db";
import { readServerEnv } from "@/lib/payments/env";
import { requestHostedLink } from "@/lib/payments/flutterwave";
import { clientIp, rateLimit } from "@/lib/payments/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: Record<string, unknown>, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (!rateLimit(`checkout:${clientIp(request)}`, 20, 60_000)) return json({ error: "Too many requests" }, 429);
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
  if (!rateLimit(`checkout:user:${user.id}`, 8, 60_000)) return json({ error: "Too many requests" }, 429);
  try { await upsertProfile(env, user); } catch { return json({ error: "Checkout could not be started" }, 500); }
  let entitlement = null;
  try { entitlement = await readOwnStatus(env, user.id); } catch { return json({ error: "Checkout could not be started" }, 503); }
  const result = await createCheckout({
    user,
    body,
    env: process.env,
    requestUrl: request.url,
    server: env,
    entitlement,
    insertPending: row => insertPendingPayment(env, row),
    markFailed: txRef => markPaymentFailed(env, txRef),
    createLink: (payload, secret) => requestHostedLink(payload, secret),
  });
  return json(result.body, result.status);
}
