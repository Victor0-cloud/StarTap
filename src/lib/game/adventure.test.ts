import test from "node:test";
import assert from "node:assert/strict";
import { emptyAdventure, levelStates, nextLevelId, readAdventure, recordLevel, starTotals, wonderStars, ADVENTURE_KEY } from "./adventure.ts";
import { modeKey, modePath, sessionStorageKey } from "./modes.ts";
import { SPARK_LINES, RESULT_LABELS } from "./result.ts";
import { loadJson, loadRawContent } from "../content/node-content.ts";
import { validateContent, sentenceCount, TRIVIA_MAX_CHARS } from "../content/validate.ts";
import { buildCatalog, toPlayable } from "../content/build.ts";
import type { Adventure, RawContent } from "../../content/schema.ts";

const adventure = loadJson("adventure.json") as Adventure;
const raw = loadRawContent();
const world = adventure.worlds[0];

test("Wonder Stars: 1 for finishing, 2 at 2,500+, 3 at 4,000+", () => {
 assert.deepEqual([0, 2499, 2500, 3999, 4000, 5000].map(wonderStars), [1, 1, 2, 2, 3, 3]);
});

test("levels unlock one by one; coming-soon levels never open", () => {
 let p = emptyAdventure();
 assert.deepEqual(levelStates(world, p).map(s => s.state), ["open", "locked", "locked", "locked", "locked", "locked", "soon"]);
 assert.equal(nextLevelId(world, p), "music-1");
 p = recordLevel(p, "music-1", 2600);
 assert.deepEqual(levelStates(world, p).map(s => s.state), ["done", "open", "locked", "locked", "locked", "locked", "soon"]);
 assert.equal(levelStates(world, p)[0].stars, 2);
 assert.equal(nextLevelId(world, p), "music-2");
 p = recordLevel(p, "music-1", 1200); // a worse replay keeps the best
 assert.equal(p.levels["music-1"].best, 2600);
 assert.deepEqual(starTotals(adventure, p), { earned: 2, max: 39 });
});

test("saved progress cannot be faked or crash the map", () => {
 for (const bad of [null, "{", "[]", JSON.stringify({ version: 2, levels: {} })]) assert.deepEqual(readAdventure(bad), emptyAdventure());
 const tampered = readAdventure(JSON.stringify({ version: 1, levels: { "music-1": { best: 99999, stars: 3 }, "music-2": { best: "x" }, "music-3": { best: 4100, stars: 1 } } }));
 assert.deepEqual(Object.keys(tampered.levels), ["music-3"]);
 assert.equal(tampered.levels["music-3"].stars, 3, "stars always derive from the score");
});

test("every playable level is five active, verified-source questions with five different people", () => {
 const byId = new Map(raw.questions.map(q => [q.id, q]));
 for (const level of world.levels.filter(l => !l.comingSoon)) {
  assert.equal(level.questionIds.length, 5, level.id);
  const qs = level.questionIds.map(id => byId.get(id)!);
  for (const q of qs) {
   assert.ok(q && q.active, `${level.id}: ${q?.id}`);
   assert.notEqual(q.sourceQuality, "needs_review", `${level.id}: ${q.id} has a weak source`);
  }
  assert.equal(new Set(qs.map(q => q.entityId)).size, 5, level.id);
 }
 assert.ok(world.levels.find(l => l.id === "music-5")!.comingSoon, "K-Pop waits for a fifth star rather than padding");
});

test("adventure storage and links never touch Today's Five", () => {
 const spec = { mode: "adventure", level: "music-1" } as const;
 assert.equal(modeKey(spec), "adventure:music-1");
 assert.ok(sessionStorageKey(spec).startsWith("startap:session:adventure:"));
 assert.equal(modePath(spec), "/adventure/play/?level=music-1");
 assert.ok(!/^startap:(origins-v1|stories-v2|global-v\d):/.test(ADVENTURE_KEY));
});

test("trivia cards are short, typed and sourced", () => {
 const cards = raw.questions.filter(q => q.triviaCard);
 assert.ok(cards.length >= 15);
 for (const q of cards) {
  const t = q.triviaCard!;
  assert.ok(t.text.length <= TRIVIA_MAX_CHARS && sentenceCount(t.text) <= 2, q.id);
  assert.ok(q.sources.some(s => s.url === t.sourceUrl), `${q.id}: card cites one of its own sources`);
  assert.ok(t.quote.length >= 20, `${q.id}: card keeps its supporting quote`);
  const batchSource = q.sources.find(s => s.url === t.sourceUrl);
  if (batchSource?.quote) assert.equal(t.quote, batchSource.quote, `${q.id}: batch card quotes its source sentence`);
 }
 const errorsFor = (change: (r: RawContent) => void) => { const r: RawContent = JSON.parse(JSON.stringify(raw)); change(r); return validateContent(r).errors.join(" | "); };
 const id = cards[0].id;
 assert.match(errorsFor(r => { r.questions.find(q => q.id === id)!.triviaCard!.text = "One. Two. Three sentences is too many."; }), /one or two short sentences/);
 assert.match(errorsFor(r => { r.questions.find(q => q.id === id)!.triviaCard!.sourceUrl = "https://example.com/elsewhere"; }), /one of the question's sources/);
 assert.match(errorsFor(r => { r.questions.find(q => q.id === id)!.triviaCard!.type = "gossip" as never; }), /unknown trivia type/);
});

test("the reveal gets a titled trivia card; unverified legacy trivia is never shown", () => {
 const catalog = buildCatalog(raw);
 const typed = toPlayable(catalog, "billie-eilish-birthplace").triviaCard!;
 assert.equal(typed.title, "Record breaker");
 assert.equal(typed.sourceName, "Britannica");
 const legacy = toPlayable(catalog, "adele-brit-school").triviaCard!;
 assert.equal(legacy.title, "Before the fame");
 assert.ok(legacy.sourceUrl.startsWith("https://"));
 const held = raw.questions.filter(q => q.triviaStatus === "needs_review");
 assert.equal(held.length, 28);
 for (const q of held) {
  assert.equal(toPlayable(catalog, q.id).triviaCard, undefined, q.id);
  assert.ok(q.trivia, "the legacy text itself is kept, only hidden");
 }
 const legacyLive = raw.questions.filter(q => q.review.status === "legacy" && q.trivia);
 assert.equal(legacyLive.length, 65);
 assert.ok(legacyLive.every(q => q.triviaCard || q.triviaStatus === "needs_review"), "every legacy line was reviewed");
});

test("Spark's lines are short and cover every result", () => {
 assert.deepEqual(Object.keys(SPARK_LINES).sort(), Object.keys(RESULT_LABELS).sort());
 for (const line of Object.values(SPARK_LINES)) assert.ok(line.length <= 24, line);
 assert.equal(SPARK_LINES.nailed, "You found it!");
 assert.equal(SPARK_LINES.miss, "New place unlocked!");
});
