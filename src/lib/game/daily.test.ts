import test from "node:test";
import assert from "node:assert/strict";
import {globalDailyIndices,dailyIndices,validDate,dateKey,scoreWithHint} from "./daily.ts";
import {restoreProgress,resultsFor} from "./progress.ts";
test("daily sets are stable, distinct, and change at UTC midnight",()=>{
 const today=dailyIndices("2026-09-29",10);
 assert.deepEqual(today,dailyIndices("2026-09-29",10));
 assert.equal(new Set(today).size,5);
 assert.notDeepEqual(today,dailyIndices("2026-09-30",10));
 assert.equal(dateKey(new Date("2026-09-29T23:59:59Z")),"2026-09-29");
 assert.equal(dateKey(new Date("2026-09-30T00:00:00Z")),"2026-09-30");
 assert.equal(validDate("2026-02-30"),false);
 assert.equal(validDate("nonsense"),false);
 assert.throws(()=>dailyIndices("bad",10));
});
test("hints deduct points without making a negative score",()=>{
 assert.equal(scoreWithHint(1000,true),800);
 assert.equal(scoreWithHint(50,true),0);
 assert.equal(scoreWithHint(900,false),900);
});
test("saved reveals resume and scores are recomputed from guesses",()=>{
 const saved=restoreProgress(JSON.stringify({version:1,answers:[{coordinates:{latitude:0,longitude:0},hintUsed:true}],roundIndex:0,finished:false,hintUsed:true}));
 assert.equal(saved.answers.length,1);
 const results=resultsFor(saved.answers,[{id:"one",starName:"One",answerCoordinates:{latitude:0,longitude:0}}]);
 assert.equal(results[0].score,800);
});
test("corrupt or impossible progress cannot crash or skip rounds",()=>{
 for(const raw of ["{",JSON.stringify({version:1,answers:[null],roundIndex:0,finished:false,hintUsed:false}),
 JSON.stringify({version:1,answers:[],roundIndex:4,finished:false,hintUsed:false}),
 JSON.stringify({version:1,answers:[],roundIndex:0,finished:true,hintUsed:false})]) {
  assert.equal(restoreProgress(raw).answers.length,0);
  assert.equal(restoreProgress(raw).roundIndex,0);
 }
});


test("global edition offers all fifty stars once across ten days, then repeats",()=>{
 const seen=new Set<number>();
 for(let day=0;day<10;day++) {
  const date=dateKey(new Date(Date.UTC(2026,8,29+day)));
  const indices=globalDailyIndices(date,50);
  assert.equal(indices.length,5);
  for(const index of indices) {assert(!seen.has(index));seen.add(index);}
  assert.deepEqual(indices,globalDailyIndices(date,50));
 }
 assert.equal(seen.size,50);
 assert.deepEqual(globalDailyIndices("2026-09-29",50),globalDailyIndices("2026-10-09",50));
 assert.throws(()=>globalDailyIndices("invalid",50));
 assert.throws(()=>globalDailyIndices("2026-09-29",49));
});

test("expanded edition includes sixty-five distinct questions over thirteen days",()=>{
 const seen=new Set<number>();
 for(let offset=0;offset<13;offset++) {
  for(const index of globalDailyIndices(dateKey(new Date(Date.UTC(2026,8,29+offset))),65)) {
   assert(!seen.has(index)); seen.add(index);
  }
 }
 assert.equal(seen.size,65);
 assert.deepEqual(globalDailyIndices("2026-09-29",65),globalDailyIndices("2026-10-12",65));
});
