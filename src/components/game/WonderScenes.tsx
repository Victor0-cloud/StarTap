import type { ReactNode } from "react";
import type { WonderTemplate } from "@/lib/game/wonder";

// Five original, hand-built SVG celebration scenes. Generic places and anonymous silhouettes only:
// no faces, no real people, logos, kits, posters or artwork are drawn or referenced.
// Motion lives in globals.css (.ws-*) and switches off under prefers-reduced-motion, leaving a finished still.

const W = 360, H = 240;
// Deterministic pseudo-random, so every render (and the reduced-motion still) is identical.
const rand = (i: number, salt = 1) => { const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453; return x - Math.floor(x); };

/** A row of anonymous crowd silhouettes; some have their arms up. */
function Crowd({ y, count, fill, scale = 1, salt = 1, cheer = 0.4 }: { y: number; count: number; fill: string; scale?: number; salt?: number; cheer?: number }) {
 const step = W / count;
 return <g className="ws-crowd" fill={fill}>
  {Array.from({ length: count }, (_, i) => {
   const x = i * step + step / 2 + (rand(i, salt) - 0.5) * step * 0.5, s = scale * (0.85 + rand(i, salt + 1) * 0.3), up = rand(i, salt + 2) < cheer;
   // Position on the outer group, motion on the inner one: a CSS transform would replace the SVG transform attribute.
   return <g key={i} transform={`translate(${x.toFixed(1)} ${y}) scale(${s.toFixed(2)})`}><g className={up ? "ws-cheer" : "ws-sway"} style={{ animationDelay: `${(rand(i, salt + 3) * 0.6).toFixed(2)}s` }}>
    <circle cx="0" cy="-26" r="6" />
    <path d="M-11 0 Q-11 -18 0 -19 Q11 -18 11 0 Z" />
    {up && <path d="M-8 -15 L-14 -34 M8 -15 L14 -34" stroke={fill} strokeWidth="3.5" strokeLinecap="round" />}
   </g></g>;
  })}
 </g>;
}

