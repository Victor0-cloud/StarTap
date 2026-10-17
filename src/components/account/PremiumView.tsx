"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteFooter } from "@/components/site/SiteChrome";
import { OFFERED_CURRENCIES, PLAN_CATALOG, PLAN_IDS, PRICE_APPROVAL, type CurrencyCode, type PlanId } from "@/lib/payments/plans";
import { readSavedSession } from "@/lib/premium/session";
import { usePremium } from "@/lib/premium/usePremium";
import styles from "./account.module.css";

const STARS = [[8, 18], [22, 70], [40, 12], [63, 64], [78, 22], [90, 48]] as const;

type Prices = Record<PlanId, Record<CurrencyCode, number>>;

export function PremiumView({ prices }: { prices: Prices }) {
  const router = useRouter();
  const access = usePremium();
  const [plan, setPlan] = useState<PlanId>("premium_monthly");
  const [currency, setCurrency] = useState<CurrencyCode>("NGN");
  const [message, setMessage] = useState<string | null>(null);
  const [already, setAlready] = useState(false);
  const [busy, setBusy] = useState(false);
  const amount = prices[plan][currency];
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
        body: JSON.stringify({ plan, currency }),
      });
      const body = await response.json() as { link?: string; error?: string };
      if (response.status === 409 || body.error === "already_premium") {
        setAlready(true);
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
          <p className={styles.note}>Prices are {PRICE_APPROVAL} placeholders.</p>
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
          {access.isPremium || already ? <>
            <p>StarTap Premium is already on for this account.</p>
            <Link className="primary-button" href="/account/">YOUR ACCOUNT</Link>
          </> : <>
            <div className={styles.controls}>
              {PLAN_IDS.map(id => <button key={id} type="button" className="secondary-button" aria-pressed={plan === id} onClick={() => setPlan(id)}>{PLAN_CATALOG[id].label.toUpperCase()}</button>)}
              {OFFERED_CURRENCIES.map(code => <button key={code} type="button" className="secondary-button" aria-pressed={currency === code} onClick={() => setCurrency(code)}>{code}</button>)}
            </div>
            <p>{amount.toLocaleString()} {currency} · {PLAN_CATALOG[plan].per} · {PRICE_APPROVAL}</p>
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
