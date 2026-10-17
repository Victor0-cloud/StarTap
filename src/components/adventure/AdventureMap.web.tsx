"use client";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import adventureData from "@/content/adventure.json";
import type { Adventure, AdventureWorld } from "@/content/schema";
import { ADVENTURE_KEY, levelStates, nextLevelId, readAdventure, starTotals, type AdventureProgress } from "@/lib/game/adventure";
import { newRewards, readSeen, REWARDS_KEY, rewardStates, sparkRewardClasses } from "@/lib/game/rewards";
import { CategoryIcon } from "@/components/worlds/CategoryIcon";
import { useMascot } from "@/components/mascot/useMascot";
import { MASCOTS, mascotToken } from "@/lib/game/mascots";
import { CinematicPlayer } from "@/components/cinematic/CinematicPlayer";
import { LEVEL_INTROS, WORLD_INTROS, type Cinematic } from "@/lib/game/cinematics";
import { markWatched, shouldPlay } from "@/components/cinematic/watched";
import { adventureLocked } from "@/lib/premium/access";
import { usePremium } from "@/lib/premium/usePremium";
import { PremiumLock } from "@/components/premium/PremiumLock";

const adventure = adventureData as Adventure;
const subscribe = () => () => {};
const readKey = (key: string) => () => { try { return localStorage.getItem(key); } catch { return null; } };
const readSaved = readKey(ADVENTURE_KEY);
const readRewardsSeen = readKey(REWARDS_KEY);
const WORLD_KEY = "startap:adventure:world"; // last world viewed (convenience only)
/** A world's intro plays the first time that world is viewed (here or on its world screen); afterwards only via Replay Intro. */
const unwatchedIntro = (worldId: string): Cinematic | null => { const c = WORLD_INTROS[worldId]; return shouldPlay(c) ? c : null; };

export const WonderStars = ({ stars, max = 3 }: { stars: number; max?: number }) =>
 <span className="wonder-stars" aria-label={`${stars} of ${max} Wonder Stars`}>{Array.from({ length: max }, (_, i) => <span key={i} className={i < stars ? "on" : ""}>★</span>)}</span>;

const worldStars = (world: AdventureWorld, progress: AdventureProgress) => starTotals({ worlds: [world] }, progress);

