/** What the browser may see. Payment-plan ids stay on the server. */
export type PriceQuoteView = {
  priceStatus: "APPROVED" | "UNAPPROVED";
  country: string | null;
  localCurrency: string;
  currency: string;
  usdFallback: boolean;
  localAvailable: boolean;
  /** USD can be charged here. When false the page shows no local / USD toggle. */
  usdAvailable: boolean;
  monthly: { plan: "premium_monthly" | "premium_yearly"; amount: number; currency: string; label: string; per: string };
  yearly: { plan: "premium_monthly" | "premium_yearly"; amount: number; currency: string; label: string; per: string };
};

export function isPriceQuoteView(value: unknown): value is PriceQuoteView {
  if (value === null || typeof value !== "object") return false;
  const row = value as Partial<PriceQuoteView>;
  return (row.priceStatus === "APPROVED" || row.priceStatus === "UNAPPROVED")
    && typeof row.currency === "string"
    && typeof row.localCurrency === "string"
    && typeof row.usdFallback === "boolean"
    && typeof row.localAvailable === "boolean"
    && typeof row.usdAvailable === "boolean"
    && side(row.monthly)
    && side(row.yearly);
}

function side(value: PriceQuoteView["monthly"] | undefined): boolean {
  return !!value && (value.plan === "premium_monthly" || value.plan === "premium_yearly") && typeof value.amount === "number" && typeof value.currency === "string";
}
