import test from "node:test";
import assert from "node:assert/strict";
import { crossedMilestone } from "./milestones.ts";
test("crowns appear only on newly crossed score milestones",()=>{
 assert.equal(crossedMilestone(0,800),null);
 assert.equal(crossedMilestone(800,1000),1000);
 assert.equal(crossedMilestone(1000,1050),null);
 assert.equal(crossedMilestone(2500,3100),3000);
 assert.equal(crossedMilestone(4000,5000),5000);
 assert.equal(crossedMilestone(3000,3000),null);
});
