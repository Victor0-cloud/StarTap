import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { countryAt, isSameCountry, type CountryLookup } from "./countries.ts";
import { CITY_HIT_RADIUS, cityLimit, cityPoints, countryShape, findCountry, focusBounds, nearestCity, worldZoom, type CityList } from "./focus.ts";
import { loadRawContent } from "../content/node-content.ts";

const lookup: CountryLookup = JSON.parse(readFileSync(new URL("../../../public/country-lookup.json", import.meta.url), "utf8"));
const citiesFile = new URL("../../../public/cities.json", import.meta.url);
const cities: CityList = JSON.parse(readFileSync(citiesFile, "utf8"));

test("every answer country can be zoomed into, and nearly all have cities", () => {
 const codes = new Set(loadRawContent().questions.map(q => q.answer.countryCode));
 for (const code of codes) assert.ok(findCountry(lookup, code), code);
 // Only tiny states (Barbados, Monaco, Saint Lucia…) may have fewer than three listed cities.
 for (const code of codes) {
  if ((cities.countries[code] ?? []).length >= 3) continue;
  const [[w, s], [e, n]] = focusBounds(findCountry(lookup, code)!);
  assert.ok(e - w < 1.5 && n - s < 1.5, `${code} has few cities but is not small`);
  assert.ok((cities.countries[code] ?? []).length >= 1, `${code} has no city at all`);
 }
});

test("cities sit inside their own country", () => {
 let checked = 0, inside = 0;
 for (const [code, list] of Object.entries(cities.countries)) for (const [, lon, lat] of list.slice(0, 5)) {
  checked++;
  if (isSameCountry(countryAt(lookup, { latitude: lat, longitude: lon }), code)) inside++;
 }
 assert.ok(inside / checked > 0.95, `${inside}/${checked}`);
});

test("capitals come first and the list is capped", () => {
 assert.equal(cities.countries.NG[0][0], "Abuja");
 assert.equal(cities.countries.GB[0][0], "London");
 assert.equal(cities.countries.AU[0][0], "Canberra");
 for (const list of Object.values(cities.countries)) assert.ok(list.length <= 40);
 assert.ok(statSync(citiesFile).size < 200 * 1024);
});

test("zoom box uses the main landmass, so big spread-out countries stay usable", () => {
 for (const code of ["US", "RU", "FR", "NZ", "FJ", "CA"]) {
  const [[w, s], [e, n]] = focusBounds(findCountry(lookup, code)!);
  assert.ok(e > w && n > s && e - w < 180, `${code}: ${w},${s} → ${e},${n}`);
 }
 const [[w], [e]] = focusBounds(findCountry(lookup, "US")!);
 assert.ok(w > -130 && e < -60, "contiguous US, not Alaska or Hawaii");
});

test("more cities appear as you zoom in", () => {
 // Progressive label density: capital + biggest, then more major cities, then the broader set; never more than 40.
 assert.deepEqual([5, 5.5, 6, 7, 8, 20].map(z => cityLimit(z, 5)), [6, 6, 15, 28, 40, 40]);
 assert.equal(cityLimit(1, 5), 6, "zooming out never drops below the capital and biggest cities");
 const fc = cityPoints(cities, "US", 10);
 assert.equal(fc.features.length, 10);
 assert.deepEqual(Object.keys(fc.features[0].properties).sort(), ["cap", "name", "rank"], "no answer data in city points");
 assert.equal(cityPoints(cities, "ZZ", 10).features.length, 0);
});

test("country outline converts to GeoJSON", () => {
 const shape = countryShape(findCountry(lookup, "JM")!);
 assert.equal(shape.geometry.type, "MultiPolygon");
 assert.ok(shape.geometry.coordinates[0][0].length >= 4);
});

test("forgiving city taps: nearest city inside a 44 px target, exact point otherwise", () => {
 const cities = [{ item: "A", x: 100, y: 100 }, { item: "B", x: 130, y: 100 }];
 assert.equal(CITY_HIT_RADIUS * 2 >= 44, true);
 assert.equal(nearestCity({ x: 112, y: 104 }, cities), "A");
 assert.equal(nearestCity({ x: 118, y: 100 }, cities), "B", "the closer city wins");
 assert.equal(nearestCity({ x: 100, y: 125 }, cities), null, "outside the target: exact point");
 assert.equal(nearestCity({ x: 0, y: 0 }, []), null);
});

test("world view fits the whole globe on phones and desktops", () => {
 const diameter = (z: number) => 512 / Math.PI * Math.pow(2, z);
 for (const [w, h] of [[358, 470], [390, 520], [900, 560], [1300, 640]]) {
  const d = diameter(worldZoom(w, h));
  assert.ok(d <= Math.min(w, h) && d >= Math.min(w, h) * 0.8, `${w}x${h}: globe ${Math.round(d)} px`);
 }
});
