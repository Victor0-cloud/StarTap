// Builds public/country-lookup.json for "which country did the player tap?".
// Source: Natural Earth 1:50m Admin 0 Countries (public domain), assets/geo/ne_50m_admin_0_countries.geojson.
// Shapes are simplified (Douglas-Peucker, ~2 km) and rounded to 0.01°. Run: node scripts/build-country-lookup.mjs
import { readFileSync, writeFileSync } from "node:fs";

const TOLERANCE = 0.02; // degrees, about 2 km
// Features without an ISO code: follow ISO 3166-1, which assigns these areas to SO and CY. Siachen stays unassigned.
const NO_ISO = { Somaliland: "SO", "N. Cyprus": "CY" };
const source = JSON.parse(readFileSync(new URL("../assets/geo/ne_50m_admin_0_countries.geojson", import.meta.url), "utf8"));

function simplify(points) {
 if (points.length < 5) return points;
 const keep = new Uint8Array(points.length); keep[0] = keep[points.length - 1] = 1;
 const stack = [[0, points.length - 1]];
 while (stack.length) {
  const [a, b] = stack.pop(); const [ax, ay] = points[a], [bx, by] = points[b];
  let far = -1, index = -1;
  for (let i = a + 1; i < b; i++) {
   const [px, py] = points[i]; const dx = bx - ax, dy = by - ay;
   const t = dx || dy ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))) : 0;
   const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
   if (d > far) { far = d; index = i; }
  }
  if (far > TOLERANCE) { keep[index] = 1; stack.push([a, index], [index, b]); }
 }
 const out = points.filter((_, i) => keep[i]);
 return out.length >= 4 ? out : points;
}
const round = n => Math.round(n * 100) / 100;
const countries = [];
for (const feature of source.features) {
 const p = feature.properties;
 const code = [p.ISO_A2, p.ISO_A2_EH, p.WB_A2].find(v => /^[A-Z]{2}$/.test(v ?? "")) ?? NO_ISO[p.NAME];
 if (!code) continue;
 const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
 let minX = 180, minY = 90, maxX = -180, maxY = -90;
 const p2 = polygons.map(rings => rings.map(ring => {
  const flat = [];
  for (const [x, y] of simplify(ring)) { flat.push(round(x), round(y)); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  return flat;
 }));
 countries.push({ c: code, b: [round(minX), round(minY), round(maxX), round(maxY)], p: p2 });
}
const out = { source: "Natural Earth 1:50m Admin 0 Countries (public domain), simplified ~2 km", countries };
writeFileSync(new URL("../public/country-lookup.json", import.meta.url), JSON.stringify(out));
const points = countries.reduce((n, c) => n + c.p.flat().reduce((m, r) => m + r.length / 2, 0), 0);
console.log(`${countries.length} countries, ${points} points, ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`);
