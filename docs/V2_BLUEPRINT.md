# StarTap V2 — Technical Blueprint

**Status:** plan for approval. Nothing in this document is implemented yet.
**Inspected:** `C:\Projects\StarTap\startap`, 30 September 2026. Figures below come from compiling the live data and dumping it, not from older docs.

---

## Part A — What exists today

### 1. Project architecture

| Layer | Implementation |
| --- | --- |
| Framework | Next.js 16.3 (App Router), React 19.2, TypeScript, Tailwind 4 (plus a 21 KB hand-written `globals.css`) |
| Routes | `/` (static home, `app/page.tsx`) and `/play` (`app/play/page.tsx` → `<Suspense><DailyGame/>`). No other routes. |
| Game UI | `components/game/`: `DailyGame` (picks edition + day), `PlayGame` (entire session: state, rounds, reveal, finish screen), `StarWheel`, `GameMap` (MapLibre), `StarMascot`, `StarPortal`, `StarPortrait`, `CountryFlag`, `SharePreview`, `SoundToggle` |
| Game logic | `lib/game/`: `distance` (haversine), `scoring` (tiers), `results` (round recording + summary), `daily` (edition constant, date keys, daily index selection, hint cost), `progress` (saved-state validation + score recomputation), `milestones`, `media` (portal link sanitising) |
| Data | TypeScript/JSON modules in `src/data/`, **statically imported**, so all question text ships inside the `/play` JS chunk |
| Map | MapLibre 6, local style: `world-countries.geojson` (257 KB), `country-labels.geojson` (31 KB), local glyph PBFs, self-hosted worker. Fully offline. |
| Mobile | Capacitor 8 Android. `STARTAP_MOBILE=1` switches `next.config.ts` to `output:"export"` into `.next-mobile`, which is copied into the APK. |
| Tests | Node's built-in test runner with type stripping, 4 files, 18 tests. **No `npm test` script.** |
| Dependencies | Deliberately minimal: no state library, no database, no analytics, no ads, no billing. |

### 2. Current question schema

Two layers, defined in two places:

```ts
// src/types/game.ts
interface StarQuestion {
  id; starName; monogram; question;
  answerCity; answerCountry;           // country is a display NAME, not ISO
  answerCoordinates: {latitude, longitude};
  category: string;                    // free text: "Music", "Tennis", "Film"...
  sourceUrl;
  imageUrl?; imageCredit?;             // only the first 5 stars
  media?: StarMedia;                   // attached at runtime, see §8
}
// src/data/challenges.ts
type Question = StarQuestion & { clue; hint; story; chapter?; storyTitle?; trivia?; extraSource? };
```

What's missing for V2: stable category keys, subcategory, the star's own country and region (separate from the answer location), difficulty, era, question type, a review status, access tier, and a way to store one person once and attach several questions to them.

### 3. Current 65-entry content structure

Content is a chain of **frozen editions**. Each edition is built from the previous one, then permuted:

```
developmentChallenge.ts (5 birthplace Qs, with photos)
  └─ challenges.ts        → questionBank (10)         edition "origins-v1"
       └─ storyChallenge.ts → storyQuestions (10)     edition "stories-v2"  (new Qs, reuse star fields)
            └─ globalChallenge.ts + globalExtras.json (40) → globalQuestions (50), order (i*17)%50   "global-v3"
                 └─ expandedChallenge.ts + expandedExtras.json (15) → expandedQuestions (65), order (i*17)%65   "global-v4" ← DEFAULT
starMedia.ts — Star Portal links keyed by starName (17 stars)
public/stars/credits.json — 5 photo credits
```

That's 75 distinct question IDs across all editions, covering **65 people**. The live edition, `global-v4`, holds 65 questions, one per person.

**Live bank (global-v4) as it stands:**

- **Stored `category` values:** Music 27, Film 14, Tennis 7, Football 6, Gymnastics 3, Athletics 3, Comedy 1, Boxing 1, Cricket 1, Badminton 1, Figure skating 1
- **Rolled up:** Music 27 (42%), Sports 23 (35%), Screen 15 (23%). Countries, Culture, Icons and Tech: 0.
- **Where the people are from:** Asia 19, Europe 14, Africa 14, North America 5, Latin America 5, Caribbean 4, Oceania 4
- **Question types:** event location 23, birthplace 22, career location (school, club, studio, venue) 10, hometown 6, famous place 4
- **Portraits:** 5 licensed photos (Adele, Burna Boy, Messi, Rihanna, Shakira). The other 60 use monograms.
- **Star Portal:** 17 of 65 have links. 48 have none.
- **Trivia:** 65/65. **Extra source:** 14/65.
- **Sources needing replacement (8):** Wikipedia (Anggun, Omar Sy, Tarkan, Penélope Cruz, Jung Kook), IMDb (Salma Hayek), Fandango (Shah Rukh Khan), Masterworks Broadway (A. R. Rahman).

Two structural findings matter for the data model:

- **The answer location is often not the star's country.** Bong Joon-ho's answer is Cannes, Usain Bolt's is Beijing, Didier Drogba's is Munich. V2 must store the person's origin (for balance and filters) separately from the answer place (for the map and the flag).
- **33 of 65 questions are not birthplace or hometown questions.** The model needs event and career question types from day one.

### 4. Current game-state structure

All state lives in `GameSession` inside `PlayGame.tsx`, using `useState`:

- `progress: {answers: {coordinates, hintUsed}[], roundIndex, finished, hintUsed}` (the persisted part)
- `revealedId` (wheel passed for this round), `draft` (unlocked pin), `practice`, `storageWarning`, plus a `lock` ref against double-submits
- The questions come in as props. `DailyGame` computes them from `?edition` and `?day` with a hard-coded if-chain of four editions.
- Hard-coded assumptions throughout: exactly 5 rounds (the wheel draws 72° segments, `roundIndex > 4` is rejected), "TODAY'S FIVE" copy, `/ 5,000`, and edition-specific disclaimer strings.

