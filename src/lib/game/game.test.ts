import test from "node:test";
import assert from "node:assert/strict";
import { calculateDistanceKm, isValidCoordinates } from "./distance.ts";
import { calculateScore, feedbackForDistance } from "./scoring.ts";

test("identical coordinates return zero kilometers", () => {
  assert.equal(calculateDistanceKm({ latitude: 4.8156, longitude: 7.0498 }, { latitude: 4.8156, longitude: 7.0498 }), 0);
});

test("London to Paris is approximately 344 kilometers", () => {
  const result = calculateDistanceKm({ latitude: 51.5074, longitude: -0.1278 }, { latitude: 48.8566, longitude: 2.3522 });
  assert.ok(result > 340 && result < 350, `${result} km`);
});

test("every MVP scoring boundary", () => {
  const cases: [number, number][] = [[0,1000],[25,1000],[26,900],[100,900],[101,750],
    [250,750],[251,600],[500,600],[501,400],[1000,400],[1001,200],[2500,200],[2501,50]];
  for (const [distance, score] of cases) assert.equal(calculateScore(distance), score, `distance ${distance}`);
});

test("feedback categories follow the specified thresholds", () => {
  assert.equal(feedbackForDistance(25), "PERFECT TAP!");
  assert.equal(feedbackForDistance(26), "AMAZING!");
  assert.equal(feedbackForDistance(101), "GREAT TAP!");
  assert.equal(feedbackForDistance(501), "NOT QUITE");
});

test("invalid inputs do not return a plausible score or distance", () => {
  assert.equal(isValidCoordinates({ latitude: 91, longitude: 0 }), false);
  assert.throws(() => calculateDistanceKm({ latitude: NaN, longitude: 0 }, { latitude: 0, longitude: 0 }), RangeError);
  assert.throws(() => calculateScore(-1), RangeError);
});

import { recordRound, summarizeResults, MAX_GAME_SCORE } from "./results.ts";
import type { RoundResult } from "../../types/game.ts";

const round = (id: string, distanceKm = 25): RoundResult => ({
  questionId: id, starName: id, playerCoordinates: { latitude: 0, longitude: 0 },
  distanceKm, score: calculateScore(distanceKm),
});
test("five rounds accumulate to the 5000 maximum and reject a sixth", () => {
  let history: RoundResult[] = [];
  for (let i = 0; i < 5; i++) {
    history = recordRound(history, round(String(i)));
    assert.equal(summarizeResults(history).finished, i === 4);
  }
  assert.equal(summarizeResults(history).totalScore, MAX_GAME_SCORE);
  assert.equal(MAX_GAME_SCORE, 5000);
  assert.equal(recordRound(history, round("sixth")).length, 5);
});
test("the same round cannot score twice and history is immutable", () => {
  const history = [round("one")];
  assert.deepEqual(recordRound(history, round("one", 100)), history);
  assert.equal(recordRound(history, round("two")).length, 2);
  assert.equal(history.length, 1);
});
test("final results calculate total, closest and average from every round", () => {
  const summary = summarizeResults([round("one", 10), round("two", 100), round("three", 250), round("four", 500), round("five", 1000)]);
  assert.equal(summary.totalScore, 3650);
  assert.equal(summary.closestKm, 10);
  assert.equal(summary.averageKm, 372);
  assert.equal(summary.finished, true);
});
test("reset history has no invented closest or average distance", () => {
  assert.deepEqual(summarizeResults([]), { totalScore: 0, closestKm: null, averageKm: null, finished: false });
});
