// Free cosmetic Spark rewards, unlocked by total Wonder Stars. No purchases; nothing gated behind payment.
export const REWARDS_KEY = "startap:rewards:v1"; // remembers which unlocks the player has already been told about
export interface Reward { rewardId: string; requiredStars: number; type: "badge" | "color" | "accessory" | "trail"; label: string; assetKey: string }
export const REWARDS: readonly Reward[] = [
 { rewardId: "note-badge", requiredStars: 5, type: "badge", label: "Music note badge", assetKey: "reward-badge" },
 { rewardId: "gold-glow", requiredStars: 10, type: "color", label: "Golden glow", assetKey: "reward-glow" },
 { rewardId: "crown", requiredStars: 20, type: "accessory", label: "Spark crown", assetKey: "reward-crown" },
 { rewardId: "star-trail", requiredStars: 30, type: "trail", label: "Star trail", assetKey: "reward-trail" },
];
export const rewardStates = (stars: number) => REWARDS.map(r => ({ ...r, unlocked: stars >= r.requiredStars }));
/** CSS classes that dress Spark on the map for the rewards unlocked so far. */
export const sparkRewardClasses = (stars: number) => REWARDS.filter(r => stars >= r.requiredStars).map(r => r.assetKey).join(" ");
export function readSeen(raw: string | null): string[] {
 try {
  const v = JSON.parse(raw ?? "null");
  return Array.isArray(v) ? v.filter((x): x is string => REWARDS.some(r => r.rewardId === x)) : [];
 } catch { return []; }
}
/** Rewards unlocked but not yet announced ("New Spark reward!"). */
export const newRewards = (stars: number, seen: readonly string[]) => REWARDS.filter(r => stars >= r.requiredStars && !seen.includes(r.rewardId));
