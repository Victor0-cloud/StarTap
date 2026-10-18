"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { SiteFooter } from "@/components/site/SiteChrome";
import { formatMoney } from "@/lib/payments/money";
import { isPriceQuoteView, type PriceQuoteView } from "@/lib/payments/quote";
import { syncSavedSession } from "@/lib/auth/browser";
import { premiumOffer } from "@/lib/premium/offer";
import { readSavedSession } from "@/lib/premium/session";
import { bindPremiumSession, markPremiumPending, refreshPremium, usePremium } from "@/lib/premium/usePremium";
import styles from "./account.module.css";

bindPremiumSession(() => syncSavedSession());

const STARS = [[8, 18], [22, 70], [40, 12], [63, 64], [78, 22], [90, 48]] as const;

export function PremiumView({ quote }: { quote: PriceQuoteView }) {
  const router = useRouter();
  const access = usePremium();
  const offer = premiumOffer(access);
  useLayoutEffect(() => {
    if (!access.isPremium) markPremiumPending();
    void refreshPremium();
  }, [access.isPremium]);
  const [plan, setPlan] = useState<"premium_monthly" | "premium_yearly">("premium_monthly");
  const [shown, setShown] = useState(quote);
  const [choice, setChoice] = useState<"local" | "USD">(quote.currency === "USD" ? "USD" : "local");
  const [message, setMessage] = useState<string | null>(null);
  const [already, setAlready] = useState(false);
  const [busy, setBusy] = useState(false);
  const selected = plan === "premium_yearly" ? shown.yearly : shown.monthly;
  async function chooseCurrency(next: "local" | "USD") {
    setMessage(null);
    try {
      const response = await fetch(`/api/pricing/?currency=${next}`, { cache: "no-store" });
      const body: unknown = await response.json();
      if (!response.ok || !isPriceQuoteView(body)) {
        setMessage("The price could not be loaded");
        return;
      }
      setChoice(next);
      setShown(body);
    } catch {
      setMessage("The price could not be loaded");
    }
  }
  const until = offer !== "purchase" && offer !== "loading" ? offer.until : null;
  const checking = offer === "loading" && !already;
  const member = already || until !== null || (offer !== "purchase" && offer !== "loading");
  async function go() {
    const session = readSavedSession();
    if (!session) {
      router.push("/login/?next=/premium/");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/flutterwave/create-checkout/", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify({ plan, currency: choice }),
      });
      const body = await response.json() as { link?: string; error?: string };
      if (response.status === 409 || body.error === "already_premium") {
        setAlready(true);
        void refreshPremium();
        setBusy(false);
        return;
      }
      if (!response.ok || !body.link) {
        setMessage(body.error ?? "Checkout could not be started");
        setBusy(false);
        return;
      }
      window.location.assign(body.link);
    } catch {
      setMessage("Checkout could not be started");
      setBusy(false);
    }
  }
  return <div className={styles.shell}>
    <header className="masthead"><Link className="brand" href="/" aria-label="StarTap home"><span aria-hidden="true">✦</span> STAR<span>TAP</span>.</Link><Link className="secondary-button" href="/play/">PLAY NOW</Link></header>
    <main className={styles.main}>
      <div className={styles.sky} aria-hidden="true">{STARS.map(([x, y], i) => <i key={i} style={{ left: `${x}%`, top: y, animationDelay: `${i * .4}s` }} />)}</div>
      <section className={styles.hero}>
        <div>
          <p className="eyebrow">✦ STARTAP PREMIUM</p>
          <h1>PLAY THE <em>WHOLE SKY.</em></h1>
          <p className={styles.lede}>Today&apos;s Five stays free. Premium opens every world, unlimited Play Five, the Adventure of Wonders, and the full history of your game.</p>
          {quote.priceStatus !== "APPROVED" && <p className={styles.note}>Prices are {quote.priceStatus} placeholders.</p>}
        </div>
        <Image className={styles.globe} src="/globe-hero.svg" width={1024} height={768} alt="" priority />
      </section>
      <div className={styles.grid}>
        <article className={styles.card}>
          <p className="eyebrow">FREE</p>
          <strong>STARTAP FREE</strong>
          <ul>
            <li>Today&apos;s Five, every day</li>
            <li>Music World and Sports World</li>
            <li>Score and share</li>
            <li>3 Play Five rounds a day</li>
          </ul>
          <Link className="secondary-button" href="/play/">PLAY TODAY&apos;S FIVE</Link>
        </article>
        <article className={`${styles.card} ${styles.premium}`}>
          <p className="eyebrow">✦ PREMIUM</p>
          <strong>STARTAP PREMIUM</strong>
          <ul>
            <li>All worlds</li>
            <li>Unlimited Play Five</li>
            <li>Adventure of Wonders</li>
            <li>Expanded stats and history</li>
            <li>Future premium challenges</li>
            <li>Future ad-free play</li>
          </ul>
          {member || checking ? <>
            <p role="status">{checking ? "Checking your Premium…" : until ? `Premium is on until ${until}.` : "Premium is on."}</p>
            {member ? <Link className="primary-button" href="/account/">YOUR ACCOUNT</Link> : null}
          </> : <>
            <div className={styles.controls}>
              <button type="button" className="secondary-button" aria-pressed={plan === "premium_monthly"} onClick={() => setPlan("premium_monthly")}>{shown.monthly.label.toUpperCase()}</button>
              <button type="button" className="secondary-button" aria-pressed={plan === "premium_yearly"} onClick={() => setPlan("premium_yearly")}>{shown.yearly.label.toUpperCase()}</button>
              {shown.localAvailable && <>
                <button type="button" className="secondary-button" aria-pressed={choice === "local"} onClick={() => chooseCurrency("local")}>{shown.localCurrency}</button>
                <button type="button" className="secondary-button" aria-pressed={choice === "USD"} onClick={() => chooseCurrency("USD")}>USD</button>
              </>}
            </div>
            <p>{formatMoney(selected.amount)} {selected.currency} · {selected.per}{shown.priceStatus !== "APPROVED" ? ` · ${shown.priceStatus}` : ""}</p>
            {shown.usdFallback && <p>Local currency isn&apos;t available yet. This is the USD price.</p>}
            <button className="primary-button" type="button" disabled={busy || access.loading} onClick={go}>{busy ? "OPENING CHECKOUT…" : "GO PREMIUM"}</button>
            {message && <p role="status">{message}</p>}
            <p className={styles.lede}>You&apos;ll pay on Flutterwave&apos;s secure page. StarTap never sees your card.</p>
          </>}
        </article>
      </div>
    </main>
    <SiteFooter />
  </div>;
}
