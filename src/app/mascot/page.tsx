import type { Metadata } from "next";
import { MascotSettings } from "@/components/mascot/MascotSettings";
export const metadata: Metadata = { title: "Your Mascot | StarTap" };
export default function MascotPage() { return <MascotSettings />; }
