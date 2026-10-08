import test from "node:test";
import assert from "node:assert/strict";
import { modeKey, modeLabel, modePath, poolFor, selectQuestions, sessionStorageKey, type ModeSpec } from "./modes.ts";
import { categoryCounts } from "../content/counts.ts";
import { loadRawContent } from "../content/node-content.ts";
import { buildModeShareText } from "./share.ts";
import { shareOrigin } from "../site.ts";

const raw = loadRawContent();
const byId = new Map(raw.questions.map(q => [q.id, q]));
const counts = categoryCounts(raw);
const check = (spec: ModeSpec, ids: string[] | null) => {
 assert.ok(ids, JSON.stringify(spec));
 assert.equal(ids!.length, 5);
 assert.equal(new Set(ids).size, 5);
 const qs = ids!.map(id => byId.get(id)!);
 assert.equal(new Set(qs.map(q => q.entityId)).size, 5, "five different people");
 for (const q of qs) assert.ok(q.active && q.access.tier === "free", q.id);
 return qs;
};

test("every playable category and subcategory yields five unique questions from that world", () => {
 for (const c of counts.filter(c => c.playable)) {
  for (let i = 0; i < 20; i++) for (const q of check({ mode: "category", category: c.key }, selectQuestions(raw, { mode: "category", category: c.key }, { seed: c.key + i }))) {
   assert.ok(q.primaryCategory === c.key || (q.secondary ?? []).some(s => s.category === c.key), q.id);
  }
  for (const s of c.subcategories.filter(s => s.playable)) {
   const spec: ModeSpec = { mode: "subcategory", category: c.key, subcategory: s.key };
   for (const q of check(spec, selectQuestions(raw, spec, { seed: s.key }))) assert.ok(q.subcategory === s.key || (q.secondary ?? []).some(x => x.subcategory === s.key), q.id);
  }
 }
});

test("thin worlds return null instead of a padded or duplicated five", () => {
 for (const c of counts.filter(c => !c.playable)) assert.equal(selectQuestions(raw, { mode: "category", category: c.key }, { seed: "x" }), null, c.key);
 // A subcategory with a few stars if one exists, otherwise an empty one (counts list only subcategories with content).
 const thinSub = counts.flatMap(c => c.subcategories.filter(s => !s.playable).map(s => ({ c: c.key, s: s.key })))[0] ?? { c: "geography", s: "capitals" };
 assert.equal(selectQuestions(raw, { mode: "subcategory", category: thinSub.c, subcategory: thinSub.s }, { seed: "x" }), null);
});

test("World Mix always spans at least three categories, two at most from any one", () => {
 for (let i = 0; i < 300; i++) {
  const qs = check({ mode: "world_mix" }, selectQuestions(raw, { mode: "world_mix" }, { seed: "mix" + i }));
  const per: Record<string, number> = {};
  for (const q of qs) per[q.primaryCategory] = (per[q.primaryCategory] ?? 0) + 1;
  assert.ok(Object.keys(per).length >= 3 && Math.max(...Object.values(per)) <= 2, JSON.stringify(per));
 }
});

test("inactive questions are never selected and recent questions are avoided", () => {
 const inactive = raw.questions.filter(q => !q.active).map(q => q.id);
 assert.ok(inactive.length > 0);
 assert.ok(poolFor(raw, { mode: "world_mix" }).every(p => !inactive.includes(p.id)));
 const first = selectQuestions(raw, { mode: "category", category: "music" }, { seed: "a" })!;
 const second = selectQuestions(raw, { mode: "category", category: "music" }, { seed: "a", exclude: new Set(first) })!;
 assert.equal(second.filter(id => first.includes(id)).length, 0);
 assert.deepEqual(selectQuestions(raw, { mode: "world_mix" }, { seed: "same" }), selectQuestions(raw, { mode: "world_mix" }, { seed: "same" }));
});

test("mode storage never collides with Today's Five keys", () => {
 const specs: ModeSpec[] = [{ mode: "world_mix" }, { mode: "category", category: "music" }, { mode: "subcategory", category: "music", subcategory: "afrobeats" }];
 assert.deepEqual(specs.map(modeKey), ["world_mix", "category:music", "subcategory:music/afrobeats"]);
 for (const spec of specs) {
  assert.ok(sessionStorageKey(spec).startsWith("startap:session:"));
  assert.ok(!/^startap:(origins-v1|stories-v2|global-v\d):/.test(sessionStorageKey(spec)));
 }
});

test("labels, links and share text name the mode without exposing answers", () => {
 assert.equal(modeLabel(raw, { mode: "world_mix" }), "World Mix");
 assert.equal(modeLabel(raw, { mode: "category", category: "music" }), "Music Five");
 assert.equal(modeLabel(raw, { mode: "subcategory", category: "music", subcategory: "afrobeats" }), "Afrobeats Five");
 assert.equal(modePath({ mode: "subcategory", category: "music", subcategory: "afrobeats" }), "/category/music/play/?sub=afrobeats");
 const ids = selectQuestions(raw, { mode: "category", category: "music" }, { seed: "share" })!;
 const text = buildModeShareText({ label: "Music Five", results: [1000, 900, 750, 500, 970].map(score => ({ score })), origin: shareOrigin({ native: true, env: undefined }), path: "/category/music/play/" });
 assert.equal(text.split("\n")[0], "StarTap · Music Five");
 assert.ok(text.includes("4,120 / 5,000"));
 assert.ok(text.endsWith("https://startap.fun/category/music/play/"));
 for (const id of ids) {
  const q = byId.get(id)!;
  assert.ok(!text.includes(q.answer.city) && !text.includes(raw.entities.find(e => e.id === q.entityId)!.name), id);
 }
});
