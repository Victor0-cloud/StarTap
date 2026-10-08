import type { ResultTier } from "./result.ts";

// Star Passport: one stamp per country + category, earned by finding the right country (or very close)
// in World Mix, category play or the Adventure. Stored locally; validated before use.
export const PASSPORT_KEY = "startap:passport:v1";
export interface Stamp { countryCode: string; countryName: string; category: string; subcategory: string; stampType: string; firstUnlockedAt: string; bestScore: number }
export interface Passport { version: 1; stamps: Record<string, Stamp> }
export const emptyPassport = (): Passport => ({ version: 1, stamps: {} });
export const stampKey = (countryCode: string, category: string) => `${countryCode}|${category}`;

/** A round earns a stamp when the pin is in the right country or within city range. */
export const earnsStamp = (tier: ResultTier) => tier === "nailed" || tier === "city" || tier === "region" || tier === "country";

const validDate = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
export function readPassport(raw: string | null): Passport {
 try {
  const value = JSON.parse(raw ?? "null");
  if (value?.version !== 1 || typeof value.stamps !== "object" || !value.stamps) return emptyPassport();
  const stamps: Passport["stamps"] = {};
  for (const s of Object.values(value.stamps as Record<string, Partial<Stamp>>)) {
   if (!s || !/^[A-Z]{2}$/.test(s.countryCode ?? "") || !s.category || !s.countryName || !s.stampType || !validDate(s.firstUnlockedAt)) continue;
   if (typeof s.bestScore !== "number" || !Number.isInteger(s.bestScore) || s.bestScore < 0 || s.bestScore > 1000) continue;
   stamps[stampKey(s.countryCode!, s.category)] = { countryCode: s.countryCode!, countryName: s.countryName, category: s.category, subcategory: s.subcategory ?? "", stampType: s.stampType, firstUnlockedAt: s.firstUnlockedAt!, bestScore: s.bestScore };
  }
  return { version: 1, stamps };
 } catch { return emptyPassport(); }
}

export type Discovery = Omit<Stamp, "firstUnlockedAt" | "bestScore"> & { score: number; date: string };
/** Adds a stamp, or improves its best score. Never duplicates a country + category stamp. */
export function recordDiscovery(passport: Passport, d: Discovery): { passport: Passport; isNewStamp: boolean; isNewCountry: boolean; improved: boolean } {
 const key = stampKey(d.countryCode, d.category);
 const existing = passport.stamps[key];
 const score = Math.max(0, Math.min(1000, Math.round(d.score)));
 const isNewCountry = !Object.values(passport.stamps).some(s => s.countryCode === d.countryCode);
 if (existing) {
  if (score <= existing.bestScore) return { passport, isNewStamp: false, isNewCountry: false, improved: false };
  return { passport: { version: 1, stamps: { ...passport.stamps, [key]: { ...existing, bestScore: score } } }, isNewStamp: false, isNewCountry: false, improved: true };
 }
 const stamp: Stamp = { countryCode: d.countryCode, countryName: d.countryName, category: d.category, subcategory: d.subcategory, stampType: d.stampType, firstUnlockedAt: d.date, bestScore: score };
 return { passport: { version: 1, stamps: { ...passport.stamps, [key]: stamp } }, isNewStamp: true, isNewCountry, improved: false };
}

/** Stamps for the passport screen, newest first, optionally for one category. */
export function stampList(passport: Passport, category: string = "all"): Stamp[] {
 return Object.values(passport.stamps).filter(s => category === "all" || s.category === category)
  .sort((a, b) => b.firstUnlockedAt.localeCompare(a.firstUnlockedAt) || a.countryName.localeCompare(b.countryName));
}
export const countriesDiscovered = (passport: Passport) => new Set(Object.values(passport.stamps).map(s => s.countryCode)).size;
