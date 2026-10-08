"use client";
import { Capacitor } from "@capacitor/core";
import { useState } from "react";

import type { RoundResult } from "@/types/game";
import { buildModeShareText, buildShareText, challengeLink } from "@/lib/game/share";
import { shareOrigin } from "@/lib/site";
import { DEFAULT_MASCOT, MASCOTS, type MascotId } from "@/lib/game/mascots";
import { MascotImage } from "@/components/mascot/MascotImage";

// Spoiler-safe tile per round: colour and a symbol from the score only (no star, place or answer).
const tone = (score: number) => score >= 900 ? ["great", "★"] : score >= 600 ? ["good", "●"] : score >= 300 ? ["ok", "◐"] : ["miss", "○"];

export function SharePreview({day, edition, results, practice, mode, mascot=DEFAULT_MASCOT}: {day:string;edition:string;results:RoundResult[];practice:boolean;mode?:{label:string;path:string};mascot?:MascotId}) {
 const [message,setMessage]=useState("");
 const [manual,setManual]=useState("");
 const score=results.reduce((sum,r)=>sum+r.score,0);
 // SHARE uses the system share sheet where there is one (Android app, mobile browsers) and copies otherwise.
 // COPY RESULT and COPY LINK always copy; if the clipboard is blocked, the text is shown to select by hand.
 async function share(kind:"share"|"result"|"link"="share") {
  const native=Capacitor.isNativePlatform();
  const origin=shareOrigin({native,location:window.location});
  const text=kind==="link"?(mode?new URL(mode.path,origin).toString():challengeLink({day,edition,origin})):mode?buildModeShareText({label:mode.label,results,origin,path:mode.path}):buildShareText({day,edition,results,practice,origin});
  const copied=kind==="link"?"Link copied.":"Result and challenge link copied.";
  try {
   if(native){
    if(kind!=="share"){const {Clipboard}=await import("@capacitor/clipboard");await Clipboard.write({string:text});setMessage(copied);}
    else{const {Share}=await import("@capacitor/share");await Share.share({title:"StarTap",text,dialogTitle:"Share your five"});setMessage("Share sheet opened.");}
    return;
   }
   if (kind==="share" && typeof navigator.share==="function") {await navigator.share({title:"StarTap",text});setMessage("Share sheet opened.");return;}
   if (navigator.clipboard?.writeText) {await navigator.clipboard.writeText(text);setMessage(copied);return;}
  } catch(error) {
   if (error instanceof Error && error.name==="AbortError") return;
  }
  setManual(text);setMessage(kind==="link"?"Select and copy the link below.":"Select and copy your result below.");
 }
 return <section className="share-preview" aria-label="Spoiler-free result" style={{["--mascot" as string]:MASCOTS[mascot].color}}>
  <div className="share-card">
   <div className="share-card-top"><span className="share-brand">✦ STAR<b>TAP</b></span><span className="eyebrow">{mode?mode.label.toUpperCase():day}{practice?" · PRACTICE":""}</span></div>
   <MascotImage id={mascot} size={84} className="share-mascot" alt={MASCOTS[mascot].name}/>
   <h2>YOUR WORLD. FIVE TAPS.</h2>
   <strong className="share-score">{score.toLocaleString()} / 5,000</strong>
   <div className="score-tiles" aria-label="Round scores">{results.map((r,i)=>{const [t,sym]=tone(r.score);return <span key={r.questionId} className={(r.score>=600?"tile-close":"tile-far")+" tile-"+t} title={"Round "+(i+1)+": "+r.score}><i aria-hidden="true">{sym}</i>{r.score}</span>;})}</div>
   <p className="disclaimer">Your result reveals no stars or answers.</p>
  </div>
  <div className="share-actions"><button className="primary-button" onClick={()=>void share()}>SHARE MY FIVE ↗</button><button className="secondary-button" onClick={()=>void share("result")}>COPY RESULT</button><button className="secondary-button" onClick={()=>void share("link")}>COPY LINK</button></div>
  <p role="status" className="share-message">{message}</p>
  {manual && <textarea readOnly aria-label="Result to copy" value={manual} onFocus={event=>event.target.select()} />}
 </section>;
}


