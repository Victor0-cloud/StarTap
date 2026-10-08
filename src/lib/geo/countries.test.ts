import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { countryAt, isSameCountry, type CountryLookup } from "./countries.ts";
import { loadRawContent } from "../content/node-content.ts";

const file = new URL("../../../public/country-lookup.json", import.meta.url);
const lookup: CountryLookup = JSON.parse(readFileSync(file, "utf8"));
const at = (latitude: number, longitude: number) => countryAt(lookup, { latitude, longitude });

test("finds countries, small islands, territories and enclaves", () => {
 const cases: [string, number, number, string | null][] = [
  ["Montréal", 45.5017, -73.5673, "CA"], ["Burlington VT", 44.4759, -73.2121, "US"], ["Stone Town", -6.1659, 39.2026, "TZ"],
  ["Bridgetown", 13.0975, -59.6167, "BB"], ["Hong Kong", 22.3193, 114.1694, "HK"], ["San Juan", 18.4655, -66.1057, "PR"],
  ["Funchal", 32.6669, -16.9241, "PT"], ["Maseru (inside South Africa)", -29.31, 27.48, "LS"], ["Johannesburg", -26.2041, 28.0473, "ZA"],
  ["Mid-Atlantic", 30, -40, null], ["Mid-Pacific", 0, -150, null],
 ];
 for (const [name, lat, lng, code] of cases) assert.equal(at(lat, lng), code, name);
});

test("taps in a harbour or just offshore count for the nearby coast, open sea does not", () => {
 assert.equal(at(40.68, -74.03), "US"); // New York harbour
 assert.equal(at(50.2, -1.0), null); // middle of the English Channel
});

test("every answer location lies in its answer country", () => {
 for (const q of loadRawContent().questions) assert.ok(isSameCountry(at(q.answer.latitude, q.answer.longitude), q.answer.countryCode), `${q.id} ${q.answer.city}`);
});

test("Hong Kong and Macau match China, unknown never matches", () => {
 assert.equal(isSameCountry("HK", "CN"), true);
 assert.equal(isSameCountry("CN", "HK"), true);
 assert.equal(isSameCountry("MO", "CN"), true);
 assert.equal(isSameCountry("US", "CA"), false);
 assert.equal(isSameCountry(null, "CA"), false);
 assert.equal(isSameCountry(undefined, undefined), false);
});

test("lookup stays small enough for the APK", () => {
 assert.ok(statSync(file).size < 800 * 1024, `${statSync(file).size} bytes`);
 assert.ok(lookup.countries.length >= 240);
});
