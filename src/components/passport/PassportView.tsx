"use client";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { catalog } from "@/lib/content/catalog";
import { playableQuestions } from "@/lib/content/counts";
import { countriesDiscovered, PASSPORT_KEY, readPassport, stampKey, stampList } from "@/lib/game/passport";
import { CountryFlag } from "@/components/game/CountryFlag";
import { CategoryIcon } from "@/components/worlds/CategoryIcon";

const subscribe = () => () => {};
const read = () => { try { return localStorage.getItem(PASSPORT_KEY); } catch { return null; } };
const FILTERS = [["all", "All"], ["music", "Music"], ["sports", "Sports"], ["screen", "Screen"], ["icons", "World Icons"], ["tech", "Tech"]] as const;
// Everything that can be stamped: each active answer country, per category.
const pool = playableQuestions(catalog.raw);
const TOTAL_COUNTRIES = new Set(pool.map(q => q.answer.countryCode)).size;
const TOTAL_STAMPS = new Set(pool.map(q => stampKey(q.answer.countryCode, q.primaryCategory))).size;
const formatDate = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function PassportView() {
 const mounted = useSyncExternalStore(subscribe, () => true, () => false);
 return mounted ? <PassportScreen /> : <main className="empty-state">Opening your passport…</main>;
}
function PassportScreen() {
 const passport = readPassport(useSyncExternalStore(subscribe, read, () => null));
 const [filter, setFilter] = useState<string>("all");
 const all = stampList(passport);
 const shown = stampList(passport, filter);
 return <main className="passport-page">
  <Link className="world-back" href="/">← HOME</Link>
  <header className="passport-head">
   <p className="eyebrow">✦ STARTAP</p>
   <h1>STAR <em>PASSPORT</em></h1>
   <div className="passport-counts">
    <p><strong>{countriesDiscovered(passport)}</strong><small>/ {TOTAL_COUNTRIES} COUNTRIES DISCOVERED</small></p>
    <p><strong>{all.length}</strong><small>/ {TOTAL_STAMPS} STAMPS</small></p>
   </div>
  </header>
  {all.length === 0 ? <section className="passport-empty">
   <p>Find the right country in World Mix, a category or the Adventure to collect your first stamp.</p>
   <div className="share-actions"><Link className="primary-button" href="/world-mix/">WORLD MIX →</Link><Link className="secondary-button" href="/adventure/">ADVENTURE</Link></div>
  </section> : <>
   <h2 className="worlds-title">RECENT STAMPS</h2>
   <div className="stamp-recent">{all.slice(0, 3).map(s => <span key={stampKey(s.countryCode, s.category)} className="stamp-chip"><CountryFlag country={s.countryName} /> {s.countryName}</span>)}</div>
   <div className="passport-filters" role="group" aria-label="Filter stamps">
    {FILTERS.map(([key, label]) => <button key={key} type="button" className="reveal-tab" aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>)}
   </div>
   {shown.length === 0 ? <p className="world-soon">No {FILTERS.find(f => f[0] === filter)?.[1]} stamps yet.</p> :
    <ul className="stamp-grid">{shown.map(s => <li key={stampKey(s.countryCode, s.category)} className="stamp">
     <CountryFlag country={s.countryName} />
     <strong>{s.countryName}</strong>
     <span className="stamp-type"><CategoryIcon category={s.category} size={14} /> {s.stampType}</span>
     <small>{formatDate(s.firstUnlockedAt)} · best {s.bestScore}</small>
    </li>)}</ul>}
  </>}
 </main>;
}
