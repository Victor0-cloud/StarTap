import type { Metadata } from "next";
import { Suspense } from "react";
import { DailyGame } from "@/components/game/DailyGame";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Today's five | StarTap", description: "Play today's five: five stars, five questions, five taps, one score. A new set every day at midnight UTC.", path: "/play/" });
export default function PlayPage(){return <Suspense fallback={<main className="empty-state">Preparing your five stars…</main>}><DailyGame/></Suspense>;}
