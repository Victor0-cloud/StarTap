"use client";
import { MASCOT_IDS, MASCOTS, type MascotId } from "@/lib/game/mascots";
import { MascotImage } from "./MascotImage";

/** Six mascot cards as one radio group: arrow keys move, the selected card glows with a check badge. */
export function MascotPicker({ value, onChange }: { value: MascotId; onChange: (id: MascotId) => void }) {
 const move = (from: MascotId, step: number) => onChange(MASCOT_IDS[(MASCOT_IDS.indexOf(from) + step + MASCOT_IDS.length) % MASCOT_IDS.length]);
 return <div className="mascot-grid" role="radiogroup" aria-label="Choose your mascot">
  {MASCOT_IDS.map(id => {
   const m = MASCOTS[id], selected = id === value;
   return <button key={id} type="button" role="radio" aria-checked={selected} tabIndex={selected ? 0 : -1}
    className={`mascot-card${selected ? " selected" : ""}`} data-mascot={id} style={{ ["--mascot" as string]: m.color }}
    onClick={() => onChange(id)}
    onKeyDown={e => { if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); move(id, 1); } if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); move(id, -1); } }}>
    {selected && <span className="mascot-check" aria-hidden="true">✓ Selected</span>}
    <MascotImage id={id} kind="card" size={360} />
    <strong>{m.name}</strong>
    <small>{m.role}</small>
    <em>{m.power}</em>
   </button>;
  })}
 </div>;
}
