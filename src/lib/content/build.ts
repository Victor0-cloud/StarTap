import type { Question } from "../../types/game.ts";
import { TRIVIA_TITLES, type ContentQuestion, type Entity, type RawContent } from "../../content/schema.ts";
import { dailyIndices, globalDailyIndices } from "../game/daily.ts";
import type { ScoringVersion } from "../game/result.ts";

export interface Catalog {
 raw: RawContent;
 entities: ReadonlyMap<string, Entity>;
 questions: ReadonlyMap<string, ContentQuestion>;
}

export function buildCatalog(raw: RawContent): Catalog {
 return {
  raw,
  entities: new Map(raw.entities.map(entity => [entity.id, entity])),
  questions: new Map(raw.questions.map(question => [question.id, question])),
 };
}

// Adapter to the playable object the game has always used; optional fields stay absent.
export function toPlayable(catalog: Catalog, id: string): Question {
 const q = catalog.questions.get(id);
 const entity = q && catalog.entities.get(q.entityId);
 if (!q || !entity) throw new Error("Unknown question: " + id);
 const primary = q.sources.find(source => source.role === "primary");
 const extra = q.sources.find(source => source.role === "extra");
 if (!primary) throw new Error("Question has no primary source: " + id);
 return {
  id: q.id, starName: entity.name, monogram: entity.monogram, question: q.question,
  ...(entity.image.url ? { imageUrl: entity.image.url } : {}),
  ...(entity.image.credit ? { imageCredit: entity.image.credit } : {}),
  answerCity: q.answer.city, answerCountry: q.answer.country,
  answerCoordinates: { latitude: q.answer.latitude, longitude: q.answer.longitude },
  category: q.displayCategory, sourceUrl: primary.url,
  clue: q.clue, hint: q.hint, story: q.story,
  ...(q.chapter ? { chapter: q.chapter } : {}),
  ...(q.storyTitle ? { storyTitle: q.storyTitle } : {}),
  ...(q.trivia ? { trivia: q.trivia } : {}),
  ...(extra ? { extraSource: extra.url } : {}),
  ...(entity.portal ? { media: entity.portal } : {}),
  answerCountryCode: q.answer.countryCode,
  primaryCategory: q.primaryCategory, subcategory: q.subcategory, stampType: stampTypeFor(catalog, q),
  ...(triviaFor(q, primary.url, extra?.url) ?? {}),
 };
}

// Passport stamp name, e.g. "K-Pop Star", "Football Star", "World Icons Star".
// A leading decade range is dropped from stamp names: "80s/90s Soul Legends" → "Soul Legends Star".
const short = (label: string) => label.split(/ \/ | & /)[0].replace(/^\d0s\/\d0s\s+/, "").trim();
function stampTypeFor(catalog: Catalog, q: ContentQuestion): string {
 const category = catalog.raw.taxonomy.categories.find(c => c.key === q.primaryCategory);
 const sub = category?.subcategories.find(s => s.key === q.subcategory)?.label;
 const name = ["music", "sports", "screen"].includes(q.primaryCategory) && sub ? sub : category?.label ?? "World";
 return short(name) + " Star";
}

// Typed card when present; legacy plain trivia shows as "Did you know?" linked to the question's own source.
function triviaFor(q: ContentQuestion, primaryUrl: string, extraUrl?: string) {
 const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");
 if (q.triviaCard) {
  const t = q.triviaCard;
  return { triviaCard: { type: t.type, title: t.title ?? TRIVIA_TITLES[t.type], text: t.text, sourceUrl: t.sourceUrl, sourceName: t.sourceName } };
 }
 if (!q.trivia || q.triviaStatus === "needs_review") return null; // unverified trivia is never shown
 const url = extraUrl ?? primaryUrl;
 return { triviaCard: { type: "did_you_know", title: TRIVIA_TITLES.did_you_know, text: q.trivia, sourceUrl: url, sourceName: host(url) } };
}

// Known editions resolve to themselves; anything else falls back to the default edition.
export function resolveEdition(catalog: Catalog, requested: string | null): string {
 return requested && Object.prototype.hasOwnProperty.call(catalog.raw.editions.editions, requested) ? requested : catalog.raw.editions.default;
}

export function editionQuestions(catalog: Catalog, edition: string): Question[] {
 const found = catalog.raw.editions.editions[edition];
 if (!found) throw new Error("Unknown edition: " + edition);
 return found.questionIds.map(id => toPlayable(catalog, id));
}

export function dailyQuestions(catalog: Catalog, edition: string, day: string): Question[] {
 const found = catalog.raw.editions.editions[edition];
 if (!found) throw new Error("Unknown edition: " + edition);
 const pick = found.selector === "blocks" ? globalDailyIndices : dailyIndices;
 return pick(day, found.questionIds.length).map(index => toPlayable(catalog, found.questionIds[index]));
}

export function editionScoring(catalog: Catalog, edition: string): ScoringVersion {
 return catalog.raw.editions.editions[edition]?.scoring ?? "distance-v1";
}

// A day already started under the previous default keeps that edition, so an in-progress or finished
// game never changes scoring mid-day. Explicit ?edition= links always win.
export function stickyEdition(catalog: Catalog, requested: string | null, day: string, hasSave: (edition: string, day: string) => boolean, previousDefault = "global-v4"): string {
 const resolved = resolveEdition(catalog, requested);
 if (requested && resolved === requested) return resolved;
 return resolved !== previousDefault && hasSave(previousDefault, day) ? previousDefault : resolved;
}
