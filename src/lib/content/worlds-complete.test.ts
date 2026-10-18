// The seven newer worlds are complete: every subcategory has at least ten verified people, Play Five stays unique, and the
// expansion left Today's Five, scoring, Music and Sports untouched. The freeze hashes below were taken before batches 16–18;
// if one of those files is changed on purpose, update its hash here in the same commit.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { contentDir, loadJson, loadRawContent } from "./node-content.ts";
import { playableQuestions } from "./counts.ts";
import { buildCatalog, dailyQuestions, editionScoring } from "./build.ts";
import { selectQuestions, type ModeSpec } from "../game/modes.ts";

const raw = loadRawContent();
const WORLDS = ["screen", "icons", "tech", "fashion", "business", "creators", "royalty"];
const MIN = 10;
const verified = playableQuestions(raw).filter(q => q.review.status === "verified");
const inSub = (q: (typeof verified)[number], cat: string, sub: string) =>
 (q.primaryCategory === cat && q.subcategory === sub) || (q.secondary ?? []).some(s => s.category === cat && s.subcategory === sub);
const sha = (path: string) => createHash("sha256").update(readFileSync(new URL(path, import.meta.url))).digest("hex");

test("every subcategory of the seven newer worlds has at least ten verified people", () => {
 for (const cat of WORLDS) {
  const subs = raw.taxonomy.categories.find(c => c.key === cat)!.subcategories;
  for (const { key } of subs) {
   const people = new Set(verified.filter(q => inSub(q, cat, key)).map(q => q.entityId)).size;
   assert.ok(people >= MIN, `${cat}/${key}: ${people} verified people`);
  }
 }
});

test("no duplicate people, question ids or repeated answers for one person", () => {
 const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
 const names = raw.entities.map(e => norm(e.name));
 assert.equal(new Set(names).size, names.length, "entity names");
 assert.equal(new Set(raw.entities.map(e => e.id)).size, raw.entities.length, "entity ids");
 assert.equal(new Set(raw.questions.map(q => q.id)).size, raw.questions.length, "question ids");
 const answers = new Set<string>();
 for (const q of raw.questions.filter(q => q.active)) {
  const key = `${q.entityId}|${norm(q.answer.city)}|${q.answer.countryCode}`;
  assert.ok(!answers.has(key), `${q.id} repeats an answer for ${q.entityId}`);
  answers.add(key);
 }
});

test("Play Five in every newer world and subcategory always gives five different people and questions", () => {
 const byId = new Map(raw.questions.map(q => [q.id, q]));
 const specs: ModeSpec[] = WORLDS.flatMap(cat => [
  { mode: "category", category: cat } as ModeSpec,
  ...raw.taxonomy.categories.find(c => c.key === cat)!.subcategories.map(s => ({ mode: "subcategory", category: cat, subcategory: s.key }) as ModeSpec),
 ]);
 for (const spec of specs) {
  const games = new Set<string>();
  for (let i = 0; i < 60; i++) {
   const ids = selectQuestions(raw, spec, { seed: `${JSON.stringify(spec)}#${i}` });
   assert.ok(ids, JSON.stringify(spec));
   assert.equal(new Set(ids).size, 5, JSON.stringify(spec));
   assert.equal(new Set(ids!.map(id => byId.get(id)!.entityId)).size, 5, JSON.stringify(spec));
   games.add([...ids!].sort().join());
  }
  assert.ok(games.size > 1, `different sessions give different fives: ${JSON.stringify(spec)}`);
 }
});

test("Today's Five is unchanged: editions file and 120 days of daily questions for every edition", () => {
 assert.equal(sha("../../content/editions.json"), "0074a32ab8898467f3df84b17fe1e02124043037ed3032e2bf36c53119ccc5d6");
 const catalog = buildCatalog(raw);
 const lines: string[] = [];
 for (const edition of Object.keys(raw.editions.editions)) for (let d = 0; d < 120; d++) {
  const day = new Date(Date.UTC(2026, 8, 1 + d)).toISOString().slice(0, 10);
  const qs = dailyQuestions(catalog, edition, day);
  lines.push(`${edition} ${day} ${editionScoring(catalog, edition)} ` + qs.map(q => `${q.id}@${q.answerCoordinates.latitude},${q.answerCoordinates.longitude}`).join("|"));
 }
 assert.equal(createHash("sha256").update(lines.join("\n")).digest("hex"), "3aa15336385aeb9f9b61f12371e386ef5981b89b88c96f088760116c5d1ec63f");
});

test("scoring and stage rules are unchanged", () => {
 assert.equal(sha("../game/scoring.ts"), "7f31898cd9c05e264756c5445b074cc990670f1eac8032e717049f3fded1b188");
 assert.equal(sha("../game/stages.ts"), "d686b044a6444d4ed52aca5fbedc8c9eaab7e9055dad39092338b854f1dc8b53");
});

type SportsBatch = { batch: number; entries: { question: { id: string; primaryCategory: string; subcategory: string; secondary?: { category: string }[] } }[]; memberships?: { category: string }[] };
const allBatches = () => readdirSync(new URL("batches/", contentDir)).filter(f => /^batch-\d+\.json$/.test(f)).map(f => loadJson("batches/" + f) as SportsBatch);

