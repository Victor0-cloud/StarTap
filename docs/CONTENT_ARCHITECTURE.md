# StarTap content architecture (future model)

**Status:** design note, not an implemented database or content pipeline. The current two-question development challenge in `src/data/developmentChallenge.ts` remains the playable MVP. Preserve **STAR → QUESTION → MAP → TAP → DISTANCE → SCORE → REVEAL → NEXT**. No content migration, mass ingestion, category routes, admin UI, or Daily generator is part of this document.

## Current boundary

`StarQuestion` in `src/types/game.ts` is a presentation/game DTO: a display category, question copy, answer coordinates, source link, and portrait placeholder. `PlayGame` consumes its read-only in-memory list; distance/scoring should stay independent of how questions are stored. It is *not* a database row or a verified-production marker. The two sourced birthplace examples are development content, not an official Daily StarTap. Do not infer production approval from the presence of `sourceUrl`.

## Proposed relational content model (PostgreSQL/Supabase, later)

| Entity | Key fields and constraints | Purpose |
| --- | --- | --- |
| `stars` | UUID PK, unique normalized `slug`, `display_name`, optional `known_as`, `country_code`, `country_name`, `region_slug`, `birth_date`, `official_url`, `active`, timestamps; optional `image_url`, `image_source`, `image_credit`, `image_license` | One public-figure record; do not duplicate a person for each category. Store only appropriate public information. |
| `star_aliases` | UUID PK, FK `star_id` with cascade, `alias`, unique normalized alias (review collisions rather than merging automatically) | Search and duplicate detection across stage/legal names. |
| `categories` | UUID PK, unique stable `slug`, `name`, `description`, `active`, `sort_order`, timestamps; optional `parent_id` FK | Browsable taxonomy; subcategories can have a parent. Category slugs are not country or region labels. |
| `star_categories` | FKs `star_id`, `category_id`, composite unique/PK, `is_primary`, timestamp; at most one primary mapping per star (partial unique index) | Many-to-many classification; a star may be Music, Afrobeats, African Stars, and Legends simultaneously. |
| `star_location_facts` | UUID PK, FK `star_id`, `fact_type`, city/region/country, latitude/longitude, `display_location`, `source_url`, `source_name`, `verification_status`, `verified_at`, `active`, timestamps; optional `valid_from`, `valid_to`, `last_checked_at`, `historical_context` | An independently reviewable, sourced geographical claim; multiple facts per star. Use valid WGS84 latitude [-90,90] and longitude [-180,180]. A source link alone is not verification. |
| `questions` | UUID PK, FK `star_id`, FK `location_fact_id`, `question_type`, `question_text`, `difficulty`, `review_status`, `active`, timestamps; optional wording/time context | Wording references one approved location fact rather than duplicating coordinates. Enforce that the linked fact belongs to the same star, e.g. composite FK/trigger. |

Index active/verified facts by `star_id`, `fact_type` and status; questions by review status, difficulty, and active flag; category mappings in both FK directions. Use foreign keys, unique slugs and mapping constraints. UUIDs and ordinary PostgreSQL indexes are sufficient for a future 10,000+ stars and 100,000+ facts/questions; do not introduce distributed infrastructure now. Avoid storing answer coordinates redundantly on `stars` or `questions`.

## Taxonomy and regions

Top-level slugs: `music`, `movies`, `television`, `football`, `basketball`, `sports`, `wrestling`, `creators`, `comedy`, `fashion`, `african_stars`, `nollywood`, `kpop`, `bollywood`, `latin_stars`, `legends`, `business_tech`. Subcategories use stable slugs under their parents (e.g. `afrobeats`, `hip_hop`, `hollywood`, `current_players`, `wnba`, `youtube`). `african_stars`, `nollywood`, `kpop`, `bollywood`, `latin_stars`, and `legends` can overlap broad industry categories; do not clone star records or force a single-parent hierarchy where it misrepresents a cross-cutting collection. `business_tech` remains selectively entertainment-oriented.

Regional filter slugs: `africa`, `north_america`, `latin_america`, `europe`, `asia`, `middle_east`, `caribbean`, `oceania`, `global`. Store country with ISO code where applicable; region is a separate editorial/filter field, not a substitute for nationality or category. Plan recognizable, verifiable stars across African markets (not only Nigeria) and other regions without rigid quotas. An initial editorial target is roughly 100–200 *verified* stars across industries and geographies; overlapping category counts must not be summed as distinct people.

## Facts, review, and eligibility

Fact types to allow over time: `birthplace`, `hometown`, `career_start`, `club_location`, `team_location`, `famous_performance`, `award_location`, `movie_location`, `event_location`, `school_location`, `stadium_location`, `concert_location`, `other_verified_location`. Photo-location is a future mode. Difficulty values: `easy`, `medium`, `hard`, `expert`; editorial judgment first, not AI scoring. Do not implement all these formats in the MVP.

A candidate follows **draft → needs_review → verified** or **rejected**. Persist the cited `source_url`, `source_name`, `verification_status`, and `verified_at`; review the claim and the precision of its answer coordinates against the source. Question wording separately moves through draft/review/approved. Production selection must require an active star, active verified fact, and active approved question, with a source still accessible and within its validity window if time-sensitive. Enforce this in the future challenge-selection query or database policy; do not rely on UI labels. AI may suggest candidates and wording, never self-verify. Host submissions enter draft and follow the same review gate. Keep source metadata and verification history auditable rather than silently overwriting disputed facts.

Prefer stable facts. For current clubs/teams and other mutable associations, include effective dates and recheck before scheduling; phrase historical associations with the period. For older figures, preserve accurate historical naming in `display_location`/context without presenting a modern political label as if it were contemporary. Use a specific event or performance source rather than treating a celebrity's general association as location proof.

## Images and rights

Keep `image_url`, `image_source`, `image_credit`, and `image_license` or a separate rights-managed asset table if more than one image is needed. A search result is not permission to reuse an image. Use licensed or explicitly authorized assets and retain attribution/usage constraints. The current monograms remain valid placeholders.

## Safe migration path after the MVP

1. Introduce schema/migrations only when database work is approved; no existing migrations are present in this Next.js app. Add constraints and indexes with representative fixtures, then test verification gates including rejected/unreviewed facts and mismatched star/fact links.
2. Curate a small sourced batch, review it manually, and provide a read adapter from approved `questions` + `star_location_facts` + `stars` to the existing `StarQuestion` DTO. Keep the current development array as a fallback/test fixture until parity is proven. Map display category separately from category/tag IDs; use the fact's display location and coordinates for the answer.
3. When Daily scheduling is authorized, assemble five varied approved questions across category, region, fact type, and difficulty; prevent duplicate stars and answer spoilers before completion. Category challenge routes, profiles, host/admin workflows, analytics, and mass ingestion remain later phases. Future analytics may use non-sensitive question ID, category, region, round, score, and distance bucket; do not collect unnecessary personal data.

**Compatibility conclusion:** the MVP's map, Haversine distance, scoring, and round transitions depend on a small question DTO and do not require schema changes now. The current free-text `category` is a display label, not a normalized category key; `sourceUrl` is not a verification workflow; the flat answer coordinates are a runtime projection of a future fact record. Preserve that boundary rather than extending this development fixture into a production content database.
