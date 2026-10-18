import test from "node:test";
import assert from "node:assert/strict";
import { FREE_SPORTS, isFreeSport, sportsPoolFor, subcategoryLocked, unlimitedFreePlay, worldLocked, adventureLocked } from "./access.ts";
import { categoryCounts, inSubcategory } from "../content/counts.ts";
import { loadRawContent } from "../content/node-content.ts";
import { modeKey, poolFor, selectQuestions } from "../game/modes.ts";
import { LOGIN_NEXT_KEY, rememberLoginNext, takeLoginNext } from "../auth/login-next.ts";

const raw = loadRawContent();
const counts = categoryCounts(raw);
const signedOut = { paymentsOn: true, isPremium: false };
const member = { paymentsOn: true, isPremium: true };
const off = { paymentsOn: false, isPremium: false };

// The approved split (Victor, Oct 18, 2026). "football" is association football (soccer); "american-football" is gridiron.
const APPROVED_FREE_SPORTS = ["football", "basketball", "boxing"];
const APPROVED_PREMIUM_SPORTS = ["american-football", "tennis", "baseball", "mma", "formula-1", "cricket", "gymnastics", "racket-sports", "winter-sports", "track-field"];
const PREMIUM_WORLDS = ["screen", "icons", "tech", "fashion", "business", "creators", "royalty"];

test("the sports split matches the approved list, using the taxonomy keys", () => {
  const sports = raw.taxonomy.categories.find(c => c.key === "sports")!;
  const keys = new Set(sports.subcategories.map(s => s.key));
  for (const key of [...APPROVED_FREE_SPORTS, ...APPROVED_PREMIUM_SPORTS]) assert.ok(keys.has(key), `taxonomy has ${key}`);
  assert.equal(sports.subcategories.find(s => s.key === "football")!.label, "Football / Soccer");
  // `football` is soccer: there is no duplicate soccer key anywhere in the taxonomy.
  assert.equal(raw.taxonomy.categories.flatMap(c => [c.key, ...c.subcategories.map(s => s.key)]).some(k => /soccer/i.test(k)), false);
  assert.equal(subcategoryLocked("sports", "american-football", signedOut), true, "American Football is Premium");
  assert.equal(subcategoryLocked("sports", "tennis", signedOut), true, "Tennis is Premium");
  assert.deepEqual([...FREE_SPORTS].sort(), [...APPROVED_FREE_SPORTS].sort());
  for (const key of APPROVED_FREE_SPORTS) {
    assert.equal(isFreeSport(key), true, key);
    assert.equal(subcategoryLocked("sports", key, signedOut), false, key);
    assert.equal(unlimitedFreePlay("sports", key), true, key);
  }
  for (const key of APPROVED_PREMIUM_SPORTS) {
    assert.equal(subcategoryLocked("sports", key, signedOut), true, key);
    assert.equal(subcategoryLocked("sports", key, member), false, key);
    assert.equal(subcategoryLocked("sports", key, off), false, key);
    assert.equal(unlimitedFreePlay("sports", key), false, key);
  }
  // Sports with no stars yet, and any sport added later, default to Premium.
  for (const key of ["golf", "wrestling", "olympic-legends"]) assert.equal(subcategoryLocked("sports", key, signedOut), true, key);
  // Every playable sport is on one list or the other.
  const playable = counts.find(c => c.key === "sports")!.subcategories.filter(s => s.playable).map(s => s.key).sort();
  assert.deepEqual(playable, [...APPROVED_FREE_SPORTS, ...APPROVED_PREMIUM_SPORTS].sort());
});

test("every Music genre is free and uncapped, signed out", () => {
  const music = raw.taxonomy.categories.find(c => c.key === "music")!;
  assert.equal(worldLocked("music", signedOut), false);
  for (const s of music.subcategories) {
    assert.equal(subcategoryLocked("music", s.key, signedOut), false, s.key);
    assert.equal(unlimitedFreePlay("music", s.key), true, s.key);
  }
  assert.equal(unlimitedFreePlay("music", null), true);
});

test("Premium worlds and Adventure lock for free players and open for members", () => {
  for (const key of PREMIUM_WORLDS) {
    assert.equal(worldLocked(key, signedOut), true, key);
    assert.equal(worldLocked(key, member), false, key);
    assert.equal(worldLocked(key, off), false, key);
  }
  assert.equal(adventureLocked(signedOut), true);
  assert.equal(adventureLocked(member), false);
  // World Mix keeps the existing daily cap: it is the only capped mode left.
  assert.equal(unlimitedFreePlay(null, null), false);
});

test("a free player's Sports Five draws only from football, basketball and boxing; members draw from every sport", () => {
  assert.deepEqual(sportsPoolFor(signedOut), FREE_SPORTS);
  assert.equal(sportsPoolFor(member), undefined);
  assert.equal(sportsPoolFor(off), undefined);
  const free = { mode: "category" as const, category: "sports", only: FREE_SPORTS };
  const pool = poolFor(raw, free);
  const byId = new Map(raw.questions.map(q => [q.id, q]));
  assert.ok(new Set(pool.map(p => p.entityId)).size >= 100, "plenty of free sports stars");
  for (const p of pool) assert.ok(FREE_SPORTS.some(sub => inSubcategory(byId.get(p.id)!, "sports", sub)), p.id);
  assert.ok(pool.length < poolFor(raw, { mode: "category", category: "sports" }).length);
  for (let i = 0; i < 25; i++) {
    const ids = selectQuestions(raw, free, { seed: `free-${i}` });
    assert.ok(ids && ids.length === 5);
    for (const id of ids!) assert.ok(FREE_SPORTS.some(sub => inSubcategory(byId.get(id)!, "sports", sub)), id);
  }
  // A saved members' Sports Five is never restored into the free pool.
  assert.notEqual(modeKey(free), modeKey({ mode: "category", category: "sports" }));
  assert.equal(modeKey({ mode: "category", category: "sports" }), "category:sports");
});

test("an emailed sign-in returns to the Premium page once, and never to an unlisted path", () => {
  const bag = new Map<string, string>();
  const kv = { getItem: (k: string) => bag.get(k) ?? null, setItem: (k: string, v: string) => { bag.set(k, v); }, removeItem: (k: string) => { bag.delete(k); } };
  const now = Date.parse("2026-10-18T12:00:00Z");
  rememberLoginNext(kv, "/premium/", now);
  assert.equal(takeLoginNext(kv, now + 1000), "/premium/");
  assert.equal(takeLoginNext(kv, now + 2000), null);
  rememberLoginNext(kv, "/premium/", now);
  assert.equal(takeLoginNext(kv, now + 2 * 60 * 60 * 1000), null, "stale");
  rememberLoginNext(kv, "https://evil.example/", now);
  assert.equal(bag.has(LOGIN_NEXT_KEY), false);
  bag.set(LOGIN_NEXT_KEY, JSON.stringify({ path: "//evil.example/", savedAt: now }));
  assert.equal(takeLoginNext(kv, now), null);
});
