// Per-page titles, descriptions and sitemap routes, derived from the live content counts so the numbers never drift.
// Pure functions (no Next imports) so they can be unit-tested with the Node content loader.
// Every claim here must stay true for every visitor: no prices, no "free" claims beyond Today's Five, no ratings.
import type { CategoryCount } from "./content/counts.ts";
import type { GenrePreview } from "./game/cinematics.ts";

export interface PageCopy { title: string; description: string }

/** Search titles for the worlds. Anything not listed uses "<Label> Trivia Geography Game". */
const WORLD_TITLES: Readonly<Record<string, string>> = {
 music: "Music Trivia Geography Game",
 sports: "Sports Trivia Geography Game",
 screen: "Movie & TV Star Geography Game",
 icons: "World Icons Trivia Geography Game",
};
/** How a world's stars are described in a sentence ("184 music stars"). */
const STAR_NOUN: Readonly<Record<string, string>> = {
 music: "music stars", sports: "sports stars", screen: "screen stars", icons: "world icons", tech: "tech and innovation stars",
 fashion: "fashion and beauty stars", business: "business stars", creators: "internet creators", royalty: "royals",
};

const list = (items: readonly string[]) => items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
const STAGES = "Find the country, then the city.";

/** A world (category) page. Worlds with no stars yet are honest "coming soon" pages and are not indexed. */
export function categoryCopy(category: CategoryCount): PageCopy & { indexable: boolean } {
 if (category.stars === 0) return {
  title: `${category.label}: Coming Soon | StarTap`,
  description: `${category.label} is a StarTap world that is still being built. Play Today's Five while new stars are added.`,
  indexable: false,
 };
 const subs = category.subcategories;
 const kind = category.key === "music" ? "genres" : category.key === "sports" ? "sports" : "collections";
 const examples = list(subs.slice(0, 3).map(s => s.label));
 const title = `${WORLD_TITLES[category.key] ?? `${category.label} Trivia Geography Game`} | StarTap`;
 const noun = STAR_NOUN[category.key] ?? "stars";
 const spread = subs.length > 1 ? ` across ${subs.length} ${kind}, including ${examples}` : "";
 return { title, description: `${category.stars} ${noun}${spread}. ${STAGES}`, indexable: true };
}

/** The "More" hub: lists the More-group worlds that have stars. */
export function moreCopy(categories: readonly CategoryCount[]): PageCopy {
 const live = categories.filter(c => c.group === "more" && c.stars > 0).map(c => c.label);
 return {
  title: "More Worlds to Explore | StarTap",
  description: live.length ? `More StarTap worlds: ${list(live)}. ${STAGES}` : `More StarTap worlds are on the way. ${STAGES}`,
 };
}

/** Genre titles stay at 60 characters: drop the "| StarTap" suffix when the base is already long. */
function genreTitle(name: string): string {
 const base = `${name} Trivia: Where Stars Come From`;
 return base.length + 10 <= 60 ? `${base} | StarTap` : base;
}

/** A genre or sport landing page (/category/<category>/genre/<key>/). */
export function genreCopy(preview: Pick<GenrePreview, "title" | "description">, stars: number): PageCopy {
 const count = stars > 0 ? ` ${stars} ${stars === 1 ? "star" : "stars"}.` : "";
 return {
  title: genreTitle(preview.title),
  description: `${preview.description}${count} ${STAGES}`,
 };
}

/** A world's play screen (/category/<category>/play/). */
export function categoryPlayCopy(label: string): PageCopy {
 return {
  title: `Play ${label} Five | StarTap`,
  description: `Five stars from ${label}, two steps each: find the country (up to 300 points), then the city (up to 700 points).`,
 };
}

/**
 * Public, indexable entry pages for the sitemap (trailing slash, as served). Login, account, payment result pages,
 * API routes, game sub-screens with query strings, onboarding and settings screens are left out, and so are
 * worlds with no stars yet (they are noindex). `premium` is listed only when the Premium page is part of the build.
 */
export function sitemapPaths({ categories, previews, premium }: { categories: readonly CategoryCount[]; previews: readonly Pick<GenrePreview, "category" | "key" | "subcategory">[]; premium: boolean }): string[] {
 const live = categories.filter(c => c.stars > 0);
 const playable = (category: string, sub: string | null) => Boolean(sub && live.find(c => c.key === category)?.subcategories.some(s => s.key === sub && s.stars > 0));
 return [
  "/", "/play/", "/how-to-play/", "/world-mix/",
  ...live.filter(c => c.group === "main").map(c => `/category/${c.key}/`),
  "/category/more/",
  ...live.filter(c => c.group === "more").map(c => `/category/${c.key}/`),
  ...previews.filter(p => playable(p.category, p.subcategory)).map(p => `/category/${p.category}/genre/${p.key}/`),
  ...(premium ? ["/premium/"] : []),
  "/support/", "/privacy/", "/terms/",
 ];
}
