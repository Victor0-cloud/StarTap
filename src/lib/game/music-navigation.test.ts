// Regression: Music World navigation. The world intro ends on the main Music page; each genre's own intro plays on that
// genre's landing page; gameplay starts only from a deliberate PLAY FIVE and never straight after an intro.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { categoryCounts } from "../content/counts.ts";
import { loadRawContent } from "../content/node-content.ts";
import { GENRE_INTROS, genreIntro, genrePreview, previewForSubcategory, MUSIC_CINEMATICS as M, WORLD_INTROS } from "./cinematics.ts";

const src = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8").replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");
const music = categoryCounts(loadRawContent()).find(c => c.key === "music")!;

test("the Music World intro is an overlay on the main Music page and closes back onto it", () => {
 assert.equal(WORLD_INTROS.music, M.intro);
 const page = src("../../app/category/[slug]/page.tsx"), intro = src("../../components/cinematic/WorldIntro.tsx");
 assert.match(page, /<WorldIntro worldId=\{category\.key\} \/>/, "rendered on /category/music/");
 assert.match(intro, /onDone=\{end => \{ if \(end !== "error"\) markWatched\(playing\.id\); setPlaying\(null\); \}\}/, "ending, Skip or Back only closes the overlay");
 assert.doesNotMatch(intro, /useRouter|router\.|location\.(href|assign|replace)|<Link/, "no navigation away from the Music page");
 assert.ok(!Object.values(GENRE_INTROS).includes(M.intro), "the world intro is never a genre intro");
});

test("every live Music genre has its own landing page, playing its own intro", () => {
 for (const s of music.subcategories) {
  const page = previewForSubcategory("music", s.key);
  assert.ok(page, `music/${s.key} has a landing page`);
  assert.equal(page.subcategory, s.key, `${s.key}: plays its own pool`);
  assert.equal(genrePreview("music", page.key), page);
  assert.equal(page.cinematic, genreIntro("music", s.key), `${s.key}: its own intro, never another genre's`);
 }
});

test("a genre intro runs straight into that genre's game; Back or a failed clip never starts a game", () => {
 const view = src("../../components/cinematic/GenrePreview.tsx"), play = src("../../components/worlds/CategoryPlay.tsx");
 assert.match(view, /playHref=\{playable && preview\.subcategory \? `\/category\/\$\{category\}\/play\/\?sub=\$\{preview\.subcategory\}&new=1` : null\}/, "the genre page intro targets its own pool");
 assert.match(view, /if \(playing\.first && playHref && \(end === "ended" \|\| end === "skipped"\)\) \{[\s\S]*?router\.push\(playHref\);/, "first-visit intro → game on end or Skip only");
 assert.match(view, /setPlaying\(\{ clip: cinematic, first: false \}\)/, "Replay Intro only replays");
 assert.match(play, /<GenreIntroGate key=\{JSON\.stringify\(spec\)\} intro=\{intro\} always=\{always\}/, "the play screen gates the game behind the genre's intro");
 assert.match(play, /intro && \(always \|\| shouldPlay\(intro\)\)/, "a genre tap (&intro=1) plays the intro every time");
 assert.match(play, /if \(end === "back"\) router\.replace\(backHref\); else setPlaying\(null\);/, "Back during the intro returns to the category; end / Skip → game");
 assert.match(play, /fresh=\{fresh\}/, "a genre tap always deals a new five from Round 1");
 assert.match(play, /const \[fresh\] = useState\(\(\) => always \|\| params\.get\("new"\) === "1"\)/, "every PLAY FIVE (&new=1) deals a new five");
 assert.match(play, /const \[always\] = useState\(\(\) => params\.get\("intro"\) === "1"\)/, "decided once at entry, so clearing &intro=1 can never bring an old game back");
 assert.match(play, /genreIntro\(category, subcategory\.key\)/, "the play screen uses that genre's own intro");
});

test("every way into a game plays an intro first, then a brand-new five (genre, sport, ▶ INTRO, Soul card, PLAY <WORLD> FIVE)", () => {
 const page = src("../../app/category/[slug]/page.tsx"), view = src("../../components/cinematic/GenrePreview.tsx"), map = src("../../components/adventure/AdventureMap.tsx"), play = src("../../components/worlds/CategoryPlay.tsx");
 assert.match(page, /const genreTap = \(category: string, sub: string, playable: boolean\) => playable \? `\/category\/\$\{category\}\/play\/\?sub=\$\{sub\}&intro=1` : null;/);
 assert.match(page, /className="sub-name" href=\{category\.key === "music" && tap \? tap : /, "Music genre name → intro → game; a sport name → its hero page");
 assert.match(page, /<SubPlayAction [^>]*href=\{tap \?\? /, "PLAY FIVE (row action; the website shows UNLOCK on a locked Premium sport, same link)");
 for (const action of [src("../../components/premium/SubPlayAction.tsx"), src("../../components/premium/SubPlayAction.web.tsx")]) assert.match(action, /className="sub-play[^"]*" href=\{href\}/, "row action keeps the row link");
 assert.match(page, /<Link className="intro-replay" href=\{tap\}/, "▶ INTRO on a genre row → intro → game");
 assert.match(page, /className="soul-legends-card" href=\{genreTap\("music"/, "Soul Legends card");
 assert.match(page, /play\/\?intro=1`\}>PLAY \{category\.label\.toUpperCase\(\)\} FIVE/, "PLAY MUSIC / SPORTS FIVE");
 assert.match(view, /play\/\?sub=\$\{preview\.subcategory\}&intro=1`\}>PLAY/, "sport / genre page PLAY FIVE");
 assert.match(map, /<Link className="intro-replay" href=\{`\/adventure\/play\/\?level=\$\{level\.id\}`\}/, "▶ INTRO on a level → intro → level");
 assert.doesNotMatch(page + map, /<IntroReplay /, "no replay-only chip that leaves the player on a list");
 assert.match(play, /\(subcategory \? genreIntro\(category, subcategory\.key\) : null\) \?\? WORLD_INTROS\[category\] \?\? null/, "sports and world-wide play use the world's intro");
 for (const s of music.subcategories) assert.ok(genreIntro("music", s.key), `music/${s.key} has its own intro`);
 assert.ok(WORLD_INTROS.sports, "sports games open with the Sports World intro");
});
