// TEMPORARY LAUNCH BEHAVIOR — Premium gating currently applies only where checkout is supported (NGN-only launch).
// Elsewhere the status route reports regionAvailable false and the client shows no locks (see load-status.ts and
// docs/payments.md). Worldwide gating is switched on only after USD/global checkout is ready.

/** Worlds whose pages stay open when Premium is on. Music is free throughout; Sports is free only for FREE_SPORTS. */
export const FREE_WORLD_KEYS = ["music", "sports"] as const;

/**
 * Sports subcategory keys (taxonomy.json) that stay free. "football" is association football (Football / Soccer);
 * there is no separate soccer key. Every other sport is Premium, including "american-football" (gridiron) and any
 * sport that gains content later (golf, wrestling, olympic-legends).
 */
export const FREE_SPORTS = ["football", "basketball", "boxing"] as const;

/** New World Mix rounds a free player can start per UTC day. Today's Five, Music and free sports are not counted. */
export const FREE_PLAY_FIVE_PER_DAY = 3;

type Access = { paymentsOn: boolean; isPremium: boolean };

export function isFreeWorld(category: string): boolean {
  return (FREE_WORLD_KEYS as readonly string[]).includes(category);
}

export function isFreeSport(subcategory: string): boolean {
  return (FREE_SPORTS as readonly string[]).includes(subcategory);
}

export function worldLocked(category: string, access: Access): boolean {
  return access.paymentsOn && !access.isPremium && !isFreeWorld(category);
}

/** A sport is locked for a free player unless it is one of FREE_SPORTS. Non-sports subcategories follow their world. */
export function subcategoryLocked(category: string, subcategory: string, access: Access): boolean {
  if (worldLocked(category, access)) return true;
  return category === "sports" && access.paymentsOn && !access.isPremium && !isFreeSport(subcategory);
}

/**
 * Free Music and free sports never count against the daily cap. The whole-world Sports Five is uncapped too,
 * because a free player's five is dealt only from FREE_SPORTS (see sportsPoolFor).
 */
export function unlimitedFreePlay(category: string | null, subcategory: string | null): boolean {
  if (category === "music") return true;
  if (category !== "sports") return false;
  return subcategory === null || isFreeSport(subcategory);
}

/** Subcategories a whole-world Sports Five may draw from: the free sports for a free player, every sport otherwise. */
export function sportsPoolFor(access: Access): readonly string[] | undefined {
  return access.paymentsOn && !access.isPremium ? FREE_SPORTS : undefined;
}

export function adventureLocked(access: Access): boolean {
  return access.paymentsOn && !access.isPremium;
}

export function expandedStatsLocked(access: Access): boolean {
  return access.paymentsOn && !access.isPremium;
}
