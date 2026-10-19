import type { Metadata } from "next";
import { Suspense } from "react";
import { DailyGame } from "@/components/game/DailyGame";
import { PageAbout } from "@/components/site/PageAbout";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Today's Five: The Daily StarTap Geography Game", description: "Five famous stars from music, sport and screen, the same for everyone and new every day at midnight UTC. Tap the globe where their story happened: up to 1,000 points a star.", path: "/play/" });
export default function PlayPage(){return <>
 <Suspense fallback={<main className="empty-state">Preparing your five stars…</main>}><DailyGame/></Suspense>
 <PageAbout id="about-today" title="How Today's Five works" link={{ href: "/how-to-play/", label: "How to play →" }}>
  <p>Every day at midnight UTC, StarTap deals five famous stars from music, sport and screen. Everyone gets the same five. Each star comes with a short clue about a place in their story: where they grew up, trained or broke through.</p>
  <p>Spin the globe, tap a country to zoom in, then tap where you think it happened and lock your answer. The closer your pin, the higher your score: up to 1,000 points a star and 5,000 a game. Stuck? Another hint gives a second clue for 200 points. There is no clock.</p>
 </PageAbout>
</>;}
