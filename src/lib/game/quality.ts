// Internal graphics quality (no user menu yet). AUTO picks a level from the device; an override can be stored for QA.
// Every level keeps the same geometry and gameplay; only particles, scenery motion, parallax and touchdown effects change.
export const QUALITY_KEY = "startap:quality";
export const QUALITY_LEVELS = ["high", "balanced", "reduced"] as const;
export type Quality = typeof QUALITY_LEVELS[number];

export interface DeviceHints { reducedMotion: boolean; deviceMemory?: number; cores?: number; saveData?: boolean; override?: string | null }

/** AUTO: reduced motion or data saver → reduced; ≤2 GB memory → reduced; ≤4 GB or ≤4 cores → balanced; else high. */
export function pickQuality(h: DeviceHints): Quality {
 if (h.override && (QUALITY_LEVELS as readonly string[]).includes(h.override)) return h.override as Quality;
 if (h.reducedMotion || h.saveData) return "reduced";
 if (h.deviceMemory !== undefined && h.deviceMemory <= 2) return "reduced";
 if ((h.deviceMemory !== undefined && h.deviceMemory <= 4) || (h.cores !== undefined && h.cores <= 4)) return "balanced";
 return "high";
}
