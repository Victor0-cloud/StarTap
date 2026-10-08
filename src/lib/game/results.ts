import type { RoundResult } from "../../types/game.ts";
import { SCORE_TIERS } from "./scoring.ts";

export const ROUND_COUNT = 5;
export const MAX_ROUND_SCORE = SCORE_TIERS[0].score;
export const MAX_GAME_SCORE = ROUND_COUNT * MAX_ROUND_SCORE;

export function recordRound(history: readonly RoundResult[], result: RoundResult): RoundResult[] {
  if (history.length >= ROUND_COUNT || history.some(item => item.questionId === result.questionId)) return [...history];
  return [...history, result];
}

export function summarizeResults(history: readonly RoundResult[]) {
  return {
    totalScore: history.reduce((sum, item) => sum + item.score, 0),
    closestKm: history.length ? Math.min(...history.map(item => item.distanceKm)) : null,
    averageKm: history.length ? history.reduce((sum, item) => sum + item.distanceKm, 0) / history.length : null,
    finished: history.length === ROUND_COUNT,
  };
}
