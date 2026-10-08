"use client";
import { useEffect, useRef, useState } from "react";
import type { Question } from "@/types/game";

type Props = { questions: readonly Question[]; round: number; onReveal: () => void; onSpin: () => void; note?: string };
export function StarWheel({ questions, round, onReveal, onSpin, note }: Props) {
 const [spinning, setSpinning] = useState(false);
 const [rotation, setRotation] = useState(0);
 const [landed, setLanded] = useState(false);
 const frame = useRef<number|null>(null);
 const active = spinning ? Math.floor((((360 - rotation % 360) % 360) + 360) % 360 / 72) : -1;
 const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
 function cancel() { if (timer.current) clearTimeout(timer.current); if (frame.current!==null) cancelAnimationFrame(frame.current); }
 useEffect(() => () => { if (timer.current) clearTimeout(timer.current); if (frame.current!==null) cancelAnimationFrame(frame.current); }, []);
 function reveal() { cancel(); onReveal(); }
 function spin() {
  if (spinning) return;
  setSpinning(true); onSpin();
  const target = 1080 - (round * 72 + 36);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
   setRotation(target); setLanded(true); timer.current=setTimeout(reveal,650); return;
  }
  const start=performance.now();
  function animate(now:number) {
   const progress=Math.min((now-start)/1900,1);
   setRotation(target*(1-Math.pow(1-progress,3)));
   if(progress<1) frame.current=requestAnimationFrame(animate);
   else {setLanded(true);timer.current=setTimeout(reveal,650);}
  }
  frame.current=requestAnimationFrame(animate);
 }
 return <section className="wheel-stage" aria-labelledby="wheel-title">
  <span className="eyebrow">FIVE STARS · ONE WORLD</span>
  <h1 id="wheel-title">WHO’S UP NEXT?</h1>
  <p>Every star starts hidden. The pointer reveals initials as the wheel turns.</p>
  <div className="wheel-frame" aria-hidden="true">
   <span className="wheel-pointer">▼</span>
   <svg className="star-wheel" viewBox="0 0 320 320" style={{transform:`rotate(${rotation}deg)`,transition:"none"}}>
    {questions.map((q, i) => {
     const a = (i * 72 - 90) * Math.PI / 180, b = ((i + 1) * 72 - 90) * Math.PI / 180;
     const middle = (i * 72 + 36 - 90) * Math.PI / 180;
     return <g key={q.id}><path d={`M160 160 L${160+150*Math.cos(a)} ${160+150*Math.sin(a)} A150 150 0 0 1 ${160+150*Math.cos(b)} ${160+150*Math.sin(b)} Z`} fill={active===i?"#658440":i%2?"#315f64":"#153b50"} stroke="#8ba994" strokeWidth="2"/><text data-revealed={active===i} x={160+100*Math.cos(middle)} y={166+100*Math.sin(middle)} textAnchor="middle" fill="#f4f6ed" fontSize="23" fontWeight="800">{active===i?q.monogram:"?"}</text></g>;
    })}
    <circle cx="160" cy="160" r="35" fill="#e9ff6b"/><text x="160" y="172" textAnchor="middle" fill="#071323" fontSize="34">★</text>
   </svg>
  </div>
  <p role="status" className="wheel-selection">{landed?questions[round].monogram+" selected — opening your question…":spinning?"Who will it land on?":"Five mystery stars. One pointer."}</p>
  <div className="wheel-actions"><button className="primary-button" disabled={spinning} onClick={spin}>{spinning?"REVEALING…":"SPIN THE STAR WHEEL"}</button><button className="secondary-button" onClick={reveal}>SKIP TO QUESTION</button></div>
  <p className="disclaimer">{note ?? "Daily reveal: everyone gets the same five stars in the same order. Spinning does not change your score."}</p>
 </section>;
}


