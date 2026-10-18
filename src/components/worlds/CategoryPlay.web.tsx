"use client";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModeGame } from "@/components/game/ModeGame";
import { CinematicPlayer } from "@/components/cinematic/CinematicPlayer";
import { markWatched, shouldPlay } from "@/components/cinematic/watched";
import { catalog } from "@/lib/content/catalog";
import { categoryCounts } from "@/lib/content/counts";
import { genreIntro, WORLD_INTROS, type Cinematic } from "@/lib/game/cinematics";
import type { ModeSpec } from "@/lib/game/modes";
import { isFreeWorld, sportsPoolFor, subcategoryLocked } from "@/lib/premium/access";
import { usePremium } from "@/lib/premium/usePremium";
import { PremiumLock } from "@/components/premium/PremiumLock";

const subscribe = () => () => {};
// ?sub=<key> plays a subcategory when it has enough stars; anything else falls back to the whole category.
// &intro=1 (a Music genre tap): that genre's intro plays every time, then a brand-new five from Round 1.
export function CategoryPlay({ category }: { category: string }) {
 const access = usePremium();
 const params = useSearchParams();
 const sub = params.get("sub");
 const [always] = useState(() => params.get("intro") === "1"); // fixed at entry: clearing the flag from the address later must not change it
 const [fresh] = useState(() => always || params.get("new") === "1"); // every PLAY FIVE: a brand-new five from Round 1
 const counts = categoryCounts(catalog.raw).find(c => c.key === category);
 const subcategory = sub && counts?.subcategories.find(s => s.key === sub && s.playable);
 // A free player's whole-world Sports Five is dealt only from the free sports; Premium players get every sport.
 const only = category === "sports" ? sportsPoolFor(access) : undefined;
 const spec: ModeSpec = subcategory ? { mode: "subcategory", category, subcategory: subcategory.key } : only ? { mode: "category", category, only } : { mode: "category", category };
 const backLabel = (counts?.label ?? "Back").toUpperCase();
 // A genre plays its own clip; sports (no per-sport clips) and world-wide play use the world's intro.
 const intro = (subcategory ? genreIntro(category, subcategory.key) : null) ?? WORLD_INTROS[category] ?? null;
 const mounted = useSyncExternalStore(subscribe, () => true, () => false); // watched flags live in local storage
 // Sports waits for status too: it decides both the lock and which sports a whole-world five may use.
 if (access.paymentsOn && (!isFreeWorld(category) || category === "sports")) {
  if (access.loading || !mounted) return <main className="empty-state">Checking access…</main>;
  if (!isFreeWorld(category) && !access.isPremium) return <PremiumLock kind="world" label={counts?.label} />;
  if (subcategory && subcategoryLocked(category, subcategory.key, access)) return <PremiumLock kind="sport" label={subcategory.label} back={`/category/${category}/`} />;
 }
 if (intro && !mounted) return <main className="adventure-cinematic-gate" />;
 return <GenreIntroGate key={JSON.stringify(spec)} intro={intro} always={always} backHref={`/category/${category}/`}>
  <ModeGame key={JSON.stringify(spec)} spec={spec} backHref={`/category/${category}/`} backLabel={backLabel} fresh={fresh} />
 </GenreIntroGate>;
}

/**
 * A genre's intro plays first — every time on a genre tap (`always`), otherwise only if not yet watched — then the game starts
 * straight away when it ends, is skipped or fails. Android Back during the intro returns to the category page instead.
 */
function GenreIntroGate({ intro, always, backHref, children }: { intro: Cinematic | null; always: boolean; backHref: string; children: ReactNode }) {
 const router = useRouter();
 const [playing, setPlaying] = useState<Cinematic | null>(() => intro && (always || shouldPlay(intro)) ? intro : null);
 if (playing) return <main className="adventure-cinematic-gate">
  <CinematicPlayer cinematic={playing} onDone={end => {
   if (end !== "error") markWatched(playing.id);
   try { window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search.replace(/&intro=1/, "")); } catch { /* ignore */ }
   if (end === "back") router.replace(backHref); else setPlaying(null);
  }} />
 </main>;
 return <>{children}</>;
}
