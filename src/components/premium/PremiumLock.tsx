"use client";
import Link from "next/link";
import { FREE_PLAY_FIVE_PER_DAY } from "@/lib/premium/access";

const copy = {
  world: {
    title: "THIS WORLD IS PREMIUM",
    body: "Music World and Sports World stay open. The rest of the worlds, including every world under More, are part of StarTap Premium.",
  },
  "play-five": {
    title: "TODAY'S FREE FIVES ARE USED",
    body: `Free play includes ${FREE_PLAY_FIVE_PER_DAY} Play Five rounds a day. Today's Five is still open, and Premium removes the limit.`,
  },
  adventure: {
    title: "ADVENTURE IS PREMIUM",
    body: "The Adventure of Wonders — its worlds, levels and Wonder Stars — is part of StarTap Premium. Today's Five stays free.",
  },
  stats: {
    title: "FULL HISTORY IS PREMIUM",
    body: "Your score and share card stay free. The full Star Passport and expanded history are part of StarTap Premium.",
  },
} as const;

export function PremiumLock({ kind }: { kind: keyof typeof copy }) {
  const text = copy[kind];
  return <section style={{ maxWidth: 640, margin: "28px auto", padding: 24, borderRadius: 24, border: "1px solid #ffd84a80", background: "radial-gradient(ellipse at 90% 0%, #ffd84a33, transparent 55%), linear-gradient(160deg, #3b2c9a, #1a1458)" }}>
    <p className="eyebrow">✦ STARTAP PREMIUM</p>
    <h1 style={{ margin: "8px 0 10px", font: "900 clamp(36px, 8vw, 56px)/.95 'Barlow Condensed', Impact, sans-serif" }}>{text.title}</h1>
    <p style={{ color: "#d5def0", marginTop: 0 }}>{text.body}</p>
    <div className="share-actions">
      <Link className="primary-button" href="/premium/">GO PREMIUM</Link>
      <Link className="secondary-button" href="/play/">TODAY&apos;S FIVE</Link>
    </div>
  </section>;
}
