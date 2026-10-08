import type { AdventureWorld } from "../../content/schema.ts";
import { levelStates, type AdventureProgress } from "./adventure.ts";

// Adventure cinematics: short portrait clips that introduce a world, its levels and genres, and its completion.
// Only clips that exist are listed; a world, level or genre without one simply keeps its normal screen.
export interface Cinematic { id: string; role: string; src: string; label: string }
const clip = (role: string, file: string, label: string, id = `music-world:${role}`, dir = "music-world"): Cinematic => ({ id, role, src: `/videos/${dir}/${file}`, label });

/** One entry per video. Each has its own watched id, so watching one never marks another as seen. */
export const MUSIC_CINEMATICS = {
 intro: clip("intro", "music_world_intro.mp4", "Music World intro"),
 globalPop: clip("global-pop", "global_pop_intro.mp4", "Global Pop intro"),
 soundsOfAfrica: clip("sounds-of-africa", "sounds_of_africa_intro.mp4", "Sounds of Africa intro"),
 hipHopRap: clip("hiphop-rap", "hiphop_rap_intro.mp4", "Hip-Hop & Rap intro"), // baked ending text reads "R&B & HIP-HOP / LEVEL 3" (CONTENT_TEXT_MISMATCH)
 rnb: clip("rnb", "rnb_hiphop_intro.mp4", "R&B intro"), // modern R&B keeps its existing clip
 latinCaribbean: clip("latin-caribbean", "latin_caribbean_intro.mp4", "Latin & Caribbean intro"),
 kpop: clip("kpop", "kpop_intro.mp4", "K-Pop intro"),
 amapiano: clip("amapiano", "amapiano_intro.mp4", "Amapiano intro"),
 reggaeDancehall: clip("reggae-dancehall", "reggae_dancehall_intro.mp4", "Reggae & Dancehall intro"),
 africanLegends: clip("african-legends", "african_music_legends_intro.mp4", "African Music Legends intro"),
 country: clip("country", "country_music_intro.mp4", "Country Music intro"),
 rock: clip("rock", "rock_music_intro.mp4", "Rock Music intro"),
 // 80s/90s Soul Legends: its own world. This file is a placeholder slot — an approved final cut can replace it under the same name.
 soulLegends: clip("soul-legends-80s-90s", "soul_legends_80s_90s_intro.mp4", "80s/90s Soul Legends intro", "music-soul-legends-80s-90s"),
 electronicDj: clip("electronic-dj", "electronic_dj_intro.mp4", "Electronic / DJ intro", "music-electronic-dj"), // baked signage reads "DJ PERFORMANCE"
 globalIcons: clip("global-icons", "global_music_icons_intro.mp4", "Global Music Icons intro", "music-global-icons"),
 complete: clip("complete", "music_world_complete.mp4", "Music World Complete"),
} as const;
const M = MUSIC_CINEMATICS;
/** Sports World has one world cinematic; each sport uses a still poster instead of its own clip. */
export const SPORTS_CINEMATICS = {
 intro: clip("sports-world", "sports_world_intro.mp4", "Sports World intro", "sports-world", "sports-world"),
} as const;
/**
 * The other worlds' entrance cinematics, on the Sports World pattern: one clip per world, its folder name doubling as
 * watched id and ?resetIntro= role. Keyed by canonical taxonomy category. The Historic Icons clip (baked title
 * "HISTORIC ICONS WORLD") introduces the World Icons category, whose first subcategory is Historic Icons.
 */
const entrance = (id: string, file: string, label: string) => clip(id, file, label, id, id);
export const WORLD_ENTRANCE_CINEMATICS = {
 screen: entrance("screen-world", "screen_world_intro.mp4", "Screen World intro"),
 icons: entrance("historic-icons", "historic_icons_intro.mp4", "Historic Icons intro"),
 tech: entrance("tech-innovation", "tech_innovation_intro.mp4", "Tech & Innovation intro"),
 fashion: entrance("fashion-beauty", "fashion_beauty_intro.mp4", "Fashion & Beauty intro"),
 business: entrance("business-money", "business_money_intro.mp4", "Business & Money intro"),
 creators: entrance("creators-internet", "creators_internet_intro.mp4", "Creators & Internet intro"),
 royalty: entrance("royalty-dynasties", "royalty_dynasties_intro.mp4", "Royalty & Dynasties intro"),
} as const;
export const ALL_CINEMATICS: readonly Cinematic[] = [...Object.values(M), ...Object.values(SPORTS_CINEMATICS), ...Object.values(WORLD_ENTRANCE_CINEMATICS)];

