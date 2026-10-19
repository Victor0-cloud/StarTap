import type { Metadata } from "next";
import { ModeGame } from "@/components/game/ModeGame";
import { PageAbout } from "@/components/site/PageAbout";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "World Mix: Five Stars From Every World | StarTap", description: "Five stars drawn from across StarTap's worlds, no more than two from any one world. Find the country, then the city: up to 1,000 points a round.", path: "/world-mix/" });
export default function WorldMixPage() {
 return <>
  <ModeGame spec={{ mode: "world_mix" }} backHref="/" backLabel="HOME" />
  <PageAbout id="about-world-mix" title="About World Mix" link={{ href: "/how-to-play/", label: "How to play →" }}>
   <p>World Mix deals five stars from across StarTap&apos;s worlds, such as music, sport, screen, tech and world icons, with no more than two from any one world. Each star comes with a clue about a place in their story.</p>
   <p>Every round has two steps. First find the country (up to 300 points), then land on the city (up to 700 points). Another hint gives a second clue for 200 points.</p>
  </PageAbout>
 </>;
}
