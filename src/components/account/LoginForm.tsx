"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { browserAuth, syncSavedSession } from "@/lib/auth/browser";
import { safeNextPath } from "@/lib/payments/redirect";
import styles from "./account.module.css";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function send(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const redirect = `${window.location.origin}/account/`;
    const { error } = await browserAuth().auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirect, shouldCreateUser: true } });
    setBusy(false);
    if (error) { setMessage("We couldn't send the email. Check the address and try again."); return; }
    setSent(true);
    setMessage("Check your email for a link or a 6-digit code.");
  }
  async function verify(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await browserAuth().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    if (error) { setBusy(false); setMessage("That code didn't work. Request a new one and try again."); return; }
    await syncSavedSession();
    router.replace(next);
  }
  return <div className={styles.shell}>
    <header className="masthead"><Link className="brand" href="/" aria-label="StarTap home"><span aria-hidden="true">✦</span> STAR<span>TAP</span>.</Link><Link className="secondary-button" href="/play/">PLAY NOW</Link></header>
    <main className={styles.main}>
      <section className={styles.panel}>
        <p className="eyebrow">✦ ACCOUNT</p>
        <h1>SIGN IN WITH <em>EMAIL.</em></h1>
        <p className={styles.lede}>Free play never needs an account. Sign in only to buy or manage StarTap Premium. We&apos;ll email you a link and a one-time code.</p>
        <form className={styles.form} onSubmit={send}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
          <button className="primary-button" type="submit" disabled={busy}>EMAIL ME A LINK</button>
        </form>
        {sent && <form className={styles.form} onSubmit={verify}>
          <label htmlFor="code">One-time code</label>
          <input id="code" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={event => setCode(event.target.value)} />
          <button className="secondary-button" type="submit" disabled={busy}>CONFIRM CODE</button>
        </form>}
        {message && <p role="status">{message}</p>}
      </section>
    </main>
  </div>;
}