### 5. Current scoring

- Haversine distance (`distance.ts`) to one answer point
- Tiers (`scoring.ts`): ≤25 km → 1000, ≤100 → 900, ≤250 → 750, ≤500 → 600, ≤1000 → 400, ≤2500 → 200, otherwise 50
- Hint: −200, floored at 0 (`daily.ts`)
- Game maximum: 5 × 1000 = 5,000 (`results.ts`)
- Milestones: crossing 1,000, 3,000 or 5,000 total triggers the crown (`milestones.ts`)
- Feedback labels: PERFECT TAP / AMAZING / GREAT TAP / NOT QUITE
- **Scores are never stored.** They are recomputed from the saved coordinates on every render. That's good for integrity, but it means **question order and coordinates for a saved day must never change**.

### 6. Current saved progress

| Key | Value |
| --- | --- |
| `startap:<edition>:<YYYY-MM-DD>` | `{version:1, answers[], roundIndex, finished, hintUsed}`. Validated strictly by `restoreProgress`; anything corrupt resets to empty. |
| `startap-sound` | `"on"` / `"off"` |

Practice mode never writes. There's no profile, no history across days, no streak and no cross-device sync. On Android this is WebView `localStorage` with `allowBackup="false"`, so **uninstalling or clearing app data loses all progress.**

### 7. Current Android / Capacitor setup

- App ID `com.startap.game`, `webDir: ".next-mobile"`, background `#081224`
- `MainActivity` is a bare `BridgeActivity`. Plugins: `@capacitor/share`, `@capacitor/clipboard`. There's no `@capacitor/app`, so the back button relies on Capacitor's default WebView-history behaviour.
- minSdk 24, target/compile SDK 36, `versionCode 1`, `minifyEnabled false`. Only the INTERNET permission.
- Debug APK: 8.4 MB. Bundled web assets: 8.9 MB, of which `_next` is 5.9 MB.
- Native share omits the URL (so no localhost link is sent). Clipboard goes through the plugin.
- **Build workaround:** `gradlew` fails because Java can't resolve github.com. Builds use the checksum-verified local Gradle 8.14.3 at `C:\Users\USER\.local\startap-tools\gradle` with JDK 21 at `...\startap-tools\jdk21`.
- There is no release signing yet.

### 8. Current Star Portal

- `starMedia.ts` is a `Record<starName, StarMedia>` (listen/watch/discover URL + label, and a source name). It's merged into questions in `DailyGame`.
- `portalLinks()` accepts only `https:` URLs without credentials and drops empty ones (tested). `StarPortal` renders nothing when no links survive.
- Links open with `target="_blank"`. On Android they leave the WebView for the system browser.
- **Weakness:** keyed by display name, so renaming "Céline Dion" silently removes her portal. V2 should key it by entity ID.

### 9. Current Spark

- One 1.1 MB PNG atlas (`public/mascot/spark-character-atlas-v1.png`). Poses are selected through CSS (`.spark-art`, `data-pose` / `data-mood`).
- `StarMascot` shows the reaction panel. Mood is `crowned` if a milestone was crossed, `happy` within 500 km, otherwise `sad`. Messages are fixed strings.
- `GameMap` creates the Spark map marker as fixed innerHTML. It flies from the previous position over 480 ms with requestAnimationFrame, and respects reduced motion.
- Mood logic is computed inline in `PlayGame` in two places (map marker and result card).

---

## Part B — Recommendations

### 10. New category data model

Split each item into an **Entity** (the person, place or thing, stored once) and one or more **Questions** (a map prompt about that entity). This is what satisfies "do not duplicate entries": Burna Boy exists once, with his birthplace question in origins-v1 and his stadium question in stories-v2 both pointing to him.

```ts
// src/content/schema.ts  (types only, no runtime dependency)
type CategoryKey = "music"|"sports"|"screen"|"geography"|"culture"|"icons"|"tech"
  | "history"|"food"|"fashion"|"science"|"business"|"creators"|"legends"|"royalty";
// "More" is a UI grouping of history…royalty, not a category.

interface Taxonomy { key: CategoryKey; label; group: "main"|"more"; subcategories: {key; label}[] }

interface Entity {
  id: string;                 // "burna-boy", stable forever
  name: string; monogram: string;
  kind: "person"|"group"|"place"|"landmark"|"event"|"dish"|"brand"|"company"|"festival"|"dynasty";
  origin?: { countryCode: string; region: Region };   // who they are, used for balance and filters
  image?: { src; credit: {title; author; sourceUrl; license; licenseUrl; changes} };
  portal?: StarMedia;         // moved here from starMedia.ts, keyed by id instead of name
  tags?: string[];
}

interface Question {
  id: string;                 // existing IDs are kept exactly
  entityId: string;
  primaryCategory: CategoryKey; subcategory: string; secondary?: {category; subcategory}[];
  questionType: QuestionType;
  prompt: string; clue: string; hint: string;
  answer: { label: string; city?: string; countryCode: string; lat: number; lng: number;
            precision: "point"|"city"|"region"|"country" };
  story: string; storyTitle?: string; trivia?: string; chapter?: string;
  difficulty: "easy"|"medium"|"hard"|"legend";   // metadata only, one copy of the content
  era?: "ancient"|"pre-1900"|"1900-1959"|"1960-1999"|"2000s"|"2010s"|"2020s";
  sources: { url: string; name: string; supports: string }[];   // at least 1; 2 if disputed
  review: { status: "draft"|"reviewed"|"verified"; checkedAt?: string };
  access: { tier: "free"|"pack"|"plus"; packId?: string };
  flags?: { featured?: boolean; active?: boolean; disputed?: boolean; nuance?: string };
}

type Region = "africa"|"europe"|"asia"|"middle-east"|"north-america"|"latin-america"|"caribbean"|"oceania";
type QuestionType = "birthplace"|"hometown"|"career_location"|"event_location"|"artist_origin"
  |"sports_origin"|"company_origin"|"country_of_origin"|"city"|"capital"|"landmark"|"famous_place"
  |"cultural_origin"|"food_origin"|"historic_location"|"flag"|"country_shape";
```

