import type { Metadata } from "next";
import { ModeGame } from "@/components/game/ModeGame";
export const metadata: Metadata = { title: "World Mix | StarTap" };
export default function WorldMixPage() {
 return <ModeGame spec={{ mode: "world_mix" }} backHref="/" backLabel="HOME" />;
}
