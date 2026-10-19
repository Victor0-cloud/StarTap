import type { Metadata } from "next";
import { Suspense } from "react";
import { AdventurePlay } from "@/components/adventure/AdventurePlay";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Play an Adventure Level | StarTap", description: "Play a level of StarTap's Adventure of Wonders: five stars, find the country, then the city, and earn Wonder Stars.", path: "/adventure/play/" });
export default function AdventurePlayPage() {
 return <Suspense fallback={<main className="empty-state">Preparing your five stars…</main>}><AdventurePlay /></Suspense>;
}
