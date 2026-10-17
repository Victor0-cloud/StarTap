"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readSavedSession } from "@/lib/premium/session";
import { refreshPremium } from "@/lib/premium/usePremium";
import styles from "./account.module.css";

type Phase = "wait" | "slow" | "on" | "pending" | "failed" | "cancelled";

function heading(phase: Phase) {
  if (phase === "on") return <>PREMIUM <em>IS ON.</em></>;
  if (phase === "failed") return <>PAYMENT <em>FAILED.</em></>;
  if (phase === "cancelled") return <>CHECKOUT <em>CLOSED.</em></>;
  return <>STILL <em>CONFIRMING.</em></>;
}

function copy(phase: Phase, received: boolean) {
  if (phase === "on") return "StarTap Premium is on. It was confirmed by the server.";
  if (phase === "failed") return "We couldn't confirm your payment, contact sales@startap.fun.";
  if (phase === "cancelled") return "You left checkout before it finished. Nothing here turns on Premium. If a payment did go through, it will show on your account once we confirm it.";
  if (phase === "slow") return "Payment received. We're confirming your StarTap Premium access. You can leave this page — Premium appears on your account once the payment is confirmed.";
  if (!received) return "Still confirming. Nothing here turns on Premium until the server confirms a payment.";
  return "Payment received. We're confirming your StarTap Premium access.";
}

export function PaymentSuccess() {
  const [phase, setPhase] = useState<Phase>("wait");
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
          if (stopped) return;
          if (verified.status === 503 || verdict.status === "pending") {
            await tick();
            return;
          }
          if (!verified.ok || verdict.status === "failed") {
            setPhase("failed");
            return;
          }
          if (verdict.status === "cancelled") {
            setPhase("cancelled");
            return;
          }
          if (verdict.status === "active") {
            await refreshPremium();
            setPhase("on");
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
        <h1>{heading(phase)}</h1>
        <p role="status">{copy(phase, true)}</p>
        <div className="share-actions">
          <Link className="primary-button" href="/play/">PLAY</Link>
          <Link className="secondary-button" href="/account/">ACCOUNT</Link>
        </div>
      </section>
    </main>
  </div>;
}

export function PaymentCancel() {
  const [phase, setPhase] = useState<Phase>("cancelled");
  useEffect(() => {
    let stopped = false;
    const session = readSavedSession();
    const tx_ref = new URLSearchParams(window.location.search).get("tx_ref");
    if (!session || !tx_ref) return () => { stopped = true; };
    const run = async () => {
      try {
        const verified = await fetch("/api/flutterwave/verify-payment/", {
          method: "POST",
          headers: { authorization: `Bearer ${session.accessToken}`, "content-type": "application/json" },
          body: JSON.stringify({ tx_ref }),
        });
        const verdict = await verified.json() as { status?: string };
        if (stopped) return;
        if (verified.status === 503) { setPhase("pending"); return; }
        if (!verified.ok || verdict.status === "failed") { setPhase("failed"); return; }
        if (verdict.status === "active") {
          await refreshPremium();
          setPhase("on");
          return;
        }
        if (verdict.status === "pending") { setPhase("pending"); return; }
        setPhase("cancelled");
      } catch {
        if (!stopped) setPhase("pending");
      }
    };
    void run();
    return () => { stopped = true; };
  }, []);
  return <div className={styles.shell}>
    <header className="masthead"><Link className="brand" href="/" aria-label="StarTap home"><span aria-hidden="true">✦</span> STAR<span>TAP</span>.</Link></header>
    <main className={styles.main}>
      <section className={styles.panel}>
        <p className="eyebrow">✦ PAYMENT</p>
        <h1>{heading(phase)}</h1>
        <p role="status">{copy(phase, false)}</p>
        <div className="share-actions">
          <Link className="primary-button" href="/premium/">BACK TO PREMIUM</Link>
          <Link className="secondary-button" href="/play/">PLAY TODAY&apos;S FIVE</Link>
        </div>
      </section>
    </main>
  </div>;
}
