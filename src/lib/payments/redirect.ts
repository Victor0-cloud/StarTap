import { PRODUCTION_URL } from "../site.ts";

const ALLOWED_HOSTS = new Set(["startap.fun", "www.startap.fun", "localhost", "127.0.0.1"]);

/** Origin we will send a payer back to. Client-supplied URLs are never read. */
export function checkoutOrigin(requestUrl: string): string {
  try {
    const url = new URL(requestUrl);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const allowed = ALLOWED_HOSTS.has(url.hostname) || url.hostname.endsWith(".vercel.app");
    if (!allowed) return PRODUCTION_URL;
    if (url.protocol === "https:" || (url.protocol === "http:" && local)) return url.origin;
    return PRODUCTION_URL;
  } catch {
    return PRODUCTION_URL;
  }
}

export function successRedirect(requestUrl: string): string {
  return `${checkoutOrigin(requestUrl)}/payment/success/`;
}

const NEXT_PATHS = new Set(["/", "/premium/", "/account/", "/payment/success/", "/play/", "/passport/"]);

/** Relative in-app path only. Used after login. Never an absolute or protocol-relative URL. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !NEXT_PATHS.has(value)) return "/account/";
  return value;
}
