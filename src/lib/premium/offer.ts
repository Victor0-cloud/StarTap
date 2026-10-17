/** What /premium shows in the purchase card. `isPremium` already includes cancelled-but-not-expired. */
export function premiumOffer(access: { loading: boolean; isPremium: boolean; currentPeriodEnd: string | null }): "loading" | "purchase" | { until: string | null } {
  if (access.loading) return "loading";
  if (!access.isPremium) return "purchase";
  return { until: formatPremiumUntil(access.currentPeriodEnd) };
}

export function formatPremiumUntil(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
}
