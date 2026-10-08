// Adventure cinematics: the right clip for each role, played once, never able to trap the player or touch progress.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { ALL_CINEMATICS, WORLD_ENTRANCE_CINEMATICS as W, GENRE_PREVIEWS, genrePreview, previewForSubcategory, AUDIO_RAMP_MS, completionCinematic, FADE_IN_MS, GENRE_INTROS, genreIntro, idsToReset, LEVEL_INTROS, MUSIC_CINEMATICS as M, SPORTS_CINEMATICS as S, WORLD_POSTERS, readWatched, REDUCED_FADE_MS, SKIP_AFTER_MS, withWatched, WORLD_COMPLETE, WORLD_INTROS, worldComplete } from "./cinematics.ts";
import { emptyAdventure, recordLevel, levelStates } from "./adventure.ts";
import { consumeBack, pushBackHandler } from "../platform/backStack.ts";
import type { Adventure } from "../../content/schema.ts";

const publicDir = new URL("../../../public/", import.meta.url);
const adventure = JSON.parse(readFileSync(new URL("../../content/adventure.json", import.meta.url), "utf8")) as Adventure;
const taxonomy = JSON.parse(readFileSync(new URL("../../content/taxonomy.json", import.meta.url), "utf8")) as { categories: { key: string; subcategories: { key: string }[] }[] };
const music = adventure.worlds.find(w => w.id === "music")!;
const file = (c: { src: string }) => c.src.split("/").pop();

test("sixteen Music cinematics, one Sports World cinematic and seven world entrances, each its own file and watched id; every packaged clip is referenced and unique", () => {
 assert.equal(Object.keys(M).length, 16); assert.equal(Object.keys(S).length, 1); assert.equal(Object.keys(W).length, 7);
 assert.equal(ALL_CINEMATICS.length, 24);
 assert.equal(new Set(ALL_CINEMATICS.map(c => c.id)).size, 24, "unique watched ids");
 assert.equal(new Set(ALL_CINEMATICS.map(c => c.src)).size, 24, "no two roles share a video");
 assert.equal(new Set(ALL_CINEMATICS.map(c => c.role)).size, 24, "unique reset roles");
 const hashes = ALL_CINEMATICS.map(c => createHash("md5").update(readFileSync(new URL("." + c.src, publicDir))).digest("hex"));
 assert.equal(new Set(hashes).size, 24, "no byte-identical duplicates packaged (e.g. the 052258/052637 Soul pair)");
 for (const c of ALL_CINEMATICS) assert.ok(existsSync(new URL("." + c.src, publicDir)), `${c.src} exists in public/`);
 const worldDirs = Object.values(W).map(c => [c.id, [c]] as const);
 assert.deepEqual(readdirSync(new URL("videos/", publicDir)).sort(), ["music-world", "sports-world", ...worldDirs.map(([d]) => d)].sort(), "no other video folders");
 for (const [dir, clips] of [["music-world", Object.values(M)], ["sports-world", Object.values(S)], ...worldDirs] as const) {
  const packaged = readdirSync(new URL(`videos/${dir}/`, publicDir)).filter(f => f !== "SOURCES.txt").sort();
  assert.deepEqual(packaged, clips.map(file).sort(), `${dir}: no unused, duplicate or double-extension clips`);
  for (const c of clips) assert.ok(c.src.startsWith(`/videos/${dir}/`), c.src);
 }
 const anyAnimate = (dir: URL): boolean => readdirSync(dir, { withFileTypes: true }).some(e => e.isDirectory() ? anyAnimate(new URL(e.name + "/", dir)) : e.name === "animate.mp4");
 assert.ok(!anyAnimate(publicDir), "the animate.mp4 reference is never bundled");
});