/** Twinkling star particles. */
function Stars({ count, salt, color = "#ffe16c", maxY = H * 0.6 }: { count: number; salt: number; color?: string; maxY?: number }) {
 return <g fill={color}>
  {Array.from({ length: count }, (_, i) => <g key={i} transform={`translate(${(rand(i, salt + 1) * W).toFixed(0)} ${(rand(i, salt + 2) * maxY).toFixed(0)}) scale(${(0.5 + rand(i, salt + 3)).toFixed(2)})`}>
   <path className="ws-twinkle" style={{ animationDelay: `${(rand(i, salt) * 1.6).toFixed(2)}s` }} d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" /></g>)}
 </g>;
}

/** Generic skyline with lit windows. */
function Skyline({ base, fill, windowColor, salt, tall = 70 }: { base: number; fill: string; windowColor: string; salt: number; tall?: number }) {
 let x = -6; const blocks: ReactNode[] = [];
 for (let i = 0; x < W; i++) {
  const w = 18 + rand(i, salt) * 26, h = 24 + rand(i, salt + 1) * tall;
  const windows = [];
  for (let wy = base - h + 6; wy < base - 6; wy += 9) for (let wx = x + 4; wx < x + w - 5; wx += 7) if (rand(wx + wy, salt + 2) > 0.55) windows.push(<rect key={`${wx}-${wy}`} x={wx} y={wy} width="3" height="4" />);
  blocks.push(<g key={i}><rect x={x} y={base - h} width={w} height={h} fill={fill} /><g fill={windowColor} className="ws-windows">{windows}</g></g>);
  x += w + 2;
 }
 return <g>{blocks}</g>;
}

function Sky({ id, stops }: { id: string; stops: [string, string, string] }) {
 return <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={stops[0]} /><stop offset=".6" stopColor={stops[1]} /><stop offset="1" stopColor={stops[2]} /></linearGradient></defs>
  <rect width={W} height={H} fill={`url(#${id})`} /></>;
}

function MusicScene() {
 return <>
  <Sky id="ws-music-sky" stops={["#120a2e", "#2a1050", "#0b1a33"]} />
  <Stars count={18} salt={3} color="#e9ff6b" maxY={90} />
  <Skyline base={150} fill="#1b1440" windowColor="#ff7ad966" salt={5} tall={50} />
  {/* Stage lights sweeping over the crowd */}
  <g className="ws-beams" style={{ mixBlendMode: "screen" }}>
   <polygon className="ws-beam ws-beam-a" points="70,40 40,200 110,200" fill="#e9ff6b33" />
   <polygon className="ws-beam ws-beam-b" points="180,30 140,200 220,200" fill="#5ce1ff33" />
   <polygon className="ws-beam ws-beam-c" points="290,40 250,200 320,200" fill="#ff7ad933" />
  </g>
  <rect x="40" y="36" width="280" height="6" rx="3" fill="#2d2160" />
  {[70, 180, 290].map((x, i) => <circle key={x} cx={x} cy="42" r="5" fill={["#e9ff6b", "#5ce1ff", "#ff7ad9"][i]} className="ws-glow" />)}
  {/* Stage and equaliser */}
  <rect x="60" y="150" width="240" height="18" rx="4" fill="#24174d" />
  <g className="ws-eq" fill="#5ce1ff">{Array.from({ length: 14 }, (_, i) => <rect key={i} x={84 + i * 14} y="128" width="8" height="22" rx="2" style={{ animationDelay: `${(rand(i, 9) * 0.5).toFixed(2)}s` }} />)}</g>
  <ellipse cx="180" cy="236" rx="230" ry="46" fill="#ff7ad9" opacity=".28" />
  <Crowd y={214} count={13} fill="#090616" salt={11} cheer={0.55} />
  <Crowd y={240} count={10} fill="#05030d" scale={1.3} salt={13} cheer={0.5} />
  <g fill="#ff7ad9" opacity=".8">{Array.from({ length: 10 }, (_, i) => <rect key={i} className="ws-confetti" x={rand(i, 21) * W} y="-8" width="4" height="7" style={{ animationDelay: `${(rand(i, 22) * 2).toFixed(2)}s` }} />)}</g>
 </>;
}

function SportsScene() {
 return <>
  <Sky id="ws-sports-sky" stops={["#06142a", "#0d2a4a", "#0d2a4a"]} />
  <Stars count={10} salt={4} color="#ffffff" maxY={50} />
  {/* Floodlights */}
  {[40, 320].map(x => <g key={x}><rect x={x - 2} y="20" width="4" height="70" fill="#1d3554" /><rect x={x - 16} y="12" width="32" height="12" rx="2" fill="#fefbe0" className="ws-glow" />
   <polygon points={`${x - 16},24 ${x + 16},24 ${x > 180 ? 200 : 260},170 ${x > 180 ? 100 : 160},170`} fill="#fefbe014" /></g>)}
  {/* Stands full of fans; flashes pop across them */}
  <path d="M0 70 Q180 40 360 70 L360 132 L0 132 Z" fill="#132a46" />
  <g fill="#2e4d72">{Array.from({ length: 90 }, (_, i) => <circle key={i} cx={(i % 30) * 12.4 + 6} cy={78 + Math.floor(i / 30) * 16 - Math.sin(((i % 30) / 30) * Math.PI) * 14} r="3.2" />)}</g>
  <g fill="#ffffff">{Array.from({ length: 8 }, (_, i) => <circle key={i} className="ws-flash" cx={rand(i, 31) * W} cy={70 + rand(i, 32) * 50} r="2.5" style={{ animationDelay: `${(rand(i, 33) * 2).toFixed(2)}s` }} />)}</g>
  {/* A generic pitch: no club, league or kit markings */}
  <path d="M-20 240 L60 132 L300 132 L380 240 Z" fill="#1f7a46" />
  <path d="M30 240 L84 132 M330 240 L276 132" stroke="#2a8c53" strokeWidth="26" opacity=".6" />
  <path d="M-20 240 L60 132 L300 132 L380 240 M180 132 L180 240" stroke="#e8ffe0aa" strokeWidth="2" fill="none" />
  <ellipse cx="180" cy="180" rx="44" ry="16" stroke="#e8ffe0aa" strokeWidth="2" fill="none" />
  {/* Star-ball arcing into the top corner, with a glowing trail */}
  <path d="M90 214 Q180 40 284 120" stroke="#e9ff6b" strokeWidth="3" strokeDasharray="6 7" fill="none" className="ws-trail" />
  <g className="ws-ball"><circle cx="284" cy="120" r="9" fill="#ffe16c" /><path d="M284 113 L286 118 L291 118 L287 121 L289 126 L284 123 L279 126 L281 121 L277 118 L282 118 Z" fill="#7a4b00" /></g>
  <Crowd y={240} count={11} fill="#04101e" scale={1.25} salt={17} cheer={0.65} />
 </>;
}

function ScreenScene() {
 return <>
  <Sky id="ws-screen-sky" stops={["#0b0820", "#1d0f33", "#2a0f22"]} />
  <Stars count={14} salt={6} maxY={70} />
  {/* Searchlights crossing the sky */}
  <g style={{ mixBlendMode: "screen" }}>
   <polygon className="ws-search ws-search-a" points="90,150 60,0 120,0" fill="#ffe16c22" />
   <polygon className="ws-search ws-search-b" points="270,150 240,0 300,0" fill="#5ce1ff22" />
  </g>
  {/* A generic premiere marquee: lights only, no title or studio mark */}
  <rect x="96" y="56" width="168" height="54" rx="6" fill="#2a1438" stroke="#ffe16c" strokeWidth="2" />
  <g fill="#ffe16c">{Array.from({ length: 20 }, (_, i) => <circle key={i} className="ws-bulb" cx={102 + i * 8.3} cy="62" r="2" style={{ animationDelay: `${(i % 4) * 0.15}s` }} />)}</g>
  <g fill="#ffe16c">{Array.from({ length: 20 }, (_, i) => <circle key={i} className="ws-bulb" cx={102 + i * 8.3} cy="104" r="2" style={{ animationDelay: `${((i + 2) % 4) * 0.15}s` }} />)}</g>
  <g fill="#ffe16c">{[150, 180, 210].map((x, i) => <path key={x} transform={`translate(${x} 83) scale(${i === 1 ? 1.5 : 1.1})`} d="M0 -8 L2.4 -2.5 L8 -2.5 L3.5 1 L5 7 L0 3.5 L-5 7 L-3.5 1 L-8 -2.5 L-2.4 -2.5 Z" />)}</g>
  {/* Red carpet in perspective, with velvet ropes */}
  <path d="M150 120 L210 120 L300 240 L60 240 Z" fill="#b3123a" />
  <path d="M150 120 L210 120 L300 240 L60 240 Z" fill="url(#ws-carpet-shine)" />
  <defs><linearGradient id="ws-carpet-shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity=".5" /><stop offset="1" stopColor="#ff4d6d" stopOpacity=".15" /></linearGradient></defs>
  {[[118, 140, 46, 232], [242, 140, 314, 232]].map(([x1, y1, x2, y2], k) => <g key={k}>
   {[0, 0.33, 0.66, 1].map(t => { const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t, h = 12 + t * 14; return <rect key={t} x={x - 1.5} y={y - h} width="3" height={h} fill="#e8c35a" />; })}
   <path d={`M${x1} ${y1 - 10} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + 6} ${x2} ${y2 - 24}`} stroke="#7a1030" strokeWidth="3" fill="none" />
  </g>)}
  {/* Photographers: anonymous silhouettes with camera flashes */}
  {[[24, 196, 1.1], [62, 214, 1.25], [298, 214, 1.25], [336, 196, 1.1]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`} fill="#07040f">
   <circle cx="0" cy="-30" r="7" /><path d="M-13 6 Q-13 -20 0 -21 Q13 -20 13 6 Z" /><rect x={i < 2 ? 4 : -14} y="-34" width="10" height="7" rx="1" />
   <circle className="ws-flash" cx={i < 2 ? 12 : -12} cy="-31" r="6" fill="#ffffff" style={{ animationDelay: `${i * 0.37}s` }} />
  </g>)}
 </>;
}

function CountryScene() {
 return <>
  <Sky id="ws-country-sky" stops={["#1a2a5a", "#d9746a", "#f6c56b"]} />
  <circle cx="250" cy="118" r="34" fill="#ffe7a3" className="ws-sun" />
  <Stars count={8} salt={8} color="#ffffff" maxY={60} />
  {/* Layered landscape: mountains, hills, a winding river */}
  <path d="M0 140 L50 96 L86 124 L140 78 L196 130 L246 92 L300 128 L360 100 L360 240 L0 240 Z" fill="#3a3f72" />
  <path d="M0 160 Q70 128 140 154 T280 146 T360 150 L360 240 L0 240 Z" fill="#2c6a5a" />
  <path d="M0 186 Q90 160 180 182 T360 176 L360 240 L0 240 Z" fill="#1f5040" />
  <path d="M200 240 Q170 214 206 198 T190 168" stroke="#7fd6e6" strokeWidth="9" fill="none" opacity=".75" strokeLinecap="round" />
  {/* Trees and a small village */}
  <g fill="#143a2e">{[30, 52, 300, 322, 344].map((x, i) => <path key={x} d={`M${x} ${172 + (i % 2) * 4} l9 -24 l9 24 Z`} />)}</g>
  <g>{[[90, 176], [112, 180], [134, 175]].map(([x, y], i) => <g key={i}><rect x={x} y={y - 12} width="16" height="12" fill="#f3d9b1" /><path d={`M${x - 2} ${y - 12} L${x + 8} ${y - 21} L${x + 18} ${y - 12} Z`} fill="#b75d43" /><rect x={x + 6} y={y - 7} width="4" height="7" fill="#7a3d2b" /></g>)}</g>
  {/* Lanterns on a string: a festive glow that belongs to no single culture */}
  <path d="M0 40 Q90 70 180 44 T360 46" stroke="#ffffff55" strokeWidth="1" fill="none" />
  {[40, 90, 140, 220, 270, 320].map((x, i) => <circle key={x} className="ws-bulb" cx={x} cy={52 + Math.sin(i) * 6} r="4" fill={["#e9ff6b", "#ffe16c", "#5ce1ff"][i % 3]} style={{ animationDelay: `${i * 0.2}s` }} />)}
  <ellipse cx="180" cy="236" rx="230" ry="46" fill="#ffd27a" opacity=".22" />
  <Crowd y={240} count={9} fill="#0b1f1a" scale={1.2} salt={19} cheer={0.5} />
 </>;
}

function CityScene() {
 return <>
  <Sky id="ws-city-sky" stops={["#060f24", "#0f2348", "#163564"]} />
  <Stars count={16} salt={10} maxY={70} />
  <Skyline base={168} fill="#0f2240" windowColor="#5ce1ff55" salt={7} tall={70} />
  <Skyline base={176} fill="#0a1830" windowColor="#ffe16c88" salt={12} tall={95} />
  {/* Roads with moving light trails */}
  <rect x="0" y="176" width={W} height="64" fill="#0a1426" />
  <path d="M-20 240 L150 176 M380 240 L210 176" stroke="#16243c" strokeWidth="30" />
  <path className="ws-traffic" d="M-20 236 L150 178" stroke="#ffe16c" strokeWidth="2.5" strokeDasharray="10 16" />
  <path className="ws-traffic ws-traffic-b" d="M380 236 L210 178" stroke="#ff5c7a" strokeWidth="2.5" strokeDasharray="10 16" />
  <path className="ws-traffic" d="M0 210 L360 206" stroke="#5ce1ff" strokeWidth="2" strokeDasharray="14 22" />
  {/* Landing pin with a pulse ring */}
  <ellipse className="ws-ring" cx="180" cy="196" rx="26" ry="8" fill="none" stroke="#e9ff6b" strokeWidth="2" />
  <g className="ws-pin"><path d="M180 194 C166 172 164 164 164 158 a16 16 0 0 1 32 0 c0 6 -2 14 -16 36 Z" fill="#e9ff6b" /><circle cx="180" cy="158" r="6" fill="#0a1830" /></g>
  <ellipse cx="180" cy="236" rx="230" ry="46" fill="#5ce1ff" opacity=".2" />
  <Crowd y={240} count={12} fill="#030913" scale={1.1} salt={23} cheer={0.35} />
 </>;
}

const SCENES: Record<WonderTemplate, () => ReactNode> = { music: MusicScene, sports: SportsScene, screen: ScreenScene, country: CountryScene, city: CityScene };

export function WonderScene({ template }: { template: WonderTemplate }) {
 return <svg className="wonder-scene-art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">{SCENES[template]()}</svg>;
}
