"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { browserAuth, syncSavedSession } from "@/lib/auth/browser";
import { takeLoginNext } from "@/lib/auth/login-next";
import { readSavedSession, writeSavedSession } from "@/lib/premium/session";
import styles from "./account.module.css";

type Status = {
  authenticated: boolean;
  email: string | null;
  plan: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
  isPremium: boolean;
};

const format = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
};

export function AccountPanel() {
  const router = useRouter();
  const [status, setStatus] = useState<Status | null>(null);
  const [message, setMessage] = useState("Checking your account…");
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        await syncSavedSession();
        const session = readSavedSession();
        if (!session) { router.replace("/login/?next=/account/"); return; }
        const response = await fetch("/api/subscription/status/", { headers: { authorization: `Bearer ${session.accessToken}` }, cache: "no-store" });
        if (!response.ok) { if (!cancel) setMessage("We couldn't load your account."); return; }
        const body = await response.json() as Status & { paymentsEnabled?: boolean };
        if (cancel) return;
        if (!body.authenticated) { router.replace("/login/?next=/account/"); return; }
        // Arrived from an emailed sign-in link that started on the Premium paywall: continue there.
        let next: string | null = null;
        try { next = takeLoginNext(localStorage); } catch { /* storage blocked */ }
        if (next) { router.replace(next); return; }
        setStatus(body);
        setMessage("");
      } catch {
        if (!cancel) setMessage("We couldn't load your account.");
      }
    })();
    return () => { cancel = true; };
  }, [router]);
  async function signOut() {
    try { await browserAuth().auth.signOut(); } catch { /* still drop the local token */ }
    writeSavedSession(null);
    router.replace("/");
  }
  const renewal = status?.status === "cancelled" ? "Access until" : status?.status === "active" ? "Renews / ends" : "Renewal";
  return <div className={styles.shell}>
    <header className="masthead"><Link className="brand" href="/" aria-label="StarTap home"><span aria-hidden="true">✦</span> STAR<span>TAP</span>.</Link><Link className="secondary-button" href="/play/">PLAY NOW</Link></header>
    <main className={styles.main}>
      <section className={styles.panel}>
        <p className="eyebrow">✦ ACCOUNT</p>
        <h1>YOUR <em>STARTAP.</em></h1>
        {message && <p role="status">{message}</p>}
        {status && <div className={styles.rows}>
          <p><span>Email</span><strong>{status.email}</strong></p>
          <p><span>Plan</span><strong>{status.plan === "premium_monthly" ? "MONTHLY" : status.plan === "premium_yearly" ? "YEARLY" : "FREE"}</strong></p>
          <p><span>Status</span><strong>{status.isPremium ? (status.status ?? "ACTIVE").toUpperCase() : "FREE"}</strong></p>
          <p><span>{renewal}</span><strong>{format(status.currentPeriodEnd)}</strong></p>
        </div>}
        <div className="share-actions">
          {status && !status.isPremium && <Link className="primary-button" href="/premium/">GO PREMIUM</Link>}
          <button className="secondary-button" type="button" onClick={signOut}>SIGN OUT</button>
        </div>
      </section>
    </main>
  </div>;
}
