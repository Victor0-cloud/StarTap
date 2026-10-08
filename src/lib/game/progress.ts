import type { Coordinates, RoundResult } from "../../types/game.ts";
import { isValidCoordinates, calculateDistanceKm } from "./distance.ts";
import { scoreWithHint } from "./daily.ts";
import { baseScore, type ScoringVersion } from "./result.ts";
import { isSameCountry } from "../geo/countries.ts";
import { stagedScore, type StageRecord } from "./stages.ts";
// countryCode: ISO code of the tapped country (null = sea/unassigned). Saves made before it existed simply lack it.
// stage: present only on two-stage answers (country, then city). Answers without it keep their original scoring.
export interface SavedAnswer { coordinates: Coordinates; hintUsed: boolean; countryCode?: string | null; stage?: StageRecord }
/**
 * A two-stage round in progress, saved so a reload resumes the same moment: it can never undo a wrong country,
 * hand back a used Joker or Life Saver, or re-roll a city attempt.
 */
export interface PendingStage {
 round: number; phase: "country_wrong" | "country_retry" | "city_select" | "city_missed";
 country: string; countryPoint: Coordinates; joker: boolean; lifeSaver: boolean; firstCity?: Coordinates;
 clue?: string; // Pixel's one clue for this round, once shown
}
export interface Progress {
 answers: SavedAnswer[]; roundIndex: number; finished: boolean; hintUsed: boolean;
 jokerUsed?: boolean; lifeSaverUsed?: boolean; pending?: PendingStage | null; // two-stage games only; absent = unused
}
export const emptyProgress = (): Progress => ({ answers: [], roundIndex: 0, finished: false, hintUsed: false });
const validCountry = (value: unknown) => value === undefined || value === null || (typeof value === "string" && /^[A-Z]{2}$/.test(value));
const bool = (value: unknown) => typeof value === "boolean";
const validStage = (s: unknown) => s === undefined || (typeof s === "object" && s !== null &&
 validCountry((s as StageRecord).country) && bool((s as StageRecord).countryRight) && bool((s as StageRecord).joker) && bool((s as StageRecord).lifeSaver));
function validPending(p: PendingStage | null | undefined, roundIndex: number, answers: number): boolean {
 if (p === undefined || p === null) return true;
 return p.round === roundIndex && answers === roundIndex && ["country_wrong", "country_retry", "city_select", "city_missed"].includes(p.phase) &&
  validCountry(p.country) && typeof p.country === "string" && isValidCoordinates(p.countryPoint) && bool(p.joker) && bool(p.lifeSaver) &&
  (p.firstCity === undefined || isValidCoordinates(p.firstCity)) && (p.clue === undefined || (typeof p.clue === "string" && p.clue.length <= 120));
}
export function restoreProgress(raw: string | null): Progress {
 try {
  if (!raw) return emptyProgress();
  const value = JSON.parse(raw);
  if (value.version !== 1 || !Array.isArray(value.answers) || value.answers.length > 5 ||
   !Number.isInteger(value.roundIndex) || value.roundIndex < 0 || value.roundIndex > 4 ||
   typeof value.finished !== "boolean" || typeof value.hintUsed !== "boolean" ||
   value.answers.some((a: SavedAnswer) => !a || !a.coordinates || !isValidCoordinates(a.coordinates) || typeof a.hintUsed !== "boolean" || !validCountry(a.countryCode) || !validStage(a.stage)) ||
   (value.finished && value.answers.length !== 5) ||
   (!value.finished && value.answers.length !== value.roundIndex && value.answers.length !== value.roundIndex + 1)) return emptyProgress();
  const progress: Progress = { answers: value.answers, roundIndex: value.roundIndex, finished: value.finished, hintUsed: value.hintUsed };
  // New fields: kept only when valid; a damaged rescue flag counts as used, never as a fresh Joker or Life Saver.
  if (value.jokerUsed !== undefined) progress.jokerUsed = value.jokerUsed !== false;
  if (value.lifeSaverUsed !== undefined) progress.lifeSaverUsed = value.lifeSaverUsed !== false;
  if (value.pending && validPending(value.pending, value.roundIndex, value.answers.length)) progress.pending = value.pending;
  return progress;
 } catch { return emptyProgress(); }
}
export function resultsFor(answers: SavedAnswer[], questions: readonly {id: string; starName: string; answerCoordinates: Coordinates; answerCountryCode?: string}[], scoring: ScoringVersion = "distance-v1"): RoundResult[] {
 return answers.map((answer, index) => {
  const question = questions[index];
  const distanceKm = calculateDistanceKm(answer.coordinates, question.answerCoordinates);
  if (answer.stage) {
   const s = stagedScore(distanceKm, answer.stage, answer.hintUsed);
   return {questionId: question.id, starName: question.starName, playerCoordinates: answer.coordinates, distanceKm, score: s.total, countryPoints: s.countryPoints, cityPoints: s.cityPoints};
  }
  const sameCountry = isSameCountry(answer.countryCode, question.answerCountryCode);
  return {questionId: question.id, starName: question.starName, playerCoordinates: answer.coordinates,
   distanceKm, score: scoreWithHint(baseScore(scoring, distanceKm, sameCountry), answer.hintUsed)};
 });
}
