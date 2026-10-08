import type { Biome } from "@/lib/game/landing";

// App-drawn icons for anything that matters to play (Joker, Life Saver, clue, biome). Platform emoji vary by device
// and may be missing, so they are only ever decorative elsewhere.
const PATHS = {
 joker: `<rect x="5" y="3" width="14" height="18" rx="3" fill="#fff" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.2l1.4 2.9 3.2.4-2.3 2.2.6 3.2L12 14.4l-2.9 1.5.6-3.2-2.3-2.2 3.2-.4z" fill="currentColor"/>`,
 lifesaver: `<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="4"/><path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4" stroke="#fff" stroke-width="3"/><circle cx="12" cy="12" r="8.5" fill="none" stroke="#0003" stroke-width=".8"/>`,
 clue: `<path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V17h5v-1.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z" fill="currentColor"/><rect x="9.5" y="18" width="5" height="2.6" rx="1" fill="currentColor"/>`,
 desert: `<circle cx="17" cy="7" r="3" fill="currentColor"/><path d="M2 19c3-5 6-6 9-3 2-3 6-4 11 3z" fill="currentColor"/>`,
 rainforest: `<path d="M12 21v-9" stroke="currentColor" stroke-width="2"/><path d="M12 12c-2-4-6-5-9-4 3 0 6 2 9 4zm0 0c2-4 6-5 9-4-3 0-6 2-9 4zm0 0c-1-4 0-7 3-9-1 3-2 6-3 9z" fill="currentColor"/>`,
 snow: `<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5" stroke="currentColor" stroke-width="1.6" fill="none"/>`,
 neutral: `<path d="M3 21V11h4v10M8 21V5h5v16M14 21V9h4v12M19 21v-7h2v7" fill="currentColor"/>`,
} as const;
export type GameIconName = keyof typeof PATHS;

/** Inline SVG markup, for places that build HTML strings (map markers). Fixed local markup only. */
export const iconSvg = (name: GameIconName, size = 18) =>
 `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`;

export function GameIcon({ name, size = 18, label, className }: { name: GameIconName; size?: number; label?: string; className?: string }) {
 return <svg className={`game-icon game-icon-${name}${className ? " " + className : ""}`} viewBox="0 0 24 24" width={size} height={size}
  role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false"
  dangerouslySetInnerHTML={{ __html: (label ? `<title>${label}</title>` : "") + PATHS[name] }} />;
}
export const BiomeIcon = ({ biome, size }: { biome: Biome; size?: number }) => <GameIcon name={biome} size={size} label={{ desert: "Desert", rainforest: "Rainforest", snow: "Snow", neutral: "City" }[biome]} />;
