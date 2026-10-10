// Public production address. Override with NEXT_PUBLIC_SITE_URL (e.g. a staging site) at build time.
export const PRODUCTION_URL = "https://startap.fun";

// Owner-supplied public details. Leave null until they are real: the site then says "coming soon" /
// "being set up" instead of showing a placeholder link or address.
/** Google Play listing, e.g. "https://play.google.com/store/apps/details?id=com.startap.game", once it is live. */
export const PLAY_STORE_URL: string | null = null;
/** Public support email address. */
export const SUPPORT_EMAIL: string | null = "sales@startap.fun";

/** Which shipped build this is: "android" (Capacitor app) or "web" (startap.fun). Set in next.config.ts. */
export const IS_ANDROID_BUILD = process.env.NEXT_PUBLIC_STARTAP_TARGET === "android";

const configured = (value: string | undefined) => {
 try { const url = new URL(value ?? ""); return url.protocol === "https:" || url.hostname === "localhost" ? url.origin : null; } catch { return null; }
};
const isDevelopmentHost = (hostname: string) =>
 hostname === "localhost" || hostname === "[::1]" || hostname.endsWith(".local") ||
 /^127\./.test(hostname) || /^10\./.test(hostname) || /^192\.168\./.test(hostname) || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

/**
 * Origin for links people share. The Android app (whose WebView origin is https://localhost) and any public
 * host use the production site; a browser on this computer or the local network keeps its own origin.
 */
export function shareOrigin({ native, location, env = process.env.NEXT_PUBLIC_SITE_URL }: { native: boolean; location?: { origin: string; hostname: string }; env?: string }): string {
 const override = configured(env);
 if (override) return override;
 if (!native && location && isDevelopmentHost(location.hostname)) return location.origin;
 return PRODUCTION_URL;
}
