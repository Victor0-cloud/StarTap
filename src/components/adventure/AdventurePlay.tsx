"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import adventureData from "@/content/adventure.json";
import type { Adventure } from "@/content/schema";
import { ModeGame } from "@/components/game/ModeGame";
import { ADVENTURE_KEY, findLevel, levelStates, readAdventure, recordLevel, wonderStars } from "@/lib/game/adventure";
import { WonderStars } from "./AdventureMap";
import { finishWonder } from "@/lib/game/wonder";
import { useState } from "react";
import { CinematicPlayer } from "@/components/cinematic/CinematicPlayer";
import { completionCinematic, LEVEL_INTROS, type Cinematic } from "@/lib/game/cinematics";
import { markWatched } from "@/components/cinematic/watched";

const adventure = adventureData as Adventure;
const read = () => { try { return localStorage.getItem(ADVENTURE_KEY); } catch { return null; } };
const save = (value: unknown) => { try { localStorage.setItem(ADVENTURE_KEY, JSON.stringify(value)); } catch { /* progress stays in this session only */ } };

/** Plays one Adventure level (a fixed five) and records its Wonder Stars on finish. Locked levels cannot be started. */
export function AdventurePlay() {
 const found = findLevel(adventure, useSearchParams().get("level"));
 const progress = readAdventure(read());
 const state = found && levelStates(found.world, progress)[found.index].state;
 if (!found || (state !== "open" && state !== "done")) return <main className="empty-state">
  <p>{found ? "Finish the level before to unlock this one." : "Level not found."}</p>
  <Link href="/adventure/">← ADVENTURE</Link>
 </main>;
 return <AdventureLevel key={found.level.id} found={found} />;
}

/**
 * Every time a level is opened: its intro (if it has one) plays, then a fresh game from Round 1 (Wonder Stars and best scores
 * are kept). Android Back during the intro returns to the Adventure map. The world-complete clip plays over the finish screen.
 */
function AdventureLevel({ found }: { found: NonNullable<ReturnType<typeof findLevel>> }) {
 const { level, index } = found;
 const router = useRouter();
 const [intro, setIntro] = useState<Cinematic | null>(() => LEVEL_INTROS[level.id] ?? null);
 const [finale, setFinale] = useState<Cinematic | null>(null);
 if (intro) return <main className="adventure-cinematic-gate">
  <CinematicPlayer cinematic={intro} onDone={end => { if (end !== "error") markWatched(intro.id); if (end === "back") router.replace("/adventure/"); else setIntro(null); }} />
 </main>;
 return <><ModeGame key={level.id} spec={{ mode: "adventure", level: level.id }} fixedIds={level.questionIds} fresh
  label={`Level ${index + 1} · ${level.title}`} backHref="/adventure/" backLabel="ADVENTURE" playAgainLabel="PLAY THIS LEVEL AGAIN"
  finishReveal={total => finishWonder({ total, label: level.title, category: found.world.category, gameKey: level.id,
   adventure: { stars: wonderStars(total), previousStars: readAdventure(read()).levels[level.id]?.stars ?? 0 } })}
  onFinish={total => {
   const before = readAdventure(read()), after = recordLevel(before, level.id, total);
   save(after);
   const clip = completionCinematic(found.world, before, after);
   if (clip) setFinale(clip);
  }}
  finishExtra={total => <div className="wonder-earned"><span className="eyebrow">WONDER STARS EARNED</span><WonderStars stars={wonderStars(total)} /></div>} />
  {finale && <CinematicPlayer key={finale.id} cinematic={finale} onDone={end => { if (end !== "error") markWatched(finale.id); setFinale(null); }} />}
 </>;
}
