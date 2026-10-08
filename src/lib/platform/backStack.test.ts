import test from "node:test";
import assert from "node:assert/strict";
import { consumeBack, pushBackHandler } from "./backStack.ts";

test("back stack: newest handler first, removable, falls through when unhandled", () => {
 const calls: string[] = [];
 const removeA = pushBackHandler(() => { calls.push("a"); return true; });
 const removeB = pushBackHandler(() => { calls.push("b"); return false; });
 assert.equal(consumeBack(), true);
 assert.deepEqual(calls, ["b", "a"]);
 removeA(); removeB();
 assert.equal(consumeBack(), false, "no handlers: the normal Android back runs");
});
