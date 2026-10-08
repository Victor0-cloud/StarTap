import type { RoundResult } from "../../types/game.ts";

// origin: site that challenge links point to, or null to share the text without a link.
export interface ShareInput { day: string; edition: string; results: readonly Pick<RoundResult, "score">[]; practice: boolean; origin: string | null }

// Spoiler-free result text. The link carries day + edition so old shared links keep resolving.
export function buildShareText({ day, edition, results, practice, origin }: ShareInput): string {
 const score = results.reduce((sum, r) => sum + r.score, 0);
 const squares = results.map(r => r.score >= 900 ? "🟩" : r.score >= 600 ? "🟨" : r.score >= 200 ? "🟧" : "⬜").join("");
 const lines = ["StarTap · " + day + (practice ? " · Practice" : ""), squares, score.toLocaleString() + " / 5,000", "Five stars. How close can you get?"];
 if (origin) lines.push(challengeLink({ day, edition, origin }));
 return lines.join("\n");
}

/** The daily challenge link on its own (COPY LINK): the same day and edition as the shared text. */
export function challengeLink({ day, edition, origin }: { day: string; edition: string; origin: string }): string {
 const url = new URL("/play", origin);
 url.searchParams.set("day", day); url.searchParams.set("edition", edition);
 return url.toString();
}

export interface ModeShareInput { label: string; results: readonly Pick<RoundResult, "score">[]; origin: string | null; path: string }

/** Category / World Mix result text, e.g. "StarTap · Music Five". Links to the mode, never to answers. */
export function buildModeShareText({ label, results, origin, path }: ModeShareInput): string {
 const score = results.reduce((sum, r) => sum + r.score, 0);
 const squares = results.map(r => r.score >= 900 ? "🟩" : r.score >= 600 ? "🟨" : r.score >= 200 ? "🟧" : "⬜").join("");
 const lines = ["StarTap · " + label, squares, score.toLocaleString() + " / 5,000", "Five stars. How close can you get?"];
 if (origin) lines.push(new URL(path, origin).toString());
 return lines.join("\n");
}
