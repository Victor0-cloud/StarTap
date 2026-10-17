import { dateKey } from "../game/daily.ts";
import { FREE_PLAY_FIVE_PER_DAY } from "./access.ts";

export const QUOTA_KEY = "startap.playfive";

export type Kv = { getItem(key: string): string | null; setItem(key: string, value: string): void };

export function quotaSnapshot(storage: Kv, now = new Date()): { day: string; count: number } {
  const day = dateKey(now);
  try {
    const raw = JSON.parse(storage.getItem(QUOTA_KEY) ?? "null") as { day?: unknown; count?: unknown } | null;
    if (raw && raw.day === day && typeof raw.count === "number" && raw.count >= 0) return { day, count: Math.floor(raw.count) };
  } catch { /* a broken value starts the day again */ }
  return { day, count: 0 };
}

export function canStartPlayFive(storage: Kv, now = new Date()): boolean {
  return quotaSnapshot(storage, now).count < FREE_PLAY_FIVE_PER_DAY;
}

export function recordPlayFive(storage: Kv, now = new Date()): void {
  const current = quotaSnapshot(storage, now);
  storage.setItem(QUOTA_KEY, JSON.stringify({ day: current.day, count: current.count + 1 }));
}

export const browserQuota: Kv = {
  getItem: key => { try { return localStorage.getItem(key); } catch { return null; } },
  setItem: (key, value) => { try { localStorage.setItem(key, value); } catch { /* private mode */ } },
};
