"use client";
import { useCallback, useSyncExternalStore } from "react";
import { MASCOT_KEY, readMascot, DEFAULT_MASCOT, type MascotId } from "@/lib/game/mascots";

// The chosen mascot, kept in localStorage and shared live across every component on the page.
const EVENT = "startap-mascot-change";
const subscribe = (notify: () => void) => { window.addEventListener("storage", notify); window.addEventListener(EVENT, notify); return () => { window.removeEventListener("storage", notify); window.removeEventListener(EVENT, notify); }; };
let memory: MascotId | null = null; // used when storage is blocked
const read = (): MascotId => { try { return readMascot(localStorage.getItem(MASCOT_KEY)); } catch { return memory ?? DEFAULT_MASCOT; } };

export function useMascot(): [MascotId, (id: MascotId) => void] {
 const mascot = useSyncExternalStore(subscribe, read, () => DEFAULT_MASCOT);
 const choose = useCallback((id: MascotId) => {
  memory = id;
  try { localStorage.setItem(MASCOT_KEY, id); } catch { /* in-memory choice still works this session */ }
  window.dispatchEvent(new Event(EVENT));
 }, []);
 return [mascot, choose];
}
