/** Worlds that stay open when Premium is on. Music and Sports are the two worlds on the home page. */
export const FREE_WORLD_KEYS = ["music", "sports"] as const;

/** New Play Five rounds a free signed-out (or free signed-in) player can start per UTC day. Today's Five is not counted. */
export const FREE_PLAY_FIVE_PER_DAY = 3;

export function isFreeWorld(category: string): boolean {
  return (FREE_WORLD_KEYS as readonly string[]).includes(category);
}

export function worldLocked(category: string, access: { paymentsOn: boolean; isPremium: boolean }): boolean {
  return access.paymentsOn && !access.isPremium && !isFreeWorld(category);
}

export function adventureLocked(access: { paymentsOn: boolean; isPremium: boolean }): boolean {
  return access.paymentsOn && !access.isPremium;
}

export function expandedStatsLocked(access: { paymentsOn: boolean; isPremium: boolean }): boolean {
  return access.paymentsOn && !access.isPremium;
}
