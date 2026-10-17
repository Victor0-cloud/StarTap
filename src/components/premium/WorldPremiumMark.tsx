"use client";
import { isFreeWorld } from "@/lib/premium/access";
import { usePremium } from "@/lib/premium/usePremium";

const style = {
  justifySelf: "start",
  color: "#2a1660",
  background: "linear-gradient(180deg, #ffe98a, #ffc83a)",
  borderRadius: 999,
  padding: "2px 8px",
  font: "800 11px/1.6 'Barlow Condensed', Impact, sans-serif",
  letterSpacing: ".08em",
} as const;

/** Small gold label. Renders nothing when Premium is off, or when the world is one of the free ones. */
export function WorldPremiumMark({ feature, category }: { feature: "world" | "adventure" | "stats"; category?: string }) {
  const access = usePremium();
  if (!access.paymentsOn || access.isPremium) return null;
  if (feature === "world" && category && isFreeWorld(category)) return null;
  return <small style={style}>PREMIUM</small>;
}
