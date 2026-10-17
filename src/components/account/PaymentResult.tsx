"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readSavedSession } from "@/lib/premium/session";
import { refreshPremium } from "@/lib/premium/usePremium";
import styles from "./account.module.css";

export function PaymentSuccess() {
  const [phase, setPhase] = useState<"wait" | "on" | "slow" | "failed">("wait");
  useEffect(() => {
    let stopped = false;
    let timer = 0;
    let tries = 0;
    const session = readSavedSession();
    const params = new URLSearchParams(window.location.search);
    const transaction_id = params.get("transaction_id");
    const tx_ref = params.get("tx_ref");
    const tick = async () => {
      if (!session) { if (!stopped) setPhase("slow"); return; }
      try {
        const response = await fetch("/api/subscription/status/", { headers: { authorization: `Bearer ${session.accessToken}` }, cache: "no-store" });
        const body = await response.json() as { isPremium?: boolean };
        if (body.isPremium) {
          await refreshPremium();
          if (!stopped) setPhase("on");
          return;
        }
      } catch { /* keep polling */ }
      tries += 1;
      if (tries >= 15) { if (!stopped) setPhase("slow"); return; }
      timer = window.setTimeout(tick, 2000);
    };
    const run = async () => {
      if (session && (transaction_id || tx_ref)) {
        try {
          const verified = await fetch("/api/flutterwave/verify-payment/", {
            method: "POST",
            headers: { authorization: `Bearer ${session.accessToken}`, "content-type": "application/json" },
            body: JSON.stringify({ transaction_id, tx_ref }),
          });
          const verdict = await verified.json() as { status?: string };
          if (!stopped && (!verified.ok || verdict.status === "failed")) {
            setPhase("failed");
            return;
          }
        } catch { /* status poll is the source of truth */ }
      }
      if (!stopped) await tick();
    };
    void run();
    return () => { stopped = true; window.clearTimeout(timer); };
  }, []);
  return <div className={styles.shell}>
    <header className="masthead"><Link className="brand" href="/" aria-label="StarTap home"><span aria-hidden="true">✦</span> STAR<span>TAP</span>.</Link></header>
    <main className={styles.main}>
      <section className={styles.panel}>
        <p className="eyebrow">✦ PAYMENT</p>
        <h1>PAYMENT <em>RECEIVED.</em></h1>
        <p>Payment received. We&apos;re confirming your StarTap Premium access.</p>
        {phase === "on" && <p role="status">StarTap Premium is on. It was confirmed by the server.</p>}
        {phase === "slow" && <p role="status">Still confirming. You can leave this page — Premium appears on your account once the payment is confirmed.</p>}
        {phase === "failed" && <p role="status">We couldn&apos;t confirm your payment, contact sales@startap.fun.</p>}
        <div className="share-actions">
          <Link className="primary-button" href="/play/">PLAY</Link>
          <Link className="secondary-button" href="/account/">ACCOUNT</Link>
        </div>
      </section>
    </main>
  </div>;
}

export function PaymentCancel() {
  return <div className={styles.shell}>
    <header className="masthead"><Link className="brand" href="/" aria-label="StarTap home"><span aria-hidden="true">✦</span> STAR<span>TAP</span>.</Link></header>
    <main className={styles.main}>
      <section className={styles.panel}>
        <p className="eyebrow">✦ PAYMENT</p>
        <h1>CHECKOUT <em>CLOSED.</em></h1>
        <p>You left checkout before it finished. Nothing here turns on Premium. If a payment did go through, it will show on your account once we confirm it.</p>
        <div className="share-actions">
          <Link className="primary-button" href="/premium/">BACK TO PREMIUM</Link>
          <Link className="secondary-button" href="/play/">PLAY TODAY&apos;S FIVE</Link>
        </div>
      </section>
    </main>
  </div>;
}
