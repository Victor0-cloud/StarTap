// StarTap V2 content schema. Each entity (person, place, thing) is stored once;
// playable questions point at it. The answer place is independent of the
// entity's origin: Bong Joon-ho is from South Korea, his question answers Cannes.
import type { StarMedia } from "../types/game.ts";

export const REGIONS = ["africa", "europe", "asia", "middle-east", "north-america", "latin-america", "caribbean", "oceania"] as const;
export const DIFFICULTIES = ["easy", "medium", "hard", "legend"] as const;
export const QUESTION_TYPES = [
 "birthplace", "hometown", "career_location", "event_location", "country_of_origin", "city", "capital",
 "landmark", "famous_place", "cultural_origin", "food_origin", "company_origin", "artist_origin",
 "sports_origin", "historic_location", "flag", "country_shape",
] as const;
export const ENTITY_KINDS = ["person", "group", "place", "landmark", "event", "festival", "dish", "brand", "company", "dynasty"] as const;
// primary: the subject or organiser itself (official site, club, venue, event).
// authoritative: governing bodies, governments, national institutions, award bodies, universities.
// reputable_secondary: established publishers and reference works.
// needs_review: weak or user-editable sources awaiting replacement (Wikipedia, IMDb, ticketing, thin profiles).
export const SOURCE_QUALITIES = ["primary", "authoritative", "reputable_secondary", "needs_review"] as const;
export const SOURCE_ROLES = ["primary", "extra"] as const;
export const ACCESS_TIERS = ["free", "pack", "plus"] as const;
// legacy: shipped before V2 and preserved unchanged; not yet re-verified under V2 rules.
export const REVIEW_STATUSES = ["draft", "needs_review", "verified", "legacy"] as const;
// Category, subcategory, difficulty, region and question type assigned during migration are provisional.
export const CLASSIFICATION_STATUSES = ["provisional", "reviewed"] as const;
export const IMAGE_STATUSES = ["licensed", "none"] as const;
// Short "wow" trivia shown in the reveal's Trivia tab. Every card cites the source sentence it comes from.
export const TRIVIA_TYPES = ["wow_fact", "did_you_know", "star_secret", "world_connection", "before_the_fame", "big_moment", "culture_spotlight", "landmark_moment", "record_breaker"] as const;
export type TriviaType = typeof TRIVIA_TYPES[number];
export const TRIVIA_TITLES: Readonly<Record<TriviaType, string>> = {
 wow_fact: "Wow fact", did_you_know: "Did you know?", star_secret: "Star secret", world_connection: "World connection", before_the_fame: "Before the fame",
 big_moment: "Big moment", culture_spotlight: "Culture spotlight", landmark_moment: "Landmark moment", record_breaker: "Record breaker",
};
export interface TriviaCard { type: TriviaType; text: string; sourceUrl: string; sourceName: string; quote: string; title?: string }

export type Region = typeof REGIONS[number];
export type Difficulty = typeof DIFFICULTIES[number];
export type QuestionType = typeof QUESTION_TYPES[number];
export type EntityKind = typeof ENTITY_KINDS[number];
export type SourceQuality = typeof SOURCE_QUALITIES[number];
export type AccessTier = typeof ACCESS_TIERS[number];

export interface ImageCredit { imageUrl?: string; title: string; author: string; sourceUrl: string; license: string; licenseUrl: string; downloadUrl?: string; changes: string }

export interface Entity {
 id: string;
 name: string;
 monogram: string;
 kind: EntityKind;
 countryOfOrigin: string; // ISO 3166-1 alpha-2; nationality / origin, never the answer location
 region: Region;
 originNote?: string;
 image: { status: typeof IMAGE_STATUSES[number]; url?: string; license?: string; source?: string; credit?: ImageCredit };
 portal?: StarMedia; // optional verified external links; absent means the Star Portal stays hidden
 tags?: string[]; // editorial tags, e.g. "current" for younger/current stars
}

// quote: the exact sentence that supports the claim, kept for QA.
export interface Source { url: string; role: typeof SOURCE_ROLES[number]; quality: SourceQuality; note?: string; quote?: string }

export interface ContentQuestion {
 id: string;
 entityId: string;
 primaryCategory: string;
 subcategory: string;
 secondary?: { category: string; subcategory: string }[];
 questionType: QuestionType;
 difficulty: Difficulty;
 displayCategory: string; // label shown on the star card, e.g. "Film"
 question: string;
 clue: string;
 hint: string;
 // coordinateSource/osm: where the coordinates came from (e.g. OpenStreetMap Nominatim record), for QA.
 answer: { city: string; country: string; countryCode: string; latitude: number; longitude: number; coordinateSource?: string; osm?: string };
 story: string;
 storyTitle?: string;
 trivia?: string;
 triviaCard?: TriviaCard; // typed, quote-sourced trivia; preferred over the plain legacy "trivia" text
 triviaStatus?: "needs_review"; // legacy trivia that could not be verified: never shown
 chapter?: string;
 sources: Source[];
 sourceQuality: SourceQuality; // quality of the primary source
 access: { tier: AccessTier; packId?: string };
 featured: boolean;
 active: boolean; // eligible for future pools; inactive questions still resolve for frozen editions
 disputed?: { nuance: string };
 review: { status: typeof REVIEW_STATUSES[number]; classification: typeof CLASSIFICATION_STATUSES[number]; checkedAt?: string; notes?: string[] };
}

export interface Taxonomy { categories: { key: string; label: string; group: "main" | "more"; subcategories: { key: string; label: string }[] }[] }
export interface Pack { id: string; title: string; productId?: string }

// "rolling": overlapping five from a start that advances three per day (origins-v1, stories-v2).
// "blocks": non-overlapping blocks of five that cycle (global-v3, global-v4). Order is frozen forever.
// scoring: "distance-v1" (default, every pre-V2 edition) or "country-v2" (country-first, global-v5 onward).
export interface Edition { selector: "rolling" | "blocks"; scoring?: "distance-v1" | "country-v2"; questionIds: string[] }
export interface Editions { default: string; editions: Record<string, Edition> }

// Adventure of Wonders: worlds of hand-picked levels, each a fixed five of existing verified questions.
export interface AdventureLevel { id: string; title: string; questionIds: string[]; comingSoon?: boolean }
export interface AdventureWorld { id: string; title: string; category: string; levels: AdventureLevel[] }
export interface Adventure { worlds: AdventureWorld[]; upcoming?: { title: string; category: string }[] }

export interface RawContent { taxonomy: Taxonomy; entities: Entity[]; questions: ContentQuestion[]; editions: Editions; packs: Pack[] }
