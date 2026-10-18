import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PremiumView } from "@/components/account/PremiumView";
import { paymentsLive } from "@/lib/payments/env";
import { REGION_UNAVAILABLE, resolveQuote, toPublicQuote } from "@/lib/payments/pricing";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({
  title: "StarTap Premium",
  description: "StarTap Premium unlocks every world, unlimited Play Five, Adventure and expanded history. Today's Five stays free.",
  path: "/premium/",
});

export default async function PremiumPage() {
  if (!paymentsLive()) notFound();
  const requestHeaders = await headers();
  const quote = resolveQuote({
    env: process.env,
    countryHeader: requestHeaders.get("x-vercel-ip-country"),
    preference: "absent",
  });
  // No chargeable price for this visitor's region: a friendly page, not an error or a 404.
  if (!quote.ok && quote.reason === REGION_UNAVAILABLE) return <PremiumView quote={null} />;
  if (!quote.ok) notFound();
  return <PremiumView quote={toPublicQuote(quote.quote)} />;
}