test("batch 19 adds only Sports stars in the five approved subcategories and lifts each to 15+", () => {
 const APPROVED = ["boxing", "tennis", "track-field", "formula-1", "cricket"];
 const b19 = allBatches().find(b => b.batch === 19)!;
 assert.equal(b19.entries.length, 48);
 assert.deepEqual(b19.memberships ?? [], []);
 for (const { question } of b19.entries) {
  assert.equal(question.primaryCategory, "sports", question.id);
  assert.ok(APPROVED.includes(question.subcategory), question.id);
  assert.equal(question.secondary, undefined, question.id);
 }
 const pool = playableQuestions(loadRawContent());
 for (const sub of APPROVED) {
  const stars = new Set(pool.filter(q => (q.primaryCategory === "sports" && q.subcategory === sub) || (q.secondary ?? []).some(s => s.category === "sports" && s.subcategory === sub)).map(q => q.entityId)).size;
  assert.ok(stars >= 15, `${sub}: ${stars}`);
 }
});

test("batch 20 adds only Sports stars in MMA, Gymnastics, Racket Sports and Winter Sports and lifts each to 15+", () => {
 const APPROVED = ["mma", "gymnastics", "racket-sports", "winter-sports"];
 const b20 = allBatches().find(b => b.batch === 20)!;
 assert.equal(b20.entries.length, 40);
 assert.deepEqual(b20.memberships ?? [], []);
 for (const { question } of b20.entries) {
  assert.equal(question.primaryCategory, "sports", question.id);
  assert.ok(APPROVED.includes(question.subcategory), question.id);
  assert.equal(question.secondary, undefined, question.id);
 }
 const pool = playableQuestions(loadRawContent());
 for (const sub of APPROVED) {
  const stars = new Set(pool.filter(q => (q.primaryCategory === "sports" && q.subcategory === sub) || (q.secondary ?? []).some(s => s.category === "sports" && s.subcategory === sub)).map(q => q.entityId)).size;
  assert.ok(stars >= 15, `${sub}: ${stars}`);
 }
});

test("batch 21 adds only Music stars in Amapiano, Rock, Reggae / Dancehall and Country and lifts each to 15+", () => {
 const APPROVED = ["amapiano", "rock", "reggae-dancehall", "country"];
 const b21 = allBatches().find(b => b.batch === 21)!;
 assert.equal(b21.entries.length, 40);
 assert.deepEqual(b21.memberships ?? [], []);
 for (const { question } of b21.entries) {
  assert.equal(question.primaryCategory, "music", question.id);
  assert.ok(APPROVED.includes(question.subcategory), question.id);
  assert.equal(question.secondary, undefined, question.id);
 }
 const pool = playableQuestions(loadRawContent());
 for (const sub of APPROVED) {
  const stars = new Set(pool.filter(q => (q.primaryCategory === "music" && q.subcategory === sub) || (q.secondary ?? []).some(s => s.category === "music" && s.subcategory === sub)).map(q => q.entityId)).size;
  assert.ok(stars >= 15, `${sub}: ${stars}`);
 }
});

test("Music and Sports content is untouched and gained no memberships from batches 16–18", () => {
 // Batch 21 appends approved Music records; every Music record that existed before it must stay byte-identical,
 // apart from the 18 Oct 2026 source cleanup of freddie-mercury-global (wording Stone Town → Zanzibar).
 const musicExpansion = new Set(allBatches().filter(b => b.batch === 21).flatMap(b => b.entries.map(e => e.question.id)));
 const music = JSON.parse(readFileSync(new URL("../../content/questions/music.json", import.meta.url), "utf8")) as { id: string }[];
 assert.equal(createHash("sha256").update(JSON.stringify(music.filter(q => !musicExpansion.has(q.id)), null, 1) + "\n").digest("hex"), "dee125cfa62d07ccf0a90ea899d16a0be288add4a36ffb1ee8f7c6c7c1e5c94e");
 // Batches 19–20 append approved Sports records; every Sports record that existed before them must stay byte-identical.
 const sportsExpansion = new Set(allBatches().filter(b => b.batch === 19 || b.batch === 20).flatMap(b => b.entries.map(e => e.question.id)));
 const sports = JSON.parse(readFileSync(new URL("../../content/questions/sports.json", import.meta.url), "utf8")) as { id: string }[];
 assert.equal(createHash("sha256").update(JSON.stringify(sports.filter(q => !sportsExpansion.has(q.id)), null, 1) + "\n").digest("hex"), "d355e53af2229bb5411c6a95ccc62e545f120252526da25aa1f7198667b8dcfa");
 const recent = allBatches().filter(b => b.batch >= 16 && b.batch <= 18);
 assert.equal(recent.length, 3);
 for (const b of recent) {
  for (const { question } of b.entries) for (const c of [question.primaryCategory, ...(question.secondary ?? []).map(s => s.category)]) assert.ok(c !== "music" && c !== "sports", `batch ${b.batch}`);
  for (const m of b.memberships ?? []) assert.ok(m.category !== "music" && m.category !== "sports", `batch ${b.batch}`);
 }
});
