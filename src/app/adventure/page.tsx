import type { Metadata } from "next";
import { AdventureMap } from "@/components/adventure/AdventureMap";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Adventure of Wonders: Travel the World | StarTap", description: "Discover stars, travel the world and collect Wonder Stars: StarTap's Adventure of Wonders, played level by level on the globe.", path: "/adventure/" });
export default function AdventurePage() { return <AdventureMap />; }
