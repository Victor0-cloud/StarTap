// V2 content batches: added cleanly, verified, and kept out of Today's Five until a new edition is approved.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { contentDir, loadJson, loadRawContent } from "./node-content.ts";
import { countryAt, isSameCountry, type CountryLookup } from "../geo/countries.ts";
import type { ContentQuestion } from "../../content/schema.ts";

const content = loadRawContent();
const lookup: CountryLookup = JSON.parse(readFileSync(new URL("../../../public/country-lookup.json", import.meta.url), "utf8"));
const inEditions = new Set(Object.values(content.editions.editions).flatMap(e => e.questionIds));
type Batch = { batch: number; entries: { entity: { id: string }; question: { id: string }; reverify?: boolean }[] };
const batches = readdirSync(new URL("batches/", contentDir)).filter(f => /^batch-\d+\.json$/.test(f)).map(f => loadJson("batches/" + f) as Batch).sort((a, b) => a.batch - b.batch);
const ids = new Set(batches.flatMap(b => b.entries.map(e => e.question.id)));
const added = content.questions.filter(q => ids.has(q.id));
// reverify entries add a newly sourced question for an existing (legacy) person; they never create an entity.
const reverified = new Set(batches.flatMap(b => b.entries.filter(e => e.reverify).map(e => e.question.id)));

test("every batch entry is a new person (or a re-verified existing one) with one active, verified question", () => {
 assert.deepEqual(batches.map(b => [b.batch, b.entries.length]), [[1, 30], [2, 30], [3, 25], [4, 50], [5, 50], [6, 50], [7, 50], [8, 50], [9, 2], [10, 32], [11, 47], [12, 92], [13, 87], [14, 50], [15, 37], [16, 65], [17, 114], [18, 16], [19, 48], [20, 40], [21, 40], [22, 39]]);
 assert.equal(added.length, 1044);
 assert.equal(reverified.size, 3);
 assert.equal(new Set(added.filter(q => !reverified.has(q.id)).map(q => q.entityId)).size, 1041);
 for (const q of added.filter(q => reverified.has(q.id))) assert.ok(content.questions.some(o => o.entityId === q.entityId && o.id !== q.id && !ids.has(o.id)), q.id);
 for (const q of added) {
  assert.equal(q.active, true, q.id);
  assert.equal(q.review.status, "verified", q.id);
  assert.equal(q.review.classification, "provisional", q.id);
  assert.notEqual(q.sourceQuality, "needs_review", q.id);
  assert.equal(q.access.tier, "free", q.id);
 }
});

test("no batch question enters Today's Five or any legacy edition", () => {
 for (const q of added) assert.ok(!inEditions.has(q.id), q.id);
});

test("every new claim has a quoted source and audited coordinates inside its country", () => {
 for (const q of added as ContentQuestion[]) {
  for (const s of q.sources) assert.ok(s.url.startsWith("https://") && s.quote && s.quote.length > 20, `${q.id} ${s.url}`);
  assert.equal(q.answer.coordinateSource, "OpenStreetMap Nominatim", q.id);
  assert.match(q.answer.osm ?? "", /^(node|way|relation)\/\d+$/, q.id);
  assert.ok(isSameCountry(countryAt(lookup, q.answer), q.answer.countryCode), q.id);
  assert.ok(existsSync(new URL(`../../../public/flags/${q.answer.countryCode.toLowerCase()}.svg`, import.meta.url)), q.id);
 }
});

test("no person appears twice across legacy and new content", () => {
 const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
 const names = content.entities.map(e => norm(e.name));
 assert.equal(new Set(names).size, names.length);
 assert.equal(content.entities.length, 65 + 1041);
});

test("batches mix question types and add the Middle East region", () => {
 const types = new Set(added.map(q => q.questionType));
 assert.ok(types.size >= 5, [...types].join(","));
 assert.ok(added.filter(q => q.questionType === "birthplace").length < added.length * 0.65);
 assert.ok(content.entities.filter(e => e.region === "middle-east").length >= 1);
});
