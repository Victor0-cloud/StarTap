export const SESSION_KEY = "startap.session";
export const PREMIUM_CACHE_KEY = "startap.premium";

export type SavedSession = { accessToken: string; expiresAt: number | null };

export type PremiumCache = {
  isPremium: boolean;
  email: string | null;
  plan: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
  savedAt: number;
};

export function readSavedSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedSession>;
    if (typeof parsed.accessToken !== "string" || !parsed.accessToken) return null;
    if (typeof parsed.expiresAt === "number" && parsed.expiresAt * 1000 < Date.now()) return null;
    return { accessToken: parsed.accessToken, expiresAt: typeof parsed.expiresAt === "number" ? parsed.expiresAt : null };
  } catch {
    return null;
  }
}

export function writeSavedSession(session: SavedSession | null): void {
  try {
    if (!session) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch { /* private mode */ }
}

/** UI cache only. Access decisions wait for the status route. */
export function writePremiumCache(cache: PremiumCache): void {
  try { localStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify(cache)); } catch { /* private mode */ }
}

export function readPremiumCache(): PremiumCache | null {
  try {
    const raw = localStorage.getItem(PREMIUM_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PremiumCache>;
    if (typeof parsed.savedAt !== "number") return null;
    return {
      isPremium: parsed.isPremium === true,
      email: typeof parsed.email === "string" ? parsed.email : null,
      plan: typeof parsed.plan === "string" ? parsed.plan : null,
      status: typeof parsed.status === "string" ? parsed.status : null,
      currentPeriodEnd: typeof parsed.currentPeriodEnd === "string" ? parsed.currentPeriodEnd : null,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}
