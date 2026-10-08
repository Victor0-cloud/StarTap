import type { ResultTier } from "./result.ts";

// Wonder Reveal: a short celebration scene after a standout moment. It celebrates the category, place or
// achievement, never a person: no names, faces or likenesses appear in a reveal.
export const WONDER_TYPES = ["music", "sports", "screen", "country", "city", "culture", "tech", "business", "fashion", "world_icon", "creator", "royalty"] as const;
export type WonderType = typeof WONDER_TYPES[number];
// First version: five reusable scene templates. Every type maps onto one of them.
export const WONDER_TEMPLATES = ["music", "sports", "screen", "country", "city"] as const;
export type WonderTemplate = typeof WONDER_TEMPLATES[number];
export const TEMPLATE_FOR: Readonly<Record<WonderType, WonderTemplate>> = {
 music: "music", sports: "sports", screen: "screen", country: "country", city: "city",
 culture: "country", world_icon: "country", tech: "city", business: "city", fashion: "screen", creator: "music", royalty: "screen",
};
export type WonderTrigger = "great_round" | "right_city" | "nailed_it" | "new_country" | "three_stars" | "level_cleared" | "challenge_complete" | "milestone";

export interface WonderReveal {
 type: WonderType;
 template: WonderTemplate;
 title: string;
 subtitle: string;
 trigger: WonderTrigger;
 badges: string[]; // short chips, e.g. "★ Music Star stamp"
 soundKey: "wonder";
 countryName?: string; // only for place-based scenes (flag stamp)
 rewardId: string; // unique per moment, so the same reward is never shown twice
}

export const GREAT_ROUND = 900; // points in one round
export const GREAT_GAME = 4000; // a category / World Mix five worth celebrating
export const IMPORTANT_MILESTONE = 3000; // 1,000 is too easy to celebrate with a full scene

const TYPE_FOR_CATEGORY: Readonly<Record<string, WonderType>> = {
 music: "music", sports: "sports", screen: "screen", tech: "tech", icons: "world_icon", business: "business", fashion: "fashion",
 creators: "creator", royalty: "royalty", culture: "culture", geography: "country", history: "world_icon", science: "tech", food: "culture", legends: "world_icon",
};
const TITLES: Readonly<Record<WonderTemplate, string>> = {
 music: "YOU FOUND THE BEAT!", sports: "WHAT A FINISH!", screen: "LIGHTS. CAMERA. STAR!", country: "COUNTRY DISCOVERED!", city: "CITY FOUND!",
};

export interface RoundMoment { tier: ResultTier; score: number; category?: string; countryName: string; newStamp?: { stampType: string; newCountry: boolean } | null; milestone?: number | null; roundKey: string }

/**
 * Picks a reveal for a locked round, or null for an ordinary round.
 * A standout round (900+, Right city, Nailed it) gets its category scene; a new country gets the country scene.
 */
export function roundWonder(m: RoundMoment): WonderReveal | null {
 const standout = m.score >= GREAT_ROUND || m.tier === "nailed" || m.tier === "city";
 const stampBadge = m.newStamp ? [`★ ${m.newStamp.stampType} stamp`] : [];
 if (standout) {
  const type = TYPE_FOR_CATEGORY[m.category ?? ""] ?? "city";
  const template = TEMPLATE_FOR[type];
  const trigger: WonderTrigger = m.tier === "nailed" ? "nailed_it" : m.tier === "city" ? "right_city" : "great_round";
  const title = template === "city" ? (m.tier === "nailed" ? "NAILED IT!" : "CITY FOUND!") : TITLES[template];
  return { type, template, title, subtitle: `+${m.score.toLocaleString("en-US")} PTS · ${m.countryName.toUpperCase()}`, trigger, soundKey: "wonder",
   badges: [...stampBadge, ...(m.newStamp?.newCountry ? [`${m.countryName} discovered`] : [])], countryName: m.countryName, rewardId: `round:${m.roundKey}` };
 }
 if (m.milestone && m.milestone >= IMPORTANT_MILESTONE) {
  const type = TYPE_FOR_CATEGORY[m.category ?? ""] ?? "city";
  return { type, template: TEMPLATE_FOR[type], title: "NEW WONDER UNLOCKED!", subtitle: `${m.milestone.toLocaleString("en-US")} POINTS REACHED`, trigger: "milestone", soundKey: "wonder",
   badges: ["♛ Crown earned", ...stampBadge], countryName: m.countryName, rewardId: `round:${m.roundKey}` };
 }
 if (m.newStamp?.newCountry) {
  return { type: "country", template: "country", title: TITLES.country, subtitle: `${m.countryName.toUpperCase()} DISCOVERED`, trigger: "new_country", soundKey: "wonder",
   badges: stampBadge, countryName: m.countryName, rewardId: `round:${m.roundKey}` };
 }
 return null;
}

export interface FinishMoment { total: number; category?: string; label: string; gameKey: string; adventure?: { stars: number; previousStars: number } }
/**
 * Reveal at the end of a game. Adventure: first time a level reaches 3 Wonder Stars, or its first clear.
 * Replays that earn nothing new get no reveal. Other modes: a great five (4,000+).
 */
export function finishWonder(m: FinishMoment): WonderReveal | null {
 const type = TYPE_FOR_CATEGORY[m.category ?? ""] ?? "city";
 const base = { type, template: TEMPLATE_FOR[type], soundKey: "wonder" as const, rewardId: `finish:${m.gameKey}` };
 const pts = `${m.total.toLocaleString("en-US")} / 5,000`;
 if (m.adventure) {
  const { stars, previousStars } = m.adventure;
  if (stars === 3 && previousStars < 3) return { ...base, title: "3 WONDER STARS!", subtitle: `${m.label.toUpperCase()}`, trigger: "three_stars", badges: ["★★★ Wonder Stars", pts] };
  if (previousStars === 0) return { ...base, title: "LEVEL CLEARED!", subtitle: `${m.label.toUpperCase()}`, trigger: "level_cleared", badges: [`${"★".repeat(stars)} Wonder Star${stars > 1 ? "s" : ""}`, pts] };
  return null;
 }
 if (m.total >= GREAT_GAME) return { ...base, title: "NEW WONDER UNLOCKED!", subtitle: m.label.toUpperCase(), trigger: "challenge_complete", badges: [pts] };
 return null;
}

/** At most this many round reveals per game, so a hot streak never turns into a reveal after every round. */
export const MAX_ROUND_REVEALS = 2;
export const allowRoundReveal = (shownThisGame: number) => shownThisGame < MAX_ROUND_REVEALS;

/** Text for a future Wonder Reveal share card. Category and place only; never a person or answer detail. */
export function wonderShareText(r: WonderReveal, worldLabel: string): string {
 return ["STARTAP · WONDER REVEAL", worldLabel, r.title, ...r.badges].join("\n");
}