test("every role maps to its own video (the wrong clip is never shown)", () => {
 assert.equal(file(WORLD_INTROS.music), "music_world_intro.mp4");
 assert.deepEqual(Object.fromEntries(Object.entries(LEVEL_INTROS).map(([id, c]) => [id, file(c)])), {
  "music-1": "global_pop_intro.mp4", "music-2": "sounds_of_africa_intro.mp4", "music-3": "hiphop_rap_intro.mp4", "music-4": "latin_caribbean_intro.mp4", "music-5": "kpop_intro.mp4" });
 assert.equal(file(WORLD_COMPLETE.music), "music_world_complete.mp4");
 assert.equal(file(genreIntro("music", "hip-hop")!), "hiphop_rap_intro.mp4", "Hip-Hop & Rap uses the approved rap clip");
 assert.equal(file(genreIntro("music", "rnb")!), "rnb_hiphop_intro.mp4", "modern R&B keeps its existing clip");
 for (const [sub, f] of [["amapiano", "amapiano_intro.mp4"], ["reggae-dancehall", "reggae_dancehall_intro.mp4"], ["african-legends", "african_music_legends_intro.mp4"], ["country", "country_music_intro.mp4"], ["rock", "rock_music_intro.mp4"]])
  assert.equal(file(genreIntro("music", sub)!), f, sub);
 assert.equal(M.soulLegends.id, "music-soul-legends-80s-90s"); assert.equal(file(M.soulLegends), "soul_legends_80s_90s_intro.mp4");
 assert.equal(genreIntro("music", "soul-legends-80s-90s"), M.soulLegends, "Soul Legends genre plays its own intro");
 assert.notEqual(genreIntro("music", "rnb"), M.soulLegends); assert.notEqual(genreIntro("music", "hip-hop"), M.soulLegends);
 assert.ok(!Object.values(LEVEL_INTROS).includes(M.soulLegends), "Soul Legends is not an Adventure level intro");
 assert.notEqual(M.hipHopRap.id, M.rnb.id); assert.notEqual(M.soulLegends.id, M.rnb.id); assert.notEqual(M.soulLegends.id, M.hipHopRap.id);
 assert.notEqual(M.globalPop.src, M.intro.src); assert.notEqual(M.soundsOfAfrica.src, M.globalPop.src); assert.notEqual(M.hipHopRap.src, M.latinCaribbean.src);
 assert.notEqual(M.latinCaribbean.src, M.kpop.src); assert.notEqual(M.kpop.src, M.complete.src);
});

test("level intros use canonical Adventure level ids, in Music World order", () => {
 const titles = Object.fromEntries(music.levels.map(l => [l.id, l.title]));
 assert.deepEqual(Object.keys(LEVEL_INTROS).map(id => titles[id]), ["Global Pop", "Sounds of Africa", "R&B & Hip-Hop", "Latin & Caribbean", "K-Pop"]);
});

test("genre intros use canonical taxonomy keys, so no slug mismatch can silently skip a clip", () => {
 const subs = new Set(taxonomy.categories.find(c => c.key === "music")!.subcategories.map(s => s.key));
 for (const key of Object.keys(GENRE_INTROS)) assert.ok(subs.has(key.split("/")[1]), `${key} is a real Music subcategory`);
 assert.equal(genreIntro("music", "pop"), M.globalPop); assert.equal(genreIntro("music", "rnb"), M.rnb); assert.equal(genreIntro("music", "hip-hop"), M.hipHopRap);
 assert.equal(genreIntro("music", "afrobeats"), M.soundsOfAfrica); assert.equal(genreIntro("music", "latin"), M.latinCaribbean); assert.equal(genreIntro("music", "k-pop"), M.kpop);
 for (const wrong of ["kpop", "r-and-b", "rnb-hiphop", "Pop", null]) assert.equal(genreIntro("music", wrong), null, String(wrong));
 assert.equal(genreIntro("sports", "pop"), null);
});

test("watched state: per-clip, tolerant of bad data, migrates first-release ids", () => {
 assert.equal(readWatched(null).size, 0);
 assert.equal(readWatched("not json").size, 0);
 assert.deepEqual([...readWatched('["a", 3, null, "b"]')], ["a", "b"]);
 const once = withWatched(readWatched(null), M.globalPop.id);
 assert.ok(!readWatched(once).has(M.kpop.id), "watching Global Pop never marks K-Pop");
 assert.deepEqual(JSON.parse(withWatched(readWatched(once), M.globalPop.id)), [M.globalPop.id]);
 assert.deepEqual([...readWatched('["music-world-intro","music-3-intro","music-world:rnb-hiphop"]')], [M.intro.id, M.rnb.id], "old ids map to the clip they showed");
 assert.ok(!readWatched('["music-world:rnb-hiphop"]').has(M.hipHopRap.id), "the new rap clip plays once even if the old Level 3 clip was watched");
});

