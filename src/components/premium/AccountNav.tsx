"use client";
import Link from "next/link";
import { usePremium } from "@/lib/premium/usePremium";
import { LockGlyph } from "./LockGlyph";

const pill = { display: "inline-flex", alignItems: "center", gap: 5, minHeight: 36, padding: "0 12px", borderRadius: 999, whiteSpace: "nowrap", font: "800 12px/1 'Barlow Condensed', Impact, sans-serif", letterSpacing: ".1em" } as const;
const goStyle = { ...pill, color: "#2a1660", background: "linear-gradient(180deg, #ffe98a, #ffc83a)" } as const;
const activeStyle = { ...pill, color: "#ffd84a", border: "1px solid #ffd84a80" } as const;

/** Header pill, shown at every width: GO PREMIUM for a free or signed-out player, PREMIUM ACTIVE for a member. */
export function PremiumCta() {
  const access = usePremium();
  if (!access.paymentsOn || access.loading) return null;
  return access.isPremium
    ? <Link href="/account/" style={activeStyle}>✦ PREMIUM ACTIVE</Link>
    : <Link href="/premium/" className="masthead-premium" style={goStyle}><LockGlyph /><span><span className="masthead-premium-go">GO </span>PREMIUM</span></Link>;
}

/** Desktop header link to sign in or open the account. */
export function AccountLink() {
  const access = usePremium();
  if (!access.paymentsOn) return null;
  return <Link href={access.email ? "/account/" : "/login/"}>{access.email ? "ACCOUNT" : "LOG IN"}</Link>;
}
