import Link from "next/link";
import { PAYMENTS_UI_ENABLED } from "@/lib/premium/flag";
import { PLAY_STORE_URL } from "@/lib/site";

export function Brand() {
 return <Link className="brand" href="/" aria-label="StarTap home"><span aria-hidden="true">✦</span> STAR<span>TAP</span>.</Link>;
}

/** Public footer: game links plus the legal and support pages (also reachable inside the Android app). */
export function SiteFooter() {
 return <footer className="site-footer site-footer-links">
  <nav aria-label="StarTap pages">
   <Link href="/how-to-play/">How to play</Link>
   {PAYMENTS_UI_ENABLED && <Link href="/premium/">Premium</Link>}
   {PAYMENTS_UI_ENABLED && <Link href="/account/">Account</Link>}
   <Link href="/privacy/">Privacy</Link>
   <Link href="/terms/">Terms</Link>
   <Link href="/support/">Support</Link>
  </nav>
  <span>STARTAP © 2026 · THE WORLD IS CLOSER THAN YOU THINK.</span>
 </footer>;
}

/** Google Play call to action. Until PLAY_STORE_URL is set it is a visibly disabled "coming soon" badge, never a link. */
export function GooglePlayButton({ className = "" }: { className?: string }) {
 const body = <><span className="store-icon" aria-hidden="true">▶</span><span><small>GET IT ON</small><strong>GOOGLE PLAY</strong></span></>;
 return PLAY_STORE_URL
  ? <a className={`store-button ${className}`} href={PLAY_STORE_URL} target="_blank" rel="noopener">{body}</a>
  : <span className={`store-button is-soon ${className}`} aria-disabled="true" aria-label="Google Play: coming soon">{body}<em>COMING SOON</em></span>;
}

/** Text pages (How to play, Privacy, Terms, Support): readable width on every device, same header and footer. */
export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: React.ReactNode; children: React.ReactNode }) {
 return <div className="site-shell">
  <header className="masthead"><Brand /><Link className="secondary-button masthead-play" href="/play/">PLAY NOW</Link></header>
  <main className="info-page">
   <p className="eyebrow">{eyebrow}</p>
   <h1>{title}</h1>
   {intro && <div className="info-intro">{intro}</div>}
   {children}
  </main>
  <SiteFooter />
 </div>;
}
