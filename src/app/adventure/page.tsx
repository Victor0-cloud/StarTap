import type { Metadata } from "next";
import { AdventureMap } from "@/components/adventure/AdventureMap";
export const metadata: Metadata = { title: "Adventure of Wonders | StarTap" };
export default function AdventurePage() { return <AdventureMap />; }
