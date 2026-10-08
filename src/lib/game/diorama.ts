import type { Biome } from "./landing.ts";

// Landing diorama geometry: miniature 3D city blocks around each city beacon and biome props scattered on the country,
// built from the offline country outline and city list. Real coordinates throughout, so taps and distances stay exact.
// Everything is deterministic per country, so a reload draws the same miniature world.

type Ring = number[]; // flattened [lng, lat, lng, lat, …] as in country-lookup.json
export interface CountryOutline { c: string; p: Ring[][] }
export interface DioramaFeature { type: "Feature"; properties: { h: number; c: string }; geometry: { type: "Polygon"; coordinates: [number, number][][] } }
export interface DioramaData { type: "FeatureCollection"; features: DioramaFeature[] }

const rng = (seed: string) => { let h = 2166136261; for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; };

function inRing(ring: Ring, x: number, y: number): boolean {
 let inside = false;
 for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
  const xi = ring[i], yi = ring[i + 1], xj = ring[j], yj = ring[j + 1];
  if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
 }
 return inside;
}
/** Point in the country (outer rings minus holes). */
export function inCountry(country: CountryOutline, lng: number, lat: number): boolean {
 return country.p.some(polygon => inRing(polygon[0], lng, lat) && !polygon.slice(1).some(hole => inRing(hole, lng, lat)));
}

/** Size of the country's largest landmass in km (its bounding-box diagonal); sets the scale of the miniature world. */
export function landmassKm(bounds: [[number, number], [number, number]]): number {
 const [[w, s], [e, n]] = bounds, midLat = (s + n) / 2;
 const dx = (e - w) * 111 * Math.cos(midLat * Math.PI / 180), dy = (n - s) * 111;
 return Math.max(20, Math.hypot(dx, dy));
}

/** Island slab thickness and box heights scale with the landmass, so a tiny island and a huge country both read well. */
export const dioramaScale = (km: number) => ({ unitKm: km / 48, heightM: km * 34 });

function box(lng: number, lat: number, wKm: number, dKm: number, h: number, c: string): DioramaFeature {
 const dLat = dKm / 2 / 111, dLng = wKm / 2 / (111 * Math.max(0.2, Math.cos(lat * Math.PI / 180)));
 return { type: "Feature", properties: { h: Math.round(h), c }, geometry: { type: "Polygon", coordinates: [[[lng - dLng, lat - dLat], [lng + dLng, lat - dLat], [lng + dLng, lat + dLat], [lng - dLng, lat + dLat], [lng - dLng, lat - dLat]]] } };
}

// Building palettes per biome (index 0–2), picked by the renderer from the "c" property.
export const BLOCK_COLORS: Readonly<Record<Biome, readonly [string, string, string]>> = {
 neutral: ["#5a47c4", "#2f7fd0", "#9a4fd6"],
 desert: ["#e2b56a", "#c98c48", "#f0d29a"],
 rainforest: ["#3aa47c", "#2a7f86", "#7ccf8a"],
 snow: ["#d6e8f7", "#9fc3e6", "#ffffff"],
};
export const PROP_COLORS: Readonly<Record<Biome, readonly [string, string, string]>> = {
 neutral: ["#3f9a5c", "#2f7a48", "#5cc8ff"],   // parks, trees, ponds
 desert: ["#a8693a", "#8a5530", "#7aa04a"],    // rocky mesas, ridges, sparse scrub
 rainforest: ["#1f7a3e", "#155c2e", "#2f9a52"], // canopy trees
 snow: ["#f4f9ff", "#cfe3f5", "#2f5a4a"],      // ice peaks, snowbanks, frosted pines
};

/**
 * Miniature city: a cluster of blocks around each city beacon, bigger for the capital and the largest cities.
 * The centre stays clear so the beacon, label and mascot are never hidden.
 */
export function cityBlocks(cities: readonly [string, number, number, 0 | 1][], biome: Biome, km: number): DioramaData {
 const { unitKm, heightM } = dioramaScale(km);
 const features: DioramaFeature[] = [];
 cities.forEach(([name, lng, lat, cap], rank) => {
  const r = rng(name + rank), count = cap ? 9 : Math.max(4, 8 - Math.floor(rank / 4));
  const tall = biome === "neutral" ? 1 : biome === "desert" ? 0.45 : 0.6;
  for (let i = 0; i < count; i++) {
   const angle = (i / count) * Math.PI * 2 + r() * 0.6, dist = unitKm * (0.9 + r() * 1.3);
   const lngOff = Math.cos(angle) * dist / (111 * Math.max(0.2, Math.cos(lat * Math.PI / 180))), latOff = Math.sin(angle) * dist / 111;
   const size = unitKm * (0.35 + r() * 0.35), h = heightM * tall * (cap ? 1.6 : 1.1 - Math.min(rank, 20) * 0.03) * (0.4 + r() * 0.9);
   features.push(box(lng + lngOff, lat + latOff, size, size * (0.7 + r() * 0.6), h, String(Math.floor(r() * 3))));
  }
 });
 return { type: "FeatureCollection", features };
}

/** Biome props scattered over the country (never on top of a city cluster): trees, mesas, ice peaks or parks. */
export function biomeProps(country: CountryOutline, bounds: [[number, number], [number, number]], biome: Biome, cities: readonly [string, number, number, 0 | 1][], count = 140): DioramaData {
 const km = landmassKm(bounds), { unitKm, heightM } = dioramaScale(km), r = rng(country.c + biome);
 const [[w, s], [e, n]] = bounds, features: DioramaFeature[] = [];
 const clear = unitKm * 2.6;
 const nearCity = (lng: number, lat: number) => cities.some(([, x, y]) => Math.hypot((x - lng) * 111 * Math.cos(lat * Math.PI / 180), (y - lat) * 111) < clear);
 const shape = { desert: [0.9, 0.18], rainforest: [0.32, 0.55], snow: [0.5, 0.7], neutral: [0.55, 0.12] }[biome];
 for (let tries = 0; features.length < count && tries < count * 12; tries++) {
  const lng = w + r() * (e - w), lat = s + r() * (n - s);
  if (!inCountry(country, lng, lat) || nearCity(lng, lat)) continue;
  const size = unitKm * shape[0] * (0.6 + r() * 0.8), h = heightM * shape[1] * (0.5 + r());
  features.push(box(lng, lat, size, size * (0.8 + r() * 0.5), h, String(Math.floor(r() * 3))));
 }
 return { type: "FeatureCollection", features };
}
