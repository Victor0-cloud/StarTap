import { safeNextPath } from "../payments/redirect.ts";

// The emailed sign-in link always opens /account/ (the one redirect Supabase allows), often in a new tab.
// LoginForm stores where the player was heading; AccountPanel sends them on once the session is confirmed.
// Only a navigation hint: the path is re-checked against the allow-list, and access still comes from the server.
export const LOGIN_NEXT_KEY = "startap.login-next";
const MAX_AGE_MS = 60 * 60 * 1000;

type Kv = { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void };

export function rememberLoginNext(storage: Kv, next: string, now = Date.now()): void {
  const path = safeNextPath(next);
  try {
    if (path === "/account/") storage.removeItem(LOGIN_NEXT_KEY);
    else storage.setItem(LOGIN_NEXT_KEY, JSON.stringify({ path, savedAt: now }));
  } catch { /* private mode: the player lands on /account/ */ }
}

/** Read once and clear. Null when nothing is pending, it is stale, or it is not an allowed path. */
export function takeLoginNext(storage: Kv, now = Date.now()): string | null {
  try {
    const raw = JSON.parse(storage.getItem(LOGIN_NEXT_KEY) ?? "null") as { path?: unknown; savedAt?: unknown } | null;
    storage.removeItem(LOGIN_NEXT_KEY);
    if (!raw || typeof raw.path !== "string" || typeof raw.savedAt !== "number" || now - raw.savedAt > MAX_AGE_MS || raw.savedAt > now) return null;
    const path = safeNextPath(raw.path);
    return path === "/account/" ? null : path;
  } catch {
    return null;
  }
}
