import type { RawContent } from "../../content/schema.ts";
import { inCategory, inSubcategory, playableQuestions, MIN_PLAYABLE } from "../content/counts.ts";
import { selectFive, type Candidate } from "./select.ts";

// Non-daily modes. Today's Five is not a mode here: it stays on its frozen edition and its own storage keys.
export type ModeSpec = { mode: "world_mix" } | { mode: "category"; category: string } | { mode: "subcategory"; category: string; subcategory: string }
 | { mode: "adventure"; level: string }; // Adventure of Wonders: a fixed, hand-picked five

/** Storage namespace per mode, kept apart from Today's Five keys (startap:<edition>:<day>). */
export const modeKey = (spec: ModeSpec) =>
 spec.mode === "world_mix" ? "world_mix" : spec.mode === "adventure" ? `adventure:${spec.level}`
 : spec.mode === "category" ? `category:${spec.category}` : `subcategory:${spec.category}/${spec.subcategory}`;
export const sessionStorageKey = (spec: ModeSpec) => `startap:session:${modeKey(spec)}`;

/** Short on-screen and share label, e.g. "WORLD MIX", "MUSIC FIVE", "AFROBEATS FIVE". */
export function modeLabel(raw: RawContent, spec: ModeSpec): string {
 if (spec.mode === "world_mix") return "World Mix";
 if (spec.mode === "adventure") return "Adventure";
 const category = raw.taxonomy.categories.find(c => c.key === spec.category);
 const name = spec.mode === "subcategory" ? category?.subcategories.find(s => s.key === spec.subcategory)?.label : category?.label;
 return `${name ?? "StarTap"} Five`;
}

/** Path a shared result links to (the mode itself, never the answers). */
export const modePath = (spec: ModeSpec) =>
 spec.mode === "world_mix" ? "/world-mix/" : spec.mode === "adventure" ? `/adventure/play/?level=${encodeURIComponent(spec.level)}` : `/category/${spec.category}/play/${spec.mode === "subcategory" ? `?sub=${encodeURIComponent(spec.subcategory)}` : ""}`;

export function poolFor(raw: RawContent, spec: ModeSpec): Candidate[] {
 const region = new Map(raw.entities.map(e => [e.id, e.region]));
 if (spec.mode === "adventure") return []; // adventure levels are fixed lists, never randomly selected
 // One candidate per question record, whatever its memberships: a person in two subcategories is never in a pool twice,
 // and selectFive keeps every game to five distinct people and questions.
 return playableQuestions(raw).filter(q => spec.mode === "world_mix" ? true
  : spec.mode === "category" ? inCategory(q, spec.category) : inSubcategory(q, spec.category, spec.subcategory)).map(q => ({ id: q.id, entityId: q.entityId, primaryCategory: q.primaryCategory, region: region.get(q.entityId) ?? "unknown", answerCountryCode: q.answer.countryCode }));
}

/**
 * Five unique questions with five different people for a mode, or null when fewer than five people are playable.
 * World Mix allows at most two per category, so a game always spans at least three categories.
 */
export function selectQuestions(raw: RawContent, spec: ModeSpec, { seed, exclude = new Set<string>(), count = 5 }: { seed: string; exclude?: ReadonlySet<string>; count?: number }): string[] | null {
 const pool = poolFor(raw, spec);
 if (new Set(pool.map(p => p.entityId)).size < Math.max(count, MIN_PLAYABLE)) return null;
 const ids = selectFive(pool, seed, { maxPerCategory: spec.mode === "world_mix" ? 2 : count, maxPerRegion: 2, exclude });
 return ids.length === count ? ids : null;
}
