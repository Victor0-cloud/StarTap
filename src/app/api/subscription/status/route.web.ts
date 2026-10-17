import { userFromRequest } from "@/lib/payments/auth";
import { readOwnStatus } from "@/lib/payments/db";
import { paymentsLive, readServerEnv } from "@/lib/payments/env";
import { entitlementIsActive } from "@/lib/payments/entitlement";
import { clientIp, rateLimit } from "@/lib/payments/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const empty = {
  paymentsEnabled: false,
  authenticated: false,
  isPremium: false,
  email: null,
  plan: null,
  status: null,
  currentPeriodStart: null,
  currentPeriodEnd: null,
  provider: null,
};

const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request: Request) {
  if (!rateLimit(`status:${clientIp(request)}`, 60, 60_000)) return json({ error: "Too many requests" }, 429);
  if (!paymentsLive()) return json(empty);
  const env = readServerEnv();
  if (!env) return json(empty);
  const user = await userFromRequest(request, env);
  if (!user) return json({ ...empty, paymentsEnabled: true });
  try {
    const row = await readOwnStatus(env, user.id);
    const now = new Date();
    const active = entitlementIsActive(row, now);
    return json({
      paymentsEnabled: true,
      authenticated: true,
      isPremium: active,
      email: user.email,
      plan: row?.plan ?? null,
      status: row?.status ?? null,
      currentPeriodStart: row?.currentPeriodStart ?? null,
      currentPeriodEnd: row?.currentPeriodEnd ?? null,
      provider: row?.provider ?? null,
    });
  } catch {
    return json({ error: "Status unavailable" }, 503);
  }
}
