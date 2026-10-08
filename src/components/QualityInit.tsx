"use client";
import { useEffect } from "react";
import { pickQuality, QUALITY_KEY } from "@/lib/game/quality";

/** Sets <html data-quality> once on load; CSS and the map read it to scale effects to the device. */
export function QualityInit() {
 useEffect(() => {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  let override: string | null = null;
  try { override = localStorage.getItem(QUALITY_KEY); } catch { /* no override */ }
  document.documentElement.dataset.quality = pickQuality({
   reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
   deviceMemory: nav.deviceMemory, cores: nav.hardwareConcurrency, saveData: nav.connection?.saveData, override,
  });
 }, []);
 return null;
}
