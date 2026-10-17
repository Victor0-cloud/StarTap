import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountPanel } from "@/components/account/AccountPanel";
import { paymentsLive } from "@/lib/payments/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Account | StarTap", robots: { index: false, follow: false } };

export default function AccountPage() {
  if (!paymentsLive()) notFound();
  return <AccountPanel />;
}
