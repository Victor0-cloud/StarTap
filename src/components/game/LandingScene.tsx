import { memo, type ReactNode } from "react";
import type { Biome } from "@/lib/game/landing";

// Landing diorama art (original SVG). The 3D island itself is drawn by the map (GameMap); this file paints what surrounds
// it: a BACKDROP behind the map (sky, horizon, distant silhouettes) and a FOREGROUND frame in front of it (near terrain
// and a few particles). Landscapes only: no people, real landmarks, logos or cultural motifs.
// Motion lives in globals.css (.ls-*) and stops under prefers-reduced-motion, leaving a still scene.
// Performance: lights, stars and particles animate as three groups (.ls-g0–2), never one element at a time, and the
// layers are memoised so React never re-renders the scenery while the player taps.
const rand = (i: number, salt: number) => { const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453; return x - Math.floor(x); };
const W = 400, H = 300;

function Sky({ id, stops }: { id: string; stops: [string, string, string, string] }) {
 return <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stopColor={stops[0]} /><stop offset=".32" stopColor={stops[1]} /><stop offset=".5" stopColor={stops[2]} /><stop offset="1" stopColor={stops[3]} /></linearGradient></defs>
  <rect width={W} height={H} fill={`url(#${id})`} /></>;
}
/** A light band that fades out at both edges (never a hard line across the scene). */
function Band({ id, y, h, color, opacity, className }: { id: string; y: number; h: number; color: string; opacity: number; className?: string }) {
 return <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity="0" /><stop offset=".5" stopColor={color} stopOpacity={opacity} /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
  <rect className={className} y={y} width={W} height={h} fill={`url(#${id})`} /></>;
}
const ridge = (y: number, amp: number, step: number, salt: number) => {
 let d = `M0 ${H} L0 ${y}`;
 for (let x = 0; x <= W; x += step) d += ` L${x} ${(y - rand(x, salt) * amp).toFixed(1)}`;
 return d + ` L${W} ${H} Z`;
};
const smooth = (y: number, amp: number, waves: number, phase: number) => {
 let d = `M0 ${H} L0 ${y}`;
 for (let x = 0; x <= W; x += 10) d += ` L${x} ${(y - Math.sin(x / W * Math.PI * waves + phase) * amp).toFixed(1)}`;
 return d + ` L${W} ${H} Z`;
};
function Skyline({ y, salt, fill, windows, step = 22, tall = 50 }: { y: number; salt: number; fill: string; windows?: string; step?: number; tall?: number }) {
 const blocks: ReactNode[] = [<rect key="base" y={y} width={W} height={H - y} fill={fill} />];
 const lit: ReactNode[][] = [[], [], []];
 for (let x = -4, i = 0; x < W; i++) {
  const w = step * (0.6 + rand(i, salt) * 0.8), h = 12 + rand(i, salt + 1) * tall;
  blocks.push(<rect key={`b${i}`} x={x} y={y - h} width={w} height={h} fill={fill} />);
  if (windows) for (let wy = y - h + 4; wy < y - 3; wy += 7) for (let wx = x + 3; wx < x + w - 3; wx += 6) if (rand(wx * 3 + wy, salt + 2) > 0.62)
   lit[((Math.floor(wx + wy) % 3) + 3) % 3].push(<rect key={`w${i}-${wx}-${wy}`} x={wx} y={wy} width="2.4" height="3" />);
  x += w + 2;
 }
 return <g>{blocks}{windows && lit.map((g, k) => <g key={k} className={`ls-window ls-g${k}`} fill={windows}>{g}</g>)}</g>;
}
function Particles({ count, salt, className, color, size = [1.2, 2.6] }: { count: number; salt: number; className: string; color: string; size?: [number, number] }) {
 const groups: ReactNode[][] = [[], [], []];
 for (let i = 0; i < count; i++) groups[i % 3].push(<circle key={i} cx={(rand(i, salt) * W).toFixed(0)} cy={(rand(i, salt + 1) * H).toFixed(0)} r={(size[0] + rand(i, salt + 2) * (size[1] - size[0])).toFixed(1)} />);
 return <g fill={color}>{groups.map((g, k) => <g key={k} className={`${className} ls-g${k}`}>{g}</g>)}</g>;
}
function Stars({ count, salt, maxY }: { count: number; salt: number; maxY: number }) {
 const groups: ReactNode[][] = [[], [], []];
 for (let i = 0; i < count; i++) groups[i % 3].push(<circle key={i} cx={(rand(i, salt) * W).toFixed(0)} cy={(rand(i, salt + 1) * maxY).toFixed(0)} r={(0.5 + rand(i, salt + 2)).toFixed(1)} />);
 return <g fill="#fff">{groups.map((g, k) => <g key={k} className={`ls-twinkle ls-g${k}`}>{g}</g>)}</g>;
}

