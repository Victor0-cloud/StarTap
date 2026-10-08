"use client";
import { useEffect, useState } from "react";
import { MASCOTS, type MascotId } from "@/lib/game/mascots";
import { MascotImage } from "./MascotImage";
import { MOTION } from "@/lib/game/motion";

/** A short mascot moment when a Joker or Life Saver is used. The rescue logic is shared; only the animation differs. */
export function RescueBurst({ mascot, kind }: { mascot: MascotId; kind: "joker" | "lifesaver" }) {
 const [visible, setVisible] = useState(true);
 useEffect(() => { const t = window.setTimeout(() => setVisible(false), 1500); return () => window.clearTimeout(t); }, []);
 if (!visible) return null;
 const m = MASCOTS[mascot];
 return <div className={`rescue-burst rescue-${mascot} rescue-kind-${kind}`} role="status">
  <span className="rescue-ring" aria-hidden="true" />
  <MascotImage id={mascot} kind="portal" size={110} />
  <strong>{kind === "joker" ? "JOKER!" : "LIFE SAVER!"}</strong>
  <small>{m.name}: {m.rescue} {MOTION[mascot].lines.retry}</small>
 </div>;
}
