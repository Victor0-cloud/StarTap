# Spark artwork and Star Portal — 2026-09-30

Status: implemented in the existing local app. Production build, TypeScript, lint, 18 unit tests and browser verification pass. Preview: http://localhost:3001/play (production server).

## Changes

- Approved glossy Spark reference converted with built-in imagegen into a transparent four-pose atlas. Ready, happy, sad and crowned poses use CSS, without a new animation dependency.
- One Spark during each round, attached to the player's map coordinates. Existing 480ms hop and interruptible reselection preserved. Locking fixes Spark at the chosen location; the true answer retains its separate marker and distance line.
- Happy/sad reactions last 700/750ms; crown cheer lasts 1200ms. Reduced motion supported. Final results show the same character.
- Optional post-reveal Star Portal supports LISTEN, WATCH and DISCOVER with destination labels and source attribution. HTTPS external links open in a separate tab with noopener/noreferrer.
- 17 stars have curated media metadata; the other 48 have no portal. Missing/empty/invalid destinations are hidden. Adding more links is a content task, not required to play.
- Scoring, Haversine distance, sound generation, sound preferences, question banks, daily order, storage and sharing logic unchanged. No downloaded third-party recordings, album artwork, movie clips or celebrity photos added.

## Exact changed / added files

- src/app/globals.css
- src/app/play/page.tsx
- src/components/game/GameMap.tsx
- src/components/game/PlayGame.tsx
- src/components/game/StarMascot.tsx
- src/components/game/StarPortal.tsx (new)
- src/data/starMedia.ts (new)
- src/lib/game/media.ts (new)
- src/lib/game/media.test.ts (new)
- src/types/game.ts
- public/mascot/spark-character-atlas-v1.png (new, 1280 x 1280; 1.1 MB)
- public/mascot/ARTWORK.md (new, generation mode and prompt brief)
- SPARK-PORTAL-HANDOFF.md (this file)

Rollback source snapshot: C:/Users/USER/StarTap-backups/before-spark-portal-20260930/src.

## Validation

- 18 Node unit tests passed: distance, every scoring boundary, hints, daily rotation, saved-state validation, milestones and optional media link validation.
- TypeScript --noEmit passed; ESLint src passed; Next.js production build passed.
- ball-verify.cjs: movement, rapid reselection, locking mid-flight, separate answer marker, reload, cleanup, reduced motion and mobile width passed.
- spark-art-verify.cjs: happy/sad, crowns at 1000/3000/5000, no repeated threshold crown, reduced motion and final celebration passed.
- audio-milestone-verify.cjs: no autoplay, theme/reveal/result/milestone/finish cues, immediate mute and persistent sound preference passed. Audio scheduling verified; subjective loudness still merits listening on a real phone.
- spark-portal-full-verify.cjs: all 65 stars across 13 complete daily games, desktop/mobile sizes, masked wheel, flags, story/trivia, one Spark per round, 17 portals and 48 hidden, saved reveal/final results, clipboard sharing and old editions passed. No browser exceptions or failed app-resource responses.
- Portal new-tab navigation tested against its exact destination with a browser route fixture. New music/video URLs verified from artist websites. We did not play every external service or verify every regional/account access condition.
- spark-layout-verify.cjs: locked answer and marker do not move after additional map tap; desktop/mobile full-page screenshots.

Browser scripts/screenshots live in C:/Users/USER/StarTap-backups. The automated checks use isolated browser storage and do not overwrite the user's saved daily game.

## Portal provenance

Existing project profile URLs are reused for 14 stars (including WTA, UNICEF, Academy, National Portrait Gallery, club and biography sources). Rihanna's biography and Celine's biography also already existed in the content bank.

New destinations verified 2026-09-30:
- https://www.adele.com/ — official source linking to https://adele.lnk.to/30outnow and https://www.youtube.com/watch?v=jDvYDzFOK9A
- https://www.rihannanow.com/videos/ — official Rihanna/Roc Nation video collection
- https://www.celinedion.com/music/ and https://www.celinedion.com/video/ — official catalogue/video pages

## Remaining scope / manual checks

No known blocker for this local update. Public deployment and unfinished celebrity portraits remain outside this change. Additional portal destinations can be curated later. A real-phone touch/sound check and personal review of Spark's animation feel are recommended; desktop and emulated mobile screenshots were reviewed. External services may require consent, login or regional availability. No third-party media is embedded or auto-played inside StarTap.

Final visual-review fix: reveal bounds now refit on map resize, preventing Spark/the answer marker from being clipped when changing screen size. The listener is removed on round cleanup. Targeted resize, map movement and milestone checks were rerun after this fix; production build and changed-file lint were rerun as well.
