import type { ProviderCheckout } from "./checkout.ts";
import { publicVerifiedTransaction, type VerifiedTx } from "./fields.ts";

const PAYMENTS_URL = "https://api.flutterwave.com/v3/payments";
const PROD_CHECKOUT_HOST = "checkout.flutterwave.com";
const TEST_CHECKOUT_HOST = "checkout-v2.dev-flutterwave.com";
const TEST_SECRET_PREFIX = "FLWSECK_TEST-";

export function verifyUrl(id: string): string | null {
  if (!/^\d+$/.test(id)) return null;
  return `https://api.flutterwave.com/v3/transactions/${id}/verify`;
}

/**
 * Hosted checkout links only. Production always uses checkout.flutterwave.com.
 * The dev host is accepted only for a Flutterwave test secret, so a live key
 * cannot be paired with it. Matching is the exact hostname, https only.
 */
export function hostedLink(value: unknown, secretKey: string): string | null {
  if (typeof value !== "string" || typeof secretKey !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (url.hostname === PROD_CHECKOUT_HOST) return url.toString();
    if (url.hostname === TEST_CHECKOUT_HOST && secretKey.startsWith(TEST_SECRET_PREFIX)) return url.toString();
    return null;
  } catch {
    return null;
  }
}

/** Upstream status plus a fixed reason. Never include the key, payload, customer, or link. */
function logHostedFailure(status: number | null, reason: "upstream" | "invalid_json" | "host_rejected" | "invalid_link" | "request_failed") {
  console.error(JSON.stringify({ source: "flutterwave_checkout", status, reason }));
}

export async function requestHostedLink(payload: ProviderCheckout, secretKey: string, fetchImpl: typeof fetch = fetch): Promise<{ ok: true; link: string } | { ok: false }> {
  let status: number | null = null;
  try {
    const response = await fetchImpl(PAYMENTS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    status = response.status;
    if (!response.ok) {
      logHostedFailure(status, "upstream");
      return { ok: false };
    }
    let body: { data?: { link?: unknown } };
    try {
      body = await response.json() as { data?: { link?: unknown } };
    } catch {
      logHostedFailure(status, "invalid_json");
      return { ok: false };
    }
    const raw = body?.data?.link;
    const link = hostedLink(raw, secretKey);
    if (!link) {
      logHostedFailure(status, typeof raw === "string" ? "host_rejected" : "invalid_link");
      return { ok: false };
    }
    return { ok: true, link };
  } catch {
    logHostedFailure(status, "request_failed");
    return { ok: false };
  }
}

export async function requestVerification(id: string, secretKey: string, fetchImpl: typeof fetch = fetch): Promise<{ ok: true; tx: VerifiedTx } | { ok: false; retry: boolean }> {
  const url = verifyUrl(id);
  if (!url) return { ok: false, retry: false };
  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${secretKey}` },
      signal: AbortSignal.timeout(15000),
    });
    if (response.status >= 500) return { ok: false, retry: true };
    if (!response.ok) return { ok: false, retry: false };
    const tx = publicVerifiedTransaction(await response.json());
    return tx ? { ok: true, tx } : { ok: false, retry: false };
  } catch {
    return { ok: false, retry: true };
  }
}
