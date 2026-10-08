# Reveal UX, country-first scoring, app icon and production URL (30 September 2026)

Rollback copy: `C:\Users\USER\StarTap-backups\before-reveal-scoring-20260930`. Screenshots: `C:\Users\USER\StarTap-backups\reveal-v2`.

## Country-first scoring ("country-v2")

`src/lib/game/result.ts` holds the bands, `resultState()` (label, points, optional subtitle) and `sparkMood()`. Spark only reacts to the tier; it never decides it.

| Result | Rule | Points (before hint) |
| --- | --- | --- |
| NAILED IT! | ≤ 25 km | 1,000 within 10 km → 950 at 25 km |
| RIGHT CITY! | ≤ 75 km | 950 → 850 |
| RIGHT REGION! | right country and ≤ 300 km | 849 → 700 |
| RIGHT COUNTRY! | right country, beyond 300 km | 699 → 500 at 3,000 km; never below 500 |
| CLOSE! | wrong country, ≤ 1,500 km | 499 → 200 |
| NOT QUITE! | wrong country, beyond 1,500 km | 199 → 0 at 5,000 km |

- Each round stays at a maximum of 1,000, and each game at 5,000. A hint still costs 200 (minimum 0). Score milestones and crowns are unchanged.
- **"Region" is a distance stand-in** (same country, within 300 km): the project has no state or province boundaries.
- A wrong-country near miss now scores lower than under the old tiers (117 km across a border: 750 before, 490 now). That's deliberate, following the approved country-first ranges.

Examples for a Montréal answer:

| Tap | Result |
| --- | --- |
| Montréal | NAILED IT! 1,000 |
| Saint-Jérôme, 46 km | RIGHT CITY! 909 |
| Québec City, 233 km | RIGHT REGION! 744 |
| Toronto, 504 km | RIGHT COUNTRY! 684 |
| Vancouver | RIGHT COUNTRY! 500 |
| Burlington VT | CLOSE! 490 |
| Tokyo | NOT QUITE! 0 |

## Country lookup

- **Data:** `public/country-lookup.json` (656 KB), built by `scripts/build-country-lookup.mjs` from public-domain Natural Earth 1:50m Admin 0 data (copy in `assets/geo/`), simplified to about 2 km. It covers 241 countries and territories, including small islands such as Barbados.
- **Point lookup:** `src/lib/geo/countries.ts` does even-odd point-in-polygon (so enclaves like Lesotho work). Taps in water within 20 km of a coast count for that country, so harbour and offshore taps near New York, Hong Kong or Reykjavík work.
- **Matching:** `isSameCountry` treats Hong Kong and Macau as China (ISO 3166-2 CN-HK / CN-MO), because the content labels them China. Unknown (open sea) never matches.
- **Saving:** the country is detected once when the answer is locked and saved with the pin (`countryCode`), so reloads recompute the identical score. The lookup is pre-loaded when a game opens. All 75 answer locations resolve to their own answer country (tested).

## How old games stay intact

- Every pre-existing edition (`origins-v1`, `stories-v2`, `global-v3`, `global-v4`) keeps `distance-v1` scoring. The Phase 1 lock files are untouched, and all their checks pass.
- New scoring lives in the new default edition **`global-v5`**, with the same 65 questions and the same daily rotation as `global-v4`. New shares say `edition=global-v5`.
- A day already saved under `global-v4` stays on `global-v4` (`stickyEdition`), so a game never changes scoring mid-day. Explicit `?edition=` links always open that edition.
- Saves without `countryCode` (older games) still restore; an invalid code rejects the save as corrupt.
- Deliberate protection-test changes, both additive: missing or unknown editions resolve to `global-v5`, and question objects may gain fields (`answerCountryCode`) but no existing field may change.

## Reveal

