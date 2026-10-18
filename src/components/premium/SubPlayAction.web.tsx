"use client";
import Link from "next/link";
import { subcategoryLocked } from "@/lib/premium/access";
import { usePremium } from "@/lib/premium/usePremium";
import { LockGlyph } from "./LockGlyph";

type Props = { category: string; subcategory: string; label: string; href: string };

const unlockStyle = { gap: 6, color: "#ffd84a", borderColor: "#ffd84a" } as const;

/**
 * A Premium sport's row button says UNLOCK for a free or signed-out player, and PLAY FIVE for members, free sports,
 * and regions where Premium isn't sold. UNLOCK keeps the same link: the play page shows the paywall and never starts a game.
 */
export function SubPlayAction({ category, subcategory, label, href }: Props) {
  const access = usePremium();
  if (!access.loading && subcategoryLocked(category, subcategory, access)) {
    return <Link className="sub-play sub-unlock" href={href} style={unlockStyle} aria-label={`Unlock ${label} with StarTap Premium`}><LockGlyph size={12} /> UNLOCK</Link>;
  }
  return <Link className="sub-play" href={href} aria-label={`Play ${label} Five`}>PLAY FIVE</Link>;
}
