import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PremiumView } from "@/components/account/PremiumView";
import { paymentsLive } from "@/lib/payments/env";
import { OFFERED_CURRENCIES, PLAN_CATALOG, PLAN_IDS, type CurrencyCode, type PlanId } from "@/lib/payments/plans";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({
  title: "StarTap Premium",
  description: "StarTap Premium unlocks every world, unlimited Play Five, Adventure and expanded history. Today's Five stays free.",
  path: "/premium/",
});

export default function PremiumPage() {
  if (!paymentsLive()) notFound();
  const prices = {} as Record<PlanId, Record<CurrencyCode, number>>;
  for (const plan of PLAN_IDS) {
    prices[plan] = {} as Record<CurrencyCode, number>;
    for (const currency of OFFERED_CURRENCIES) prices[plan][currency] = PLAN_CATALOG[plan].prices[currency].amount;
  }
  return <PremiumView prices={prices} />;
}
