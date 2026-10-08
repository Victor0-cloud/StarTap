# StarTap — current handoff, 29 September 2026

## Current state
The app is a working local five-round early-access game. The original Downloads/HANDOFF.md is out of date: five-round functionality and five portrait assets were already present when the actual project was inspected.

Project: C:\Projects\StarTap\startap
Local preview: http://localhost:3001/play
Pre-change source backup: C:\Users\USER\StarTap-backups\before-daily-mvp-20260929
This folder has no Git repository. No Git initialization, commit, push or public deployment was performed.

## User direction
Keep the first release small, fun and global. Do not restrict it to Nigeria or Afrobeats. Five quick rounds, clues, map guesses, scores, short discoveries and sharing. Accounts, Passport, leaderboard, payments and a large database are deferred.

## Implemented
- Ten sourced stars spanning music, film, football and tennis: Burna Boy, Rihanna, Adele, Lionel Messi, Shakira, Naomi Osaka, Hugh Jackman, Jackie Chan, Serena Williams and Shah Rukh Khan.
- UTC-date-based five-question rotation, version origins-v1. The small bank repeats; early-access disclosure is visible.
- Starting clues and optional 200-point hints, with scores floored at zero.
- Adjustable pin before explicit answer confirmation; map-centre selection button.
- Short sourced answer stories; city/parish-centre distance scoring.
- Browser-local saved answers, hints and results. Invalid saved state is rejected and scores are recomputed.
- Practice replay preserves the original saved result.
- Native share where supported; clipboard copy and manual text fallback. Links contain challenge date and edition. Localhost links work only on this computer until hosted.
- Mobile layout; the answer bar was changed from sticky to normal flow to prevent covering map controls.
- Initial map tap fix: accept taps once initial map load completes, even during the opening animation.

## Photos
Five existing JPEGs and credit records are in public/stars. Newly added stars currently use initials. Obtain individually reviewed Wikimedia Commons or other appropriately licensed assets before replacing these fallbacks. Existing credit UI links to author/source/license records. Do not fabricate celebrity portraits.

## Validation
Before final CSS-only fix: lint and TypeScript passed, all 13 tests passed, production build passed. Isolated Edge completed all five rounds, draft-pin adjustment, hint persistence, answer locking, reveal/result refresh recovery, mute persistence, result copying, practice protection, and width checks at 360/390/412/430 pixels, without page errors.
Final CSS-only build and mobile screenshot confirmation: pending at time of this note; see final update below.
Browser scripts/screenshots: C:\Users\USER\StarTap-backups. In-app automation timed out, so bundled Playwright and isolated installed Edge were used.

## Local commands
Use .local-node/node.exe (Node 24) with node_modules/next/dist/bin/next build or start -p 3001.
Stop the identified StarTap server before rebuilding. Do not run development and production builds against the same .next directory.
Tests: .local-node/node.exe --experimental-strip-types --test src/lib/game/game.test.ts src/lib/game/daily.test.ts
Lint: .local-node/node.exe node_modules/eslint/bin/eslint.js src
Type check: .local-node/node.exe node_modules/typescript/bin/tsc --noEmit --incremental false

## Limits and next work
- The ten-star bank repeats; more verified questions are needed for long-term daily freshness.
- Five new portraits are still missing; initials work safely.
- All scoring is client-side, without competitive integrity or a public leaderboard.
- Progress is local to one browser, without cross-device sync.
- A running session keeps its selected date; a fresh request selects the current UTC day.
- The local basemap has no street/city labels. Map knowledge remains part of the challenge.
- Public hosting and release review remain undone.
- Existing docs/FIVE_ROUND_MVP.md and docs/CONTENT_ARCHITECTURE.md describe earlier work or future design and may differ from this handoff.

## Final verification update
The final production build passed after the mobile answer-bar fix and map minimum zoom change. A fresh 390px Edge browser test verified that the map-centre button works, an answer can be locked, the reveal renders, both markers fit fully inside the map, and there is no horizontal overflow. Final screenshot: C:\Users\USER\StarTap-backups\mvp-mobile-final.png.
Local production server restarted successfully on port 3001 (PID 18508 at this handoff; identify the live process again before stopping it).
The requested local gameplay pass is complete. Five new portrait assets, additional daily content, and public deployment remain as disclosed above.