/** Music and Sports: the world intro on the world page, in the Adventure tab, and before that world's games. */
export const WORLD_INTROS: Readonly<Record<string, Cinematic>> = { music: M.intro, sports: SPORTS_CINEMATICS.intro };
/**
 * Every world's entrance on its category page: first visit plays it, then Replay Intro. The newer worlds' clips are
 * entrance-only — they never play before PLAY FIVE and are not Adventure intros.
 */
export const WORLD_ENTRANCE_INTROS: Readonly<Record<string, Cinematic>> = { ...WORLD_INTROS, ...WORLD_ENTRANCE_CINEMATICS };
/** Adventure levels, by their canonical level id in adventure.json. */
export const LEVEL_INTROS: Readonly<Record<string, Cinematic>> = {
 "music-1": M.globalPop, "music-2": M.soundsOfAfrica, "music-3": M.hipHopRap, "music-4": M.latinCaribbean,
 "music-5": M.kpop, // K-Pop: plays once that level opens (it is "coming soon" in the Adventure today)
};
/** Music World genre play (/category/music/play/?sub=…), by canonical taxonomy key. Genres without their own clip use their level's. */
export const GENRE_INTROS: Readonly<Record<string, Cinematic>> = {
 "music/pop": M.globalPop,
 "music/afrobeats": M.soundsOfAfrica, "music/amapiano": M.amapiano, "music/african-legends": M.africanLegends,
 "music/hip-hop": M.hipHopRap, "music/rnb": M.rnb,
 "music/latin": M.latinCaribbean, "music/reggae-dancehall": M.reggaeDancehall, "music/caribbean-music": M.latinCaribbean,
 "music/k-pop": M.kpop, "music/country": M.country, "music/rock": M.rock,
 "music/soul-legends-80s-90s": M.soulLegends, "music/electronic": M.electronicDj, "music/global-icons": M.globalIcons,
};
export const genreIntro = (category: string, subcategory: string | null | undefined) => subcategory ? GENRE_INTROS[`${category}/${subcategory}`] ?? null : null;
export const WORLD_COMPLETE: Readonly<Record<string, Cinematic>> = { music: M.complete };

/**
 * Genre preview pages (/category/<category>/genre/<key>/): the intro on first visit (when there is one), Replay Intro, and either
 * PLAY FIVE or an honest "coming soon" while a genre has too few verified stars. `subcategory` is the taxonomy pool it plays from
 * (null = no pool yet). Sports use the same page with a hero poster and no clip of their own.
 */
export interface GenrePreview { key: string; category: string; subcategory: string | null; title: string; subtitle: string; description: string; cinematic: Cinematic | null; artwork?: string; artworkSize?: readonly [number, number]; theme: string }
const SPORT_POSTER = [941, 1672] as const;
const sport = (key: string, title: string, subtitle: string, description: string, poster?: string): GenrePreview =>
 ({ key, category: "sports", subcategory: key, title, subtitle, description, cinematic: null, ...(poster ? { artwork: `/images/sports-world/${poster}.webp`, artworkSize: SPORT_POSTER } : {}), theme: "sports" });
