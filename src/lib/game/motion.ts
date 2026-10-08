import type { MascotId } from "./mascots.ts";

// Movement personalities. The game logic (where the mascot goes, what scores) is shared; these profiles only decide HOW
// each mascot travels, which route it draws and what it says. A player should recognise the mascot from motion alone.

export type Outcome = "success" | "close" | "miss";
export interface RouteStyle {
 color: string; glow: string; width: number; glowWidth: number; dash: number[] | null; cap: "round" | "butt";
 blur: number; ahead: number; // ahead: how far the bright route runs in front of the mascot (Dash lights it up ahead)
}
export interface MotionProfile {
 travelMs: [min: number, max: number]; // scaled by on-screen distance
 curve: number;       // route bend, as a share of the distance (0 = straight)
 hops: number;        // hop arcs along the route (0 = glide)
 hopPx: number;       // hop height
 spinDeg: number;     // body rotation over the trip
 tilt: number;        // lean into the direction of travel (deg)
 ease: "spring" | "glide" | "rocket" | "float" | "stream" | "flare";
 dematerialize: boolean; // Pixel travels as a pixel stream
 route: RouteStyle;
 lines: Record<Outcome, string> & { retry: string; country: string };
}

export const MOTION: Readonly<Record<MascotId, MotionProfile>> = {
 sparkle: { travelMs: [520, 900], curve: 0.12, hops: 3, hopPx: 26, spinDeg: 0, tilt: 6, ease: "spring", dematerialize: false,
  route: { color: "#ffd84a", glow: "#ffb020", width: 4, glowWidth: 10, dash: [0.2, 2.2], cap: "round", blur: 3, ahead: 0 },
  lines: { success: "You found it!", close: "So close!", miss: "Almost!", retry: "Try again!", country: "Hop, hop — found it!" } },
 orbit: { travelMs: [620, 1000], curve: 0.22, hops: 0, hopPx: 14, spinDeg: 360, tilt: 0, ease: "glide", dematerialize: false,
  route: { color: "#5cc8ff", glow: "#2a7fd0", width: 3, glowWidth: 12, dash: null, cap: "round", blur: 5, ahead: 0 },
  lines: { success: "Destination confirmed.", close: "Nearly on course.", miss: "Let's re-orient.", retry: "Re-orienting…", country: "Course locked!" } },
 dash: { travelMs: [260, 460], curve: 0.03, hops: 0, hopPx: 6, spinDeg: 0, tilt: 18, ease: "rocket", dematerialize: false,
  route: { color: "#5cf2b4", glow: "#16c08a", width: 4, glowWidth: 9, dash: [3, 1.4], cap: "butt", blur: 2, ahead: 0.3 },
  lines: { success: "Too easy!", close: "Just short!", miss: "Too fast — try again!", retry: "Rewind!", country: "Zoom!" } },
 aura: { travelMs: [900, 1300], curve: 0.32, hops: 0, hopPx: 20, spinDeg: 0, tilt: 0, ease: "float", dematerialize: false,
  route: { color: "#ff9fe0", glow: "#c88bff", width: 7, glowWidth: 16, dash: null, cap: "round", blur: 8, ahead: 0 },
  lines: { success: "Beautiful landing.", close: "Close. Breathe.", miss: "Close. Stay calm.", retry: "Stay calm — here's a clue.", country: "Gently found." } },
 pixel: { travelMs: [560, 880], curve: 0.08, hops: 0, hopPx: 10, spinDeg: 0, tilt: 0, ease: "stream", dematerialize: true,
  route: { color: "#6dff8f", glow: "#1f9a52", width: 5, glowWidth: 9, dash: [1, 1], cap: "butt", blur: 1, ahead: 0 },
  lines: { success: "Data confirmed!", close: "Signal nearby…", miss: "New clue unlocked.", retry: "Hint projected.", country: "Match found!" } },
 nova: { travelMs: [600, 950], curve: 0.18, hops: 1, hopPx: 34, spinDeg: 180, tilt: 0, ease: "flare", dematerialize: false,
  route: { color: "#ffe16c", glow: "#c88bff", width: 4, glowWidth: 14, dash: [0.6, 1.4], cap: "round", blur: 6, ahead: 0 },
  lines: { success: "Wonder landing!", close: "Shining close!", miss: "One more shot!", retry: "Second-chance star!", country: "A star is found!" } },
};

export const outcomeOf = (tier: string): Outcome =>
 tier === "nailed" || tier === "city" || tier === "crowned" ? "success" : tier === "miss" ? "miss" : "close";

/** Trip duration for this mascot over a given on-screen distance. */
export function travelDuration(p: MotionProfile, pixels: number): number {
 const t = Math.min(1, Math.max(0, pixels / 500));
 return Math.round(p.travelMs[0] + (p.travelMs[1] - p.travelMs[0]) * t);
}

const ease = (kind: MotionProfile["ease"], t: number) => {
 switch (kind) {
  case "rocket": return 1 - Math.pow(1 - t, 4); // bursts off, brakes hard
  case "float": return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // slow in, slow out
  case "glide": return t * t * (3 - 2 * t);
  case "stream": return t;
  case "flare": return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  default: return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
 }
};

/** A curved route between two points (quadratic Bézier in lng/lat, bent sideways by the mascot's curve). */
export function routePoints(from: [number, number], to: [number, number], curve: number, samples = 28): [number, number][] {
 const [x0, y0] = from, [x1, y1] = to, dx = x1 - x0, dy = y1 - y0;
 const cx = (x0 + x1) / 2 - dy * curve, cy = (y0 + y1) / 2 + dx * curve;
 return Array.from({ length: samples + 1 }, (_, i) => {
  const t = i / samples, u = 1 - t;
  return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1];
 });
}

export interface TravelFrame { progress: number; lift: number; spin: number; tilt: number; opacity: number; scale: number }
/** Where the mascot is on its trip at time t (0–1) and how its body moves: hops, spin, lean, pixel stream. */
export function travelFrame(p: MotionProfile, t: number): TravelFrame {
 const k = Math.min(1, Math.max(0, t)), progress = ease(p.ease, k);
 const lift = p.hops > 0 ? Math.abs(Math.sin(Math.PI * p.hops * k)) * p.hopPx * (p.ease === "flare" ? 1 : 1 - k * 0.25) : Math.sin(Math.PI * k) * p.hopPx;
 const dissolve = p.dematerialize ? Math.sin(Math.PI * k) : 0; // Pixel: thins out mid-trip, rematerialises on arrival
 return { progress, lift, spin: p.spinDeg * progress, tilt: p.tilt * Math.sin(Math.PI * k), opacity: 1 - dissolve * 0.55, scale: 1 - dissolve * 0.4 };
}

/** The point at a given progress along the sampled route. */
export function pointAt(points: [number, number][], progress: number): [number, number] {
 const f = Math.min(1, Math.max(0, progress)) * (points.length - 1), i = Math.floor(f), r = f - i;
 const a = points[i], b = points[Math.min(points.length - 1, i + 1)];
 return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r];
}
