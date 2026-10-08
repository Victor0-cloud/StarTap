"use client";
import { useEffect, useState } from "react";
import { MASCOTS, type MascotId } from "@/lib/game/mascots";
import type { Biome } from "@/lib/game/landing";
import { MascotImage } from "@/components/mascot/MascotImage";
import { CountryFlag } from "./CountryFlag";
import { BiomeIcon, GameIcon } from "./GameIcon";

export interface FinishRound {
 id: string; score: number; status: string; tone: "great" | "good" | "ok" | "miss";
 starName: string; city: string; country: string; km: number; biome: Biome;
 joker: boolean; lifeSaver: boolean; hint: boolean;
}
/** One label per score band, so the celebration matches the five without overselling it. */
export function performanceLabel(total: number): string {
 return total >= 4500 ? "LEGENDARY FIVE" : total >= 3500 ? "WORLD EXPLORER" : total >= 2500 ? "GREAT JOURNEY" : total >= 1500 ? "SO CLOSE" : "FIRST STEPS";
}
const reduced = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return true; } };

/** End-of-five hero: the chosen mascot, a count-up total, the five round cards and the places discovered. */
export function FinishSummary({ mascot, total, max, rounds, eyebrow, children }: { mascot: MascotId; total: number; max: number; rounds: FinishRound[]; eyebrow: string; children?: React.ReactNode }) {
 const [shown, setShown] = useState(() => reduced() ? total : 0);
 useEffect(() => {
  if (reduced()) return;
  const start = performance.now();
  let frame = requestAnimationFrame(function tick(now) {
   const t = Math.min((now - start) / 1200, 1);
   setShown(Math.round(total * (1 - Math.pow(1 - t, 3))));
   if (t < 1) frame = requestAnimationFrame(tick);
  });
  return () => cancelAnimationFrame(frame);
 }, [total]);
 const m = MASCOTS[mascot], label = performanceLabel(total), tier = total >= 3500 ? "high" : total >= 2500 ? "mid" : "low";
 return <div className="finish-summary" data-tier={tier} style={{ ["--mascot" as string]: m.color }}>
  <section className="finish-hero" aria-labelledby="finish-label">
   <span className="eyebrow">{eyebrow}</span>
   <div className="finish-mascot"><span className="finish-burst" aria-hidden="true" /><MascotImage id={mascot} kind="card" size={132} alt={`${m.name}, your travel buddy`} /></div>
   <h1 id="finish-label" className="finish-label">{label}</h1>
   <div className="final-score"><span className="final-count" aria-hidden="true">{shown.toLocaleString()}</span><strong className="visually-hidden">{total.toLocaleString()}</strong><small>/ {max.toLocaleString()} POINTS</small></div>
   <p className="finish-buddy">{m.name}: “{tier === "high" ? "What a journey! The world is yours." : tier === "mid" ? "Great trip! A few more cities to nail." : "Every miss is a new place. Again?"}”</p>
  </section>
  <ol className="round-strip" aria-label="Your five rounds">
   {rounds.map((r, i) => <li key={r.id} className={`round-card tone-${r.tone}`}>
    <span className="round-no">R{i + 1}</span><CountryFlag country={r.country} />
    <strong>{r.score}</strong><small>{r.status}</small>
    {(r.joker || r.lifeSaver) && <span className="round-rescue">{r.joker && <GameIcon name="joker" size={16} label="Joker used" />}{r.lifeSaver && <GameIcon name="lifesaver" size={16} label="Life Saver used" />}</span>}
   </li>)}
  </ol>
  {children}
  <h2 className="recap-heading">THE PLACES YOU DISCOVERED</h2>
  <div className="place-cards">
   {rounds.map(r => <div className="recap-row place-card" key={r.id}>
    <span className={`place-biome biome-${r.biome}`}><BiomeIcon biome={r.biome} size={22} /></span>
    <span className="place-main">{r.starName}<small className="recap-location"><CountryFlag country={r.country} /><span>{r.city}, {r.country} · {Math.round(r.km).toLocaleString()} km away{r.hint ? " · hint used" : ""}{r.joker ? " · Joker" : ""}{r.lifeSaver ? " · Life Saver" : ""}</span></small></span>
    <strong>+{r.score}</strong>
   </div>)}
  </div>
 </div>;
}
