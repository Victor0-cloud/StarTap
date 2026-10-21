import type { Metadata } from "next";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { pageMetadata } from "@/lib/seo";
// First-run onboarding: kept out of search results (the home page and How to play cover the same ground).
export const metadata: Metadata = pageMetadata({ title: "Welcome to StarTap", description: "A quick welcome to StarTap: get the country right to earn points, then tap the right city to win bigger.", path: "/welcome/", index: false });
export default function WelcomePage() { return <Onboarding />; }
