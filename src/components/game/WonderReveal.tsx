"use client";
import { useEffect, useRef, useState } from "react";
import type { WonderReveal as Reveal } from "@/lib/game/wonder";
import { CountryFlag } from "./CountryFlag";
import { WonderScene } from "./WonderScenes";
import { DEFAULT_MASCOT, type MascotId } from "@/lib/game/mascots";
import { MascotImage } from "@/components/mascot/MascotImage";

const AUTO_CLOSE_MS = 4600;
const reducedMotion = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };

/**
 * A short celebration after a standout moment. It closes by itself after a few seconds, on SKIP, on Escape or on a tap
 * outside the card, so it never blocks the next round. ENJOY REVEAL keeps it open and replays the scene.
 * Under reduced motion it is a still scene with the same text and buttons.
 */
export function WonderReveal({ reveal, onClose, mascot = DEFAULT_MASCOT }: { reveal: Reveal; onClose: () => void; mascot?: MascotId }) {
 const [held, setHeld] = useState(false);
 const [replay, setReplay] = useState(0);
 const [still] = useState(reducedMotion);
 const skip = useRef<HTMLButtonElement>(null);
 const close = useRef(onClose);
 useEffect(() => { close.current = onClose; });
 useEffect(() => {
  skip.current?.focus({ preventScroll: true });
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close.current(); };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
 }, []);
 useEffect(() => {
  if (held) return;
  const timer = window.setTimeout(() => close.current(), AUTO_CLOSE_MS);
  return () => window.clearTimeout(timer);
 }, [held]);
 const place = reveal.template === "country" || reveal.template === "city" ? reveal.countryName : undefined;
 return <div className={`wonder-overlay wonder-${reveal.template}${still ? " wonder-still" : ""}`} data-trigger={reveal.trigger} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
  <section className="wonder-card" role="dialog" aria-modal="false" aria-labelledby="wonder-title" aria-describedby="wonder-sub">
   <div className="wonder-scene" key={replay}>
    <WonderScene template={reveal.template} />
    <MascotImage id={mascot} size={84} className="wonder-spark mascot-art" data-mascot={mascot} data-crowned={reveal.trigger === "three_stars" || reveal.trigger === "milestone" ? "" : undefined} />
    {mascot === "nova" && <span className="wonder-fireworks" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>}
    {place && <span className="wonder-stamp" aria-hidden="true"><CountryFlag country={place} /><small>{place}</small></span>}
    {!held && !still && <span className="wonder-timer" aria-hidden="true" />}
   </div>
   <div className="wonder-copy">
    <span className="eyebrow">★ WONDER REVEAL</span>
    <h2 id="wonder-title">{reveal.title}</h2>
    <p id="wonder-sub">{reveal.subtitle}</p>
    {reveal.badges.length > 0 && <ul className="wonder-badges">{reveal.badges.map(b => <li key={b}>{b}</li>)}</ul>}
   </div>
   <div className="wonder-actions">
    {held ? <button className="primary-button" onClick={onClose}>CONTINUE →</button>
     : <button className="primary-button" onClick={() => { setHeld(true); setReplay(r => r + 1); }}>ENJOY REVEAL</button>}
    <button ref={skip} className="secondary-button" onClick={onClose}>SKIP</button>
   </div>
  </section>
 </div>;
}