## Storytelling pass completed
The default edition is now stories-v2. All ten celebrities have a story title, short narrative and extra trivia fact. Eight questions now concern career beginnings, training or milestones; two retain origins questions. The old origins-v1 dataset and share links remain supported with separate saved-progress keys. Source details are in docs/STORY_EDITION.md. No wheel was implemented; it remains an exploratory idea.

Validation: lint/type check passed, all 13 game tests passed, and production build passed. Browser testing played all ten new questions across two five-round sets, checked story/trivia visibility after locking, checked phone overflow, verified the shared edition and checked that the original birthplace edition still works. No page errors were reported. Screenshot: C:\Users\USER\StarTap-backups\story-mobile.png.
Production preview is running at http://localhost:3001/play (PID 5316 at this update; re-identify before stopping). The first review link uses today's five; the complementary demo set is http://localhost:3001/play?day=2026-10-04&edition=stories-v2 . Fifty-star expansion, five additional photos and public hosting remain outstanding.

## Country flags — 29 September 2026
Added local SVG country flags beside revealed locations and final recap countries. Flags remain hidden before answers. Production build and full five-round mobile browser check passed; all reveal and recap flags loaded without horizontal overflow. Preview restarted on port 3001 (PID 19080). Map country labels are not part of this change.


## Completed: masked wheel and 65 stars
- Current default edition: global-v4, 65 stars, five rounds per UTC day, thirteen non-overlapping daily sets before repeating. The home and result screens describe the finite rotation accurately.
- The wheel starts with five question marks. Only the segment currently under the pointer reveals its initials. The landed segment stays highlighted for 650 ms before the question opens. Skip cancels the animation and pending timer; reduced motion omits rotation.
- Global map country/territory names are implemented using local Natural Earth label points and Open Sans glyphs. Flags cover every answer country in all editions.
- Older origins-v1, stories-v2 and global-v3 links and saved results retain their prior content. The previous 50-star order remains unchanged.
- Build, TypeScript, lint, and all 15 unit tests passed. Headless Edge checked all 65 distinct stars across thirteen dates at mobile and desktop widths; stories, trivia, flags, pointer masking frame-by-frame, skip mid-spin, reduced motion, save/refresh, clipboard sharing, and legacy editions passed with no browser errors or failed requests.
- Verification report: C:\Users\USER\StarTap-backups\expanded-verification.json. Screenshots include expanded-wheel-mobile.png and expanded-wheel-selected.png in the same folder.
- Preview server is running on port 3001, PID 16776. Public deployment has not been performed.
- Source catalogue and remaining portrait limitation are documented in docs/GLOBAL_EDITION.md. Five existing portraits have local credited photographs; other stars use monograms.
- Rollback: C:\Users\USER\StarTap-backups\before-masked65. Earlier before-global-finish-20260929 snapshot preserves the ten-star build.
- The earlier usage-limit rejection cleared; the account usage tool confirmed ordinary usage allowed before this work resumed.

## Original music and Spark mascot — 30 September 2026
- Original Web Audio note patterns: short wheel theme, reveal, perfect, close, miss, victory, and encouraging finish. Synthesized sine/triangle voices; no sampled audio or third-party compositions were intentionally used. Sound is gesture-triggered; no autoplay. Mute stops scheduled voices immediately, persists across reloads, and is available on the final screen. Audio contexts and nodes clean up on unmount.
- Added original SVG star mascot Spark. Good guesses (within 500 km) trigger a short happy dance; misses show a gentle sad pose. Newly crossed total-score milestones at 1,000, 3,000 and 5,000 show a crown and celebratory tune. Animations finish within four seconds and respect reduced-motion preferences.
- Crown thresholds are tested to avoid repeat rewards after crossing. Final results crown 3,000+ and perfect 5,000 runs.
- Production build, TypeScript, lint and 16 unit tests passed. Browser verified mascot poses, all crown thresholds, reduced motion, mobile width and final state. Audio checks verified gesture activation, mute persistence, stopping voices, and all outcome cues; final milestone audio integration also checked.
- Browser verification scripts: C:\Users\USER\StarTap-backups\audio-verify.cjs, mascot-verify.cjs and audio-milestone-verify.cjs. Screenshots spark-happy.png, spark-sad.png, spark-crown.png in that folder.
- Preview now running on port 3001, PID 6392.

