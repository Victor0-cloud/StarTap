import type { CountryLookup } from "./countries.ts";

// public/cities.json: per ISO code, [name, longitude, latitude, isCapital] with the capital first, then by population.
export interface CityList { countries: Record<string, [string, number, number, 0 | 1][]> }
type Country = CountryLookup["countries"][number];

export const findCountry = (lookup: CountryLookup, code: string): Country | undefined => lookup.countries.find(c => c.c === code);

/** Box to zoom to: the country's largest landmass, so the US is not stretched to Alaska and Hawaii. */
export function focusBounds(country: Country): [[number, number], [number, number]] {
 let best: [number, number, number, number] = [0, 0, 0, 0], area = -1;
 for (const polygon of country.p) {
  const ring = polygon[0];
  let minX = 180, minY = 90, maxX = -180, maxY = -90;
  for (let i = 0; i < ring.length; i += 2) { minX = Math.min(minX, ring[i]); maxX = Math.max(maxX, ring[i]); minY = Math.min(minY, ring[i + 1]); maxY = Math.max(maxY, ring[i + 1]); }
  const a = (maxX - minX) * (maxY - minY);
  if (a > area) { area = a; best = [minX, minY, maxX, maxY]; }
 }
 return [[best[0], best[1]], [best[2], best[3]]];
}

/** The country's outline as GeoJSON, for the highlight layer. */
export function countryShape(country: Country) {
 const pairs = (ring: number[]) => { const out: [number, number][] = []; for (let i = 0; i < ring.length; i += 2) out.push([ring[i], ring[i + 1]]); return out; };
 return { type: "Feature" as const, properties: { code: country.c }, geometry: { type: "MultiPolygon" as const, coordinates: country.p.map(polygon => polygon.map(pairs)) } };
}

/**
 * How many cities to show, in clear steps so labels never crowd: the capital and biggest cities at the country view,
 * more major cities one zoom level in, and the broader local set closer still.
 */
export const CITY_TIERS = [6, 15, 28, 40] as const;
export function cityLimit(zoom: number, focusZoom: number, tiers: readonly number[] = CITY_TIERS): number {
 const step = Math.max(0, Math.min(tiers.length - 1, Math.floor(zoom - focusZoom + 0.25)));
 return tiers[step];
}

/** Touch radius (CSS px) around a city: the dot stays small, but a 44 px target is easy to hit with a thumb. */
export const CITY_HIT_RADIUS = 22;
/** The nearest city within the touch radius of a tap, or null to place Spark exactly where the player tapped. */
export function nearestCity<T>(tap: { x: number; y: number }, cities: readonly { item: T; x: number; y: number }[], radius = CITY_HIT_RADIUS): T | null {
 let best: T | null = null, bestDistance = radius;
 for (const c of cities) {
  const d = Math.hypot(c.x - tap.x, c.y - tap.y);
  if (d <= bestDistance) { best = c.item; bestDistance = d; }
 }
 return best;
}

/**
 * Globe zoom that shows the whole Earth with a little space around it in a map of this size.
 * At zoom 0 the globe is 512/π px across, and it doubles with each zoom level.
 */
export function worldZoom(width: number, height: number): number {
 const diameter = Math.max(160, Math.min(width, height) * 0.88);
 return Math.max(0.3, Math.min(2.2, Math.log2(diameter * Math.PI / 512)));
}

/** City points for one country, as GeoJSON. Never marks or favours the answer; it is just the country's main cities. */
export function cityPoints(cities: CityList, code: string, limit: number) {
 return {
  type: "FeatureCollection" as const,
  features: (cities.countries[code] ?? []).slice(0, limit).map(([name, lon, lat, cap], i) => ({
   type: "Feature" as const, properties: { name, cap, rank: i }, geometry: { type: "Point" as const, coordinates: [lon, lat] as [number, number] },
  })),
 };
}

let pending: Promise<CityList | null> | null = null;
export function loadCities(): Promise<CityList | null> {
 pending ??= fetch("/cities.json").then(r => r.ok ? r.json() as Promise<CityList> : null).catch(() => null)
  .then(list => { if (!list) pending = null; return list; });
 return pending;
}