test("QA reset clears only the named cinematic flags", () => {
 assert.deepEqual(idsToReset("1", M.hipHopRap), [M.hipHopRap.id]);
 assert.deepEqual(idsToReset("soul-legends-80s-90s", null), ["music-soul-legends-80s-90s"]);
 assert.deepEqual(idsToReset("global-pop", M.intro), [M.globalPop.id]);
 assert.deepEqual(idsToReset("sports-world", null), ["sports-world"], "?resetIntro=sports-world");
 assert.deepEqual(idsToReset("electronic-dj", null), ["music-electronic-dj"]); assert.deepEqual(idsToReset("global-icons", null), ["music-global-icons"]);
 assert.deepEqual(idsToReset("1", S.intro), ["sports-world"]);
 assert.deepEqual(idsToReset("all", null).length, 24);
 assert.deepEqual(idsToReset("nonsense", M.intro), []); assert.deepEqual(idsToReset(null, M.intro), []);
});

test("the completion clip plays only on the finish that completes the world", () => {
 const playable = levelStates(music, emptyAdventure()).filter(s => s.state !== "soon").map(s => s.level.id);
 let progress = emptyAdventure();
 for (const id of playable.slice(0, -1)) { const next = recordLevel(progress, id, 3000); assert.equal(completionCinematic(music, progress, next), null, id); progress = next; }
 const last = recordLevel(progress, playable.at(-1)!, 3000);
 assert.equal(worldComplete(music, last), true);
 assert.equal(completionCinematic(music, progress, last)?.id, M.complete.id);
 assert.equal(completionCinematic(music, last, recordLevel(last, playable[0], 4500)), null, "replaying a level never replays the finale");
});

