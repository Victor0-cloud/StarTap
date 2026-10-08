// V1: every intended Music and Sports subcategory is playable from live verified counts, every game is five distinct
// people and questions, and Today's Five renders exactly as it did before the expansion.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { categoryCounts, inCategory, inSubcategory, MIN_PLAYABLE } from "./counts.ts";
import { loadRawContent } from "./node-content.ts";
import { buildCatalog, dailyQuestions, editionQuestions } from "./build.ts";
import { selectQuestions } from "../game/modes.ts";

const raw = loadRawContent();
const counts = categoryCounts(raw);
const subs = (category: string) => counts.find(c => c.key === category)!.subcategories;
const q = (id: string) => raw.questions.find(x => x.id === id)!;

export const V1_MUSIC = ["pop", "afrobeats", "amapiano", "rnb", "hip-hop", "rock", "reggae-dancehall", "country", "latin", "k-pop", "electronic", "african-legends", "global-icons", "soul-legends-80s-90s"];
export const V1_SPORTS = ["football", "basketball", "baseball", "american-football", "boxing", "mma", "tennis", "track-field", "formula-1", "cricket", "gymnastics", "racket-sports", "winter-sports"];

test("every V1 Music and Sports subcategory has at least 5 verified stars and is playable", () => {
 for (const [category, keys] of [["music", V1_MUSIC], ["sports", V1_SPORTS]] as const) {
  for (const key of keys) {
   const s = subs(category).find(x => x.key === key);
   assert.ok(s && s.stars >= MIN_PLAYABLE && s.playable, `${category}/${key}: ${s?.stars ?? 0} stars`);
  }
  for (const s of subs(category)) assert.equal(s.playable, s.stars >= MIN_PLAYABLE, `${category}/${s.key} follows the live count`);
  assert.deepEqual(subs(category).filter(s => !s.playable).map(s => s.key), [], `${category}: nothing listed is still Preview / Soon`);
 }
});

test("every Play Five game (each subcategory, Music Five, Sports Five) is 5 distinct questions and 5 distinct people", () => {
 const specs = [
  ...V1_MUSIC.map(subcategory => ({ mode: "subcategory", category: "music", subcategory }) as const),
  ...V1_SPORTS.map(subcategory => ({ mode: "subcategory", category: "sports", subcategory }) as const),
  { mode: "category", category: "music" } as const, { mode: "category", category: "sports" } as const,
 ];
 for (const spec of specs) for (let i = 0; i < 120; i++) {
  const ids = selectQuestions(raw, spec, { seed: `v1-${i}` });
  assert.ok(ids, JSON.stringify(spec));
  assert.equal(ids.length, 5);
  assert.equal(new Set(ids).size, 5, `${JSON.stringify(spec)}: five distinct questions`);
  assert.equal(new Set(ids.map(id => q(id).entityId)).size, 5, `${JSON.stringify(spec)}: five distinct people`);
  for (const id of ids) assert.ok(spec.mode === "category" ? inCategory(q(id), spec.category) : inSubcategory(q(id), spec.category, spec.subcategory), id);
 }
});

test("reused stars: Taylor Swift is Pop (primary) + Country (secondary) from one record, counted once in Music", () => {
 const taylor = q("taylor-swift-global");
 assert.equal(taylor.subcategory, "pop");
 assert.deepEqual(taylor.secondary, [{ category: "music", subcategory: "country" }]);
 assert.ok(taylor.review.notes?.some(n => n.includes("britannica.com/biography/Taylor-Swift") && n.includes("country music performer")), "membership evidence is sourced");
 assert.equal(raw.questions.filter(x => x.entityId === "taylor-swift").length, 1);
 const music = new Set(raw.questions.filter(x => x.active && inCategory(x, "music")).map(x => x.entityId));
 assert.equal(counts.find(c => c.key === "music")!.stars, music.size);
 assert.equal(subs("music").find(s => s.key === "rnb")!.stars, 8, "R&B unchanged");
 assert.equal(subs("music").find(s => s.key === "soul-legends-80s-90s")!.stars, 5, "Soul Legends unchanged");
});

test("Today's Five and every legacy edition render exactly as before the V1 expansion", () => {
 const catalog = buildCatalog(raw);
 const md5 = (v: unknown) => createHash("md5").update(JSON.stringify(v)).digest("hex");
 const days = ["2026-10-04", "2026-10-05", "2026-12-25", "2027-03-01"];
 // Frozen on 4 October 2026 from the catalog before Batch 10 and the Taylor Swift membership.
 const frozen: Record<string, [string, string]> = {
  "origins-v1": ["ad8552e6a8db1d9f26d22524cbae8bbf", "41b8402ed1ff16d5e708e7e66c88c604"],
  "stories-v2": ["d48ea0224ea2b71af823da483c101812", "9bef2120f393a2adb90a6ba852938f31"],
  "global-v3": ["825e9c7a1ae942feed0e502ea6c894d9", "ac8c243915afee6c395e4ccb4b89032c"],
  "global-v4": ["79ae69ab3861c94deca587a36e78df17", "421aa1d2f9a611085ef3d1df720a4a03"],
  "global-v5": ["79ae69ab3861c94deca587a36e78df17", "421aa1d2f9a611085ef3d1df720a4a03"],
 };
 assert.deepEqual(Object.keys(raw.editions.editions).sort(), Object.keys(frozen).sort());
 for (const [edition, [all, daily]] of Object.entries(frozen)) {
  assert.equal(md5(editionQuestions(catalog, edition)), all, `${edition}: questions`);
  assert.equal(md5(days.map(d => dailyQuestions(catalog, edition, d))), daily, `${edition}: daily rotation`);
 }
});
