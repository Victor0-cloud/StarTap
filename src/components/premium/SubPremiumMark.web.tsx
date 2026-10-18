"use client";
import { subcategoryLocked } from "@/lib/premium/access";
import { usePremium } from "@/lib/premium/usePremium";
import { LockGlyph } from "./LockGlyph";
import { premiumMarkStyle } from "./WorldPremiumMark";

/** Lock + PREMIUM beside a Premium sport on its world page. The row stays visible; tapping it opens the paywall. */
export function SubPremiumMark({ category, subcategory }: { category: string; subcategory: string }) {
  const access = usePremium();
  if (access.loading || !subcategoryLocked(category, subcategory, access)) return null;
  return <small className="sub-premium" style={premiumMarkStyle}><LockGlyph /> PREMIUM</small>;
}
