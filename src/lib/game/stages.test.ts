import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { cityPoints, compassDirection, COUNTRY_POINTS, CITY_POINTS, jokerZone, pixelClue, stagedScore, stageLabel, stageTier, wrongCountryPoints } from "./stages.ts";
import { emptyProgress, restoreProgress, resultsFor } from "./progress.ts";
import { DEFAULT_MASCOT, MASCOT_IDS, MASCOTS, mascotCard, mascotToken, readMascot } from "./mascots.ts";
import { BIOME_STYLE, landingWorldFor, type LandingWorlds } from "./landing.ts";
import { loadRawContent } from "../content/node-content.ts";

const right = { country: "NG", countryRight: true, joker: false, lifeSaver: false };

test("two-stage score: 300 country + up to 700 city, 1,000 max per round", () => {
 assert.equal(COUNTRY_POINTS + CITY_POINTS, 1000);
 assert.deepEqual(stagedScore(0, right, false), { countryPoints: 300, cityPoints: 700, total: 1000 });
 assert.equal(stagedScore(50, right, false).cityPoints, cityPoints(50, false));
 assert.ok(cityPoints(30, false) > cityPoints(200, false) && cityPoints(200, false) > cityPoints(900, false), "closer is better");
 assert.equal(cityPoints(5000, false), 0);
 assert.equal(stagedScore(0, right, true).total, 800, "hint still costs 200");
 assert.equal(stagedScore(5000, { ...right, joker: true }, true).total, 0, "never negative");
});

test("rescues lower the maximum: Joker country 150, Life Saver city 420", () => {
 assert.equal(stagedScore(0, { ...right, joker: true }, false).countryPoints, 150);
 assert.equal(stagedScore(0, { ...right, lifeSaver: true }, false).cityPoints, 420);
 assert.equal(stagedScore(0, { ...right, joker: true, lifeSaver: true }, false).total, 570);
});

test("wrong country: small consolation for a near miss, labels and tiers", () => {
 const wrong = { ...right, countryRight: false };
 assert.equal(stagedScore(200, wrong, false).total, 150);
 assert.equal(wrongCountryPoints(1500), 0);
 assert.equal(stageLabel(200, false), "WRONG COUNTRY");
 assert.deepEqual([10, 50, 120, 350, 900].map(km => stageLabel(km, true)), ["CITY NAILED!", "RIGHT CITY!", "VERY CLOSE!", "CLOSE!", "MISSED THE CITY!"]);
 assert.deepEqual([10, 50, 200, 900].map(km => stageTier(km, true)), ["nailed", "city", "region", "country"]);
 assert.deepEqual([500, 2000].map(km => stageTier(km, false)), ["close", "miss"]);
});

test("old saves restore unchanged; answers without stage data keep country-v2 scoring", () => {
 const legacy = JSON.stringify({ version: 1, answers: [{ coordinates: { latitude: 6.45, longitude: 3.39 }, hintUsed: false, countryCode: "NG" }], roundIndex: 0, finished: false, hintUsed: false });
 const p = restoreProgress(legacy);
 assert.deepEqual(p, { answers: [{ coordinates: { latitude: 6.45, longitude: 3.39 }, hintUsed: false, countryCode: "NG" }], roundIndex: 0, finished: false, hintUsed: false });
 const q = [{ id: "q", starName: "S", answerCoordinates: { latitude: 6.45, longitude: 3.39 }, answerCountryCode: "NG" }];
 assert.equal(resultsFor(p.answers, q, "country-v2")[0].score, 1000);
 assert.equal(resultsFor(p.answers, q, "country-v2")[0].countryPoints, undefined);
 const staged = resultsFor([{ coordinates: { latitude: 6.45, longitude: 3.39 }, hintUsed: false, countryCode: "NG", stage: { ...right, joker: true } }], q, "country-v2")[0];
 assert.deepEqual([staged.countryPoints, staged.cityPoints, staged.score], [150, 700, 850]);
});

test("rescues survive reloads: used flags and pending rounds are restored, damaged flags count as used", () => {
 const base = { version: 1, answers: [], roundIndex: 0, finished: false, hintUsed: false };
 const pending = { round: 0, phase: "country_wrong", country: "GH", countryPoint: { latitude: 7, longitude: -1 }, joker: false, lifeSaver: false };
 const p = restoreProgress(JSON.stringify({ ...base, jokerUsed: true, lifeSaverUsed: false, pending }));
 assert.deepEqual([p.jokerUsed, p.lifeSaverUsed, p.pending?.phase], [true, false, "country_wrong"]);
 assert.equal(restoreProgress(JSON.stringify({ ...base, jokerUsed: "yes" })).jokerUsed, true, "a damaged flag never hands back a Joker");
 assert.equal(restoreProgress(JSON.stringify({ ...base, pending: { ...pending, round: 3 } })).pending, undefined, "pending must belong to this round");
 assert.equal(restoreProgress(JSON.stringify({ ...base, answers: [{ coordinates: { latitude: 1, longitude: 1 }, hintUsed: false, stage: { country: "x" } }] })).answers.length, 0);
 assert.deepEqual(restoreProgress(null), emptyProgress());
});

