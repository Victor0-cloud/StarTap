# World entrance intros — 7 October 2026

Seven owner-supplied world cinematics, copied unchanged (not re-encoded; 720×1280, 8 s, H.264 + AAC) from
`C:\Projects\StarTap\assets\videos\`. One production copy each; no duplicates, notes or alternates packaged.
Provenance lives here rather than in `public/`, so nothing internal is published.

| Category (taxonomy key) | Source | Production | Watched id / `?resetIntro=` | Baked ending text |
|---|---|---|---|---|
| Screen (`screen`) | `screen_world/screen_world_intro.mp4` | `public/videos/screen-world/screen_world_intro.mp4` | `screen-world` | SCREEN WORLD · STORIES COME ALIVE |
| World Icons (`icons`) | `historic_icons/historic_icons_intro.mp4` | `public/videos/historic-icons/historic_icons_intro.mp4` | `historic-icons` | HISTORIC ICONS WORLD · GREAT MINDS. BOLD LIVES. ONE WORLD. |
| Tech & Innovation (`tech`) | `tech_innovation/tech_innovation_intro.mp4` | `public/videos/tech-innovation/tech_innovation_intro.mp4` | `tech-innovation` | TECH & INNOVATION · FROM CODE TO CONSCIOUSNESS |
| Fashion & Beauty (`fashion`) | `fashion_beauty/fashion_beauty_intro.mp4` | `public/videos/fashion-beauty/fashion_beauty_intro.mp4` | `fashion-beauty` | FASHION & BEAUTY · OWN THE LOOK |
| Business & Money (`business`) | `business_money/business_money_intro.mp4` | `public/videos/business-money/business_money_intro.mp4` | `business-money` | BUSINESS & MONEY · BUILD. TRADE. WIN. |
| Creators & Internet (`creators`) | `creators_internet/creators_internet_intro.mp4` | `public/videos/creators-internet/creators_internet_intro.mp4` | `creators-internet` | CREATORS & INTERNET · GO LIVE. GO GLOBAL. |
| Royalty & Dynasties (`royalty`) | `royalty_dynasties/royalty_dynasties_intro.mp4` | `public/videos/royalty-dynasties/royalty_dynasties_intro.mp4` | `royalty-dynasties` | ROYALTY & DYNASTIES · CROWNS OF THE WORLD |

CONTENT_TEXT_MISMATCH: the Historic Icons clip says "HISTORIC ICONS WORLD"; there is no category of that name. It
introduces **World Icons** (`icons`), whose first subcategory is Historic Icons (`History` has no stars yet). Moving it is
one line in `WORLD_ENTRANCE_CINEMATICS` (`src/lib/game/cinematics.ts`).

Behaviour (Sports World pattern, entrance-only): first entry to `/category/<key>/` plays the intro over the page; Skip,
Esc, Android Back or the end close it onto that page; return visits go straight to the page; ▶ REPLAY INTRO replays it.
Unlike Music and Sports, these clips never play before PLAY FIVE and are not Adventure intros. A clip that fails to load
closes itself and is not marked watched. Tests: `src/lib/game/world-intros.test.ts`.