- **Card hierarchy:** reaction label → large points → flag + answer → "N km away" → optional short subtitle ("Right country · under 300 km", "Nearby, but another country", "Hint used · −200").
- **Colours:** lime for positive results, amber for CLOSE, coral for NOT QUITE.
- **Extras:** **Story** (with source links), **Trivia** and **Discover** (Star Portal) are collapsed buttons, one open at a time. Discover appears only when verified links exist. A full-width **NEXT STAR** follows.
- **Phones:** the card scrolls into view after locking.
- **Spark:** the long messages were removed from the reveal. Spark reacts on the map pin, and reduced motion turns the animations off.

| Result | Spark |
| --- | --- |
| NAILED IT | Biggest leap ×3 |
| RIGHT CITY | Happy hop ×2 |
| RIGHT REGION | Happy hop |
| RIGHT COUNTRY | Happy bob |
| CLOSE | Neutral nod |
| NOT QUITE | Sad sigh |
| New milestone | Crown |

## App icon

Source: `assets/images/startap_app_icon.png`, a copy of the approved `C:\Projects\StarTap\assets\images\App_Icon.png`. Generator: `node scripts/build-android-icons.mjs` (uses sharp, installed by Next.js).
- **Adaptive (Android 8+):** navy `#031455` background plus a transparent foreground whose soft-edged artwork circle fills the 66 dp safe zone. Previewed under circle, squircle and rounded-square masks with no clipping. The same foreground is the Android 12+ splash icon.
- **Legacy (Android 7):** square and round PNGs in five densities.
- **Store:** `assets/images/generated/play-store-icon-512.png` for the Play Console.
- **Web:** `src/app/icon.png` (192 px) and `apple-icon.png` (180 px). The default Next.js favicon was removed.
- **Removed:** the old vector star drawables, and `mipmap-anydpi/` (adaptive icons there broke the build below API 26 and would have shown the old star on Android 7).
- The Spark artwork is unchanged.

## Production URL

`src/lib/site.ts`: `PRODUCTION_URL = "https://startap.fun"`, overridable at build time with `NEXT_PUBLIC_SITE_URL` (https only).
- **Shared links:** the Android app (whose WebView origin is `https://localhost`) and any public host share `https://startap.fun/play?day=…&edition=…`. Android shares now include the link; before, they had none.
- **Local development:** a browser on localhost, 127.x, a LAN IP or `*.local` keeps its own origin.
- **Metadata:** page metadata uses startap.fun for `metadataBase` and the Open Graph URL. Star Portal keeps its own external links.

## Build and verification

- **Tests and checks:** 59/59 tests pass; TypeScript, lint and the content report are clean (0 errors); the production web build passes.
- **Browser (headless Edge):**
  - Seeded RIGHT REGION (+751) and RIGHT COUNTRY (+669) reveals.
  - NOT QUITE with hint (+0).
  - Story and Trivia open and close; Discover links are https and open in a new tab.
  - A full global-v5 game's total equals the sum of its rounds (≤ 5,000).
  - The copied result in development links to localhost.
  - A sticky global-v4 day keeps distance scoring.
  - The Phase 1 legacy run (8 games, 40 rounds) still passes.
- **Android:** sync passes; `assembleDebug` passes. APK: `android/app/build/outputs/apk/debug/app-debug.apk` (9.64 MB; +1.2 MB for the country lookup and icons), copied to `C:\temp\StarTap-debug.apk`.
- **Known build quirk:** the mobile build (`npm run android:sync`) also rewrites `.next`, which breaks a running `next start` preview. Rebuild the web version (`next build`) before restarting the preview.

## Remaining manual QA (phone)

The install over ADB was blocked by MIUI (`INSTALL_FAILED_USER_RESTRICTED`). Once the new APK is installed, check:
- New launcher icon; app opens.
- Today's Five, map touch and Spark reactions.
- RIGHT CITY / REGION / COUNTRY labels and points.
- Story / Trivia / Discover.
- Sound, saved progress and the back button.
- The share sheet shows a `https://startap.fun` link and no localhost.
