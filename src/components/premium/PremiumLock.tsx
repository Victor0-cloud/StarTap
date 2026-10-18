"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FREE_PLAY_FIVE_PER_DAY } from "@/lib/premium/access";
import { formatMoney } from "@/lib/payments/money";
import { isPriceQuoteView, type PriceQuoteView } from "@/lib/payments/quote";
import { usePremium } from "@/lib/premium/usePremium";
import { LockGlyph } from "./LockGlyph";

type Kind = "world" | "sport" | "play-five" | "adventure" | "stats";

/** Why this paywall appeared. `label` names the world or sport the player tapped. */
const reason = (kind: Kind, label?: string) => ({
  world: `${label ?? "This world"} is part of StarTap Premium.`,
  sport: `${label ?? "This sport"} is a Premium sport. Football (Soccer), Basketball and Boxing stay free.`,
  "play-five": `You've played today's ${FREE_PLAY_FIVE_PER_DAY} free World Mix rounds. Music, free sports and Today's Five stay open.`,
  adventure: "The Adventure of Wonders — its worlds, levels and Wonder Stars — is part of StarTap Premium.",
  stats: "Your score and share card stay free. The full Star Passport and expanded history are Premium.",
})[kind];

const UNLOCKS = [
  "Premium Sports",
  "Screen World",
  "World Icons",
  "Tech & Innovation",
  "Fashion & Beauty",
  "Business & Money",
  "Creators & Internet",
  "Royalty & Dynasties",
  "Adventure mode",
  "Expanded stats & history",
];

const SKY = [[6, 14], [18, 72], [34, 8], [58, 20], [74, 66], [88, 12], [94, 44]] as const;

/** The server quote, as on /premium. Nothing is shown until it loads, and no price is written in this file. */
function useQuote(enabled: boolean): PriceQuoteView | null {
  const [quote, setQuote] = useState<PriceQuoteView | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let cancel = false;
    fetch("/api/pricing/", { cache: "no-store" })
      .then(response => response.ok ? response.json() : null)
      .then((body: unknown) => { if (!cancel && isPriceQuoteView(body)) setQuote(body); })
      .catch(() => { /* the paywall works without a price line */ });
    return () => { cancel = true; };
  }, [enabled]);
  return quote;
}

const price = (row: PriceQuoteView["monthly"]) => `${formatMoney(row.amount)} ${row.currency} ${row.per}`;

export function PremiumLock({ kind, label, back = "/" }: { kind: Kind; label?: string; back?: string }) {
  const access = usePremium();
  const quote = useQuote(access.paymentsOn);
  // Signed out: sign in first, then land on the Premium checkout page.
  const goPremium = access.email ? "/premium/" : "/login/?next=/premium/";
  return <section aria-labelledby="paywall-title" style={{ position: "relative", overflow: "hidden", maxWidth: 640, margin: "28px auto", padding: "28px 24px", borderRadius: 28, border: "1px solid #ffd84a80", boxShadow: "0 18px 50px #0b073380", background: "radial-gradient(ellipse at 88% 0%, #ffd84a33, transparent 55%), radial-gradient(circle at 8% 100%, #7b5cff40, transparent 50%), linear-gradient(160deg, #3b2c9a, #1a1458)" }}>
    {SKY.map(([x, y], i) => <i key={i} aria-hidden="true" style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: i % 2 ? 3 : 4, height: i % 2 ? 3 : 4, borderRadius: 9, background: "#ffe98a", boxShadow: "0 0 8px #ffd84a", opacity: .75 }} />)}
    <p className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}><LockGlyph size={13} /> STARTAP PREMIUM</p>
    <h1 id="paywall-title" style={{ margin: "8px 0 10px", font: "900 clamp(36px, 8vw, 56px)/.95 'Barlow Condensed', Impact, sans-serif" }}>UNLOCK THE <span style={{ color: "#ffd84a" }}>WHOLE WORLD</span></h1>
    <p style={{ color: "#d5def0", marginTop: 0 }}>{reason(kind, label)}</p>
    <p style={{ color: "#ffe98a", margin: "14px 0 6px", font: "800 14px/1.4 'Barlow Condensed', Impact, sans-serif", letterSpacing: ".08em" }}>GO PREMIUM TO UNLOCK</p>
    <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 210px), 1fr))", gap: "4px 16px", margin: "0 0 16px", padding: 0, listStyle: "none", color: "#eef2ff" }}>
      {UNLOCKS.map(item => <li key={item}><span aria-hidden="true" style={{ color: "#ffd84a" }}>✦</span> {item}</li>)}
    </ul>
    {quote && <p style={{ color: "#eef2ff", fontWeight: 700 }}>{price(quote.monthly)} · {price(quote.yearly)}{quote.priceStatus !== "APPROVED" ? ` · ${quote.priceStatus}` : ""}</p>}
    <div className="share-actions">
      <Link className="primary-button" href={goPremium}>GO PREMIUM</Link>
      <Link className="secondary-button" href={back}>KEEP PLAYING FREE</Link>
    </div>
  </section>;
}
