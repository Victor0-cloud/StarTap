import type { Coordinates } from "../../types/game.ts";
import { calculateDistanceKm } from "./distance.ts";
import { HINT_COST } from "./daily.ts";
import type { ResultTier } from "./result.ts";

// Two-stage rounds (World Mix, category play, Adventure): find the country, then land on the city in its landing world.
// Round max stays 1,000: up to 300 for the country and up to 700 for the city. Today's Five and every legacy edition keep
// their own scoring; saved answers without stage data keep the score they were recorded with.
export const COUNTRY_POINTS = 300, JOKER_COUNTRY_POINTS = 150;
export const CITY_POINTS = 700, LIFE_SAVER_CITY_POINTS = 420;
export const WRONG_COUNTRY_POINTS = 150; // a small consolation for a near miss in the wrong country
export const LIFE_SAVER_KM = 75; // a Life Saver is offered when the first city tap lands farther than this

export type RoundPhase = "country_select" | "country_locked" | "country_result" | "city_transition" | "city_select" | "city_locked" | "city_result" | "round_complete";

/** Stored with each finished two-stage answer, so the score recomputes identically on reload. */
export interface StageRecord { country: string | null; countryRight: boolean; joker: boolean; lifeSaver: boolean }

// Share of the city points by distance from the answer: full within 10 km, then easing down to 0 at 2,500 km.
const CITY_CURVE: readonly [km: number, share: number][] = [[10, 1], [25, 0.95], [75, 0.85], [150, 0.7], [300, 0.5], [1000, 0.15], [2500, 0]];
function curve(points: readonly [number, number][], km: number): number {
 if (!Number.isFinite(km) || km < 0) throw new RangeError("Invalid distance");
 if (km <= points[0][0]) return points[0][1];
 for (let i = 1; i < points.length; i++) {
  const [k0, s0] = points[i - 1], [k1, s1] = points[i];
  if (km <= k1) return s0 + (s1 - s0) * (km - k0) / (k1 - k0);
 }
 return points.at(-1)![1];
}
export const cityPoints = (km: number, lifeSaver: boolean) => Math.round((lifeSaver ? LIFE_SAVER_CITY_POINTS : CITY_POINTS) * curve(CITY_CURVE, km));
export const wrongCountryPoints = (km: number) => Math.round(WRONG_COUNTRY_POINTS * curve([[300, 1], [1500, 0]], km));

export interface StageScore { countryPoints: number; cityPoints: number; total: number }
/** Country + city points, then the hint deduction (never below 0). */
export function stagedScore(distanceKm: number, stage: StageRecord, hintUsed: boolean): StageScore {
 const countryPts = stage.countryRight ? (stage.joker ? JOKER_COUNTRY_POINTS : COUNTRY_POINTS) : 0;
 const cityPts = stage.countryRight ? cityPoints(distanceKm, stage.lifeSaver) : wrongCountryPoints(distanceKm);
 return { countryPoints: countryPts, cityPoints: cityPts, total: Math.max(0, countryPts + cityPts - (hintUsed ? HINT_COST : 0)) };
}

/** The shared result tier (drives mascot mood, sound, passport stamps and Wonder Reveal), from the city distance. */
export function stageTier(distanceKm: number, countryRight: boolean): ResultTier {
 if (!countryRight) return distanceKm <= 1500 ? "close" : "miss";
 return distanceKm <= 25 ? "nailed" : distanceKm <= 75 ? "city" : distanceKm <= 300 ? "region" : "country";
}
export function stageLabel(distanceKm: number, countryRight: boolean): string {
 if (!countryRight) return "WRONG COUNTRY";
 return distanceKm <= 25 ? "CITY NAILED!" : distanceKm <= 75 ? "RIGHT CITY!" : distanceKm <= 150 ? "VERY CLOSE!" : distanceKm <= 400 ? "CLOSE!" : "MISSED THE CITY!";
}

const DIRECTIONS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"] as const;
/** Compass direction from the guess toward the answer: the Life Saver clue. It never names or places the city. */
export function compassDirection(from: Coordinates, to: Coordinates): typeof DIRECTIONS[number] {
 const r = Math.PI / 180, dLon = (to.longitude - from.longitude) * r;
 const y = Math.sin(dLon) * Math.cos(to.latitude * r);
 const x = Math.cos(from.latitude * r) * Math.sin(to.latitude * r) - Math.sin(from.latitude * r) * Math.cos(to.latitude * r) * Math.cos(dLon);
 const bearing = (Math.atan2(y, x) / r + 360) % 360;
 return DIRECTIONS[Math.round(bearing / 45) % 8];
}

const hash = (text: string) => { let h = 0; for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
/**
 * Joker zone: a group of neighbouring countries that contains the answer, centred on a nearby country rather than the
 * answer, so the middle of the zone never gives it away. Deterministic per question, so a reload shows the same zone.
 */
export function jokerZone(answerCode: string, centres: readonly { code: string; centre: Coordinates }[], seed: string, size = 7): string[] {
 const answer = centres.find(c => c.code === answerCode);
 if (!answer) return [];
 const byDistance = (from: Coordinates) => [...centres].sort((a, b) => calculateDistanceKm(from, a.centre) - calculateDistanceKm(from, b.centre));
 const near = byDistance(answer.centre);
 const pivot = near[1 + hash(seed) % Math.min(4, Math.max(1, near.length - 1))] ?? answer;
 const zone = byDistance(pivot.centre).slice(0, size).map(c => c.code);
 if (!zone.includes(answerCode)) zone[zone.length - 1] = answerCode;
 return zone.sort();
}

/**
 * Pixel's CLUE BURST: one small fact read straight from the offline city list (capital first, then by population).
 * Returns null when the data cannot support a clue.
 */
export function pixelClue(answer: Coordinates, cities: readonly [string, number, number, 0 | 1][] | undefined): string | null {
 if (!cities?.length) return null;
 const at = (c: readonly [string, number, number, 0 | 1]) => calculateDistanceKm(answer, { latitude: c[2], longitude: c[1] });
 const capital = cities.find(c => c[3] === 1);
 if (capital && at(capital) <= 15) return "It's the capital city.";
 const rank = cities.findIndex(c => at(c) <= 15);
 // The list is capital first, then by population, so entries 1–4 are always within the five biggest cities.
 if (rank >= 1 && rank <= 4) return capital ? "Not the capital, but one of the country's five biggest cities." : "One of the country's five biggest cities.";
 return capital ? "It's not the capital city." : null;
}
