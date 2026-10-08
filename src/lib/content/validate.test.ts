import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { balanceReport, validateContent } from "./validate.ts";
import { flagExists, loadRawContent, questionFiles } from "./node-content.ts";
import type { ContentQuestion, RawContent } from "../../content/schema.ts";

const content = loadRawContent();
const clone = (): RawContent => JSON.parse(JSON.stringify(content));
const live = new Set(content.editions.editions["global-v4"].questionIds);
const errorsAfter = (change: (raw: RawContent, q: ContentQuestion) => void, id = "burna-boy-stadium") => {
 const raw = clone();
 change(raw, raw.questions.find(q => q.id === id)!);
 return validateContent(raw).errors;
};

test("current content passes every validation rule", () => {
 const { errors } = validateContent(content, { flagExists });
 assert.deepEqual(errors, []);
});

test("exactly the eight known weak primary sources are flagged for QA, not removed", () => {
 const flagged = content.questions.filter(q => q.sourceQuality === "needs_review").map(q => q.id).sort();
 assert.deepEqual(flagged, ["a-r-rahman-global", "anggun-expanded", "jung-kook-expanded", "omar-sy-expanded", "penelope-cruz-global", "salma-hayek-global", "shah-rukh-khan-theatre", "tarkan-expanded"]);
 for (const id of flagged) assert.ok(live.has(id), id + " remains playable");
 assert.equal(validateContent(content).warnings.filter(w => w.includes("needs review")).length, 8);
});

test("migrated classifications are marked provisional and legacy", () => {
 const legacy = new Set(Object.values(content.editions.editions).flatMap(e => e.questionIds));
 assert.equal(legacy.size, 75);
 for (const q of content.questions.filter(x => legacy.has(x.id))) {
  assert.equal(q.review.classification, "provisional", q.id);
  assert.equal(q.review.status, "legacy", q.id);
  assert.equal(q.access.tier, "free", q.id);
 }
});

test("each rule rejects bad data", () => {
 const cases: [string, (raw: RawContent, q: ContentQuestion) => void, RegExp][] = [
  ["category", (_, q) => { q.primaryCategory = "kpop"; }, /unknown primaryCategory/],
  ["subcategory", (_, q) => { q.subcategory = "k-pop"; q.primaryCategory = "sports"; }, /not in sports/],
  ["difficulty", (_, q) => { q.difficulty = "expert" as never; }, /unknown difficulty/],
  ["question type", (_, q) => { q.questionType = "birthday" as never; }, /unknown questionType/],
  ["region", raw => { raw.entities[0].region = "antarctica" as never; }, /unknown region/],
  ["origin code", raw => { raw.entities[0].countryOfOrigin = "Nigeria"; }, /ISO alpha-2/],
  ["coordinates", (_, q) => { q.answer.latitude = 91; }, /valid coordinates/],
  ["http source", (_, q) => { q.sources[0].url = "http://example.com/"; }, /must be https/],
  ["weak source rated high", (_, q) => { q.sources[0].url = "https://en.wikipedia.org/wiki/Burna_Boy"; }, /must be rated needs_review/],
  ["missing primary", (_, q) => { q.sources[0].role = "extra"; }, /exactly one primary/],
  ["duplicate id", raw => { raw.questions.push({ ...raw.questions[0] }); }, /duplicate id/],
  ["unknown entity", (_, q) => { q.entityId = "nobody"; }, /unknown entity/],
  ["duplicate answer", (raw, q) => { const twin = raw.questions.find(o => o.id === "burna-boy-birthplace")!; twin.answer = { ...q.answer }; }, /same answer/],
  ["disputed without nuance", (_, q) => { q.disputed = { nuance: "" }; }, /disputed/],
  ["paid without pack", (_, q) => { q.access = { tier: "pack" }; }, /packId/],
  ["paid in Today's Five", (raw, q) => { raw.packs.push({ id: "afro" }  as never); q.access = { tier: "pack", packId: "afro" }; }, /is not free/],
  ["edition unknown id", raw => { raw.editions.editions["global-v4"].questionIds[0] = "missing"; }, /unknown question missing/],
  ["draft active", (_, q) => { q.review.status = "draft"; }, /draft content cannot be active/],
  ["portal http", raw => { raw.entities.find(e => e.id === "adele")!.portal!.watchUrl = "http://youtube.com/"; }, /portal watchUrl must be https/],
 ];
 for (const [name, change, pattern] of cases) {
  const errors = errorsAfter(change);
  assert.ok(errors.some(e => pattern.test(e)), `${name}: ${errors.join(" | ") || "no error"}`);
 }
});

test("taxonomy keeps Afrobeats and Amapiano separate and includes the approved sports additions", () => {
 const sub = (key: string) => content.taxonomy.categories.find(c => c.key === key)!.subcategories.map(s => s.key);
 assert.ok(sub("music").includes("afrobeats") && sub("music").includes("amapiano"));
 for (const key of ["gymnastics", "racket-sports", "winter-sports"]) assert.ok(sub("sports").includes(key), key);
 assert.equal(content.taxonomy.categories.filter(c => c.group === "main").length, 7);
});

test("answer location is stored separately from the entity's origin", () => {
 const q = content.questions.find(x => x.id === "bong-joon-ho-global")!;
 const e = content.entities.find(x => x.id === q.entityId)!;
 assert.equal(e.countryOfOrigin, "KR");
 assert.equal(q.answer.countryCode, "FR");
});

test("the app catalog imports every question file", () => {
 const source = readFileSync(new URL("./catalog.ts", import.meta.url), "utf8");
 for (const file of questionFiles()) assert.ok(source.includes(`@/content/questions/${file}`), file);
});

test("balance report reflects the live 65", () => {
 const report = balanceReport(content, id => live.has(id));
 assert.equal(report.total, 65);
 assert.deepEqual([report.byCategory.music.count, report.byCategory.sports.count, report.byCategory.screen.count], [27, 23, 15]);
});
