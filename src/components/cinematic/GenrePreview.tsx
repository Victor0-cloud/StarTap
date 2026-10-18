"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { CinematicPlayer } from "./CinematicPlayer";
import { markWatched, shouldPlay } from "./watched";
import { genrePreview, type Cinematic } from "@/lib/game/cinematics";
import { GenrePlayAction } from "@/components/premium/GenrePlayAction";

const subscribe = () => () => {};
/** Genre preview screen. Gameplay appears only when the genre has enough verified stars — never padded with placeholder data. */
export function GenrePreviewView({ previewKey, category, categoryLabel, stars, playable }: { previewKey: string; category: string; categoryLabel: string; stars: number; playable: boolean }) {
 const preview = genrePreview(category, previewKey)!;
 const [w, h] = preview.artworkSize ?? [1122, 1402];
 const mounted = useSyncExternalStore(subscribe, () => true, () => false); // watched flags live in local storage
 return <main className={`world-page genre-page genre-${preview.theme}`} data-genre={preview.key}>
  <Link className="world-back" href={`/category/${category}/`}>← {categoryLabel.toUpperCase()}</Link>
  <header className="genre-hero">
   {preview.artwork && <Image className="genre-art" src={preview.artwork} alt="" width={w} height={h} style={{ aspectRatio: `auto ${w}/${h}` }} unoptimized priority />}
   <p className="eyebrow">{categoryLabel.toUpperCase()} WORLD</p>
   <h1>{preview.title.toUpperCase()}</h1>
   <p className="genre-subtitle">{preview.subtitle}</p>
   <p className="genre-description">{preview.description}</p>
   {playable && <p className="genre-count">{stars} verified stars</p>}
  </header>
  {mounted && preview.cinematic && <GenreIntro cinematic={preview.cinematic} playHref={playable && preview.subcategory ? `/category/${category}/play/?sub=${preview.subcategory}&new=1` : null} />}
  {playable && preview.subcategory
   ? <GenrePlayAction category={category} subcategory={preview.subcategory} title={preview.title} href={`/category/${category}/play/?sub=${preview.subcategory}&intro=1`} />
   : <p className="world-soon genre-pending">{stars > 0 ? `${stars} verified ${stars === 1 ? "star" : "stars"} so far — gameplay opens at 5.` : "Gameplay coming soon — verified stars are being added."}</p>}
 </main>;
}

/**
 * First visit: the genre's intro plays, and when it ends or is skipped the game starts straight away (if the genre is playable).
 * Back / Escape during it, or a clip that fails, leaves the player on this page. Replay Intro only replays; it stays here.
 */
function GenreIntro({ cinematic, playHref }: { cinematic: Cinematic; playHref: string | null }) {
 const router = useRouter();
 const [playing, setPlaying] = useState<{ clip: Cinematic; first: boolean } | null>(() => shouldPlay(cinematic) ? { clip: cinematic, first: true } : null);
 return <>
  <button type="button" className="secondary-button replay-intro" onClick={() => setPlaying({ clip: cinematic, first: false })}>▶ REPLAY INTRO</button>
  {playing && <CinematicPlayer key={playing.clip.id} cinematic={playing.clip} onDone={end => {
   if (end !== "error") markWatched(playing.clip.id);
   setPlaying(null);
   if (playing.first && playHref && (end === "ended" || end === "skipped")) {
    try { window.history.replaceState(window.history.state, "", window.location.pathname); } catch { /* ignore */ } // a QA ?resetIntro= must not re-apply on the game screen
    router.push(playHref);
   }
  }} />}
 </>;
}
