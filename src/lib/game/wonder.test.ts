import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { allowRoundReveal, finishWonder, MAX_ROUND_REVEALS, roundWonder, TEMPLATE_FOR, WONDER_TEMPLATES, WONDER_TYPES, wonderShareText } from "./wonder.ts";
import { loadRawContent } from "../content/node-content.ts";
import { buildCatalog, toPlayable } from "../content/build.ts";

const base = { category: "music", countryName: "Nigeria", roundKey: "k:0:q" };

test("wonder: 900+, RIGHT CITY and NAILED IT trigger; ordinary rounds do not", () => {
 assert.equal(roundWonder({ ...base, tier: "nailed", score: 980 })?.trigger, "nailed_it");
 assert.equal(roundWonder({ ...base, tier: "city", score: 870 })?.trigger, "right_city");
 assert.equal(roundWonder({ ...base, tier: "city", score: 920 })?.title, "YOU FOUND THE BEAT!");
 assert.equal(roundWonder({ ...base, tier: "region", score: 800 }), null);
 assert.equal(roundWonder({ ...base, tier: "country", score: 650 }), null);
 assert.equal(roundWonder({ ...base, tier: "miss", score: 40 }), null);
 // Great score from distance-v1 style scoring without a tier label still counts.
 assert.equal(roundWonder({ ...base, tier: "region", score: 905 })?.trigger, "great_round");
});

test("wonder: a new country gets the country scene; important milestones only", () => {
 const w = roundWonder({ ...base, tier: "country", score: 600, newStamp: { stampType: "Afrobeats Star", newCountry: true } });
 assert.deepEqual([w?.template, w?.title, w?.subtitle], ["country", "COUNTRY DISCOVERED!", "NIGERIA DISCOVERED"]);
 assert.deepEqual(w?.badges, ["★ Afrobeats Star stamp"]);
 assert.equal(roundWonder({ ...base, tier: "country", score: 600, newStamp: { stampType: "Afrobeats Star", newCountry: false } }), null, "a new stamp alone is the stamp note, not a reveal");
 assert.equal(roundWonder({ ...base, tier: "close", score: 300, milestone: 1000 }), null);
 assert.equal(roundWonder({ ...base, tier: "close", score: 300, milestone: 3000 })?.trigger, "milestone");
});

test("wonder: each category maps to its scene; every type has a template", () => {
 const t = (category: string) => roundWonder({ ...base, category, tier: "nailed", score: 990 })!;
 assert.deepEqual(["music", "sports", "screen", "geography", "tech"].map(c => t(c).template), ["music", "sports", "screen", "country", "city"]);
 assert.equal(t("sports").title, "WHAT A FINISH!");
 assert.equal(t("screen").title, "LIGHTS. CAMERA. STAR!");
 assert.equal(t("tech").title, "NAILED IT!");
 assert.equal(t("unknown").template, "city");
 for (const type of WONDER_TYPES) assert.ok(WONDER_TEMPLATES.includes(TEMPLATE_FOR[type]), type);
});

test("wonder: Adventure finish rewards are never repeated", () => {
 const f = (stars: number, previousStars: number) => finishWonder({ total: 4200, label: "Global Pop", category: "music", gameKey: "music-1", adventure: { stars, previousStars } });
 assert.equal(f(3, 0)?.title, "3 WONDER STARS!");
 assert.equal(f(3, 2)?.title, "3 WONDER STARS!", "first time reaching 3 stars");
 assert.equal(f(3, 3), null, "already had 3 stars");
 assert.equal(f(2, 0)?.title, "LEVEL CLEARED!");
 assert.equal(f(2, 1), null, "replay with nothing new");
 assert.equal(finishWonder({ total: 4100, label: "World Mix", gameKey: "g" })?.trigger, "challenge_complete");
 assert.equal(finishWonder({ total: 3900, label: "World Mix", gameKey: "g" }), null);
});

test("wonder: at most two round reveals per game", () => {
 assert.equal(MAX_ROUND_REVEALS, 2);
 assert.deepEqual([0, 1, 2, 3].map(allowRoundReveal), [true, true, false, false]);
});

test("wonder: copy is short and celebrates places and categories, never people", () => {
 const raw = loadRawContent(), catalog = buildCatalog(raw);
 const names = raw.entities.map(e => e.name.toLowerCase());
 for (const q of raw.questions.filter(x => x.active)) {
  const p = toPlayable(catalog, q.id);
  for (const tier of ["nailed", "city"] as const) {
   const w = roundWonder({ tier, score: 960, category: p.primaryCategory, countryName: p.answerCountry, newStamp: { stampType: p.stampType ?? "World Star", newCountry: true }, roundKey: q.id })!;
   const text = [w.title, w.subtitle, ...w.badges, wonderShareText(w, "Music World")].join(" ").toLowerCase();
   assert.ok(w.title.length <= 24 && w.title === w.title.toUpperCase(), w.title);
   assert.ok(!names.some(n => text.includes(n)), `${q.id}: reveal names a person`);
   assert.ok(!text.includes(p.starName.toLowerCase()), q.id);
   assert.ok(!/official/.test(text), q.id);
  }
 }
});

test("wonder scenes: original vector art only, no external media or likeness assets", () => {
 for (const file of ["WonderScenes.tsx", "WonderReveal.tsx"]) {
  const src = readFileSync(new URL(`../../components/game/${file}`, import.meta.url), "utf8");
  assert.ok(!/<image|<img|<audio|<video|url\((?!#)|https?:\/\/|\.(png|jpe?g|webp|gif|mp3|wav|ogg|mp4)\b/i.test(src), `${file} loads no external or bitmap media`);
  assert.ok(!/official|logo/i.test(src.replace(/no [^.]*logos?/gi, "")), `${file} has no logo or "official" wording`);
 }
});
