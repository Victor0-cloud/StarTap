import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { baseScore, calculateCountryScore, resultState, resultTier, sparkMood, RESULT_LABELS } from "./result.ts";
import { calculateDistanceKm } from "./distance.ts";
import { resultsFor, restoreProgress } from "./progress.ts";
import { summarizeResults, MAX_GAME_SCORE } from "./results.ts";
import { countryAt, isSameCountry, type CountryLookup } from "../geo/countries.ts";

const lookup: CountryLookup = JSON.parse(readFileSync(new URL("../../../public/country-lookup.json", import.meta.url), "utf8"));
const MONTREAL = { latitude: 45.5017, longitude: -73.5673 }; // Nadia Comăneci question answer, Canada
function play(latitude: number, longitude: number) {
 const tap = { latitude, longitude };
 const tapped = countryAt(lookup, tap);
 const distanceKm = calculateDistanceKm(tap, MONTREAL);
 const sameCountry = isSameCountry(tapped, "CA");
 const score = calculateCountryScore(distanceKm, sameCountry);
 return { tapped, distanceKm, ...resultState({ distanceKm, sameCountry, score }) };
}

test("QA 1: correct city", () => {
 const nailed = play(45.52, -73.6), city = play(45.78, -74.0);
 assert.equal(nailed.label, "NAILED IT!"); assert.equal(nailed.score, 1000);
 assert.equal(city.label, "RIGHT CITY!"); assert.ok(city.score >= 850 && city.score <= 950, String(city.score));
});

test("QA 2: correct region (same country, under 300 km)", () => {
 const r = play(46.8139, -71.208); // Québec City
 assert.equal(r.tapped, "CA"); assert.equal(r.label, "RIGHT REGION!");
 assert.ok(r.score >= 700 && r.score <= 849, String(r.score));
 assert.equal(r.subtitle, "Right country · under 300 km");
});

test("QA 3: correct country, wrong city always earns meaningful points", () => {
 for (const [lat, lng] of [[43.6532, -79.3832], [49.2827, -123.1207], [64.2008, -149.4937 + 10]]) {
  const r = play(lat, lng);
  if (r.tapped !== "CA") continue;
  assert.equal(r.label, "RIGHT COUNTRY!"); assert.ok(r.score >= 500 && r.score <= 699, `${lat},${lng}: ${r.score}`);
 }
 assert.equal(play(49.2827, -123.1207).score, 500); // Vancouver, ~3,700 km: floor of the band
});

test("QA 4: neighbouring country earns some distance credit", () => {
 const r = play(44.4759, -73.2121); // Burlington, Vermont
 assert.equal(r.tapped, "US"); assert.equal(r.label, "CLOSE!");
 assert.ok(r.score >= 200 && r.score <= 499, String(r.score));
});

test("QA 5: far wrong guess can reach zero", () => {
 const tokyo = play(35.6762, 139.6503);
 assert.equal(tokyo.label, "NOT QUITE!"); assert.equal(tokyo.score, 0);
 const mexico = play(19.4326, -99.1332);
 assert.equal(mexico.label, "NOT QUITE!"); assert.ok(mexico.score >= 0 && mexico.score <= 199);
});

test("every band stays inside its range and never exceeds 1,000", () => {
 const ranges: Record<string, [number, number]> = { nailed: [900, 1000], city: [850, 950], region: [700, 849], country: [500, 699], close: [200, 499], miss: [0, 199] };
 for (let km = 0; km <= 20000; km += km < 100 ? 0.5 : 7) for (const same of [true, false]) {
  const tier = resultTier(km, same), score = calculateCountryScore(km, same);
  const [lo, hi] = ranges[tier];
  assert.ok(score >= lo && score <= hi && score <= 1000, `${km} km same=${same}: ${tier} ${score}`);
 }
 assert.equal(calculateCountryScore(0, false), 1000);
 assert.equal(calculateCountryScore(20000, true), 500);
 assert.equal(calculateCountryScore(20000, false), 0);
 assert.throws(() => calculateCountryScore(-1, true), RangeError);
});

test("scores fall with distance inside each outcome", () => {
 for (const same of [true, false]) {
  let previous = Infinity;
  for (let km = 0; km <= 6000; km += 5) {
   const score = calculateCountryScore(km, same);
   assert.ok(score <= previous, `${km} km same=${same}`);
   previous = score;
  }
 }
});

test("the right country beats a wrong country at the same distance", () => {
 for (const km of [80, 150, 300, 800, 1500, 2500]) assert.ok(calculateCountryScore(km, true) > calculateCountryScore(km, false), String(km));
});

test("a perfect country-v2 game totals 5,000 and hints still cost 200", () => {
 const answers = Array.from({ length: 5 }, () => ({ coordinates: MONTREAL, hintUsed: false, countryCode: "CA" }));
 const questions = Array.from({ length: 5 }, (_, i) => ({ id: "q" + i, starName: "S", answerCoordinates: MONTREAL, answerCountryCode: "CA" }));
 const results = resultsFor(answers, questions, "country-v2");
 assert.equal(summarizeResults(results).totalScore, MAX_GAME_SCORE);
 assert.equal(MAX_GAME_SCORE, 5000);
 assert.equal(resultsFor([{ ...answers[0], hintUsed: true }], questions, "country-v2")[0].score, 800);
});

test("saved answers without a country still restore; right country needs the saved code", () => {
 const tap = { latitude: 43.6532, longitude: -79.3832 }; // Toronto
 const q = [{ id: "q", starName: "S", answerCoordinates: MONTREAL, answerCountryCode: "CA" }];
 assert.ok(resultsFor([{ coordinates: tap, hintUsed: false, countryCode: "CA" }], q, "country-v2")[0].score >= 500);
 assert.ok(resultsFor([{ coordinates: tap, hintUsed: false }], q, "country-v2")[0].score < 500);
 // Legacy distance scoring ignores the country entirely.
 assert.equal(resultsFor([{ coordinates: tap, hintUsed: false, countryCode: "CA" }], q, "distance-v1")[0].score, baseScore("distance-v1", calculateDistanceKm(tap, MONTREAL), false));
 const saved = (countryCode: unknown) => JSON.stringify({ version: 1, answers: [{ coordinates: tap, hintUsed: false, countryCode }], roundIndex: 0, finished: false, hintUsed: false });
 assert.equal(restoreProgress(saved("CA")).answers[0].countryCode, "CA");
 assert.equal(restoreProgress(saved(null)).answers.length, 1);
 assert.equal(restoreProgress(saved("Canada")).answers.length, 0);
});

test("labels and Spark moods: Spark only reacts to the tier; a crown overrides", () => {
 assert.deepEqual(Object.values(RESULT_LABELS), ["NAILED IT!", "RIGHT CITY!", "RIGHT REGION!", "RIGHT COUNTRY!", "CLOSE!", "NOT QUITE!"]);
 for (const tier of Object.keys(RESULT_LABELS) as (keyof typeof RESULT_LABELS)[]) {
  assert.equal(sparkMood(tier, null), tier);
  assert.equal(sparkMood(tier, 3000), "crowned");
 }
 assert.equal(resultState({ distanceKm: 5, sameCountry: true, score: 800, hintUsed: true }).subtitle, "Hint used · −200");
 assert.equal(resultState({ distanceKm: 5000, sameCountry: false, score: 0 }).subtitle, null);
});
