import type { Adventure, AdventureLevel, AdventureWorld } from "../../content/schema.ts";

// Adventure of Wonders: a light campaign. Separate from Today's Five, World Mix and category play.
export const ADVENTURE_KEY = "startap:adventure:v1";
// Finishing a level earns 1 Wonder Star; 2,500+ points earns 2; 4,000+ earns 3.
export const WONDER_TWO = 2500, WONDER_THREE = 4000;

export function wonderStars(score: number): 1 | 2 | 3 {
 return score >= WONDER_THREE ? 3 : score >= WONDER_TWO ? 2 : 1;
}

export interface AdventureProgress { version: 1; levels: Record<string, { best: number; stars: 1 | 2 | 3 }> }
export const emptyAdventure = (): AdventureProgress => ({ version: 1, levels: {} });

/** Reads saved progress; anything malformed is ignored rather than trusted, so progress can never be faked by bad data. */
export function readAdventure(raw: string | null): AdventureProgress {
 try {
  const value = JSON.parse(raw ?? "null");
  if (value?.version !== 1 || typeof value.levels !== "object" || !value.levels) return emptyAdventure();
  const levels: AdventureProgress["levels"] = {};
  for (const [id, entry] of Object.entries(value.levels as Record<string, { best?: unknown }>)) {
   const best = entry?.best;
   if (typeof best === "number" && Number.isInteger(best) && best >= 0 && best <= 5000) levels[id] = { best, stars: wonderStars(best) };
  }
  return { version: 1, levels };
 } catch { return emptyAdventure(); }
}

/** Records a finished level, keeping the best score. */
export function recordLevel(progress: AdventureProgress, levelId: string, score: number): AdventureProgress {
 const best = Math.max(progress.levels[levelId]?.best ?? 0, Math.max(0, Math.min(5000, Math.round(score))));
 return { version: 1, levels: { ...progress.levels, [levelId]: { best, stars: wonderStars(best) } } };
}

export type LevelState = "done" | "open" | "locked" | "soon";
/** A level opens once the previous playable level is finished; "coming soon" levels never open. */
export function levelStates(world: AdventureWorld, progress: AdventureProgress): { level: AdventureLevel; state: LevelState; stars: number }[] {
 let previousDone = true;
 return world.levels.map(level => {
  if (level.comingSoon || level.questionIds.length !== 5) return { level, state: "soon" as const, stars: 0 };
  const entry = progress.levels[level.id];
  const state: LevelState = entry ? "done" : previousDone ? "open" : "locked";
  previousDone = Boolean(entry);
  return { level, state, stars: entry?.stars ?? 0 };
 });
}

export function findLevel(adventure: Adventure, id: string | null): { world: AdventureWorld; level: AdventureLevel; index: number } | null {
 for (const world of adventure.worlds) {
  const index = world.levels.findIndex(l => l.id === id);
  if (index >= 0) return { world, level: world.levels[index], index };
 }
 return null;
}

/** "Start adventure" goes to the first open level, or the first level once everything is done. */
export function nextLevelId(world: AdventureWorld, progress: AdventureProgress): string {
 const states = levelStates(world, progress);
 return (states.find(s => s.state === "open") ?? states.find(s => s.state === "done") ?? states[0]).level.id;
}

export function starTotals(adventure: Adventure, progress: AdventureProgress) {
 const playable = adventure.worlds.flatMap(w => w.levels.filter(l => !l.comingSoon && l.questionIds.length === 5));
 return { earned: playable.reduce((n, l) => n + (progress.levels[l.id]?.stars ?? 0), 0), max: playable.length * 3 };
}
