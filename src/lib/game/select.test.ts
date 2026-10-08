import test from "node:test";
import assert from "node:assert/strict";
import { selectFive, type Candidate } from "./select.ts";
import { loadRawContent } from "../content/node-content.ts";

const raw = loadRawContent();
const region = new Map(raw.entities.map(e => [e.id, e.region]));
const pool: Candidate[] = raw.questions.filter(q => q.active && q.access.tier === "free")
 .map(q => ({ id: q.id, entityId: q.entityId, primaryCategory: q.primaryCategory, region: region.get(q.entityId)!, answerCountryCode: q.answer.countryCode }));

test("same seed, same five; different seeds vary", () => {
 assert.deepEqual(selectFive(pool, "2026-10-01"), selectFive(pool, "2026-10-01"));
 const sets = new Set(Array.from({ length: 20 }, (_, i) => selectFive(pool, "day-" + i).join()));
 assert.ok(sets.size >= 18);
});

test("five distinct people, at most two per category and region, no repeated answer country", () => {
 for (let i = 0; i < 200; i++) {
  const ids = selectFive(pool, "seed-" + i);
  const qs = ids.map(id => pool.find(p => p.id === id)!);
  assert.equal(new Set(qs.map(q => q.entityId)).size, 5);
  for (const key of ["primaryCategory", "region"] as const) {
   const counts: Record<string, number> = {};
   for (const q of qs) counts[q[key]] = (counts[q[key]] ?? 0) + 1;
   assert.ok(Math.max(...Object.values(counts)) <= 2, `${key} ${JSON.stringify(counts)}`);
  }
  assert.equal(new Set(qs.map(q => q.answerCountryCode)).size, 5);
 }
});

test("recent questions are avoided while the pool allows it", () => {
 const first = selectFive(pool, "a");
 const next = selectFive(pool, "a", { exclude: new Set(first) });
 assert.equal(next.filter(id => first.includes(id)).length, 0);
});

test("a thin pool relaxes preferences instead of failing", () => {
 const music = pool.filter(p => p.primaryCategory === "music").slice(0, 6);
 assert.equal(selectFive(music, "x").length, 5);
 assert.equal(selectFive(pool.slice(0, 3), "x").length, 3);
});
