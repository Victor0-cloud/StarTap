import test from "node:test";
import assert from "node:assert/strict";
import { MOTION, outcomeOf, pointAt, routePoints, travelDuration, travelFrame } from "./motion.ts";
import { MASCOT_IDS } from "./mascots.ts";

test("six movement personalities: no two mascots share a motion signature or route style", () => {
 const sig = MASCOT_IDS.map(id => { const m = MOTION[id]; return JSON.stringify([m.ease, m.hops, m.spinDeg, m.dematerialize, m.curve]); });
 assert.equal(new Set(sig).size, 6, "each mascot moves differently");
 const routes = MASCOT_IDS.map(id => { const r = MOTION[id].route; return JSON.stringify([r.color, r.dash, r.width]); });
 assert.equal(new Set(routes).size, 6, "each mascot draws its own route");
 for (const kind of ["success", "close", "miss", "retry", "country"] as const) assert.equal(new Set(MASCOT_IDS.map(id => MOTION[id].lines[kind])).size, 6, `unique ${kind} lines`);
});

test("speed personalities: Dash fastest, Aura slowest, durations grow with distance", () => {
 const at = (id: keyof typeof MOTION, px: number) => travelDuration(MOTION[id], px);
 for (const id of MASCOT_IDS) assert.ok(at(id, 600) >= at(id, 50), id);
 assert.ok(MASCOT_IDS.every(id => id === "dash" || at("dash", 300) < at(id, 300)), "Dash is the fastest");
 assert.ok(MASCOT_IDS.every(id => id === "aura" || at("aura", 300) > at(id, 300)), "Aura is the slowest");
});

test("travel frames: start and end on the route, hops for Sparkle, spin for Orbit, pixel stream for Pixel", () => {
 for (const id of MASCOT_IDS) {
  const s = travelFrame(MOTION[id], 0), e = travelFrame(MOTION[id], 1);
  assert.equal(s.progress, 0, id); assert.ok(Math.abs(e.progress - 1) < 1e-9, id);
  assert.ok(Math.abs(e.opacity - 1) < 1e-9 && Math.abs(e.scale - 1) < 1e-9, `${id} arrives whole`);
 }
 const sparkle = [0.17, 0.33, 0.5].map(t => travelFrame(MOTION.sparkle, t).lift);
 assert.ok(sparkle[0] > 15 && sparkle[1] < 3 && sparkle[2] > 15, "three hops touch down between arcs");
 assert.equal(travelFrame(MOTION.orbit, 1).spin, 360);
 assert.ok(travelFrame(MOTION.pixel, 0.5).opacity < 0.5 && travelFrame(MOTION.pixel, 0.5).scale < 0.65, "Pixel dematerialises mid-trip (still visible as a stream)");
 assert.ok(travelFrame(MOTION.dash, 0.3).progress > 0.7, "Dash bursts off");
 assert.ok(travelFrame(MOTION.aura, 0.25).progress < 0.2, "Aura eases in gently");
});

test("routes start and end exactly on the two points; outcome groups", () => {
 const pts = routePoints([0, 0], [10, 0], 0.3);
 assert.deepEqual(pts[0], [0, 0]); assert.deepEqual(pts.at(-1), [10, 0]);
 assert.ok(Math.abs(pts[14][1]) > 1, "curved");
 assert.deepEqual(routePoints([0, 0], [10, 0], 0)[14], [5, 0]);
 assert.deepEqual(pointAt(pts, 1), [10, 0]);
 assert.deepEqual(["nailed", "city", "crowned", "region", "close", "miss"].map(outcomeOf), ["success", "success", "success", "close", "close", "miss"]);
});
