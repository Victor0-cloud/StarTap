import { calculateScore } from "./scoring.ts";

// "distance-v1": the original distance tiers, kept for every pre-V2 edition so saved and shared scores reproduce.
// "country-v2": country-first scoring. The right country always earns at least 500 of 1,000.
export type ScoringVersion = "distance-v1" | "country-v2";
export type ResultTier = "nailed" | "city" | "region" | "country" | "close" | "miss";

export const RESULT_LABELS: Readonly<Record<ResultTier, string>> = {
 nailed: "NAILED IT!", city: "RIGHT CITY!", region: "RIGHT REGION!", country: "RIGHT COUNTRY!", close: "CLOSE!", miss: "NOT QUITE!",
};

// No state/province boundaries exist in the project, so "region" means the right country and within REGION_KM.
export const NAILED_KM = 25, CITY_KM = 75, REGION_KM = 300, CLOSE_KM = 1500;
// Each band scales linearly with distance between its start and end scores.
const BANDS: Readonly<Record<ResultTier, readonly [fromKm: number, toKm: number, fromScore: number, toScore: number]>> = {
 nailed: [10, NAILED_KM, 1000, 950], // 1,000 within 10 km
 city: [NAILED_KM, CITY_KM, 950, 850],
 region: [CITY_KM, REGION_KM, 849, 700],
 country: [REGION_KM, 3000, 699, 500], // never below 500 inside the right country
 close: [CITY_KM, CLOSE_KM, 499, 200],
 miss: [CLOSE_KM, 5000, 199, 0],
};

function validDistance(distanceKm: number) {
 if (!Number.isFinite(distanceKm) || distanceKm < 0) throw new RangeError("Invalid distance");
}

/** Very close always wins; beyond city range the country decides. Unknown country counts as a different country. */
export function resultTier(distanceKm: number, sameCountry: boolean | null | undefined): ResultTier {
 validDistance(distanceKm);
 if (distanceKm <= NAILED_KM) return "nailed";
 if (distanceKm <= CITY_KM) return "city";
 if (sameCountry) return distanceKm <= REGION_KM ? "region" : "country";
 return distanceKm <= CLOSE_KM ? "close" : "miss";
}

export function calculateCountryScore(distanceKm: number, sameCountry: boolean | null | undefined): number {
 const [d0, d1, s0, s1] = BANDS[resultTier(distanceKm, sameCountry)];
 const t = Math.min(1, Math.max(0, (distanceKm - d0) / (d1 - d0)));
 return Math.round(s0 + (s1 - s0) * t);
}

/** Round score before any hint deduction. */
export function baseScore(version: ScoringVersion, distanceKm: number, sameCountry: boolean | null | undefined): number {
 return version === "country-v2" ? calculateCountryScore(distanceKm, sameCountry) : calculateScore(distanceKm);
}

export interface ResultState { tier: ResultTier; label: string; score: number; subtitle: string | null }

/** What the reveal shows: reaction label, points and an optional short subtitle. Spark only reacts to `tier`. */
export function resultState({ distanceKm, sameCountry, score, hintUsed = false }: { distanceKm: number; sameCountry: boolean | null | undefined; score: number; hintUsed?: boolean }): ResultState {
 const tier = resultTier(distanceKm, sameCountry);
 const detail = tier === "region" ? "Right country · under 300 km" : tier === "close" ? "Nearby, but another country" : null;
 return { tier, label: RESULT_LABELS[tier], score, subtitle: [detail, hintUsed ? "Hint used · −200" : null].filter(Boolean).join(" · ") || null };
}

// Spark's one-line cheer on the reveal. Short on purpose: Spark reacts, it never explains.
export const SPARK_LINES: Readonly<Record<ResultTier, string>> = {
 nailed: "You found it!", city: "Right on the spot!", region: "You're getting warm!", country: "Great direction!", close: "Almost there!", miss: "New place unlocked!",
};

export type SparkMood = ResultTier | "crowned";
/** Spark's reaction: a newly crossed score milestone shows the crown, otherwise the result tier. */
export function sparkMood(tier: ResultTier, milestone: number | null): SparkMood {
 return milestone ? "crowned" : tier;
}
