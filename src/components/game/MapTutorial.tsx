"use client";
import { useEffect, useState } from "react";
import { MascotImage } from "@/components/mascot/MascotImage";
import type { MascotId } from "@/lib/game/mascots";

export const TUTORIAL_KEY = "startap:tutorial:v1";
const isDone = () => { try { return localStorage.getItem(TUTORIAL_KEY) === "done"; } catch { return true; } };
const markDone = () => { try { localStorage.setItem(TUTORIAL_KEY, "done"); } catch { /* shows again next visit at worst */ } };

/**
 * First-play coach: four short cues that follow what the player actually does (the map decides the step).
 * Shown once, skippable, never blocks the map (only the Skip button takes taps) and finishes on the first revealed answer.
 */
export function MapTutorial({ steps, step, revealed, mascot }: { steps: readonly string[]; step: number; revealed: boolean; mascot: MascotId }) {
 const [hidden, setHidden] = useState(isDone);
 useEffect(() => { if (revealed && !hidden) markDone(); }, [revealed, hidden]);
 if (hidden || revealed || isDone()) return null;
 return <div className="map-tutorial" role="status" aria-live="polite">
  <MascotImage id={mascot} size={26} className="mascot-mini" />
  <span className="map-tutorial-text"><small>{step + 1} / {steps.length}</small><strong>{steps[step]}</strong></span>
  <button type="button" onClick={() => { markDone(); setHidden(true); }}>SKIP</button>
 </div>;
}