test("Joker zone contains the answer, is not centred on it, and is stable", () => {
 const centres = [["NG", 9, 8], ["GH", 8, -1], ["BJ", 9, 2.3], ["TG", 8, 1], ["CM", 6, 12], ["NE", 17, 9], ["TD", 15, 19], ["BF", 12, -1.5], ["CI", 7.5, -5.5], ["ML", 17, -4], ["GA", -0.6, 11.6], ["FR", 46, 2]]
  .map(([code, lat, lon]) => ({ code: code as string, centre: { latitude: lat as number, longitude: lon as number } }));
 const zone = jokerZone("NG", centres, "q1");
 assert.ok(zone.includes("NG") && zone.length === 7 && !zone.includes("FR"));
 assert.deepEqual(jokerZone("NG", centres, "q1"), zone, "same question, same zone");
 assert.deepEqual(jokerZone("ZZ", centres, "q1"), []);
});

test("Life Saver direction and Pixel clues come from data only", () => {
 assert.equal(compassDirection({ latitude: 0, longitude: 0 }, { latitude: 10, longitude: 0 }), "north");
 assert.equal(compassDirection({ latitude: 0, longitude: 0 }, { latitude: -5, longitude: -5 }), "south-west");
 const ng: [string, number, number, 0 | 1][] = [["Abuja", 7.49, 9.06, 1], ["Lagos", 3.39, 6.45, 0], ["Kano", 8.52, 12.0, 0], ["Ibadan", 3.9, 7.39, 0], ["Port Harcourt", 7.0, 4.8, 0], ["Benin City", 5.6, 6.3, 0], ["Ogidi", 6.87, 6.15, 0]];
 assert.equal(pixelClue({ latitude: 9.06, longitude: 7.49 }, ng), "It's the capital city.");
 assert.equal(pixelClue({ latitude: 6.46, longitude: 3.39 }, ng), "Not the capital, but one of the country's five biggest cities.");
 assert.equal(pixelClue({ latitude: 6.15, longitude: 6.87 }, ng), "It's not the capital city.");
 assert.equal(pixelClue({ latitude: 0, longitude: 0 }, undefined), null);
});

test("mascots: six, Sparkle by default, assets exist and are small", () => {
 assert.deepEqual([...MASCOT_IDS].sort(), ["aura", "dash", "nova", "orbit", "pixel", "sparkle"]);
 assert.equal(DEFAULT_MASCOT, "sparkle");
 assert.deepEqual(["orbit", null, "Orbit", "elf"].map(v => readMascot(v)), ["orbit", "sparkle", "sparkle", "sparkle"]);
 for (const id of MASCOT_IDS) {
  assert.ok(MASCOTS[id].name && MASCOTS[id].power && MASCOTS[id].role, id);
  for (const path of [mascotCard(id), mascotToken(id)]) {
   const bytes = readFileSync(new URL(`../../../public${path}`, import.meta.url));
   assert.ok(bytes.length > 2000 && bytes.length < 60000, `${path}: ${bytes.length} bytes`);
   assert.equal(bytes.subarray(8, 12).toString(), "WEBP", path);
  }
 }
});

test("landing worlds: every curated place is a real answer location; unlisted places use the neutral world", () => {
 const data = JSON.parse(readFileSync(new URL("../../content/landing-worlds.json", import.meta.url), "utf8")) as LandingWorlds;
 const answers = loadRawContent().questions.filter(q => q.active).map(q => ({ coordinates: { latitude: q.answer.latitude, longitude: q.answer.longitude }, countryCode: q.answer.countryCode }));
 for (const place of data.places) {
  assert.ok(place.biome in BIOME_STYLE && (place.biome as string) !== "neutral" && place.koppen, place.city);
  assert.ok(answers.some(a => landingWorldFor(data, a).biome === place.biome && a.countryCode === place.countryCode), `${place.city} matches an answer`);
 }
 const counts = { desert: 0, rainforest: 0, snow: 0, neutral: 0 };
 for (const a of answers) counts[landingWorldFor(data, a).biome]++;
 assert.ok(counts.desert && counts.rainforest && counts.snow && counts.neutral > counts.desert, JSON.stringify(counts));
 assert.deepEqual(landingWorldFor(data, { coordinates: { latitude: 51.5, longitude: -0.12 }, countryCode: "GB" }), { biome: "neutral", curated: false, source: null, koppen: null, aurora: false });
 assert.equal(landingWorldFor(data, { coordinates: { latitude: 30.04, longitude: 31.24 }, countryCode: "SD" }).biome, "neutral", "country must match too");
});
