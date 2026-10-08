import test from "node:test";
import assert from "node:assert/strict";
import { decideBack } from "./back.ts";

test("back on a nested screen returns to the previous StarTap screen", () => {
 assert.equal(decideBack("/play/", true), "history-back");
 assert.equal(decideBack("/play", true), "history-back");
});
test("back in a game opened without history goes home instead of closing the app", () => {
 assert.equal(decideBack("/play/", false), "go-home");
});
test("back on home deliberately backgrounds the app rather than destroying it", () => {
 for (const path of ["/", "", "/index.html"]) {
  assert.equal(decideBack(path, true), "minimize", path);
  assert.equal(decideBack(path, false), "minimize", path);
 }
});