export const GENRE_PREVIEWS: readonly GenrePreview[] = [
 { key: "soul-legends-80s-90s", category: "music", subcategory: "soul-legends-80s-90s", title: "80s/90s Soul Legends", subtitle: "Golden Voices. Timeless Soul.",
  description: "Powerful voices, slow grooves, classic harmonies, and the golden era of soul and R&B.", cinematic: M.soulLegends, artwork: "/images/music-world/soul_legends_80s_90s.webp", theme: "soul" },
 { key: "hip-hop", category: "music", subcategory: "hip-hop", title: "Hip-Hop & Rap", subtitle: "Bars, beats and the block.", description: "Rap stars and the cities that shaped their flow.", cinematic: M.hipHopRap, theme: "hiphop" },
 { key: "amapiano", category: "music", subcategory: "amapiano", title: "Amapiano", subtitle: "South African rhythm in motion.", description: "Log-drum grooves from South Africa to the world.", cinematic: M.amapiano, theme: "amapiano" },
 { key: "reggae-dancehall", category: "music", subcategory: "reggae-dancehall", title: "Reggae & Dancehall", subtitle: "Island rhythm.", description: "Sunset sounds and dancehall energy from the Caribbean.", cinematic: M.reggaeDancehall, theme: "reggae" },
 { key: "african-legends", category: "music", subcategory: "african-legends", title: "African Music Legends", subtitle: "The classic sounds of a continent.", description: "Heritage voices, live bands and the legends of African music.", cinematic: M.africanLegends, theme: "legends" },
 { key: "country", category: "music", subcategory: "country", title: "Country Music", subtitle: "Stories. Soul. Strings.", description: "Acoustic stories and the towns behind them.", cinematic: M.country, theme: "country" },
 // Every live Music genre has a landing page: its intro (first visit), Replay Intro, then a deliberate PLAY FIVE.
 { key: "pop", category: "music", subcategory: "pop", title: "Pop", subtitle: "Chart-toppers everywhere.", description: "Global pop stars and the towns that made them.", cinematic: M.globalPop, theme: "pop" },
 { key: "afrobeats", category: "music", subcategory: "afrobeats", title: "Afrobeats", subtitle: "The sound of Africa, worldwide.", description: "Afrobeats stars and the cities behind their sound.", cinematic: M.soundsOfAfrica, theme: "afrobeats" },
 { key: "rnb", category: "music", subcategory: "rnb", title: "R&B", subtitle: "Smooth voices, big stages.", description: "Modern R&B stars and where their stories began.", cinematic: M.rnb, theme: "rnb" },
 { key: "latin", category: "music", subcategory: "latin", title: "Latin", subtitle: "Ritmo without borders.", description: "Latin music stars and their home towns.", cinematic: M.latinCaribbean, theme: "latin" },
 { key: "k-pop", category: "music", subcategory: "k-pop", title: "K-Pop", subtitle: "Seoul to the world.", description: "K-Pop idols and the places they grew up.", cinematic: M.kpop, theme: "kpop" },
 { key: "rock", category: "music", subcategory: "rock", title: "Rock Music", subtitle: "Turn it up.", description: "Arena anthems and the bands behind them.", cinematic: M.rock, theme: "rock" },
 { key: "electronic", category: "music", subcategory: "electronic", title: "Electronic / DJ", subtitle: "Enter the sound.", description: "Decks, drops and the DJs who fill festival stages.", cinematic: M.electronicDj, theme: "electronic" },
 { key: "global-icons", category: "music", subcategory: "global-icons", title: "Global Music Icons", subtitle: "One world. Many voices.", description: "The biggest voices on the planet and the places they come from.", cinematic: M.globalIcons, theme: "global" },
 sport("football", "Football / Soccer", "Strike the moment.", "The world's game and the places its stars come from.", "football"),
 sport("basketball", "Basketball", "Own the rim.", "Hoops stars and the cities that raised them.", "basketball"),
 sport("baseball", "Baseball", "Step up to the plate.", "Big hitters and aces, and where they started.", "baseball"),
 sport("american-football", "American Football", "Power through.", "Gridiron stars and their hometowns.", "american_football"),
 sport("tennis", "Tennis", "Serve for glory.", "Grand Slam names and where their game began.", "tennis"),
 sport("track-field", "Track & Field", "Chase the finish.", "Sprinters, jumpers and the places they first ran.", "track_field"),
 sport("boxing", "Boxing", "Fight night.", "Champions of the ring and their home towns.", "boxing"),
 sport("mma", "MMA / UFC", "Enter the cage.", "Cage fighters and where they come from.", "mma"),
 sport("formula-1", "Formula 1", "Race the edge.", "Drivers and the places they first raced.", "formula_1"),
 // No poster supplied yet: same page, text-only hero.
 sport("cricket", "Cricket", "Every ball counts.", "Batting and bowling greats and where they grew up."),
 sport("gymnastics", "Gymnastics", "Flight and balance.", "Olympic and world champions and where they first trained."),
 sport("racket-sports", "Racket Sports", "Speed at the net.", "Badminton and squash greats and the places behind them."),
 sport("winter-sports", "Winter Sports", "Ice, snow and speed.", "Skiers, snowboarders and skaters and their home towns."),
];
/** The world poster shown on a category page (Sports World overview collage). */
export const WORLD_POSTERS: Readonly<Record<string, { src: string; size: readonly [number, number] }>> = { sports: { src: "/images/sports-world/sports_world.webp", size: SPORT_POSTER } };
export const genrePreview = (category: string, key: string) => GENRE_PREVIEWS.find(g => g.category === category && g.key === key) ?? null;
export const previewForSubcategory = (category: string, subcategory: string) => GENRE_PREVIEWS.find(g => g.category === category && g.subcategory === subcategory) ?? null;

