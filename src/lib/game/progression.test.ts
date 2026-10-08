import test from "node:test";
import assert from "node:assert/strict";
import { countriesDiscovered, earnsStamp, emptyPassport, readPassport, recordDiscovery, stampList } from "./passport.ts";
import { activeStreak, emptyStreak, readStreak, recordCompletion } from "./streak.ts";
import { newRewards, readSeen, REWARDS, rewardStates, sparkRewardClasses } from "./rewards.ts";
import { levelStates, starTotals } from "./adventure.ts";
import { loadJson, loadRawContent } from "../content/node-content.ts";
import { buildCatalog, toPlayable } from "../content/build.ts";
import type { Adventure } from "../../content/schema.ts";

const ng = { countryCode: "NG", countryName: "Nigeria", category: "music", subcategory: "afrobeats", stampType: "Afrobeats Star" };

test("passport: first unlock, no duplicates, best score improves", () => {
 let r = recordDiscovery(emptyPassport(), { ...ng, score: 720, date: "2026-10-01" });
 assert.ok(r.isNewStamp && r.isNewCountry);
 r = recordDiscovery(r.passport, { ...ng, score: 600, date: "2026-10-02" });
 assert.ok(!r.isNewStamp && !r.improved);
 assert.equal(Object.keys(r.passport.stamps).length, 1, "same country + category never duplicates");
 r = recordDiscovery(r.passport, { ...ng, score: 950, date: "2026-10-03" });
 assert.ok(r.improved);
 const stamp = Object.values(r.passport.stamps)[0];
 assert.equal(stamp.bestScore, 950);
 assert.equal(stamp.firstUnlockedAt, "2026-10-01", "first unlock date is kept");
 r = recordDiscovery(r.passport, { ...ng, category: "screen", subcategory: "nollywood", stampType: "Nollywood Star", score: 700, date: "2026-10-04" });
 assert.ok(r.isNewStamp && !r.isNewCountry, "a new category in a known country is a new stamp, not a new country");
 assert.equal(countriesDiscovered(r.passport), 1);
 assert.deepEqual(stampList(r.passport, "screen").map(s => s.stampType), ["Nollywood Star"]);
 assert.deepEqual(stampList(r.passport).map(s => s.firstUnlockedAt), ["2026-10-04", "2026-10-01"], "newest first");
});

test("passport: only right-country results earn stamps; bad saved data is ignored", () => {
 assert.deepEqual(["nailed", "city", "region", "country", "close", "miss"].map(t => earnsStamp(t as never)), [true, true, true, true, false, false]);
 const saved = JSON.stringify({ version: 1, stamps: { a: { ...ng, firstUnlockedAt: "2026-10-01", bestScore: 900 }, b: { ...ng, countryCode: "Nigeria", firstUnlockedAt: "2026-10-01", bestScore: 1 }, c: { ...ng, category: "x", firstUnlockedAt: "bad", bestScore: 5 }, d: { ...ng, category: "y", firstUnlockedAt: "2026-10-01", bestScore: 5000 } } });
 assert.deepEqual(Object.keys(readPassport(saved).stamps), ["NG|music"]);
 for (const bad of [null, "{", "[]", JSON.stringify({ version: 9 })]) assert.deepEqual(readPassport(bad), emptyPassport());
});

test("every playable question has a stamp name and country", () => {
 const raw = loadRawContent(), catalog = buildCatalog(raw);
 for (const q of raw.questions.filter(x => x.active)) {
  const p = toPlayable(catalog, q.id);
  assert.match(p.stampType ?? "", /^[\p{L}\p{N}&\- ]+ Star$/u, q.id);
  assert.ok(p.primaryCategory && p.answerCountryCode, q.id);
 }
 assert.equal(toPlayable(catalog, "rose-birthplace").stampType, "K-Pop Star");
 assert.equal(toPlayable(catalog, "messi-youth-club").stampType, "Football Star");
 assert.equal(toPlayable(catalog, "zaha-hadid-birthplace").stampType, "World Icons Star");
});

test("streak: first day, next day, same-day repeat, missed day, longest kept", () => {
 let s = recordCompletion(emptyStreak(), "2026-10-01");
 assert.deepEqual([s.currentStreak, s.longestStreak], [1, 1]);
 s = recordCompletion(s, "2026-10-02");
 assert.deepEqual([s.currentStreak, s.longestStreak], [2, 2]);
 assert.deepEqual(recordCompletion(s, "2026-10-02"), s, "same day counts once");
 s = recordCompletion(recordCompletion(s, "2026-10-03"), "2026-10-04");
 assert.equal(s.currentStreak, 4);
 s = recordCompletion(s, "2026-10-07"); // missed the 5th and 6th
 assert.deepEqual([s.currentStreak, s.longestStreak], [1, 4]);
 assert.deepEqual(recordCompletion(s, "2026-10-06"), s, "an older day never rewinds the streak");
 assert.equal(activeStreak(s, "2026-10-07"), 1);
 assert.equal(activeStreak(s, "2026-10-08"), 1, "still alive the next day");
 assert.equal(activeStreak(s, "2026-10-09"), 0, "shown as broken after a missed day");
 for (const bad of [null, "{", JSON.stringify({ version: 1, currentStreak: -1, longestStreak: 0, lastCompletedDate: null })]) assert.deepEqual(readStreak(bad), emptyStreak());
});

test("rewards: free milestones at 5, 10, 20 and 30 Wonder Stars, announced once", () => {
 assert.deepEqual(REWARDS.map(r => r.requiredStars), [5, 10, 20, 30]);
 assert.deepEqual(rewardStates(12).map(r => r.unlocked), [true, true, false, false]);
 assert.equal(sparkRewardClasses(4), "");
 assert.equal(sparkRewardClasses(20), "reward-badge reward-glow reward-crown");
 assert.deepEqual(newRewards(12, ["note-badge"]).map(r => r.rewardId), ["gold-glow"]);
 assert.deepEqual(readSeen(JSON.stringify(["crown", "fake", 3])), ["crown"]);
 const max = starTotals(loadJson("adventure.json") as Adventure, { version: 1, levels: {} }).max;
 assert.ok(max >= 30, `all rewards are reachable (max ${max} stars)`);
});

test("Music, Sports and Screen worlds: real five-person levels, no repeats, honest coming-soon", () => {
 const adventure = loadJson("adventure.json") as Adventure;
 const raw = loadRawContent(), byId = new Map(raw.questions.map(q => [q.id, q]));
 assert.deepEqual(adventure.worlds.map(w => w.id), ["music", "sports", "screen"]);
 const seen = new Set<string>();
 for (const w of adventure.worlds) {
  for (const l of w.levels) {
   if (l.comingSoon) { assert.equal(l.questionIds.length, 0, l.id); continue; }
   const qs = l.questionIds.map(id => byId.get(id)!);
   assert.ok(qs.every(q => q?.active && q.sourceQuality !== "needs_review"), l.id);
   assert.equal(new Set(qs.map(q => q.entityId)).size, 5, l.id);
   for (const q of qs) { assert.ok(!seen.has(q.entityId), `${q.entityId} repeats in ${l.id}`); seen.add(q.entityId); }
   assert.ok(qs.every(q => q.primaryCategory === w.category || (q.secondary ?? []).some(s => s.category === w.category)), `${l.id} stays in ${w.category}`);
  }
  const states = levelStates(w, { version: 1, levels: {} }).map(s => s.state);
  assert.equal(states[0], "open", w.id);
  assert.ok(states.slice(1).every(s => s === "locked" || s === "soon"), w.id);
 }
});
