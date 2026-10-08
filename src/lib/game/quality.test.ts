import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pickQuality } from "./quality.ts";
import { MASCOT_IDS, mascotPortal } from "./mascots.ts";

test("quality AUTO: reduced motion and weak devices step down; a valid override wins", () => {
 assert.equal(pickQuality({ reducedMotion: false, deviceMemory: 8, cores: 8 }), "high");
 assert.equal(pickQuality({ reducedMotion: false }), "high", "unknown device: full quality");
 assert.equal(pickQuality({ reducedMotion: false, deviceMemory: 4, cores: 8 }), "balanced");
 assert.equal(pickQuality({ reducedMotion: false, deviceMemory: 8, cores: 4 }), "balanced");
 assert.equal(pickQuality({ reducedMotion: false, deviceMemory: 2 }), "reduced");
 assert.equal(pickQuality({ reducedMotion: true, deviceMemory: 8 }), "reduced");
 assert.equal(pickQuality({ reducedMotion: false, saveData: true }), "reduced");
 assert.equal(pickQuality({ reducedMotion: true, override: "high" }), "high");
 assert.equal(pickQuality({ reducedMotion: false, override: "ultra" }), "high", "unknown override ignored");
});

test("every mascot has an in-world portal image with transparency, kept small", () => {
 for (const id of MASCOT_IDS) {
  const bytes = readFileSync(new URL(`../../../public${mascotPortal(id)}`, import.meta.url));
  assert.equal(bytes.subarray(8, 12).toString(), "WEBP", id);
  assert.ok(bytes.includes(Buffer.from("ALPH")) || bytes.includes(Buffer.from("VP8L")), `${id} portal keeps its alpha channel`);
  assert.ok(bytes.length < 40000, `${id}: ${bytes.length} bytes`);
 }
});
