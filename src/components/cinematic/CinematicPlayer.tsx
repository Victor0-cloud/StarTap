"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { pushBackHandler } from "@/lib/platform/backStack";
import { AUDIO_RAMP_MS, FADE_IN_MS, REDUCED_FADE_MS, SKIP_AFTER_MS, type Cinematic } from "@/lib/game/cinematics";

export type CinematicEnd = "ended" | "skipped" | "back" | "error";
export const CINEMATIC_EVENT = "startap-cinematic";
const START_TIMEOUT_MS = 6000; // a clip that never starts (missing, undecodable, blocked) is skipped automatically
const STALL_MS = 4000; // a clip that stops advancing while visible is ended rather than left frozen
const soundOn = () => { try { return localStorage.getItem("startap-sound") !== "off"; } catch { return true; } };
const reducedMotion = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };

/**
 * Full-screen portrait cinematic. Plays once (no loop), shows SKIP after a moment, and always ends by calling onDone —
 * on finish, skip, Android back / Escape, or any load or playback failure — so a player can never be trapped.
 * Smooth start: a dark screen opens at once, playback begins only when the clip can play, the picture fades in on the
 * first real frame and the sound ramps up from silence. StarTap's own sound cues stand down while it plays.
 */
export function CinematicPlayer({ cinematic, onDone }: { cinematic: Cinematic; onDone: (end: CinematicEnd) => void }) {
 const video = useRef<HTMLVideoElement>(null);
 const done = useRef(false), started = useRef(false), ramp = useRef(0);
 const [shown, setShown] = useState(false);
 const [skippable, setSkippable] = useState(false);
 const [tapForSound, setTapForSound] = useState(false);
 const finish = useCallback((end: CinematicEnd) => {
  if (done.current) return;
  done.current = true;
  cancelAnimationFrame(ramp.current);
  try { video.current?.pause(); } catch { /* already gone */ }
  if (end === "error" && process.env.NODE_ENV !== "production") console.warn(`[cinematic] ${cinematic.id} could not play (${cinematic.src}); continuing without it`);
  onDone(end);
 }, [onDone, cinematic]);

 // Screen-level wiring: sound stand-down, Android back / Escape, SKIP timing, start timeout, app pause/resume.
 useEffect(() => {
  const root = document.documentElement;
  root.dataset.cinematic = "on";
  window.dispatchEvent(new Event(CINEMATIC_EVENT));
  const overflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  const removeBack = pushBackHandler(() => { finish("back"); return true; });
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") finish("skipped"); };
  window.addEventListener("keydown", onKey);
  const skipTimer = window.setTimeout(() => setSkippable(true), SKIP_AFTER_MS); // not delayed by the fade
  const startTimer = window.setTimeout(() => { if (!started.current) finish("error"); }, START_TIMEOUT_MS);
  const onVisibility = () => { // app sent to background and back: pause, then carry on from the same frame
   const v = video.current; if (!v || done.current) return;
   if (document.visibilityState === "hidden") v.pause(); else if (started.current) void v.play().catch(() => {});
  };
  document.addEventListener("visibilitychange", onVisibility);
  let last = -1, still = 0;
  const watchdog = window.setInterval(() => { // ends the clip if it finished without "ended", or froze while on screen
   const v = video.current; if (!v || done.current || !started.current) return;
   if (v.ended) return finish("ended");
   if (document.visibilityState !== "visible" || v.paused) { still = 0; return; }
   if (v.currentTime === last) { still += 500; if (still >= STALL_MS) finish("error"); } else { still = 0; last = v.currentTime; }
  }, 500);
  return () => {
   delete root.dataset.cinematic;
   window.dispatchEvent(new Event(CINEMATIC_EVENT));
   document.body.style.overflow = overflow;
   removeBack(); window.removeEventListener("keydown", onKey); document.removeEventListener("visibilitychange", onVisibility);
   window.clearTimeout(skipTimer); window.clearTimeout(startTimer); window.clearInterval(watchdog);
  };
 }, [finish]);

 // Playback: wait until the clip can play, start from silence, fade the picture in on the first real frame, ramp the sound.
 useEffect(() => {
  const v = video.current;
  if (!v) return;
  const withSound = soundOn();
  v.volume = 0;
  v.muted = !withSound;
  const rampUp = () => {
   if (v.muted) return;
   const t0 = performance.now();
   const step = (now: number) => { const k = Math.min(1, (now - t0) / AUDIO_RAMP_MS); v.volume = k * k; if (k < 1 && !done.current) ramp.current = requestAnimationFrame(step); };
   ramp.current = requestAnimationFrame(step);
  };
  const onPlaying = () => { if (done.current || started.current) return; started.current = true; setShown(true); rampUp(); };
  const start = () => {
   if (done.current) return;
   v.play().catch(() => {
    // Autoplay with sound blocked (some browsers): play muted and offer sound; if even that fails, move on.
    if (done.current) return;
    v.muted = true;
    v.play().then(() => { if (withSound) setTapForSound(true); }).catch(() => finish("error"));
   });
  };
  v.addEventListener("playing", onPlaying);
  if (v.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) start(); else v.addEventListener("canplay", start, { once: true });
  return () => { v.removeEventListener("playing", onPlaying); v.removeEventListener("canplay", start); };
 }, [finish]);

 const fade = reducedMotion() ? REDUCED_FADE_MS : FADE_IN_MS;
 return <div className={"cinematic" + (shown ? " is-shown" : "")} role="dialog" aria-modal="true" aria-label={cinematic.label}
  data-cinematic={cinematic.id} data-shown={shown ? "1" : "0"} style={{ ["--cinematic-fade" as string]: `${fade}ms` }}>
  <video ref={video} className="cinematic-video" src={cinematic.src} playsInline preload="auto" disablePictureInPicture
   controlsList="nodownload nofullscreen noremoteplayback" onEnded={() => finish("ended")} onError={() => finish("error")} />
  {tapForSound && <button type="button" className="cinematic-sound" onClick={() => {
   const v = video.current; if (v) { v.muted = false; v.volume = 1; void v.play().catch(() => {}); } setTapForSound(false);
  }}>🔊 TAP FOR SOUND</button>}
  {skippable && <button type="button" className="cinematic-skip" onClick={() => finish("skipped")}>SKIP <span aria-hidden="true">›</span></button>}
 </div>;
}
