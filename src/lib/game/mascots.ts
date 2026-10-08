// The six travel buddies. Powers change presentation only (motion, celebrations, clutter, one verified clue);
// none of them changes a score or points at the answer.
export const MASCOT_IDS = ["sparkle", "orbit", "dash", "aura", "pixel", "nova"] as const;
export type MascotId = typeof MASCOT_IDS[number];
export const MASCOT_KEY = "startap:mascot:v1";
export const DEFAULT_MASCOT: MascotId = "sparkle";

export interface Mascot {
 id: MascotId; name: string; role: string; power: string; powerText: string;
 touchdown: string; rescue: string; color: string;
}
export const MASCOTS: Readonly<Record<MascotId, Mascot>> = {
 sparkle: { id: "sparkle", name: "Sparkle", role: "Balanced hopping guide", power: "CITY HOP", color: "#ffd84a",
  powerText: "Hops you from country to city with a clean, bouncy landing.", touchdown: "Golden hop and star ring", rescue: "Hop rewind!" },
 orbit: { id: "orbit", name: "Orbit", role: "World explorer", power: "GLOBE SPIN", color: "#5cc8ff",
  powerText: "Shows the continents and a compass so you always know which way you face.", touchdown: "Spiral descent and orbit rings", rescue: "Orbit rewind!" },
 dash: { id: "dash", name: "Dash", role: "Speed specialist", power: "FLASH LANDING", color: "#5cf2b4",
  powerText: "Faster flights and transitions, for players who like to move.", touchdown: "Speed streak and impact ring", rescue: "Speed reset!" },
 aura: { id: "aura", name: "Aura", role: "Precision helper", power: "STEADY AIM", color: "#ff9fe0",
  powerText: "Fewer labels and calmer motion in the city phase, for careful aim.", touchdown: "Gentle float and soft rings", rescue: "Calm pulse…" },
 pixel: { id: "pixel", name: "Pixel", role: "Trivia helper", power: "CLUE BURST", color: "#6dff8f",
  powerText: "Once per city, a small clue taken straight from the map data.", touchdown: "Hologram and pixel burst", rescue: "Hint projection!" },
 nova: { id: "nova", name: "Nova", role: "Victory specialist", power: "WONDER BURST", color: "#c88bff",
  powerText: "Bigger celebrations, crowns and fireworks when you win.", touchdown: "Starburst and crown flash", rescue: "Second-chance star!" },
};

export const isMascotId = (value: unknown): value is MascotId => typeof value === "string" && (MASCOT_IDS as readonly string[]).includes(value);
/** Saved choice, or Sparkle when nothing (or something invalid) is stored. */
export const readMascot = (raw: string | null): MascotId => isMascotId(raw) ? raw : DEFAULT_MASCOT;
export const mascotCard = (id: MascotId) => `/mascots/${id}-card.webp`;
export const mascotToken = (id: MascotId) => `/mascots/${id}-token.webp`;
/** In-world character art: a tight oval with a soft aura fade (see scripts/build-mascot-cutouts.mjs). */
export const mascotPortal = (id: MascotId) => `/mascots/${id}-portal.webp`;

/** Per-mascot motion: Dash moves faster, Aura moves calmly; everyone else uses the standard timing. */
export const motionScale = (id: MascotId) => id === "dash" ? 0.55 : id === "aura" ? 1.25 : 1;
/** Aura's STEADY AIM shows fewer city labels at each zoom step. */
export const cityTiersFor = (id: MascotId): readonly number[] => id === "aura" ? [5, 8, 12, 16] : [6, 15, 28, 40];
