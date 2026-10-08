import { calculateDistanceKm } from "./distance.ts";
import type { Coordinates } from "../../types/game.ts";

// Landing worlds: the themed scene the city phase plays in. More biomes can be added here and in landing-worlds.json.
export const BIOMES = ["desert", "rainforest", "snow", "neutral"] as const;
export type Biome = typeof BIOMES[number];

export interface BiomeStyle {
 title: string; land: string; landEdge: string; ocean: string; dim: string; label: string; halo: string;
 sky: string; horizon: string; fog: string; accent: string;
 cliff: readonly [string, string, string]; // island slab, top to bottom (landing diorama)
}
// Map palette per biome (MapLibre paint + sky) and the banner title.
export const BIOME_STYLE: Readonly<Record<Biome, BiomeStyle>> = {
 desert: { title: "DESERT", land: "#c99a52", landEdge: "#f3d18a", ocean: "#1d5566", dim: "#2a1a0c", label: "#fff6dc", halo: "#5a3612",
  sky: "#ffb35c", horizon: "#ffe2a6", fog: "#f2b878", accent: "#ffd27a", cliff: ["#a8693a", "#7a4a26", "#4a2a14"] },
 rainforest: { title: "RAINFOREST", land: "#2f7a45", landEdge: "#9be38a", ocean: "#14465a", dim: "#06180f", label: "#eaffe6", halo: "#0b2a17",
  sky: "#3f8f6a", horizon: "#c8f2c4", fog: "#9fd8b0", accent: "#8dff9a", cliff: ["#5a4a2a", "#3d3220", "#241c12"] },
 snow: { title: "SNOW & ICE", land: "#dde9f3", landEdge: "#ffffff", ocean: "#244a6e", dim: "#0b1830", label: "#0c2440", halo: "#ffffff",
  sky: "#5d8fd1", horizon: "#e4f2ff", fog: "#c8dcf2", accent: "#9fe8ff", cliff: ["#9fc3e6", "#6f93bd", "#3f5f8a"] },
 neutral: { title: "CITY LIGHTS", land: "#56609e", landEdge: "#a9c4ff", ocean: "#173a52", dim: "#081224", label: "#ffffff", halo: "#1a1a3a",
  sky: "#2a4f86", horizon: "#ffd9a8", fog: "#7f9fc0", accent: "#5cf2ff", cliff: ["#3a3f7a", "#2a2c5c", "#1a1a3a"] },
};

export interface LandingPlace { city: string; countryCode: string; latitude: number; longitude: number; biome: Exclude<Biome, "neutral">; koppen: string; aurora?: boolean }
export interface LandingWorlds { source: string; places: LandingPlace[] }
export interface LandingWorld { biome: Biome; curated: boolean; source: string | null; koppen: string | null; aurora: boolean }

/** Matches the answer to a curated place (same country, within 30 km). Anything unlisted lands in the neutral city world. */
export function landingWorldFor(data: LandingWorlds, answer: { coordinates: Coordinates; countryCode?: string }): LandingWorld {
 const place = data.places.find(p => p.countryCode === answer.countryCode &&
  calculateDistanceKm({ latitude: p.latitude, longitude: p.longitude }, answer.coordinates) <= 30);
 return place ? { biome: place.biome, curated: true, source: data.source, koppen: place.koppen, aurora: Boolean(place.aurora) }
  : { biome: "neutral", curated: false, source: null, koppen: null, aurora: false };
}
