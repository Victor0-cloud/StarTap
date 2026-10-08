"use client";
import { useState, useSyncExternalStore } from "react";
import { CinematicPlayer } from "./CinematicPlayer";
import { markWatched, shouldPlay } from "./watched";
import { WORLD_ENTRANCE_INTROS, type Cinematic } from "@/lib/game/cinematics";

const subscribe = () => () => {};
const useMounted = () => useSyncExternalStore(subscribe, () => true, () => false); // watched flags live in local storage

/**
 * A world's intro on its own screen: plays the first time the world is entered (Music and Sports share it with the
 * Adventure tab), plus Replay Intro.
 */
export function WorldIntro({ worldId }: { worldId: string }) {
 return useMounted() && WORLD_ENTRANCE_INTROS[worldId] ? <WorldIntroInner cinematic={WORLD_ENTRANCE_INTROS[worldId]} /> : null;
}
function WorldIntroInner({ cinematic }: { cinematic: Cinematic }) {
 const [playing, setPlaying] = useState<Cinematic | null>(() => shouldPlay(cinematic) ? cinematic : null);
 return <>
  <button type="button" className="secondary-button replay-intro" onClick={() => setPlaying(cinematic)}>▶ REPLAY INTRO</button>
  {playing && <CinematicPlayer key={playing.id} cinematic={playing} onDone={end => { if (end !== "error") markWatched(playing.id); setPlaying(null); }} />}
 </>;
}

/** Small replay control for a level card or genre row: replays only that clip; scores, stars and progress are untouched. */
export function IntroReplay({ cinematic, label }: { cinematic: Cinematic; label: string }) {
 const [playing, setPlaying] = useState(false);
 if (!useMounted()) return null;
 return <>
  <button type="button" className="intro-replay" aria-label={`Replay ${label} intro`} data-replay={cinematic.id} onClick={() => setPlaying(true)}>▶ INTRO</button>
  {playing && <CinematicPlayer key={cinematic.id} cinematic={cinematic} onDone={end => { if (end !== "error") markWatched(cinematic.id); setPlaying(false); }} />}
 </>;
}
