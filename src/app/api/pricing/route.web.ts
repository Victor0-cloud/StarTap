import { paymentsLive } from "@/lib/payments/env";
import { readPreference, resolveQuote, toPublicQuote } from "@/lib/payments/pricing";
import { clientIp, rateLimit } from "@/lib/payments/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: Record<string, unknown>, status: number) => Response.json(body, {
  status,
  headers: { "Cache-Control": "private, no-store", Vary: "x-vercel-ip-country" },
});

/** Server offer for the premium page. Country is the platform header, never a query parameter. */
export async function GET(request: Request) {
  if (!rateLimit(`pricing:${clientIp(request)}`, 60, 60_000)) return json({ error: "Too many requests" }, 429);
  if (!paymentsLive()) return json({ error: "Payments are not available" }, 503);
  const url = new URL(request.url);
  const preference = readPreference(url.searchParams.has("currency") ? url.searchParams.get("currency") : undefined);
  if (preference === "invalid") return json({ error: "Choose local or USD" }, 400);
  const quote = resolveQuote({
    env: process.env,
    countryHeader: request.headers.get("x-vercel-ip-country"),
    preference,
  });
  if (!quote.ok) return json({ error: quote.error }, quote.status);
  return json(toPublicQuote(quote.quote), 200);
}
