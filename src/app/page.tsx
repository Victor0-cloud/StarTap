import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WorldsGrid } from "@/components/worlds/WorldCards";
import { CategoryIcon } from "@/components/worlds/CategoryIcon";
import { StreakBadge } from "@/components/game/StreakBadge";
import { HomeMascot } from "@/components/mascot/HomeMascot";
import { AccountNavLink, GooglePlayButton, PremiumNav, SiteFooter } from "@/components/site/SiteChrome";
import { catalog } from "@/lib/content/catalog";
import { categoryCounts } from "@/lib/content/counts";
import { homeJsonLd, pageMetadata, SITE_TITLE } from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import { IS_ANDROID_BUILD, PRODUCTION_URL, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = pageMetadata({ title: SITE_TITLE, path: "/" });

const counts = categoryCounts(catalog.raw);
const world = (key: string) => counts.find(c => c.key === key);
const STEPS = [
 ["01", "SEE THE STAR", "A famous face and a clue about a place in their story."],
 ["02", "SPIN THE GLOBE", "Drag, zoom and explore the world map."],
 ["03", "TAP & LOCK", "Drop your pin where you think it happened, then lock it in."],
 ["04", "SCORE", "Up to 1,000 points a round. The closer, the better."],
] as const;
// Floating star field behind the hero: [left %, top %, delay s, size scale]. Fixed positions, CSS-only animation.
const SKY = [[6,12,0,1],[18,64,1.2,.7],[29,22,2.4,.9],[41,80,.6,.6],[52,8,3.1,1.1],[63,46,1.8,.7],[71,18,.3,.9],[83,70,2.7,1],[92,30,1.5,.6],[12,40,3.6,.8],[47,58,2.1,.5],[77,90,.9,.7],[96,8,2.9,.8],[34,94,1.1,.6]] as const;
const DEVICES = [["📱", "PHONE"], ["📲", "TABLET"], ["💻", "LAPTOP"], ["🖥️", "DESKTOP"]] as const;

// One home for both builds. The Android app hides the web-only "play anywhere" and Google Play sections.
export default function Home() {
 const music = world("music"), sports = world("sports");
 return <div className="site-shell">
  <JsonLd data={homeJsonLd(PRODUCTION_URL, SUPPORT_EMAIL)} />
  <header className="masthead">
   <Link className="brand" href="/" aria-label="StarTap home"><span aria-hidden="true">✦</span> STAR<span>TAP</span>.</Link>
   <nav className="masthead-nav" aria-label="Main"><Link href="/how-to-play/">HOW TO PLAY</Link><Link href="/support/">SUPPORT</Link><AccountNavLink/></nav>
   <PremiumNav/>
   <HomeMascot/>
  </header>
  <main>
   <section className="home-page" aria-labelledby="home-title">
    <div className="sky-stars" aria-hidden="true">{SKY.map(([x, y, d, z], i) => <i key={i} style={{ left: x + "%", top: y + "%", animationDelay: d + "s", ["--z" as string]: z }}/>)}</div>
    <div className="home-copy">
     <p className="eyebrow home-kicker">✦ MUSIC. SPORT. EVERYWHERE.</p>
     <h1 id="home-title" className="home-five"><span>5 STARS</span><span>5 QUESTIONS</span><span>5 TAPS</span><em>ONE SCORE</em></h1>
     <p className="home-description">You know the face. But do you know the place? Follow the clue, spin the globe and tap where their story happened.</p>
     <div className="home-ctas">
      <Link className="primary-button home-play" href="/play/">PLAY NOW <span aria-hidden="true">↗</span></Link>
      {!IS_ANDROID_BUILD && <GooglePlayButton className="home-store"/>}
     </div>
     <Link className="secondary-button home-mix" href="/world-mix/">WORLD MIX <span aria-hidden="true">→</span></Link>
     <StreakBadge/>
     <p className="home-count">05 STARS <span>•</span> ABOUT 3 MINUTES <span>•</span> NO SIGN-UP</p>
    </div>
    <div className="globe-art"><Image src="/globe-hero.svg" width={1024} height={768} alt="Illustrated glowing Earth with an arcing route" priority/><span className="globe-caption">EVERY PLACE HAS A STORY</span></div>
   </section>

   <section className="home-section home-features" aria-label="Choose how to play">
    <Link className="feature-card feature-today" href="/play/">
     <span className="eyebrow">✦ DAILY</span><strong>TODAY&apos;S FIVE</strong>
     <span>Five stars, the same for everyone today. A new set every day at midnight UTC.</span>
     <span className="feature-cta">PLAY TODAY&apos;S FIVE <span aria-hidden="true">→</span></span>
    </Link>
    {music && <Link className="feature-card feature-music" href="/category/music/">
     <CategoryIcon category="music" size={34}/><strong>MUSIC WORLD</strong>
     <span>{music.stars} stars across {music.subcategories.filter(s => s.stars > 0).length} genres, from Afrobeats to K-Pop. Every genre has its own intro.</span>
     <span className="feature-cta">ENTER MUSIC <span aria-hidden="true">→</span></span>
    </Link>}
    {sports && <Link className="feature-card feature-sports" href="/category/sports/">
     <Image className="feature-poster" src="/images/sports-world/sports_world.webp" alt="" width={941} height={1672} loading="lazy"/>
     <CategoryIcon category="sports" size={34}/><strong>SPORTS WORLD</strong>
     <span>{sports.stars} stars from football, tennis, basketball, F1 and more.</span>
     <span className="feature-cta">ENTER SPORTS <span aria-hidden="true">→</span></span>
    </Link>}
   </section>

   <div className="home-section"><WorldsGrid/></div>

   <section className="home-section" aria-labelledby="how-title">
    <h2 id="how-title" className="worlds-title">HOW STARTAP WORKS</h2>
    <ol className="home-how">{STEPS.map(([n, t, d]) => <li key={n}><b>{n}</b><strong>{t}</strong><span>{d}</span></li>)}</ol>
    <Link className="text-link" href="/how-to-play/">Full guide: how to play <span aria-hidden="true">→</span></Link>
   </section>

   {!IS_ANDROID_BUILD && <section className="home-section home-anywhere" aria-labelledby="devices-title">
    <h2 id="devices-title" className="worlds-title">PLAY ANYWHERE</h2>
    <ul className="device-list">{DEVICES.map(([icon, label]) => <li key={label}><span aria-hidden="true">{icon}</span>{label}</li>)}</ul>
    <p>Plays in any modern browser — Chrome, Edge, Safari or Firefox. Touch, mouse or keyboard. No download, no account: your scores and streak are saved in this browser.</p>
   </section>}

   {!IS_ANDROID_BUILD && <section className="home-section home-android" aria-labelledby="android-title">
    <div><h2 id="android-title" className="worlds-title">STARTAP FOR ANDROID</h2>
     <p>The same game and the same daily five, as an app. The Android version is on its way to Google Play.</p></div>
    <GooglePlayButton/>
   </section>}
  </main>
  <SiteFooter/>
 </div>;
}
