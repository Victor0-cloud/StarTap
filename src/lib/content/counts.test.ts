import test from "node:test";
import assert from "node:assert/strict";
import { categoryCounts, MIN_PLAYABLE, playableQuestions } from "./counts.ts";
import { loadRawContent } from "./node-content.ts";

const raw = loadRawContent();
const counts = categoryCounts(raw);
const get = (key: string) => counts.find(c => c.key === key)!;
const people = (pred: (q: ReturnType<typeof playableQuestions>[number]) => boolean) => new Set(playableQuestions(raw).filter(pred).map(q => q.entityId)).size;

test("category counts are live distinct-people counts from the catalog", () => {
 for (const c of counts) {
  const expected = people(q => q.primaryCategory === c.key || (q.secondary ?? []).some(s => s.category === c.key));
  assert.equal(c.stars, expected, c.key);
  assert.equal(c.playable, c.stars >= MIN_PLAYABLE, c.key);
 }
 assert.ok(get("music").stars >= 40 && get("sports").stars >= 30 && get("screen").stars >= 25);
});

test("categories keep the approved order: seven main worlds, then More", () => {
 assert.deepEqual(counts.filter(c => c.group === "main").map(c => c.key), ["music", "sports", "screen", "geography", "culture", "icons", "tech"]);
 assert.deepEqual(counts.filter(c => c.group === "more").map(c => c.key), ["history", "food", "fashion", "science", "business", "creators", "legends", "royalty"]);
});

test("subcategory counts list only subcategories that have content, and add up", () => {
 for (const c of counts) for (const s of c.subcategories) {
  assert.ok(s.stars > 0, `${c.key}/${s.key}`);
  assert.equal(s.playable, s.stars >= MIN_PLAYABLE);
 }
 const music = get("music");
 // Every person has exactly one primary subcategory, so the category total is the sum of primary memberships; additional
 // same-category memberships (e.g. music/rnb + music/soul-legends-80s-90s) add exactly one count each, never more.
 const pool = playableQuestions(raw).filter(q => q.primaryCategory === "music");
 const extra = new Set(pool.flatMap(q => (q.secondary ?? []).filter(s => s.category === "music").map(s => `${q.entityId}/${s.subcategory}`))).size;
 assert.equal(music.subcategories.reduce((n, s) => n + s.stars, 0), music.stars + extra);
 assert.ok(music.subcategories.some(s => s.key === "pop" && s.playable));
});

test("thin and empty worlds are never playable", () => {
 assert.equal(get("geography").stars, 0);
 assert.equal(get("geography").playable, false);
 assert.equal(get("culture").playable, false);
 for (const c of counts.filter(c => c.stars < MIN_PLAYABLE)) assert.equal(c.playable, false, c.key);
});