How your field list maps onto this: `name/type` → Entity; `country/region/continent` → `entity.origin` (continent is derived from region) plus `answer.countryCode`; `latitude/longitude` → `answer`; `image/imageSource` → `entity.image`; `source/sourceUrl` → `sources[]`; `media` → `entity.portal`; `premium` → `access`; `featured/active` → `flags`. Every optional field falls back safely: no image means monogram, no portal means hidden, no trivia means hidden.

**One addition to your list:** `career_location` (school, academy, club, studio, first venue). Ten current entries are this type, and relabelling them as "Hometown" or "Event" would be inaccurate.

**Adapter:** `toPlayable(question, entity) → Question` (today's DTO). `PlayGame`, `GameMap` and the scoring code don't change in Phase 1.

**Storage format:** one JSON file per category (`src/content/questions/music.json` …), one `entities.json`, and one `taxonomy.json`. JSON rather than TS means content can be edited and validated without touching code.

**Disputed origins** (e.g. jollof, some dances): `flags.disputed: true` requires a `nuance` note, two sources, and wording such as "most associated with" or "widely credited to". The answer sits at the most-cited location, and the story must mention the other claims. The validator enforces all of this.

### 11. Migration plan for the 65 entries

**Step 0 — Safety net before touching data.** Generate `src/content/editions.lock.json` from the *current* code: the ordered question IDs, coordinates and hint answers for `origins-v1`, `stories-v2`, `global-v3` and `global-v4`, plus the five IDs picked for 20 sample dates per edition. A test asserts the new loader reproduces the lock exactly. If this passes, no saved score or shared link can change.

**Step 1 — Mapping table.** `scripts/migration-map.json`: one row per person with the audited fields below. It's reviewed by hand, but it's data, not duplicated content.

**Step 2 — One-off script.** `scripts/migrate-v1.mjs` reads the compiled current bank plus the mapping table and writes `entities.json` (65) and the category question files (75 questions, including the 10 legacy origins-v1 IDs). Legacy-only questions get `flags.active:false` when they duplicate another question's answer (e.g. `shakira-birthplace` vs `shakira-origins-giving-back`). They still resolve for old editions but are excluded from new modes.

**Step 3 — Editions become ID lists.** `src/content/editions/global-v4.json` = the 65 IDs in the current `(i*17)%65` order, stored literally so the formula never needs re-running. `DailyGame`'s if-chain becomes a registry lookup.

**Step 4 — Switch and remove.** Once parity passes, `src/data/*` is deleted (with a backup taken first). `starMedia.ts` moves into `entity.portal`, and `CountryFlag` switches to ISO codes.

**Audit (proposed values; difficulty and subcategory are editorial and need your sign-off):**

Legend: Portal L/W/D = listen/watch/discover, – = none. Source ⚠ = replace. † = subcategory not in your list (see note after the table).

| # | Entry | Category / subcategory | Origin (region) | Answer | Type | Diff. | Portal | Src | Img |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Adele | Music / Pop | GB (Europe) | London (Croydon) | career | easy | LWD | ok | photo |
| 1 | Dua Lipa | Music / Pop | GB (Europe) | London | hometown | easy | – | ok | mono |
| 2 | PSY | Music / K-Pop | KR (Asia) | Seoul | famous_place | easy | – | ok | mono |
| 3 | Rebeca Andrade | Sports / Olympic† gymnastics | BR (Lat Am) | Paris | event | medium | – | ok | mono |
| 4 | Naomi Osaka | Sports / Tennis | JP (Asia) | Indian Wells | event | hard | D | ok | mono |
| 5 | Freddie Mercury | Music / Rock | GB, b. Zanzibar (Europe) | Stone Town | birthplace | hard | D | ok | mono |
| 6 | Lisa | Music / K-Pop | TH (Asia) | Bangkok | famous_place | medium | – | ok | mono |
| 7 | Didier Drogba | Sports / Football | CI (Africa) | Munich | event | medium | – | ok | mono |
| 8 | Burna Boy | Music / Afrobeats | NG (Africa) | London | event | easy | – | ok | photo |
| 9 | Bob Marley | Music / Reggae | JM (Caribbean) | Nine Mile | birthplace | medium | D | ok | mono |
| 10 | A. R. Rahman | Music / Global Icons | IN (Asia) | Chennai | career | medium | D | ⚠ | mono |
| 11 | Anggun | Music / Pop | ID (Asia) | Jakarta | birthplace | medium | – | ⚠ | mono |
| 12 | Hugh Jackman | Screen / Hollywood | AU (Oceania) | Perth | career | medium | D | ok | mono |
| 13 | Björk | Music / Electronic | IS (Europe) | Reykjavík | birthplace | easy | – | ok | mono |
| 14 | Priyanka Chopra | Screen / Bollywood | IN (Asia) | London | event | medium | – | ok | mono |
| 15 | Omar Sy | Screen / Streaming Stars | FR (Europe) | Trappes | birthplace | hard | – | ⚠ | mono |
| 16 | Lionel Messi | Sports / Football | AR (Lat Am) | Rosario | career | easy | D | ok | photo |
| 17 | Lorde | Music / Pop | NZ (Oceania) | Auckland | birthplace | medium | – | ok | mono |
| 18 | Deepika Padukone | Screen / Bollywood | IN (Asia) | Copenhagen | birthplace | hard | – | ok | mono |
| 19 | Tarkan | Music / Pop | TR (Europe) | Alzey | birthplace | legend | – | ⚠ | mono |
| 20 | Jackie Chan | Screen / Action | HK (Asia) | Hong Kong | career | easy | D | ok | mono |
| 21 | Taika Waititi | Screen / Directors | NZ (Oceania) | Wellington | career | medium | – | ok | mono |
| 22 | Michelle Yeoh | Screen / Action | MY (Asia) | Ipoh | birthplace | hard | – | ok | mono |
| 23 | Nadia Comăneci | Sports / Olympic Legends | RO (Europe) | Montréal | event | medium | – | ok | mono |
| 24 | Rihanna | Music / R&B | BB (Caribbean) | St. Michael | birthplace | medium | WD | ok | photo |
| 25 | Kylie Minogue | Music / Pop | AU (Oceania) | Melbourne | birthplace | medium | D | ok | mono |
| 26 | P. V. Sindhu | Sports / Olympic† badminton | IN (Asia) | Basel | event | hard | – | ok | mono |
| 27 | Miriam Makeba | Music / African Music Legends | ZA (Africa) | Johannesburg | birthplace | medium | – | ok | mono |
| 28 | Serena Williams | Sports / Tennis | US (N Am) | New York | event | easy | D | ok | mono |
| 29 | Salma Hayek | Screen / Hollywood | MX (Lat Am) | Coatzacoalcos | birthplace | hard | – | ⚠ | mono |
| 30 | Ons Jabeur | Sports / Tennis | TN (Africa) | Madrid | event | hard | – | ok | mono |
| 31 | Angélique Kidjo | Music / African Music Legends | BJ (Africa) | Ouidah | birthplace | hard | – | ok | mono |
| 32 | Shah Rukh Khan | Screen / Bollywood | IN (Asia) | New Delhi | career | easy | – | ⚠ | mono |
| 33 | Penélope Cruz | Screen / Drama | ES (Europe) | Alcobendas | birthplace | medium | – | ⚠ | mono |
| 34 | Jung Kook | Music / K-Pop | KR (Asia) | Busan | birthplace | medium | – | ⚠ | mono |
| 35 | Youssou N'Dour | Music / African Music Legends | SN (Africa) | Dakar | famous_place | easy | D | ok | mono |
| 36 | Shakira | Music / Latin | CO (Lat Am) | Barranquilla | birthplace | easy | D | ok | photo |
| 37 | Cristiano Ronaldo | Sports / Football | PT (Europe) | Funchal | birthplace | medium | D | ok | mono |
| 38 | Aitana | Music / Pop | ES (Europe) | Sant Climent | hometown | hard | – | ok | mono |
| 39 | Manny Pacquiao | Sports / Boxing | PH (Asia) | Phutthamonthon, TH | event | legend | – | ok | mono |
| 40 | Céline Dion | Music / Pop | CA (N Am) | Charlemagne | hometown | hard | LWD | ok | mono |
| 41 | Mohamed Salah | Sports / Football | EG (Africa) | Cairo | career | easy | D | ok | mono |
| 42 | Diljit Dosanjh | Music / Global Icons | IN (Asia) | Indio, US | event | hard | – | ok | mono |
| 43 | Sachin Tendulkar | Sports / Cricket | IN (Asia) | Mumbai | event | easy | – | ok | mono |
| 44 | Bad Bunny | Music / Latin | PR (Caribbean) | Vega Baja | hometown | hard | – | ok | mono |
| 45 | Pelé | Sports / Football | BR (Lat Am) | Santos | career | medium | – | ok | mono |
| 46 | Bong Joon-ho | Screen / Korean Film | KR (Asia) | Cannes | event | medium | – | ok | mono |
| 47 | Yuzuru Hanyu | Sports / Olympic† figure skating | JP (Asia) | Sochi | event | medium | – | ok | mono |
| 48 | Taylor Swift | Music / Pop (tag: country) | US (N Am) | Nashville | career | easy | – | ok | mono |
| 49 | Sadio Mané | Sports / Football | SN (Africa) | Southampton | event | hard | – | ok | mono |
| 50 | Hayao Miyazaki | Screen / Directors | JP (Asia) | Mitaka | landmark | hard | – | ok | mono |
| 51 | Roger Federer | Sports / Tennis | CH (Europe) | London | event | easy | – | ok | mono |
| 52 | Beyoncé | Music / R&B | US (N Am) | Houston | birthplace | easy | D | ok | mono |
| 53 | David Rudisha | Sports / Track & Field | KE (Africa) | London | event | medium | – | ok | mono |
| 54 | Lupita Nyong'o | Screen / Hollywood | KE (Africa) | Mexico City | birthplace | medium | – | ok | mono |
| 55 | Rafael Nadal | Sports / Tennis | ES (Europe) | Paris | event | easy | – | ok | mono |
| 56 | Usain Bolt | Sports / Track & Field | JM (Caribbean) | Beijing | event | easy | – | ok | mono |
| 57 | Agnetha Fältskog | Music / Pop | SE (Europe) | Jönköping | birthplace | hard | – | ok | mono |
| 58 | Charlize Theron | Screen / Hollywood | ZA (Africa) | Benoni | birthplace | hard | – | ok | mono |
| 59 | Novak Djokovic | Sports / Tennis | RS (Europe) | Melbourne | event | medium | – | ok | mono |
| 60 | Eliud Kipchoge | Sports / Track & Field | KE (Africa) | Vienna | event | medium | – | ok | mono |
| 61 | Tyla | Music / Afrobeats† (amapiano/pop) | ZA (Africa) | Johannesburg | hometown | medium | – | ok | mono |
| 62 | Trevor Noah | Screen / Comedy | ZA (Africa) | Johannesburg | hometown | easy | – | ok | mono |
| 63 | Li Na | Sports / Tennis | CN (Asia) | Paris | event | medium | – | ok | mono |
| 64 | Simone Biles | Sports / Olympic† gymnastics | US (N Am) | Antwerp | event | medium | – | ok | mono |

**Gaps across all 65:** subcategory, region, difficulty and era are missing on every entry. 48 have no portal, 60 have no image, 8 have weak sources. Screen has **no Nollywood, Korean Drama or African Cinema**. Sports has no basketball, American football, F1, MMA, baseball or golf.

**† Taxonomy additions I'd suggest:** under Sports, add *Gymnastics*, *Racket Sports* (badminton, table tennis) and *Winter Sports*. Otherwise "Olympic Legends" becomes a catch-all. Rename Music's "Afrobeats" to **"Afrobeats & Amapiano"** so South African stars like Tyla aren't mislabelled.

### 12. Category routing

Static export has no server, so every route must be pre-generated.

| Route | Purpose |
| --- | --- |
| `/` | Home V2: Today's Five, World Mix, "Choose your world" grid, links to My Stars and Settings |
| `/play/` | **Unchanged URL.** No params = Today's Five. `?edition&day` = legacy/shared links (must keep working). |
| `/play/?mode=mix` | World Mix |
| `/play/?mode=cat&c=music` and `&s=afrobeats` | Category or subcategory play (optional `&d=hard`) |
| `/worlds/[category]/` | Category screen, via `generateStaticParams` over the 8 top-level keys (plus the More children). Subcategories are listed on the page, not given routes of their own (avoids ~150 static pages). |
| `/stars/` | My Stars (mastery), Phase 6 |
| `/challenges/`, `/settings/` | Phases 7 and 10 |

Everything goes through `/play` with query params (as today), so `DailyGame`'s existing `useSearchParams` + `Suspense` pattern extends naturally and shared links stay short.

### 13. State-management changes

Still no state library. The React state that exists is enough; the problem is that it's all inside one component.

- **`SessionSpec`** (new, `lib/game/session.ts`): `{kind:"daily", edition, day} | {kind:"mix", seed} | {kind:"category", seed, category, subcategory?, difficulty?}`. Parsed from the URL by `parseSpec(searchParams)`.
- **`resolveQuestions(spec, catalog)`**: for daily, the edition registry lookup. For mix/category, `selectFive(pool, seed, rules)` (see §17).
- **`useGameSession(spec, questions)` hook**: extracted from `GameSession` (progress, draft, lock, confirm/next, practice), with the storage key derived from the spec. `PlayGame` becomes presentation.
- **Copy from the spec**: "TODAY'S FIVE" / "WORLD MIX" / "MUSIC · AFROBEATS", the disclaimer, and the "next game" button. This removes the hard-coded `global-v4` strings.
- **Spark mood**: move the duplicated inline logic into `sparkMood(result, previousTotal)` in `lib/game/milestones.ts`, so it's testable.
- Five rounds, the wheel, scoring, hints and milestones all stay as they are.

### 14. Storage changes

All access goes through a new `lib/storage.ts` (`read(key)`, `write(key, value)` with try/catch and an in-memory fallback, as `SoundToggle` already does).

| Key | Change |
| --- | --- |
| `startap:<edition>:<day>` v1 | **Unchanged.** Today's Five keeps writing v1. |
| `startap:session:<mode>` | **New, v2**: `{version:2, spec, questionIds[5], answers, roundIndex, finished, hintUsed}`. Storing the IDs is what makes seeded modes resumable even after content grows. On restore, if any ID no longer exists, the session resets. |
| `startap:ledger:v1` | **New**: `{q: {[questionId]: {best, plays, last}}}`, written when a round locks, idempotently (`best = max`). Practice never writes. About 40 bytes per question, so roughly 20 KB at 500. |
| `startap:ledger:backfilled` | One-time scan of existing `startap:global-v4:*` (and older) keys, so current players start V2 with credit for past days. |
| `startap:entitlements:v1` | Cache only. Google Play is the real source (Phase 8). |
| `startap:settings:v1` | Later: sound (migrated from `startap-sound`), reduced effects |

Mastery, levels and category totals are **derived** from the ledger and never stored, so they can't drift.

**Android durability:** enable Android Auto Backup (`allowBackup="true"` + a `dataExtractionRules` XML covering the WebView storage directory) in Phase 10, so reinstalling restores progress. Consider `@capacitor/preferences` only if WebView storage eviction is actually observed. That's one small official plugin, not needed yet.

### 15. Mastery model

Three separate measures that must not be mixed:

| Measure | Definition | Where shown |
| --- | --- | --- |
| **Game score** | 0–5,000 per game (unchanged) | Round and result screens, share text |
| **Category mastery** | Stars per `primaryCategory`, derived from the ledger | Category screen, My Stars |
| **Player level** | Lifetime XP = sum of best score over all distinct questions ÷ 1,000, on a gentle curve | Profile badge |

Mastery counts distinct questions played in the category (*n*) and the average of their best scores (*avg*):

| Stars | Title | Needs |
| --- | --- | --- |
| ★ | Explorer | n ≥ 5 |
| ★★ | Traveller | n ≥ 15 and avg ≥ 400 |
| ★★★ | Globe Hunter | n ≥ 30 and avg ≥ 550 |
| ★★★★ | World Expert | n ≥ 50 and avg ≥ 700 |
| ★★★★★ | StarTap Legend | n ≥ 80 and avg ≥ 800 |

For small categories, required n = min(threshold, ⌈pool size × 5/15/35/60/85 %⌉), so a 20-question Tech pool is masterable. Replays improve *best* but never increase *n*, so grinding one question doesn't help. Hinted rounds count at their hinted score. All thresholds live in one constants table so they can be tuned. Players can see the thresholds, and progress toward the next star is shown.

### 16. Monetization-ready fields (architecture only; nothing gated yet)

- `question.access.tier` + `packId`, and a new `src/content/packs.json`: `{id, title, productId /* Play Billing SKU, empty until Phase 8 */, rule: {category?, subcategory?, tags?}, preview: number}`. A pack is a *filter over content*, not a copy of it.
- `lib/monetization/entitlements.ts`: `canPlay(question, entitlements)`. This is the **single** gate, used by the selector and the category screens. Until Phase 8, `entitlements = {all: true}`.
- **Today's Five and World Mix draw only from `tier: "free"`.** That keeps the daily game identical for everyone and shared scores comparable. Premium packs start as categories with a free preview of N questions.
- `lib/monetization/rewards.ts`: `type RewardKind = "extra_hint"|"replay"|"bonus_round"|"extra_daily"|"streak_recovery"` and an interface `RewardProvider {available(kind); show(kind): Promise<boolean>}`, with a `NoRewards` implementation that always returns unavailable. The UI hides reward buttons when unavailable, so AdMob can be added later without touching the game code.
- **Rule:** rewards never change a Today's Five score. They unlock extra games, replays or bonus rounds.
- **Play policy:** digital unlocks on Android must use Google Play Billing. That will need one billing plugin in Phase 8 (a decision for later).

### 17. Performance strategy

- **Stop importing content into JS.** Ship `public/content/index.json` eagerly (≈ 150 bytes × 500 ≈ 75 KB: id, entity, category, subcategory, difficulty, tier, region, answer country). Load full question bodies per category (`public/content/q/music.json`, …) with `fetch` only when that category is played. These files are bundled in the APK, so they work **offline** through Capacitor's local server.
- Today's Five fetches only the edition's five questions (`content/editions/<edition>.json` plus the category files it references, cached in memory).
- **Balanced selector** `selectFive(pool, seed, rules)`: deterministic seeded shuffle (e.g. mulberry32), then greedy pick with constraints: distinct entities, no repeated answer country, World Mix at most 2 per primary category and 2 per origin region, and a requested difficulty band if one is set. If fewer than 5 are eligible, relax constraints in a fixed order, and never crash. It works for any pool size, which removes the current "multiple of 5" limitation.
- **Images:** 160×160 WebP, ≤ 20 KB each, loaded only for the current round with the next one prefetched. Monograms remain the default. Only licensed or original images are bundled. Pack images can live in the pack files, so they don't inflate the core APK.
- **Spark atlas:** 1.1 MB PNG → WebP, about 150–250 KB (same art). This is the cheapest size win in the app.
- MapLibre stays dynamically imported and is never loaded on home or category screens.
- **Budgets checked in CI tests:** `index.json` < 100 KB; any single category file < 250 KB; APK < 15 MB; AAB download < 12 MB.

### 18. Android considerations

- **Back button:** with deeper navigation (home → worlds → play), Capacitor's default WebView-history back should work. It needs checking on the Xiaomi phone. If it misbehaves (e.g. exits from the category screen, or loops after a reveal), add `@capacitor/app`'s `backButton` listener. That's small, official, and an approved exception to "no new dependencies".
- **Query-param routing** keeps a single `/play/index.html`, so there are no 404s in static export.
- **External links** (portal and sources) must keep leaving the app for the browser. Re-check on device after the layout changes.
- Share text on native must say which mode was played ("StarTap · World Mix"), still without a URL until the site is public.
- **Release:** bump `versionCode` every upload. Release signing (keystore, not in the repo) and `bundleRelease` come in Phase 10.
- **Gradle:** either keep using the local Gradle, or fix the wrapper by setting `distributionUrl` to the verified local zip (`file:///…/gradle-8.14.3-bin.zip`).
- **Play Console:** target audience 13+ avoids the Families policy constraints on ads. Content rating questionnaire needed. Data safety form: no data collected until analytics or ads are added.
- **Device checks per phase:** touch pin placement, pinch zoom, back navigation, sound after backgrounding, share sheet, offline launch (airplane mode), progress kept after force-stop.

### 19. New tests

The existing 18 stay. Add an `npm test` script (`node --experimental-strip-types --test "src/**/*.test.ts"`).

| Test file | Covers |
| --- | --- |
| `content/editions.test.ts` | **Parity lock**: all four legacy editions reproduce the same IDs, order, coordinates and daily picks |
| `content/validate.test.ts` | Schema, unique IDs, coordinates in range, `https` sources, category/subcategory exist in the taxonomy, every question's entity exists, disputed ⇒ nuance + 2 sources, `verified` required for `active`, warnings for weak-source domains |
| `content/balance.test.ts` | No primary category > 30% of the World Mix pool; no single subcategory (K-pop included) > 15% of its category once the category has ≥ 40 entries; no origin region > 30% |
| `lib/game/select.test.ts` | Deterministic by seed; 5 distinct entities; category, region and country caps; difficulty filter; graceful fallback with small pools; free-only for daily and mix |
| `lib/game/session.test.ts` | Spec parsing (bad params fall back to Today's Five); v2 restore; v1 still restores; unknown IDs reset the session |
| `lib/game/ledger.test.ts` | Best score is idempotent; practice excluded; backfill from v1 keys; corrupt ledger resets safely |
| `lib/game/mastery.test.ts` | Every star boundary; small-pool scaling; level ≠ mastery ≠ score |
| `lib/monetization/*.test.ts` | `canPlay` for free/pack/plus; `NoRewards` always unavailable; packs match by rule |
| `lib/game/milestones.test.ts` (extend) | `sparkMood` |
| `CountryFlag` lookup | Every answer `countryCode` has a flag file |

Plus the existing headless-Edge scripts, re-run each phase (65-star pass, mobile widths), and the device checklist in §18.

### 20. Files that will need changes

**Modified:** `src/types/game.ts`, `src/components/game/DailyGame.tsx`, `PlayGame.tsx`, `StarWheel.tsx` (the `Question` import only), `StarPortal.tsx` (entity-keyed media), `CountryFlag.tsx` (ISO lookup), `SharePreview.tsx` (mode label), `StarMascot.tsx` (mood helper), `src/app/page.tsx` (Home V2), `src/app/globals.css`, `src/lib/game/daily.ts` (edition registry), `progress.ts` (v2 alongside v1), `milestones.ts`, `package.json` (test and content scripts), `next.config.ts` (possibly nothing), `android/app/src/main/AndroidManifest.xml` and `build.gradle` (Phase 10 only), `public/mascot/` (WebP).

**New:** `src/content/{schema.ts, taxonomy.json, entities.json, questions/*.json, editions/*.json, editions.lock.json, packs.json}`, `src/lib/content/{load.ts, adapt.ts, validate.ts}`, `src/lib/game/{session.ts, select.ts, ledger.ts, mastery.ts}`, `src/lib/storage.ts`, `src/lib/monetization/{entitlements.ts, rewards.ts}`, `src/app/worlds/[category]/page.tsx`, `src/app/stars/page.tsx`, `src/components/home/*`, `src/components/worlds/*`, `scripts/{migrate-v1.mjs, migration-map.json, build-content.mjs, content-report.mjs}`.

**Removed after parity (backed up first):** `src/data/{developmentChallenge, challenges, storyChallenge, globalChallenge, expandedChallenge}.ts`, `globalExtras.json`, `expandedExtras.json`, `starMedia.ts`.

---

## Part C — Balanced content expansion plan

**Principle:** the first expansion (+145 → **210 total**) fixes the biggest gaps: Music is 42% today, and Countries, Culture, Icons and Tech have nothing. It then moves toward your ~500 target in Phase 9.

**The names below are candidates only. None has been researched yet.** Each one enters as `draft`, needs a reliable source for its specific location claim, and can be dropped if sourcing fails. Group memberships and current clubs get checked against official pages at the time of writing.

| Category | Now | Add | First set | Share | Medium-term (Phase 9) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Music | 27 | 23 | 50 | 24% | 100 |
| Sports | 23 | 27 | 50 | 24% | 100 |
| Screen | 15 | 25 | 40 | 19% | 100 |
| Countries & Geography | 0 | 25 | 25 | 12% | 50 |
| Culture | 0 | 20 | 20 | 10% | 25 |
| World Icons | 0 | 15 | 15 | 7% | 75 |
| Tech & Innovation | 0 | 10 | 10 | 5% | 50 (with Business) |
| More (History, Food, Science, Fashion…) | 0 | 0 | 0 | — | 50 |
| **Total** | **65** | **145** | **210** | | **~550** |

**Music (+23 → 50).** Afrobeats & Amapiano +4 (Wizkid, Davido, Tems, Rema → 6). R&B +2 (Alicia Keys, The Weeknd → 4). Hip-Hop +3 (Kendrick Lamar, Stormzy, Nicki Minaj → 3). Rock +1 (Elvis Presley → 2). Reggae/Dancehall +2 (Sean Paul, Shaggy → 3). Latin +2 (Karol G, Celia Cruz → 4). K-Pop +3 (Rosé, Jennie, IU → **6, which is 12% of Music**). Country +1 (Dolly Parton). Gospel +1 (Kirk Franklin). Jazz +1 (Louis Armstrong). Soul +1 (Aretha Franklin). Electronic +1 (Black Coffee → 2). African Music Legends +1 (Fela Kuti → 4). Pop +0 (already 10, the largest subcategory at 20%).

**Sports (+27 → 50).** Football +5 (Kylian Mbappé, Marta, Asisat Oshoala, Son Heung-min, Erling Haaland → 11). Basketball +4 (LeBron James, Giannis Antetokounmpo, Hakeem Olajuwon, Yao Ming). American Football +2 (Tom Brady, Patrick Mahomes). Boxing +2 (Muhammad Ali, Anthony Joshua → 3). MMA +2 (Israel Adesanya, Francis Ngannou). Track & Field +2 (Faith Kipyegon, Shelly-Ann Fraser-Pryce → 5). F1 +3 (Lewis Hamilton, Ayrton Senna, Max Verstappen). Cricket +2 (Virat Kohli, Brian Lara → 3). Baseball +2 (Shohei Ohtani, Babe Ruth). Golf +2 (Tiger Woods, Gary Player). Wrestling +1 (Dwayne Johnson; primary Wrestling, secondary Screen). Tennis +0 (already 7).

**Screen (+25 → 40).** Nollywood +4 (Genevieve Nnaji, Funke Akindele, Richard Mofe-Damijo, Omotola Jalade-Ekeinde). Korean Drama +3 (Lee Min-ho, Song Hye-kyo, Lee Jung-jae). Korean Film +2 (Park Chan-wook, Youn Yuh-jung → 3). Bollywood +1 (Amitabh Bachchan → 4). Hollywood +3 (Denzel Washington, Meryl Streep, Zendaya → 7). African Cinema +2 (Ousmane Sembène, Thuso Mbedu). Streaming/TV +2 (Pedro Pascal, Ncuti Gatwa → 3). Comedy +2 (Rowan Atkinson, Basketmouth → 3). Directors +2 (Akira Kurosawa, Steven Spielberg → 4). Classic Icons +3 (Charlie Chaplin, Marilyn Monroe, Bruce Lee). Drama +1 (Gael García Bernal → 2).

**Countries & Geography (+25).** Capitals 5 (Abuja, Canberra, Brasília, Ottawa, Addis Ababa). Landmarks 6 (Machu Picchu, Petra, Great Zimbabwe, Angkor Wat, Taj Mahal, Lalibela). Natural Wonders 6 (Victoria Falls, Iguazu Falls, Uluru, Kilimanjaro, Great Barrier Reef, Table Mountain). Famous Cities 3 (Timbuktu, Kyoto, Havana). Islands 3 (Zanzibar, Bali, Galápagos). Caribbean 2 (Port of Spain, Kingston). Flags and Country Shapes are deferred because they need a new "tap the country" scoring rule (see Phase 4).

**Culture (+20).** Trinidad Carnival, Rio Carnival, Durbar Festival (Kano), Eyo Festival (Lagos), Timkat (Gondar), Kente weaving (Bonwire), jollof rice (**disputed; the nuance rule applies**), Oktoberfest (Munich), La Tomatina (Buñol), Carnival of Venice, Edinburgh Fringe, flamenco (Andalusia), tango (Buenos Aires), capoeira (Salvador), Day of the Dead (Oaxaca), Inti Raymi (Cusco), Holi (Mathura), Kumbh Mela (Prayagraj), Songkran (Chiang Mai), hanami (Kyoto).

**World Icons (+15).** Nelson Mandela, Mahatma Gandhi, Marie Curie, Albert Einstein, Frida Kahlo, Pablo Picasso, Leonardo da Vinci, Chinua Achebe, Toni Morrison, Wangari Maathai, Malala Yousafzai, Martin Luther King Jr., Zaha Hadid, Coco Chanel, Ibn Battuta.

**Tech & Innovation (+10).** Tim Berners-Lee (CERN), Alan Turing (Bletchley Park), Ada Lovelace, Grace Hopper, Shigeru Miyamoto (Nintendo, Kyoto), Jack Ma (Hangzhou), Satya Nadella, Apple's founding garage (Los Altos), Samsung's origin (Daegu), M-Pesa (Nairobi).

**Resulting balance (first set, people only, by origin region):** after the additions, the target is no region above 30%. The content report checks this automatically after each batch.

---

## Part D — Phased implementation plan

Complexity: S = under a day, M = 1–3 days, L = multiple sessions (mostly content research).

| Phase | Purpose | Files affected | Risks | Tests | Depends on | Size |
|---|---|---|---|---|---|---|
| **1. Data model + migration** | Entity/question split, taxonomy, 65 people migrated, editions as ID lists, adapter to the current DTO. **No visible change.** | `src/content/*`, `lib/content/*`, `scripts/migrate-v1.mjs`, `migration-map.json`, `DailyGame`, `daily.ts`, `CountryFlag`, `StarPortal`, `types/game.ts`, `package.json` | Breaking saved scores or shared links (mitigated by the parity lock written *first*); a portal lost to an ID mismatch | editions lock, validator, all 18 existing tests, 65-star browser pass, APK smoke test | — | M |
| **2. Category navigation UI** | Home V2, `/worlds/[category]`, World Mix + category play via `SessionSpec`, `useGameSession` extraction, lazy content loading, mode-aware share | `app/page.tsx`, `app/worlds/…`, `PlayGame`, `SharePreview`, `session.ts`, `select.ts`, `storage.ts`, `progress.ts` v2, `globals.css` | Regressing Today's Five while refactoring `PlayGame`; Android back behaviour; tiny pools (3 Screen subcats have 1 entry) | select, session, progress v1+v2; device back/offline checks | 1 | M–L |
| **3. Music + Sports + Screen expansion** | +75 sourced entries; weak sources replaced; portal links for more stars | `content/questions/{music,sports,screen}.json`, `entities.json` | Factual errors, dead links, outdated clubs/groups | validator, balance, link checker script (manual run, network) | 1 (2 for testing by category) | L (research) |
| **4. Countries + Culture + Icons** | +60 entries; place/landmark entities; `precision` and optional **inside-country full score** (point-in-polygon on the existing GeoJSON) for country-level answers | content files, `scoring.ts` (new rule behind `precision`), `GameMap` (answer area highlight) | Scoring unfairness for large countries; disputed cultural claims | scoring boundaries, polygon tests, disputed-rule validation | 1, 3's workflow | L |
| **5. Tech + More categories** | +10 Tech, then History, Food, Science, Fashion, Business, Creators, Legends, Royalty stubs; "More" screen | content, taxonomy, worlds UI | Creator/influencer facts go stale quickly | validator, balance | 2, 4 | M + content |
| **6. My Stars / mastery** | Ledger, backfill, mastery stars per category, player level, `/stars` | `ledger.ts`, `mastery.ts`, `app/stars/*`, category screen badges | Confusing score vs mastery vs level; ledger corruption | ledger, mastery, backfill | 2 | M |
| **7. Challenges** | Themed 5-question sets (e.g. "Caribbean Stars", "Olympic Moments") as curated ID lists | `content/challenges.json`, `app/challenges/*` | Fixed sets repeat, so they need a content cadence | challenge resolves, all IDs valid | 2, 3–5 | S–M |
| **8. Monetization architecture** | `canPlay` gate live, pack previews, entitlements store, then Play Billing plugin and reward provider (AdMob only with your approval) | `lib/monetization/*`, worlds UI, Android plugin config | Play policy compliance; blocking free players by mistake; receipt handling | entitlements, free-only daily, pack rules; Play internal-testing purchase | 2, 6 | M (L with billing) |
| **9. Large-scale content** | Toward ~550 entries; content report per batch; pack-by-pack | content files | Quality at volume; APK size | validator, balance, size budgets | 3–5 workflow | L (ongoing) |
| **10. Google Play production polish** | Release keystore, AAB, versioning, Auto Backup, Spark WebP, store listing, data safety, content rating, internal → closed testing | `android/*`, manifest, `build.gradle`, `public/mascot` | Losing the keystore (backup plan required); MIUI-specific issues | release build installs; device checklist; pre-launch report | any stable point | M |

**Suggested order in practice:** 1 → 2 → a small slice of 3 (e.g. 15 entries across all three categories to prove the content workflow) → 10 (get an internal-testing build to Play early) → the rest of 3 → 4 → 6 → 5 → 7 → 8 → 9.

---

## Decisions needed before Phase 1

1. Approve the **entity + question** split and adding the `career_location` question type.
2. Approve the taxonomy additions (Gymnastics, Racket Sports and Winter Sports under Sports; "Afrobeats & Amapiano").
3. Confirm that **Today's Five and World Mix stay free-only** and rewards never change a daily score.
4. Confirm the proposed difficulty and subcategory values in the audit table, or mark changes.
5. Approve `@capacitor/app` as a conditional dependency, only if back navigation fails on device.
