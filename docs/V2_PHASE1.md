# StarTap V2 — Phase 1: data model and migration

Completed 30 September 2026. Player-visible gameplay is unchanged. Rollback copy: `C:\Users\USER\StarTap-backups\before-v2-phase1-20260930`.

## Content layout

| Path | Contents |
| --- | --- |
| `src/content/schema.ts` | Types and allowed values (regions, difficulties, question types incl. `career_location`, source qualities, access tiers, review states) |
| `src/content/taxonomy.json` | 7 main categories + 8 "More" categories and their subcategories. Afrobeats and Amapiano are separate. Sports adds Gymnastics, Racket Sports, Winter Sports. |
| `src/content/entities.json` | 65 people, each stored once: `countryOfOrigin`, `region`, image status/licence, optional Star Portal links |
| `src/content/questions/{music,screen,sports}.json` | 75 questions (65 live + 10 origins-v1). The answer place (`answer.countryCode`) is independent of the entity's origin. |
| `src/content/editions.json` | Frozen, ordered question-ID lists for origins-v1, stories-v2, global-v3, global-v4 (default) |
| `src/content/packs.json` | Empty. Premium-ready: paid content must reference a pack; editions (Today's Five) must be free. |
| `src/content/legacy/gameplay.lock.json` | **Never regenerate.** Frozen from the original code: IDs, order, coordinates, 95 dates × 4 editions of daily picks (380), recomputed scores for 44 edition-days, 32 share texts, edition-link resolution. |
| `src/content/legacy/content.snapshot.json` | Every field of every legacy playable question. Regenerate only for a deliberate, approved content edit (e.g. replacing a weak source). |

Code: `src/lib/content/build.ts` (catalog + adapter to the existing playable object), `catalog.ts` (app bundle), `node-content.ts` (tests/scripts), `validate.ts` (rules + balance report). `scripts/legacy/migrate-v1.cjs` is the one-off migration, with provisional classifications. `scripts/content-report.ts` generates `docs/V2_CONTENT_QA.md`.

All migrated classifications are `review.classification: "provisional"` and `review.status: "legacy"`. Answers and wording were not changed.

## Commands

- `npm test`: all unit tests, including the compatibility lock and content validation
- `npm run typecheck`, `npm run lint`
- `npm run content:report`: validation + QA report; exits non-zero on errors
- Android: `npm run android:sync`, then in `android/` run `C:\Users\USER\.local\startap-tools\gradle\gradle-8.14.3\bin\gradle.bat assembleDebug` with `JAVA_HOME=C:\Users\USER\.local\startap-tools\jdk21\jdk-21.0.12.1+1`

## Android back button

Capacitor 8's Android core has no back handling, so Android's default closed the app from any screen, including mid-game. Added the official `@capacitor/app@8.1.1` (the only new dependency) and `src/components/AndroidBackButton.tsx`. It's active only on native Android; the web is unaffected. The decision logic is in `src/lib/platform/back.ts` (unit-tested):

- Nested screen with history → previous StarTap screen
- Game opened without history → home
- Home → app moved to the background (`minimizeApp`), not destroyed. Saved games are in storage and are never touched.

**On-device checklist (pending: phone was disconnected during Phase 1):**
1. Home → Play → back ⇒ home. Back again ⇒ app goes to the background; reopening shows StarTap without a restart splash.
2. Lock an answer in round 2 → back ⇒ home. Play ⇒ resumes at the reveal of round 2 with the same score.
3. Star Portal / "Read the source" opens the browser. Back returns to the same StarTap reveal.
4. Pinch-zoom and tap still place Spark. Sound toggle persists. Share sheet opens.
