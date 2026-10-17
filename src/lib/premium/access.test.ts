import test from "node:test";
import assert from "node:assert/strict";
import { adventureLocked, expandedStatsLocked, isFreeWorld, worldLocked } from "./access.ts";
import { canStartPlayFive, quotaSnapshot, recordPlayFive, type Kv } from "./quota.ts";

const memory = (): Kv => {
  const bag = new Map<string, string>();
  return { getItem: key => bag.get(key) ?? null, setItem: (key, value) => { bag.set(key, value); } };
};

test("free worlds stay open and other worlds lock only while payments are on", () => {
  assert.equal(isFreeWorld("music"), true);
  assert.equal(isFreeWorld("sports"), true);
  assert.equal(worldLocked("music", { paymentsOn: true, isPremium: false }), false);
  assert.equal(worldLocked("screen", { paymentsOn: true, isPremium: false }), true);
  assert.equal(worldLocked("screen", { paymentsOn: true, isPremium: true }), false);
  assert.equal(worldLocked("screen", { paymentsOn: false, isPremium: false }), false);
  assert.equal(adventureLocked({ paymentsOn: true, isPremium: false }), true);
  assert.equal(adventureLocked({ paymentsOn: false, isPremium: false }), false);
  assert.equal(expandedStatsLocked({ paymentsOn: true, isPremium: false }), true);
  assert.equal(expandedStatsLocked({ paymentsOn: false, isPremium: false }), false);
});

test("Play Five allows three new rounds per UTC day and resets the next day", () => {
  const store = memory();
  const day = new Date("2026-10-17T23:00:00.000Z");
  assert.equal(canStartPlayFive(store, day), true);
  recordPlayFive(store, day);
  recordPlayFive(store, day);
  recordPlayFive(store, day);
  assert.equal(quotaSnapshot(store, day).count, 3);
  assert.equal(canStartPlayFive(store, day), false);
  const next = new Date("2026-10-18T00:00:00.000Z");
  assert.equal(canStartPlayFive(store, next), true);
  assert.equal(quotaSnapshot(store, next).count, 0);
});
