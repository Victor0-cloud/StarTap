// Regression: the seven world entrance intros (Screen, Historic Icons → World Icons, Tech, Fashion, Business, Creators,
// Royalty). Sports World pattern on the world page — first entry plays it, return visits go straight to the page, Replay
// Intro replays it — but entrance-only: never before PLAY FIVE, never in the Adventure tab.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { ALL_CINEMATICS, idsToReset, MUSIC_CINEMATICS as M, readWatched, SPORTS_CINEMATICS as S, WORLD_ENTRANCE_CINEMATICS as W, WORLD_ENTRANCE_INTROS, WORLD_INTROS, withWatched } from "./cinematics.ts";

const publicDir = new URL("../../../public/", import.meta.url);
const sourceRoot = new URL("../../../../assets/videos/", import.meta.url); // C:\Projects\StarTap\assets\videos (outside the repo)
const src = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8").replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");
const md5 = (u: URL) => createHash("md5").update(readFileSync(u)).digest("hex");
const taxonomy = JSON.parse(readFileSync(new URL("../../content/taxonomy.json", import.meta.url), "utf8")) as { categories: { key: string; label: string }[] };

// category key → [watched id, source file, production file, category label]
const WORLDS = {
 screen: ["screen-world", "screen_world/screen_world_intro.mp4", "/videos/screen-world/screen_world_intro.mp4", "Screen"],
 icons: ["historic-icons", "historic_icons/historic_icons_intro.mp4", "/videos/historic-icons/historic_icons_intro.mp4", "World Icons"],
 tech: ["tech-innovation", "tech_innovation/tech_innovation_intro.mp4", "/videos/tech-innovation/tech_innovation_intro.mp4", "Tech & Innovation"],
 fashion: ["fashion-beauty", "fashion_beauty/fashion_beauty_intro.mp4", "/videos/fashion-beauty/fashion_beauty_intro.mp4", "Fashion & Beauty"],
 business: ["business-money", "business_money/business_money_intro.mp4", "/videos/business-money/business_money_intro.mp4", "Business & Money"],
 creators: ["creators-internet", "creators_internet/creators_internet_intro.mp4", "/videos/creators-internet/creators_internet_intro.mp4", "Creators & Internet"],
 royalty: ["royalty-dynasties", "royalty_dynasties/royalty_dynasties_intro.mp4", "/videos/royalty-dynasties/royalty_dynasties_intro.mp4", "Royalty & Dynasties"],
} as const;

test("each of the seven worlds has a registry entry on its real taxonomy category, with the specified watched id and production file", () => {
 assert.deepEqual(Object.keys(W).sort(), Object.keys(WORLDS).sort());
 for (const [key, [id, , production, label]] of Object.entries(WORLDS)) {
  const clip = W[key as keyof typeof W];
  assert.equal(taxonomy.categories.find(c => c.key === key)?.label, label, `${key} is the ${label} category`);
  assert.equal(clip.id, id); assert.equal(clip.role, id, `?resetIntro=${id}`); assert.equal(clip.src, production);
  assert.equal(WORLD_ENTRANCE_INTROS[key], clip, `${key} world page plays ${id}`);
  assert.ok(ALL_CINEMATICS.includes(clip), "one shared registry");
  assert.ok(existsSync(new URL("." + production, publicDir)), `${production} packaged`);
 }
});

test("production files are the approved source clips, copied unchanged (when the source folder is present)", { skip: !existsSync(sourceRoot) && "assets/videos not on this machine" }, () => {
 for (const [id, source, production] of Object.values(WORLDS)) {
  assert.ok(existsSync(new URL(source, sourceRoot)), `${source} exists`);
  assert.equal(md5(new URL("." + production, publicDir)), md5(new URL(source, sourceRoot)), `${id}: byte-identical, not re-encoded`);
 }
});

