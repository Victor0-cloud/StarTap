// Multi-subcategory membership: one person / one question record can belong to its primary subcategory and to additional
// subcategories of the same category (e.g. music/rnb + music/soul-legends-80s-90s) without duplicates anywhere.
import test from "node:test";
import assert from "node:assert/strict";
import { categoryCounts, inCategory, inSubcategory } from "./counts.ts";
import { loadRawContent } from "./node-content.ts";
import { validateContent } from "./validate.ts";
import { buildCatalog, toPlayable } from "./build.ts";
import { poolFor, selectQuestions } from "../game/modes.ts";
import { readAdventure, recordLevel, emptyAdventure } from "../game/adventure.ts";
import type { RawContent } from "../../content/schema.ts";

const raw = loadRawContent();
const music = categoryCounts(raw).find(c => c.key === "music")!;
const sub = (k: string) => music.subcategories.find(s => s.key === k)!;
const SOUL = "soul-legends-80s-90s";
const q = (id: string) => raw.questions.find(x => x.id === id)!;
const SHARED = ["whitney-houston-newark", "mariah-carey-greenlawn", "usher-las-vegas"];

test("one artist belongs to two Music subcategories from a single record", () => {
 const whitney = q("whitney-houston-newark");
 assert.equal(whitney.subcategory, "rnb", "primary R&B membership kept");
 assert.ok(inSubcategory(whitney, "music", "rnb") && inSubcategory(whitney, "music", SOUL));
 assert.equal(raw.entities.filter(e => e.name === "Whitney Houston").length, 1, "one person record");
 assert.equal(raw.questions.filter(x => x.entityId === "whitney-houston").length, 1, "one question record");
 for (const id of SHARED) assert.ok(q(id).sources.some(s => s.role === "extra" && /198\d|199\d|1990s|1980s/.test(s.quote ?? "")), `${id}: era evidence is sourced`);
});

test("counts: R&B unchanged at 8, Soul Legends 15 (5 shared + 10 from batch 22) and playable, Music counts each person once", () => {
 assert.equal(sub("rnb").stars, 8);
 assert.equal(sub(SOUL).stars, 15); assert.equal(sub(SOUL).playable, true);
 const soulPeople = new Set(raw.questions.filter(x => x.active && inSubcategory(x, "music", SOUL)).map(x => x.entityId));
 assert.deepEqual([...soulPeople].sort(), ["anita-baker", "babyface", "chaka-khan", "d-angelo", "lauryn-hill", "lionel-richie", "lisa-stansfield", "luther-vandross", "mariah-carey", "maxwell", "patti-labelle", "sade", "toni-braxton", "usher", "whitney-houston"]);
 const musicPeople = new Set(raw.questions.filter(x => x.active && inCategory(x, "music")).map(x => x.entityId));
 assert.equal(music.stars, musicPeople.size, "a shared member counts once in Music");
});

test("pools: one candidate per question record; shared members appear once in each pool", () => {
 for (const spec of [{ mode: "subcategory", category: "music", subcategory: "rnb" }, { mode: "subcategory", category: "music", subcategory: SOUL }, { mode: "category", category: "music" }, { mode: "world_mix" }] as const) {
  const pool = poolFor(raw, spec);
  assert.equal(new Set(pool.map(c => c.id)).size, pool.length, `${JSON.stringify(spec)}: no question twice`);
  for (const id of SHARED) assert.equal(pool.filter(c => c.id === id).length, 1, `${id} once in ${JSON.stringify(spec)}`);
 }
});

test("no duplicate person or question in any five-round game (R&B, Soul Legends, Music Five, World Mix)", () => {
 for (const spec of [{ mode: "subcategory", category: "music", subcategory: "rnb" }, { mode: "subcategory", category: "music", subcategory: SOUL }, { mode: "category", category: "music" }, { mode: "world_mix" }] as const) {
  for (let i = 0; i < 300; i++) {
   const ids = selectQuestions(raw, spec, { seed: `dup-${i}` })!;
   assert.equal(ids.length, 5);
   assert.equal(new Set(ids).size, 5, "five distinct questions");
   assert.equal(new Set(ids.map(id => q(id).entityId)).size, 5, "five distinct people");
  }
 }
});

test("backward compatible: records without secondary, and cross-category secondary, behave exactly as before", () => {
 const plain = raw.questions.filter(x => x.active && !x.secondary?.length);
 assert.ok(plain.length > 300);
 for (const x of plain) { assert.ok(inSubcategory(x, x.primaryCategory, x.subcategory)); assert.ok(inCategory(x, x.primaryCategory)); }
 const jake = raw.questions.find(x => x.entityId === "jake-paul" && x.secondary?.length)!;
 assert.ok(inCategory(jake, "sports") && inSubcategory(jake, "sports", "boxing"), "cross-category secondary still counts");
 const boxers = new Set(raw.questions.filter(x => x.active && inSubcategory(x, "sports", "boxing")).map(x => x.entityId));
 assert.ok(boxers.has("jake-paul"), "Jake Paul (creators) still counts in Boxing");
 assert.equal(categoryCounts(raw).find(c => c.key === "sports")!.subcategories.find(s => s.key === "boxing")!.stars, boxers.size);
});

test("validation rejects a secondary that repeats the primary or itself", () => {
 const clone = (): RawContent => JSON.parse(JSON.stringify(raw));
 assert.equal(validateContent(raw).errors.length, 0);
 const a = clone(); a.questions.find(x => x.id === "whitney-houston-newark")!.secondary!.push({ category: "music", subcategory: "rnb" });
 assert.match(validateContent(a).errors.join(" | "), /secondary repeats a membership/);
 const b = clone(); b.questions.find(x => x.id === "whitney-houston-newark")!.secondary!.push({ category: "music", subcategory: SOUL });
 assert.match(validateContent(b).errors.join(" | "), /secondary repeats a membership/);
});

test("stamps and saved progress are unaffected by additional memberships", () => {
 const catalog = buildCatalog(raw);
 assert.equal(toPlayable(catalog, "whitney-houston-newark").stampType, "R&B Star", "stamp follows the primary subcategory");
 assert.equal(toPlayable(catalog, "lionel-richie-joliet").stampType, "Soul Legends Star");
 const saved = JSON.stringify(recordLevel(emptyAdventure(), "music-3", 3200));
 assert.deepEqual(readAdventure(saved), JSON.parse(saved), "Adventure progress format unchanged");
});
