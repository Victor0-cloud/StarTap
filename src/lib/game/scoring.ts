export const SCORE_TIERS = [
  { maxDistanceKm: 25, score: 1000 },
  { maxDistanceKm: 100, score: 900 },
  { maxDistanceKm: 250, score: 750 },
  { maxDistanceKm: 500, score: 600 },
  { maxDistanceKm: 1000, score: 400 },
  { maxDistanceKm: 2500, score: 200 },
  { maxDistanceKm: Infinity, score: 50 },
] as const;

export function calculateScore(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) throw new RangeError("Invalid distance");
  return SCORE_TIERS.find((tier) => distanceKm <= tier.maxDistanceKm)!.score;
}

export function feedbackForDistance(distanceKm: number): "PERFECT TAP!" | "AMAZING!" | "GREAT TAP!" | "NOT QUITE" {
  if (distanceKm <= 25) return "PERFECT TAP!";
  if (distanceKm <= 100) return "AMAZING!";
  if (distanceKm <= 500) return "GREAT TAP!";
  return "NOT QUITE";
}