test("watched ids are unique: watching one world never marks another (or Music / Sports) as seen", () => {
 const ids = Object.values(W).map(c => c.id);
 assert.equal(new Set(ALL_CINEMATICS.map(c => c.id)).size, ALL_CINEMATICS.length);
 for (const id of ids) {
  const watched = readWatched(withWatched(readWatched(null), id));
  assert.deepEqual([...watched], [id], `${id} only`);
  for (const other of ALL_CINEMATICS.filter(c => c.id !== id)) assert.ok(!watched.has(other.id), `${id} never marks ${other.id}`);
 }
 assert.ok(!readWatched(withWatched(readWatched(null), S.intro.id)).has(W.screen.id), "Sports watched does not skip Screen");
});

test("?resetIntro=<world id> clears only that world's flag; ?resetIntro=1 clears the page's own clip", () => {
 for (const clip of Object.values(W)) {
  assert.deepEqual(idsToReset(clip.id, null), [clip.id]);
  assert.deepEqual(idsToReset("1", clip), [clip.id]);
 }
 assert.ok(idsToReset("all", null).includes(W.royalty.id));
});

test("world page: first visit plays the intro, a return visit does not, Replay Intro replays; it closes onto the same page", () => {
 const intro = src("../../components/cinematic/WorldIntro.tsx"), page = src("../../app/category/[slug]/page.tsx");
 assert.match(page, /<WorldIntro worldId=\{category\.key\} \/>/, "every category page mounts its world intro");
 assert.match(intro, /WORLD_ENTRANCE_INTROS\[worldId\]/, "looked up in the entrance map");
 assert.match(intro, /useState<Cinematic \| null>\(\(\) => shouldPlay\(cinematic\) \? cinematic : null\)/, "first visit plays; watched → straight to the page");
 assert.match(intro, /onClick=\{\(\) => setPlaying\(cinematic\)\}>▶ REPLAY INTRO/, "Replay Intro");
 assert.match(intro, /onDone=\{end => \{ if \(end !== "error"\) markWatched\(playing\.id\); setPlaying\(null\); \}\}/, "end, Skip, Esc and Back only close the overlay; a failed clip is not marked watched");
 assert.doesNotMatch(intro, /useRouter|router\.|location\.(href|assign|replace)|<Link/, "never navigates — the destination is the page it opened on");
});

test("the player behind it: Skip, Esc, Android Back and load failure all end the clip (shared with Music and Sports)", () => {
 const player = src("../../components/cinematic/CinematicPlayer.tsx");
 assert.match(player, /className="cinematic-skip" onClick=\{\(\) => finish\("skipped"\)\}/);
 assert.match(player, /e\.key === "Escape"\) finish\("skipped"\)/);
 assert.match(player, /pushBackHandler\(\(\) => \{ finish\("back"\); return true; \}\)/, "Android Back closes the intro first");
 assert.match(player, /onError=\{\(\) => finish\("error"\)\}/); assert.match(player, /START_TIMEOUT_MS/);
});

test("entrance-only: the new intros never start or precede a game and are not Adventure intros", () => {
 assert.deepEqual(Object.keys(WORLD_INTROS).sort(), ["music", "sports"], "pre-game / Adventure map unchanged");
 for (const key of Object.keys(W)) assert.equal(WORLD_INTROS[key], undefined, key);
 const play = src("../../components/worlds/CategoryPlay.tsx"), adventure = src("../../components/adventure/AdventureMap.tsx");
 assert.doesNotMatch(play + adventure, /WORLD_ENTRANCE/, "PLAY FIVE and the Adventure tab never use the entrance clips");
});

test("Music and Sports unchanged", () => {
 assert.equal(WORLD_INTROS.music, M.intro); assert.equal(WORLD_INTROS.sports, S.intro);
 assert.equal(WORLD_ENTRANCE_INTROS.music, M.intro); assert.equal(WORLD_ENTRANCE_INTROS.sports, S.intro);
 assert.equal(M.intro.src, "/videos/music-world/music_world_intro.mp4"); assert.equal(S.intro.src, "/videos/sports-world/sports_world_intro.mp4");
});

test("Today's Five never touches cinematics", () => {
 const daily = src("../../components/game/DailyGame.tsx") + src("../../app/play/page.tsx");
 assert.doesNotMatch(daily, /cinematic|WorldIntro|CinematicPlayer/i);
});