// Watched clips are kept apart from Adventure progress, so a cinematic can never change scores or stars.
export const CINEMATICS_KEY = "startap:cinematics:v1";
export const SKIP_AFTER_MS = 750;
// Smooth start: the picture fades in once playback has really begun, and the sound ramps up instead of starting at full volume.
export const FADE_IN_MS = 420, REDUCED_FADE_MS = 180, AUDIO_RAMP_MS = 650;
// Earlier ids, mapped onto today's so a clip that was already watched is not forced again. "rnb-hiphop" was the clip the
// modern R&B genre still uses; Level 3's new rap clip has its own id, so it plays once.
const LEGACY_IDS: Readonly<Record<string, string>> = {
 "music-world-intro": M.intro.id, "music-1-intro": M.globalPop.id, "music-2-intro": M.soundsOfAfrica.id, "music-3-intro": M.rnb.id,
 "music-4-intro": M.latinCaribbean.id, "music-5-intro": M.kpop.id, "music-world-complete": M.complete.id, "music-world:rnb-hiphop": M.rnb.id,
};

/** Reads the watched list; anything malformed is treated as "nothing watched yet". */
export function readWatched(raw: string | null): Set<string> {
 try {
  const value = JSON.parse(raw ?? "[]");
  return new Set(Array.isArray(value) ? value.filter((x): x is string => typeof x === "string" && x.length < 64).map(x => LEGACY_IDS[x] ?? x) : []);
 } catch { return new Set(); }
}
export const withWatched = (watched: ReadonlySet<string>, id: string) => JSON.stringify([...new Set([...watched, id])]);
/** QA reset (`?resetIntro=`): "1" = this screen's own clip, a role (e.g. "hiphop-rap") = that clip, "all" = every cinematic. */
export function idsToReset(param: string | null, own: Cinematic | null): string[] {
 if (!param) return [];
 if (param === "1") return own ? [own.id] : [];
 if (param === "all") return ALL_CINEMATICS.map(c => c.id);
 const match = ALL_CINEMATICS.find(c => c.role === param);
 return match ? [match.id] : [];
}

/** A world is complete when every playable level in it has been finished ("coming soon" levels don't count). */
export function worldComplete(world: AdventureWorld, progress: AdventureProgress): boolean {
 const playable = levelStates(world, progress).filter(s => s.state !== "soon");
 return playable.length > 0 && playable.every(s => s.state === "done");
}

/** The completion clip plays only on the finish that completes the world, never on later replays. */
export function completionCinematic(world: AdventureWorld, before: AdventureProgress, after: AdventureProgress): Cinematic | null {
 return !worldComplete(world, before) && worldComplete(world, after) ? WORLD_COMPLETE[world.id] ?? null : null;
}
