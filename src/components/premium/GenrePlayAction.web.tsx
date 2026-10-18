"use client";
import Link from "next/link";
import { subcategoryLocked } from "@/lib/premium/access";
import { usePremium } from "@/lib/premium/usePremium";
import { LockGlyph } from "./LockGlyph";
import { premiumMarkStyle } from "./WorldPremiumMark";

type Props = { category: string; subcategory: string; title: string; href: string };

const unlockStyle = { color: "#2a1660", background: "linear-gradient(180deg, #ffe98a, #ffc83a)" } as const;

/**
 * Same rule as the Sports grid (SubPlayAction): a Premium sport shows PREMIUM + UNLOCK to a free or signed-out player.
 * UNLOCK keeps the same link; the play page shows the paywall before any game. Everyone else sees PLAY <TITLE> FIVE.
 */
export function GenrePlayAction({ category, subcategory, title, href }: Props) {
  const access = usePremium();
  if (!access.loading && subcategoryLocked(category, subcategory, access)) {
    return <>
      <p className="genre-premium" style={{ margin: "0 0 10px" }}><small style={premiumMarkStyle}><LockGlyph /> PREMIUM</small></p>
      <Link className="primary-button world-play genre-unlock" href={href} style={unlockStyle} aria-label={`Unlock ${title} with StarTap Premium`}><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><LockGlyph size={14} /> UNLOCK {title.toUpperCase()}</span> <span aria-hidden="true">→</span></Link>
    </>;
  }
  return <Link className="primary-button world-play" href={href}>PLAY {title.toUpperCase()} FIVE <span aria-hidden="true">→</span></Link>;
}
