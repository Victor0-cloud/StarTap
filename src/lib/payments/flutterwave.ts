import type { ProviderCheckout } from "./checkout.ts";
import { publicVerifiedTransaction, type VerifiedTx } from "./fields.ts";

const PAYMENTS_URL = "https://api.flutterwave.com/v3/payments";

export function verifyUrl(id: string): string | null {
  if (!/^\d+$/.test(id)) return null;
  return `https://api.flutterwave.com/v3/transactions/${id}/verify`;
}

/** Hosted checkout links only. Any other URL is refused so the client cannot be sent elsewhere. */
export function hostedLink(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "checkout.flutterwave.com") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function requestHostedLink(payload: ProviderCheckout, secretKey: string, fetchImpl: typeof fetch = fetch): Promise<{ ok: true; link: string } | { ok: false }> {
  try {
    const response = await fetchImpl(PAYMENTS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return { ok: false };
    const body = await response.json() as { data?: { link?: unknown } };
    const link = hostedLink(body.data?.link);
    return link ? { ok: true, link } : { ok: false };
  } catch {
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
