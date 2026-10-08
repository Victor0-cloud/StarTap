// Compatibility lock: the V2 content system must reproduce every pre-V2 edition exactly.
// The lock files were frozen from the ORIGINAL code by scripts/legacy/migrate-v1.cjs.
import test from "node:test";
import assert from "node:assert/strict";
import { buildCatalog, dailyQuestions, editionQuestions, editionScoring, resolveEdition, stickyEdition } from "./build.ts";
import { loadJson, loadRawContent } from "./node-content.ts";
import { EDITION } from "../game/daily.ts";
import { resultsFor } from "../game/progress.ts";
import { buildShareText } from "../game/share.ts";

const catalog = buildCatalog(loadRawContent());
const lock = loadJson("legacy/gameplay.lock.json");
const snapshot = loadJson("legacy/content.snapshot.json");
const LEGACY = ["origins-v1", "stories-v2", "global-v3", "global-v4"];
const normal = (value: unknown) => JSON.parse(JSON.stringify(value));

test("lock covers all four legacy editions, which keep their original distance scoring", () => {
 assert.deepEqual(Object.keys(lock.editions), LEGACY);
 assert.equal(lock.defaultEdition, "global-v4");
 for (const edition of LEGACY) {
  assert.ok(catalog.raw.editions.editions[edition], edition);
  assert.equal(editionScoring(catalog, edition), "distance-v1", edition);
 }
 // Country-first scoring arrived as a new edition; the legacy default is untouched.
 assert.equal(catalog.raw.editions.default, "global-v5");
 assert.equal(EDITION, catalog.raw.editions.default);
});

test("global-v5 keeps the exact global-v4 question order and daily rotation", () => {
 assert.deepEqual(catalog.raw.editions.editions["global-v5"].questionIds, catalog.raw.editions.editions["global-v4"].questionIds);
 assert.equal(catalog.raw.editions.editions["global-v5"].selector, "blocks");
 assert.equal(editionScoring(catalog, "global-v5"), "country-v2");
 for (const [day, ids] of Object.entries(lock.days["global-v4"] as Record<string, string[]>)) assert.deepEqual(dailyQuestions(catalog, "global-v5", day).map(q => q.id), ids, day);
});

test("every edition keeps the same question IDs, order and answer coordinates", () => {
 for (const edition of LEGACY) {
  const actual = editionQuestions(catalog, edition).map(q => ({ id: q.id, latitude: q.answerCoordinates.latitude, longitude: q.answerCoordinates.longitude }));
  assert.deepEqual(actual, lock.editions[edition].questions, edition);
  assert.equal(catalog.raw.editions.editions[edition].selector, lock.editions[edition].selector, edition);
 }
});

test("every locked date selects the same five questions in the same order", () => {
 let checked = 0;
 for (const edition of LEGACY) for (const [day, ids] of Object.entries(lock.days[edition] as Record<string, string[]>)) {
  assert.deepEqual(dailyQuestions(catalog, edition, day).map(q => q.id), ids, `${edition} ${day}`);
  checked++;
 }
 assert.ok(checked >= 4 * 90, `checked ${checked} edition-days`);
});

test("every shared edition link resolves exactly as before; missing or unknown editions open the current default", () => {
 for (const [requested, resolved] of Object.entries(lock.resolution as Record<string, string>)) {
  const expected = LEGACY.includes(requested) ? resolved : catalog.raw.editions.default;
  assert.equal(resolveEdition(catalog, requested || null), expected, JSON.stringify(requested));
  if (LEGACY.includes(requested)) assert.equal(resolved, requested);
 }
 for (const bad of [null, "constructor", "__proto__"]) assert.equal(resolveEdition(catalog, bad), "global-v5");
});

test("saved guesses recompute to the same scores and distances", () => {
 for (const edition of LEGACY) for (const [day, expected] of Object.entries(lock.scoring.results[edition] as Record<string, { distanceKm: number }[]>)) {
  const actual = resultsFor(lock.scoring.guesses, dailyQuestions(catalog, edition, day), editionScoring(catalog, edition)).map(r => ({ ...r, distanceKm: Math.round(r.distanceKm * 1e6) / 1e6 }));
  assert.deepEqual(actual, expected, `${edition} ${day}`);
 }
});

test("share text and challenge links are identical to the original", () => {
 assert.ok(lock.share.length >= 16);
 for (const item of lock.share) {
  const text = buildShareText({ day: item.day, edition: item.edition, practice: item.practice, origin: item.native ? null : item.origin, results: item.scores.map((score: number) => ({ score })) });
  assert.equal(text, item.text, `${item.edition} ${item.day} practice=${item.practice} native=${item.native}`);
  if (!item.native) assert.ok(text.endsWith(`/play?day=${item.day}&edition=${item.edition}`));
  else assert.ok(!text.includes("http"));
 }
});

test("every playable field of every legacy question is unchanged (new fields may be added, none changed or removed)", () => {
 for (const edition of LEGACY) {
  const actual = normal(editionQuestions(catalog, edition)) as Record<string, unknown>[];
  assert.equal(actual.length, snapshot.editions[edition].length, edition);
  snapshot.editions[edition].forEach((expected: Record<string, unknown>, i: number) => {
   const same = Object.fromEntries(Object.keys(expected).map(key => [key, actual[i][key]]));
   assert.deepEqual(same, expected, edition + " " + expected.id);
  });
 }
});

test("all 65 live stars are preserved with their photos, credits and Star Portal links", () => {
 const live = editionQuestions(catalog, "global-v4");
 assert.equal(live.length, 65);
 assert.equal(new Set(live.map(q => q.starName)).size, 65);
 assert.equal(live.filter(q => q.imageUrl && q.imageCredit).length, 5);
 assert.equal(live.filter(q => q.media).length, 17);
 // The legacy editions still reference exactly the original 65 people and 75 questions (new batches add to the catalog).
 const legacyIds = new Set(LEGACY.flatMap(e => catalog.raw.editions.editions[e].questionIds));
 assert.equal(legacyIds.size, 75);
 assert.equal(new Set([...legacyIds].map(id => catalog.questions.get(id)!.entityId)).size, 65);
});

test("a day already started under global-v4 stays on global-v4; explicit links always win", () => {
 const saved = new Set(["global-v4:2026-09-30"]);
 const hasSave = (edition: string, day: string) => saved.has(edition + ":" + day);
 assert.equal(stickyEdition(catalog, null, "2026-09-30", hasSave), "global-v4");
 assert.equal(stickyEdition(catalog, null, "2026-10-01", hasSave), "global-v5");
 assert.equal(stickyEdition(catalog, "global-v5", "2026-09-30", hasSave), "global-v5");
 assert.equal(stickyEdition(catalog, "global-v3", "2026-09-30", hasSave), "global-v3");
 assert.equal(stickyEdition(catalog, "bogus", "2026-09-30", hasSave), "global-v4");
 assert.equal(stickyEdition(catalog, "bogus", "2026-10-02", hasSave), "global-v5");
});