/** Adventure of Wonders: choose a world, follow its glowing path of levels. Progress is real or empty, never faked. */
export function AdventureMap() {
 const access = usePremium();
 if (access.paymentsOn && access.loading) return <main className="empty-state">Checking access…</main>;
 if (adventureLocked(access)) return <PremiumLock kind="adventure" />;
 return <AdventureMapLive />;
}
function AdventureMapLive() {
 // Rendered in the browser only: progress, chosen world and rewards all live in local storage.
 const mounted = useSyncExternalStore(subscribe, () => true, () => false);
 return mounted ? <AdventureScreen /> : <main className="empty-state">Preparing your adventure…</main>;
}
function AdventureScreen() {
 const saved = useSyncExternalStore(subscribe, readSaved, () => null);
 const seenRaw = useSyncExternalStore(subscribe, readRewardsSeen, () => null);
 const progress = readAdventure(saved);
 const totals = starTotals(adventure, progress);
 const [mascot] = useMascot(); // rewards are worn by the player's chosen mascot
 const [worldId, setWorldId] = useState<string>(() => { try { return localStorage.getItem(WORLD_KEY) ?? "music"; } catch { return "music"; } });
 const world = adventure.worlds.find(w => w.id === worldId) ?? adventure.worlds[0];
 const [intro, setIntro] = useState<Cinematic | null>(() => unwatchedIntro(world.id));
 const worldIntro = WORLD_INTROS[world.id];
 const fresh = newRewards(totals.earned, readSeen(seenRaw));
 // Announce each newly unlocked reward once, then remember it.
 useEffect(() => {
  try {
   const seen = readSeen(localStorage.getItem(REWARDS_KEY));
   const unseen = newRewards(totals.earned, seen);
   if (unseen.length) localStorage.setItem(REWARDS_KEY, JSON.stringify([...seen, ...unseen.map(r => r.rewardId)]));
  } catch { /* shown again next time */ }
 }, [totals.earned]);
 function choose(id: string) { setWorldId(id); try { localStorage.setItem(WORLD_KEY, id); } catch { /* ignore */ } setIntro(i => i ?? unwatchedIntro(id)); }
 const ws = worldStars(world, progress);
 return <main className="adventure-page">
  <Link className="world-back" href="/">← HOME</Link>
  <header className="adventure-hero">
   <p className="eyebrow">✦ STARTAP ADVENTURE</p>
   <h1>ENTER THE ADVENTURE OF <em>WONDERS</em></h1>
   <p className="adventure-lines">Discover stars. Travel the world. Collect Wonder Stars.</p>
   <p className="wonder-total"><span aria-hidden="true">★</span> {totals.earned} / {totals.max} WONDER STARS</p>
  </header>
  {fresh.length > 0 && <p className="reward-toast" role="status"><span aria-hidden="true">✨ </span>New reward for {MASCOTS[mascot].name}! {fresh.map(r => r.label).join(", ")}</p>}

  <nav className="world-tabs" aria-label="Adventure worlds">
   {adventure.worlds.map(w => {
    const t = worldStars(w, progress);
    return <button key={w.id} type="button" className="world-tab" aria-pressed={w.id === world.id} onClick={() => choose(w.id)}>
     <CategoryIcon category={w.category} size={22} /><strong>{w.title}</strong><small>★ {t.earned}/{t.max}</small>
    </button>;
   })}
   {(adventure.upcoming ?? []).map(u => <span key={u.title} className="world-tab world-tab-soon" aria-disabled="true">
    <CategoryIcon category={u.category} size={22} /><strong>{u.title}</strong><small>Coming soon</small>
   </span>)}
  </nav>

  <section className="adventure-world" aria-labelledby={`world-${world.id}`}>
   <p className="eyebrow">WORLD {adventure.worlds.indexOf(world) + 1} · ★ {ws.earned} / {ws.max}</p>
   <h2 id={`world-${world.id}`}><CategoryIcon category={world.category} size={26} /> {world.title.toUpperCase()}</h2>
   {worldIntro && <button type="button" className="secondary-button replay-intro" onClick={() => setIntro(worldIntro)}>▶ REPLAY INTRO</button>}
   <Link className="primary-button adventure-start" href={`/adventure/play/?level=${nextLevelId(world, progress)}`}>START {world.title.toUpperCase()} <span aria-hidden="true">→</span></Link>
   <ol className="level-path">
    {levelStates(world, progress).map(({ level, state, stars }, i) => {
     const body = <><span className="level-node" aria-hidden="true">{state === "locked" || state === "soon" ? "🔒" : i + 1}</span>
      <span className="level-text"><small>LEVEL {i + 1}</small><strong>{level.title}</strong>
       <em>{state === "done" ? <WonderStars stars={stars} /> : state === "open" ? "Ready to play" : state === "locked" ? "Finish the level before" : "Coming soon"}</em></span></>;
     return <li key={level.id} className={`level level-${state}`}>
      {state === "done" || state === "open" ? <Link href={`/adventure/play/?level=${level.id}`} aria-label={`Play level ${i + 1}: ${level.title}`}>{body}</Link> : <div aria-disabled="true">{body}</div>}
      {(state === "done" || state === "open") && LEVEL_INTROS[level.id] && <Link className="intro-replay" href={`/adventure/play/?level=${level.id}`} aria-label={`${level.title} intro, then play`}>▶ INTRO</Link>}
     </li>;
    })}
   </ol>
  </section>
  {intro && <CinematicPlayer key={intro.id} cinematic={intro} onDone={end => { if (end !== "error") markWatched(intro.id); setIntro(null); }} />}

  <section className="spark-rewards" aria-labelledby="rewards-title">
   <h2 id="rewards-title" className="worlds-title">{MASCOTS[mascot].name.toUpperCase()}&apos;S REWARDS</h2>
   <div className="rewards-row">
    <span className={"map-pin-player reward-preview " + sparkRewardClasses(totals.earned)} aria-hidden="true">
     <span className="map-ball mascot-art" style={{ backgroundImage: `url('${mascotToken(mascot)}')` }} /><span className="spark-acc acc-crown" /><span className="spark-acc acc-badge" />
    </span>
    <ul>
     {rewardStates(totals.earned).map(r => <li key={r.rewardId} className={r.unlocked ? "reward-on" : "reward-off"}>
      <strong>{r.unlocked ? "✓" : "🔒"} {r.label}</strong><small>{r.requiredStars} Wonder Stars</small>
     </li>)}
    </ul>
   </div>
  </section>
 </main>;
}
