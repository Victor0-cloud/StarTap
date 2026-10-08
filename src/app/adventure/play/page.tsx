import type { Metadata } from "next";
import { Suspense } from "react";
import { AdventurePlay } from "@/components/adventure/AdventurePlay";
export const metadata: Metadata = { title: "Adventure of Wonders | StarTap" };
export default function AdventurePlayPage() {
 return <Suspense fallback={<main className="empty-state">Preparing your five stars…</main>}><AdventurePlay /></Suspense>;
}
