import type { RawContent } from "../../content/schema.ts";

// Minimum distinct people needed before a category or subcategory offers "Play Five".
export const MIN_PLAYABLE = 5;

export interface SubcategoryCount { key: string; label: string; stars: number; playable: boolean }
export interface CategoryCount { key: string; label: string; group: "main" | "more"; stars: number; playable: boolean; subcategories: SubcategoryCount[] }

/** Playable pool: active, free questions. Premium tiers will filter here later, in one place. */
export const playableQuestions = (raw: RawContent) => raw.questions.filter(q => q.active && q.access.tier === "free");

type Membership = Pick<RawContent["questions"][number], "primaryCategory" | "subcategory" | "secondary">;
/** Whether a question belongs to a category: its primary category, or any `secondary` membership in it. */
export const inCategory = (q: Membership, category: string) => q.primaryCategory === category || (q.secondary ?? []).some(s => s.category === category);
/**
 * Whether a question belongs to a subcategory: its primary subcategory, or a `secondary` membership — which may name another
 * category, or another subcategory of its own category (e.g. music/rnb plus music/soul-legends-80s-90s). One record, many homes.
 */
export const inSubcategory = (q: Membership, category: string, subcategory: string) =>
 (q.primaryCategory === category && q.subcategory === subcategory) || (q.secondary ?? []).some(s => s.category === category && s.subcategory === subcategory);

/** Live counts of distinct people ("stars") per category and subcategory, in taxonomy order. A person counts once per pool. */
export function categoryCounts(raw: RawContent): CategoryCount[] {
 const pool = playableQuestions(raw);
 const people = (match: (q: (typeof pool)[number]) => boolean) => new Set(pool.filter(match).map(q => q.entityId)).size;
 return raw.taxonomy.categories.map(c => {
  const stars = people(q => inCategory(q, c.key));
  const subcategories = c.subcategories.map(s => {
   const n = people(q => inSubcategory(q, c.key, s.key));
   return { key: s.key, label: s.label, stars: n, playable: n >= MIN_PLAYABLE };
  }).filter(s => s.stars > 0);
  return { key: c.key, label: c.label, group: c.group, stars, playable: stars >= MIN_PLAYABLE, subcategories };
 });
}
