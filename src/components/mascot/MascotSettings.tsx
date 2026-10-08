"use client";
import Link from "next/link";
import { MASCOTS } from "@/lib/game/mascots";
import { MascotPicker } from "./MascotPicker";
import { useMascot } from "./useMascot";

/** Change the travel buddy at any time; the choice applies to every mode straight away. */
export function MascotSettings() {
 const [mascot, choose] = useMascot();
 const m = MASCOTS[mascot];
 return <main className="mascot-page">
  <Link href="/" className="mascot-back">← HOME</Link>
  <h1 className="ob-title">Your <em>Mascot</em></h1>
  <p className="ob-sub">{m.name} · {m.power}: {m.powerText}</p>
  <MascotPicker value={mascot} onChange={choose} />
  <p className="ob-note">Saved on this device. <Link href="/welcome/">Replay the intro</Link></p>
 </main>;
}