## Spark map ball — 30 September 2026
- Replaced the player map dot with an expressive round Spark mascot. On selection it travels from the previous position (or initial map centre) to the new guess with a 480 ms hop, taking the short route across the date line.
- Rapid selections cancel the previous animation cleanly. Locking snaps to the actual stored guess and leaves Spark there, happy within 500 km, sad otherwise, or crowned for a newly crossed milestone. A separate star still marks the true answer; Spark sits above its selected point so both remain visible even for exact guesses.
- Result-card Spark is also round. Reduced motion disables travel and bounce; marker frames and elements clean up on round changes/unmount. Restored answers immediately show their correct expression.
- Build and TypeScript passed. Focused browser verification passed movement, rapid reselection, locking, every reaction, separate answer marker, reload, next-round cleanup, reduced motion and mobile overflow checks. Script: C:\Users\USER\StarTap-backups\ball-verify.cjs. Screenshots: ball-map-sad.png, ball-map-happy.png, ball-map-crowned.png.
- Local preview PID 9668 on port 3001.

## V2 Phase 1 — data model and migration (30 September 2026)
Content now lives in `src/content` (entity + question model, taxonomy, frozen editions). `src/data` was removed after the compatibility lock passed; the original is in `C:\Users\USER\StarTap-backups\before-v2-phase1-20260930`. Gameplay, scoring, Spark, Star Portal, sharing and saved-progress keys are unchanged. Added `@capacitor/app@8.1.1` for Android back handling. Details: `docs/V2_PHASE1.md`; QA lists: `docs/V2_CONTENT_QA.md` (`npm run content:report`). Tests: `npm test` (37). On-device back-button check is still pending. Phase 2 not started; awaiting approval.

## Responsive web + startap.fun deployment preparation — 7 October 2026
- Deployment model: fully static. `npm run build:web` → `out/` (static export, trailingSlash, Apache `.htaccess`, output scan, flat prefetch-segment copies). Preview it like the host: `npm run serve:web` (port 3002). Not deployed.
- Android unchanged in behaviour: `npm run build:mobile` → `.next-mobile`, `cap sync android` done (no AAB). The build target is `NEXT_PUBLIC_STARTAP_TARGET` (next.config.ts); the app keeps first-run onboarding and hides the web-only Google Play / Play Anywhere sections.
- New routes: `/how-to-play/`, `/privacy/`, `/terms/`, `/support/`, plus `manifest.webmanifest`, `robots.txt`, `sitemap.xml`. Owner values in `src/lib/site.ts`: `PLAY_STORE_URL` and `SUPPORT_EMAIL` are null until supplied (site shows "coming soon" / "being set up").
- Home reworked (worlds first, star field, glow); desktop gameplay ≥1000px is globe left, star/clue/hint/lock/result right (CSS only); share adds COPY LINK. Content, scoring, gameplay, map and cinematic code unchanged.
- QA: tsc, lint, 155 unit tests, content report (identical), default + mobile + web builds passed. Full Today's Five + Afrobeats + Tennis games at 375/430/768/1024/1366/1440 (Edge) and 1366/412 (Chrome), zero errors. Screenshots: C:\Users\USER\StarTap-backups\web-qa. Rollback: C:\Users\USER\StarTap-backups\before-web-responsive-20261007.

## Recovery check + Vercel preparation — 8 October 2026
- After an unexpected shutdown (last writes: vercel.json and .vercelignore at 00:49 on 8 Oct) the saved state was verified intact: all 71 content/config JSON files parse, no truncated or NUL-filled files, scripts syntax-check, 170/170 tests pass, `C:\temp\StarTap-debug.apk` passes a zip integrity test, `out/` holds all public routes (built 00:29, newer than every source change).
- Content batches 11–18 (src/content/batches, research in docs/content-research) and the 170-test suite were already in place; they were not recorded in this file before.
- Vercel: `vercel.json` (static, `npm run build:web` → `out/`, trailingSlash, cache/MIME/security headers) and `.vercelignore` (uploads only src, public, scripts, configs, package files). Checked by copying exactly the uploaded file set to a clean folder, running `npm ci` + `npm run build:web` (system Node 26): the output scan passed, with the same 691 files as the local `out/`.
- Not done (needs the owner): Vercel login/project link, Node version in project settings (24.x matches the local toolchain), attaching startap.fun + DNS, first deploy. No Git repository exists; deploy via the Vercel CLI from this folder or after creating a repo.