test("the player plays once, starts smoothly, offers SKIP quickly, handles back, and falls back on failure", () => {
 const src = readFileSync(new URL("../../components/cinematic/CinematicPlayer.tsx", import.meta.url), "utf8");
 const css = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");
 assert.ok(SKIP_AFTER_MS >= 500 && SKIP_AFTER_MS <= 1000);
 assert.ok(FADE_IN_MS >= 350 && FADE_IN_MS <= 500 && REDUCED_FADE_MS >= 150 && REDUCED_FADE_MS <= 200 && AUDIO_RAMP_MS >= 500 && AUDIO_RAMP_MS <= 800);
 assert.ok(!/\bloop\b/.test(src.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "")), "never loops");
 assert.ok(/addEventListener\("canplay"/.test(src) && /addEventListener\("playing"/.test(src) && /v\.volume = 0/.test(src), "waits for canplay, fades in on playing, starts silent");
 assert.ok(/\.cinematic-video\{[^}]*opacity:0/.test(css) && /\.cinematic\.is-shown \.cinematic-video\{opacity:1\}/.test(css) && /object-fit:contain/.test(css), "hidden until the first frame, then fades; never stretched");
 assert.ok(/onEnded=/.test(src) && /onError=\{\(\) => finish\("error"\)\}/.test(src) && /pushBackHandler/.test(src) && /START_TIMEOUT_MS/.test(src) && /visibilitychange/.test(src));
 let closed = 0;
 const remove = pushBackHandler(() => { closed++; return true; });
 assert.equal(consumeBack(), true); assert.equal(closed, 1);
 remove(); assert.equal(consumeBack(), false, "back is released once the cinematic closes");
});

test("genre preview pages: one per dedicated clip; 80s/90s Soul Legends plays from its own taxonomy pool", () => {
 const subs = (category: string) => new Set(taxonomy.categories.find(c => c.key === category)!.subcategories.map(s => s.key));
 assert.equal(new Set(GENRE_PREVIEWS.map(g => `${g.category}/${g.key}`)).size, GENRE_PREVIEWS.length);
 for (const g of GENRE_PREVIEWS) {
  assert.ok(g.subcategory === null || subs(g.category).has(g.subcategory), g.key);
  assert.equal(genrePreview(g.category, g.key), g, "route resolves");
  if (g.subcategory) assert.equal(previewForSubcategory(g.category, g.subcategory), g);
  if (g.artwork) assert.ok(existsSync(new URL("." + g.artwork, publicDir)), `${g.artwork} packaged`);
 }
 const soul = genrePreview("music", "soul-legends-80s-90s")!;
 assert.equal(soul.title, "80s/90s Soul Legends"); assert.equal(soul.subtitle, "Golden Voices. Timeless Soul.");
 assert.equal(soul.subcategory, "soul-legends-80s-90s", "its own pool (PREVIEW becomes PLAY FIVE automatically at 5 verified stars)");
 assert.equal(soul.cinematic, M.soulLegends);
 assert.ok(existsSync(new URL("." + soul.artwork, publicDir)), "artwork packaged");
 assert.equal(genrePreview("music", "rnb-soul"), null, "no 'R&B & Soul' route");
});

test("Electronic / DJ and Global Music Icons: their own clips and watched ids, on the shared genre-page system", () => {
 assert.equal(M.electronicDj.id, "music-electronic-dj"); assert.equal(file(M.electronicDj), "electronic_dj_intro.mp4");
 assert.equal(M.globalIcons.id, "music-global-icons"); assert.equal(file(M.globalIcons), "global_music_icons_intro.mp4");
 assert.equal(genreIntro("music", "electronic"), M.electronicDj); assert.equal(genreIntro("music", "global-icons"), M.globalIcons);
 for (const [key, clip] of [["electronic", M.electronicDj], ["global-icons", M.globalIcons]] as const) {
  const g = genrePreview("music", key)!;
  assert.equal(g.cinematic, clip, `${key}: first visit plays its own intro (the page's Replay Intro uses the same clip)`);
  assert.equal(previewForSubcategory("music", key), g, `${key}: its list row links to this page`);
  for (const other of ALL_CINEMATICS.filter(c => c !== clip)) assert.notEqual(other.id, clip.id);
 }
 assert.ok(!Object.values(LEVEL_INTROS).includes(M.electronicDj) && !Object.values(LEVEL_INTROS).includes(M.globalIcons), "not Adventure level intros");
});

test("Sports World: one world cinematic shared by the Sports page and the Adventure tab; posters, never per-sport clips", () => {
 assert.equal(WORLD_INTROS.sports, S.intro); assert.equal(S.intro.id, "sports-world"); assert.equal(S.intro.role, "sports-world");
 assert.equal(S.intro.src, "/videos/sports-world/sports_world_intro.mp4");
 assert.ok(adventure.worlds.some(w => w.id === "sports"), "the Adventure Sports World shares the same watched id, so it never plays twice");
 const sportsSubs = taxonomy.categories.find(c => c.key === "sports")!.subcategories.map(s => s.key);
 for (const sub of sportsSubs) assert.equal(genreIntro("sports", sub), null, `${sub}: no separate sport MP4`);
 const posters = Object.fromEntries(GENRE_PREVIEWS.filter(g => g.category === "sports" && g.artwork).map(g => [g.key, file({ src: g.artwork! })]));
 assert.deepEqual(GENRE_PREVIEWS.filter(g => g.category === "sports" && !g.artwork).map(g => g.key), ["cricket", "gymnastics", "racket-sports", "winter-sports"], "sports without a supplied poster get a text-only hero page");
 assert.deepEqual(posters, { football: "football.webp", basketball: "basketball.webp", baseball: "baseball.webp", "american-football": "american_football.webp", tennis: "tennis.webp",
  "track-field": "track_field.webp", boxing: "boxing.webp", mma: "mma.webp", "formula-1": "formula_1.webp" });
 for (const g of GENRE_PREVIEWS.filter(g => g.category === "sports")) { assert.equal(g.cinematic, null); if (g.artwork) assert.deepEqual(g.artworkSize, [941, 1672], "poster keeps its own aspect ratio"); }
 assert.equal(WORLD_POSTERS.sports.src, "/images/sports-world/sports_world.webp");
 const images = readdirSync(new URL("images/sports-world/", publicDir)).filter(f => f !== "SOURCES.txt").sort();
 assert.deepEqual(images, [...Object.values(posters), "sports_world.webp"].sort(), "every packaged poster is used; WebP only, no PNG twins");
 const hashes = images.map(f => createHash("md5").update(readFileSync(new URL("images/sports-world/" + f, publicDir))).digest("hex"));
 assert.equal(new Set(hashes).size, images.length, "no duplicate posters");
});
