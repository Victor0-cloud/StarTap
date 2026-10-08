import type { Metadata } from "next";
import { PassportView } from "@/components/passport/PassportView";
export const metadata: Metadata = { title: "Star Passport | StarTap" };
export default function PassportPage() { return <PassportView />; }