const BACKDROP: Record<Biome, (aurora: boolean) => ReactNode> = {
 desert: () => <>
  <Sky id="ld-sky-desert" stops={["#2a1a5e", "#7a3f8a", "#f08a4b", "#ffcf7a"]} />
  <Stars count={14} salt={2} maxY={70} />
  <defs><radialGradient id="ld-sun" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#fff2c2" /><stop offset=".5" stopColor="#ffd27a" stopOpacity=".7" /><stop offset="1" stopColor="#ffb35c" stopOpacity="0" /></radialGradient></defs>
  <circle className="ls-sun" cx="300" cy="118" r="60" fill="url(#ld-sun)" /><circle cx="300" cy="118" r="20" fill="#fff0c0" />
  <path d={smooth(132, 10, 3, 0.4)} fill="#b9668a" opacity=".55" />
  <path d={ridge(140, 16, 26, 7)} fill="#8f4d5a" opacity=".7" />
  <g fill="#6e3a4a" opacity=".8">{Array.from({ length: 9 }, (_, i) => <rect key={i} x={40 + i * 13 + rand(i, 3) * 6} y={140 - 6 - rand(i, 4) * 7} width={9} height={14} />)}</g>
  <path d={smooth(150, 9, 2.4, 1.2)} fill="#c27a4a" />
  <path d={smooth(162, 7, 3.2, 2.1)} fill="#d99a58" />
  <Band id="ld-haze-desert" className="ls-haze" y={128} h={46} color="#ffe2a6" opacity={0.45} />
 </>,
 rainforest: () => <>
  <Sky id="ld-sky-rain" stops={["#0b2a3a", "#16514f", "#2f8a6a", "#5fbf86"]} />
  <path d={smooth(128, 14, 2.2, 0.3)} fill="#2f6f5c" opacity=".6" />
  <path d={smooth(136, 12, 3, 1.4)} fill="#1f5a44" opacity=".85" />
  <g fill="#184a36">{Array.from({ length: 30 }, (_, i) => { const x = i * 14 + rand(i, 5) * 8, r = 9 + rand(i, 6) * 9; return <circle key={i} cx={x} cy={150 - rand(i, 7) * 8} r={r} />; })}</g>
  <path d="M0 168 C 80 160, 140 176, 220 166 S 340 158, 400 168 L400 176 C 330 168, 250 182, 190 174 S 70 168, 0 178 Z" fill="#7fd6e6" opacity=".55" />
  <g fill="#0f3a28">{Array.from({ length: 34 }, (_, i) => { const x = i * 12 + rand(i, 8) * 6, r = 7 + rand(i, 9) * 8; return <circle key={i} cx={x} cy={176 - rand(i, 10) * 6} r={r} />; })}</g>
  <Band id="ld-mist-rain" className="ls-mist" y={120} h={70} color="#c8f2c4" opacity={0.35} />
 </>,
 snow: aurora => <>
  <Sky id="ld-sky-snow" stops={["#0c1a40", "#2a4f8f", "#7fa7d8", "#dbe9f7"]} />
  <Stars count={26} salt={4} maxY={90} />
  {aurora && <g className="ls-aurora" opacity=".6">
   <path d="M0 50 C 80 20, 160 80, 240 40 S 360 20, 400 50 L400 82 C 320 60, 260 100, 180 70 S 60 60, 0 92 Z" fill="#5cf2b4" />
   <path d="M0 30 C 90 10, 170 50, 260 25 S 360 10, 400 35 L400 52 C 300 40, 250 66, 170 46 S 60 40, 0 56 Z" fill="#9f8bff" opacity=".7" /></g>}
  <path d={ridge(132, 38, 34, 11)} fill="#5c7fb4" />
  <path d={ridge(132, 38, 34, 11)} fill="#ffffff" opacity=".55" clipPath="url(#ld-caps)" />
  <defs><clipPath id="ld-caps"><rect y="0" width={W} height="112" /></clipPath></defs>
  <path d={ridge(150, 22, 22, 13)} fill="#8fb0dc" />
  <g fill="#3f6a8c">{Array.from({ length: 22 }, (_, i) => { const x = i * 19 + rand(i, 14) * 9; return <path key={i} d={`M${x} 170 l7 -20 l7 20 Z`} />; })}</g>
  <path d={smooth(172, 4, 2, 0.5)} fill="#e8f2fb" />
  <Band id="ld-frost-snow" y={120} h={60} color="#ffffff" opacity={0.3} />
 </>,
 neutral: () => <>
  <Sky id="ld-sky-city" stops={["#120a3a", "#3a2a8a", "#7a4fc4", "#ff9fb8"]} />
  <Stars count={22} salt={6} maxY={80} />
  <g stroke="#ffffff" strokeOpacity=".35" strokeWidth=".7" fill="none"><path d="M40 30 L62 22 L80 34 L104 26" /><path d="M260 18 L284 30 L300 20 L326 28 L340 16" /></g>
  <path d={smooth(118, 8, 2.6, 0.6)} fill="#2a2f7a" opacity=".9" />
  <path d={smooth(126, 6, 3.4, 1.9)} fill="#22286a" />
  <g fill="#181d52">{Array.from({ length: 30 }, (_, i) => { const x = i * 14 + rand(i, 31) * 8, hh = 6 + rand(i, 32) * 7; return <path key={i} d={`M${x} 130 l4 -${hh.toFixed(1)} l4 ${hh.toFixed(1)} Z`} />; })}</g>
  <Skyline y={150} salt={21} fill="#3a2f7a" step={20} tall={48} />
  <Skyline y={160} salt={23} fill="#251d5c" windows="#ffd27a" step={24} tall={60} />
  <path d="M40 160 Q 120 120 200 160 M200 160 Q 280 120 360 160" stroke="#5cc8ff" strokeWidth="2" fill="none" opacity=".7" />
  <g stroke="#5cc8ff" strokeWidth="1" opacity=".5">{[60, 90, 120, 150, 180, 220, 250, 280, 310, 340].map(x => <line key={x} x1={x} y1={160} x2={x} y2={160 - Math.sin(((x % 160) / 160) * Math.PI) * 38} />)}</g>
  <rect y="160" width={W} height="20" fill="#2a4f9a" opacity=".6" />
  <path className="ls-traffic" d="M0 171 L400 168" stroke="#ffd27a" strokeWidth="1.8" strokeDasharray="4 16" />
  <path className="ls-traffic" style={{ animationDirection: "reverse" }} d="M0 176 L400 173" stroke="#ff6a7a" strokeWidth="1.6" strokeDasharray="3 19" />
  <g className="ls-neon"><rect x="74" y="116" width="16" height="6" rx="1.5" fill="#ff7ad9" /><rect x="300" y="108" width="14" height="5" rx="1.5" fill="#5cf2ff" /><rect x="214" y="122" width="10" height="4" rx="1" fill="#ffe16c" /></g>
  <Band id="ld-glow-city" y={150} h={40} color="#ff7ad9" opacity={0.25} />
 </>,
};
const FOREGROUND: Record<Biome, () => ReactNode> = {
 desert: () => <>
  <path d="M0 300 L0 250 Q 40 236 90 252 Q 60 270 0 300 Z" fill="#b5803f" />
  <path d="M400 300 L400 244 Q 350 232 300 252 Q 350 268 400 300 Z" fill="#a8733a" />
  <path d="M10 268 Q 40 258 70 266 M330 262 Q 360 252 390 260" stroke="#ffe2a6" strokeWidth="1.2" fill="none" opacity=".6" />
  <path d="M30 258 l3 -10 l3 10 Z M360 252 l3 -8 l3 8 Z" fill="#6a8a3a" />
  <Particles count={18} salt={11} className="ls-sand" color="#ffe2a6" size={[0.7, 1.6]} />
 </>,
 rainforest: () => <g>
  <g fill="#0b2a18">{[0, 1, 2, 3].map(i => <path key={i} className="ls-sway" style={{ animationDelay: `${i * -0.7}s` }} d={`M${-10 + i * 18} -6 q 30 ${36 + i * 6} ${64 - i * 6} ${50 + i * 4} q -38 -4 -64 -50 Z`} />)}
   {[0, 1, 2, 3].map(i => <path key={`r${i}`} className="ls-sway" style={{ animationDelay: `${i * -0.5}s` }} d={`M${410 - i * 18} -6 q -30 ${36 + i * 6} ${-64 + i * 6} ${50 + i * 4} q 38 -4 64 -50 Z`} />)}</g>
  <path d="M0 300 L0 240 Q 18 222 28 252 Q 42 214 56 256 Q 74 230 84 268 L 92 300 Z" fill="#082414" />
  <path d="M400 300 L400 236 Q 382 218 370 250 Q 354 212 340 254 Q 320 228 310 266 L 302 300 Z" fill="#082414" />
  <Particles count={16} salt={13} className="ls-firefly" color="#d9ff8a" size={[1, 2.2]} />
 </g>,
 snow: () => <>
  <path d="M0 300 L0 252 Q 50 238 110 258 Q 70 276 0 300 Z" fill="#f4f9ff" />
  <path d="M400 300 L400 246 Q 340 236 290 258 Q 340 274 400 300 Z" fill="#eaf3fc" />
  <g fill="#9fe8ff" opacity=".8" className="ls-twinkle">{[[40, 262], [70, 270], [350, 258], [372, 268]].map(([x, y]) => <path key={x} d={`M${x} ${y} l3 -6 l3 6 l-3 6 Z`} />)}</g>
  <Particles count={34} salt={17} className="ls-snow" color="#ffffff" size={[0.9, 2.4]} />
 </>,
 neutral: () => <>
  <g fill="#0d0a2a">{[[0, 248, 34, 52], [30, 262, 26, 38], [356, 244, 44, 56], [330, 264, 28, 36]].map(([x, y, w, h]) => <rect key={x} x={x} y={y} width={w} height={h} />)}</g>
  <g fill="#ffd27a" className="ls-window ls-g1">{[[8, 256], [18, 266], [366, 252], [380, 262], [340, 272]].map(([x, y]) => <rect key={x} x={x} y={y} width="3" height="4" />)}</g>
  <g>{[60, 340].map(x => <g key={x}><rect x={x} y={262} width="2" height="38" fill="#3a2f7a" /><circle cx={x + 1} cy={262} r="5" fill="#5cc8ff" opacity=".7" className="ls-glow" /></g>)}</g>
  <Particles count={10} salt={19} className="ls-firefly" color="#ffe16c" size={[0.8, 1.6]} />
 </>,
};

/** Behind the 3D island: sky, horizon and distant scenery. */
export const LandingBackdrop = memo(function LandingBackdrop({ biome, aurora = false }: { biome: Biome; aurora?: boolean }) {
 return <div className={`landing-backdrop ls-${biome}`} aria-hidden="true"><svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMin slice">{BACKDROP[biome](aurora)}</svg></div>;
});
/** In front of the island: near terrain framing the corners, and a few particles. Never takes taps. */
export const LandingForeground = memo(function LandingForeground({ biome }: { biome: Biome }) {
 return <div className={`landing-foreground ls-${biome}`} aria-hidden="true"><svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">{FOREGROUND[biome]()}</svg></div>;
});
/** Both layers together, for previews (onboarding world cards). */
export function LandingScene({ biome, aurora = false }: { biome: Biome; aurora?: boolean }) {
 return <div className={`landing-scene ls-${biome}`} aria-hidden="true"><LandingBackdrop biome={biome} aurora={aurora} /><LandingForeground biome={biome} /></div>;
}
