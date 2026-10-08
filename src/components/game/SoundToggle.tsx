"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

export type FeedbackSound = "theme" | "reveal" | "perfect" | "close" | "miss" | "victory" | "finish" | "wonder";
type Note = [pitch: number, beat: number, duration: number];
// Original StarTap motifs, composed for this game. No samples or third-party recordings.
const music: Record<FeedbackSound, { tempo: number; notes: Note[]; bass?: Note[] }> = {
 theme: {tempo:160,notes:[[72,0,.35],[76,.5,.35],[79,1,.5],[74,2,.35],[77,2.5,.35],[81,3,.5],[79,4,.35],[76,4.5,.35],[74,5,.35],[72,5.5,.8]],bass:[[48,0,1.5],[53,2,1.5],[55,4,1.5]]},
 reveal: {tempo:160,notes:[[79,0,.3],[84,.4,.8]]},
 perfect: {tempo:160,notes:[[72,0,.35],[76,.5,.35],[79,1,.35],[84,1.5,1.2]],bass:[[48,0,1.3],[60,1.5,1.2]]},
 close: {tempo:150,notes:[[72,0,.4],[76,.55,.4],[79,1.1,.9]]},
 miss: {tempo:130,notes:[[67,0,.55],[64,.65,.65],[60,1.4,1]],bass:[[48,0,2]]},
 victory: {tempo:142,notes:[[72,0,.35],[76,.5,.35],[79,1,.45],[84,2,.6],[81,3,.35],[79,3.5,.35],[84,4,1.8]],bass:[[48,0,1.5],[53,2,1.5],[48,4,1.8]]},
 // Wonder Reveal: a rising sparkle into a held chord. Original StarTap motif.
 wonder: {tempo:168,notes:[[67,0,.3],[72,.33,.3],[76,.66,.3],[79,1,.3],[84,1.33,.3],[88,1.66,.5],[91,2.2,.25],[88,2.5,.25],[84,3,1.6],[79,3,1.6],[76,3,1.6]],bass:[[48,0,1.6],[55,1.66,1.2],[48,3,1.8]]},
 finish: {tempo:120,notes:[[64,0,.6],[67,.75,.6],[69,1.5,.6],[72,2.5,1.4]],bass:[[48,0,1.6],[53,2,1.8]]},
};
const soundEvent="startap-sound-change";
let fallbackEnabled=true;
const subscribe=(notify:()=>void)=>{
 window.addEventListener("storage",notify);window.addEventListener(soundEvent,notify);
 return ()=>{window.removeEventListener("storage",notify);window.removeEventListener(soundEvent,notify);};
};
const getSound=()=>{try{return localStorage.getItem("startap-sound")!=="off";}catch{return fallbackEnabled;}};
const getServerSound=()=>true;
// While an Adventure cinematic plays, its own audio leads: StarTap cues are stopped and not started (see CinematicPlayer).
const cinematicPlaying=()=>typeof document!=="undefined"&&document.documentElement.dataset.cinematic==="on";

export function useGameSound(){
 const enabled=useSyncExternalStore(subscribe,getSound,getServerSound);
 const context=useRef<AudioContext|null>(null);
 const voices=useRef(new Set<OscillatorNode>());
 const generation=useRef(0);
 const stop=useCallback(()=>{
  generation.current++;
  for(const voice of voices.current){try{voice.stop();}catch{/* Already stopped. */}}
  voices.current.clear();
 },[]);
 useEffect(()=>{if(!enabled)stop();},[enabled,stop]);
 useEffect(()=>{const onCinematic=()=>{if(cinematicPlaying())stop();};window.addEventListener("startap-cinematic",onCinematic);return ()=>window.removeEventListener("startap-cinematic",onCinematic);},[stop]);
 useEffect(()=>()=>{stop();void context.current?.close().catch(()=>{});context.current=null;},[stop]);
 const toggle=useCallback(()=>{
  fallbackEnabled=!getSound();
  try{localStorage.setItem("startap-sound",fallbackEnabled?"on":"off");}catch{/* In-memory preference still works. */}
  if(!fallbackEnabled)stop();
  window.dispatchEvent(new Event(soundEvent));
 },[stop]);
 const play=useCallback((kind:FeedbackSound)=>{
  stop();
  if(!getSound()||cinematicPlaying())return;
  const request=generation.current;
  void (async()=>{
   try{
    context.current??=new AudioContext();
    const audio=context.current;
    if(audio.state==="suspended")await audio.resume();
    if(request!==generation.current||!getSound()||audio.state!=="running")return;
    const song=music[kind],beat=60/song.tempo,origin=audio.currentTime+.025;
    function note([pitch,position,length]:Note,bass=false){
     const oscillator=audio.createOscillator(),gain=audio.createGain();
     const start=origin+position*beat,end=start+length*beat;
     oscillator.type=bass?"sine":"triangle";
     oscillator.frequency.value=440*Math.pow(2,(pitch-69)/12);
     oscillator.connect(gain).connect(audio.destination);
     gain.gain.setValueAtTime(.0001,start);
     gain.gain.exponentialRampToValueAtTime(bass ? 0.055 : 0.045,start+.012);
     gain.gain.exponentialRampToValueAtTime(.0001,end+.12);
     voices.current.add(oscillator);
     oscillator.onended=()=>{voices.current.delete(oscillator);oscillator.disconnect();gain.disconnect();};
     oscillator.start(start);oscillator.stop(end+.14);
    }
    song.notes.forEach(n=>note(n));song.bass?.forEach(n=>note(n,true));
   }catch{/* Audio permissions and device errors never interrupt the game. */}
  })();
 },[stop]);
 return {enabled,toggle,play,stop};
}
export function SoundToggle({enabled,onToggle}:{enabled:boolean;onToggle:()=>void}){
 return <button className="sound-toggle" type="button" aria-label={enabled?"Mute music and sound effects":"Enable music and sound effects"} aria-pressed={enabled} onClick={onToggle}>SOUND {enabled?"ON":"OFF"}</button>;
}

