import type { Metadata } from "next";
import { MascotSettings } from "@/components/mascot/MascotSettings";
import { pageMetadata } from "@/lib/seo";
// A settings screen: indexable content lives elsewhere, so it is kept out of search results.
export const metadata: Metadata = pageMetadata({ title: "Your Mascot | StarTap", description: "Choose the StarTap mascot that travels the globe with you. Saved on this device.", path: "/mascot/", index: false });
export default function MascotPage() { return <MascotSettings />; }
