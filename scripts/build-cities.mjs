// Builds public/cities.json: the main cities of each country, shown when a player zooms into a country.
// Source: Natural Earth 1:10m Populated Places (public domain), assets/geo/ne_10m_populated_places_simple.geojson.
// Up to PER_COUNTRY cities per country, largest population first, national capital flagged. Run: node scripts/build-cities.mjs
import { readFileSync, writeFileSync } from "node:fs";

const PER_COUNTRY = 40;
// Natural Earth gives these no ISO code; match the country lookup (Kosovo XK; ISO 3166-1 assigns the others to SO / CY).
const NO_ISO = { KOS: "XK", SOL: "SO", CYN: "CY" };
const source = JSON.parse(readFileSync(new URL("../assets/geo/ne_10m_populated_places_simple.geojson", import.meta.url), "utf8"));
const by = {};
for (const { properties: p } of source.features) {
 const code = /^[A-Z]{2}$/.test(p.iso_a2 ?? "") ? p.iso_a2 : NO_ISO[p.adm0_a3];
 if (!code || !p.name) continue;
 (by[code] ??= []).push({ n: p.name.replace(/\s+/g, " ").trim(), lon: Math.round(p.longitude * 1000) / 1000, lat: Math.round(p.latitude * 1000) / 1000, pop: Math.max(0, p.pop_max | 0), cap: p.adm0cap === 1 ? 1 : 0 });
}
const countries = {};
for (const [code, list] of Object.entries(by)) {
 const seen = new Set();
 // Capitals first, then by population; drop duplicate names within a country.
 countries[code] = list.sort((a, b) => b.cap - a.cap || b.pop - a.pop).filter(c => !seen.has(c.n) && seen.add(c.n)).slice(0, PER_COUNTRY).map(c => [c.n, c.lon, c.lat, c.cap]);
}
const out = { source: "Natural Earth 1:10m Populated Places (public domain); top cities per country, capitals first", countries };
writeFileSync(new URL("../public/cities.json", import.meta.url), JSON.stringify(out));
const total = Object.values(countries).reduce((n, l) => n + l.length, 0);
console.log(`${Object.keys(countries).length} countries, ${total} cities, ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`);
console.log("NG:", countries.NG.slice(0, 8).map(c => c[0]).join(", "));
console.log("US:", countries.US.slice(0, 8).map(c => c[0]).join(", "));
