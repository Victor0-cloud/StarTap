"use client";
import { CINEMATICS_KEY, idsToReset, readWatched, withWatched, type Cinematic } from "@/lib/game/cinematics";

// Watched cinematics live in their own key, apart from Adventure progress, so clearing one never touches scores or stars.
const watchedNow = () => { try { return readWatched(localStorage.getItem(CINEMATICS_KEY)); } catch { return new Set<string>(); } };
export const isWatched = (id: string) => watchedNow().has(id);
export const markWatched = (id: string) => { try { localStorage.setItem(CINEMATICS_KEY, withWatched(watchedNow(), id)); } catch { /* shown again next time */ } };
/** Forgets cinematic flags only; Adventure progress, scores and stars are never touched. */
export const forgetWatched = (ids: string[]) => {
 if (!ids.length) return;
 try { const w = watchedNow(); ids.forEach(id => w.delete(id)); localStorage.setItem(CINEMATICS_KEY, JSON.stringify([...w])); } catch { /* ignore */ }
};
/** QA: `?resetIntro=1` (this screen's clip), `?resetIntro=global-pop` (one clip by role), or `?resetIntro=all` (cinematics only). */
export function applyResetParam(own: Cinematic | null) {
 try { forgetWatched(idsToReset(new URLSearchParams(window.location.search).get("resetIntro"), own)); } catch { /* ignore */ }
}
/** First-entry check used by every screen: applies any QA reset, then reports whether this clip still needs to play. */
export const shouldPlay = (c: Cinematic | null | undefined): c is Cinematic => { if (!c) return false; applyResetParam(c); return !isWatched(c.id); };
