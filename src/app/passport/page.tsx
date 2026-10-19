import type { Metadata } from "next";
import { PassportView } from "@/components/passport/PassportView";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Star Passport: Your Country Stamps | StarTap", description: "Your StarTap Star Passport: collect a stamp for each country you find in World Mix, a world or the Adventure. Saved in this browser.", path: "/passport/" });
export default function PassportPage() { return <PassportView />; }
