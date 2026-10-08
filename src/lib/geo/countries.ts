import type { Coordinates } from "../../types/game.ts";

// public/country-lookup.json: rings are flat [lng, lat, lng, lat, ...]; the first ring of a polygon is its outline.
export interface CountryLookup { countries: { c: string; b: [number, number, number, number]; p: number[][][] }[] }

function inRing(ring: number[], x: number, y: number): boolean {
 let inside = false;
 for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
  const xi = ring[i], yi = ring[i + 1], xj = ring[j], yj = ring[j + 1];
  if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
 }
 return inside;
}

// Taps in water this close to a coast count for that country: coastlines are simplified (~2 km), and a pin in a
// harbour or just offshore from a coastal city (New York, Hong Kong, Reykjavík) is clearly aimed at that country.
export const COAST_KM = 20;
const KM_PER_DEGREE = 111.32;

function kmToRing(ring: number[], x: number, y: number): number {
 const scale = Math.cos(y * Math.PI / 180);
 let best = Infinity;
 for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
  const ax = (ring[j] - x) * scale, ay = ring[j + 1] - y, bx = (ring[i] - x) * scale, by = ring[i + 1] - y;
  const dx = bx - ax, dy = by - ay, length = dx * dx + dy * dy;
  const t = length ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / length)) : 0;
  best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
 }
 return best * KM_PER_DEGREE;
}

/** ISO alpha-2 code of the country containing the point (or whose coast is within COAST_KM), else null. */
export function countryAt(lookup: CountryLookup, { latitude: y, longitude: x }: Coordinates): string | null {
 for (const country of lookup.countries) {
  const [minX, minY, maxX, maxY] = country.b;
  if (x < minX || x > maxX || y < minY || y > maxY) continue;
  // Even-odd across all rings of a polygon handles holes (e.g. Lesotho inside South Africa).
  for (const polygon of country.p) if (polygon.reduce((inside, ring) => inRing(ring, x, y) ? !inside : inside, false)) return country.c;
 }
 const pad = COAST_KM / KM_PER_DEGREE / Math.max(0.2, Math.cos(y * Math.PI / 180));
 let nearest: string | null = null, nearestKm = COAST_KM;
 for (const country of lookup.countries) {
  const [minX, minY, maxX, maxY] = country.b;
  if (x < minX - pad || x > maxX + pad || y < minY - pad || y > maxY + pad) continue;
  for (const polygon of country.p) {
   const km = kmToRing(polygon[0], x, y);
   if (km <= nearestKm) { nearestKm = km; nearest = country.c; }
  }
 }
 return nearest;
}

let pending: Promise<CountryLookup | null> | null = null;
/** Fetches the bundled lookup once; resolves null if it cannot load, so scoring falls back to distance. */
export function loadCountryLookup(): Promise<CountryLookup | null> {
 pending ??= fetch("/country-lookup.json").then(r => r.ok ? r.json() as Promise<CountryLookup> : null).catch(() => null)
  .then(lookup => { if (!lookup) pending = null; return lookup; });
 return pending;
}

// ISO 3166-2 lists Hong Kong and Macau as subdivisions of China (CN-HK, CN-MO); StarTap content labels them China.
const PART_OF: Readonly<Record<string, string>> = { HK: "CN", MO: "CN" };
/** Whether the tapped country matches the answer's country. Unknown (sea, lookup unavailable) is never a match. */
export function isSameCountry(tapped: string | null | undefined, answer: string | null | undefined): boolean {
 if (!tapped || !answer) return false;
 return (PART_OF[tapped] ?? tapped) === (PART_OF[answer] ?? answer);
}
