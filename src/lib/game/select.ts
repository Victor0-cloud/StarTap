// Balanced five-question selection for FUTURE editions and modes. Not wired into Today's Five:
// the current daily edition stays a frozen list until a new edition is explicitly approved.
export interface Candidate { id: string; entityId: string; primaryCategory: string; region: string; answerCountryCode: string }
export interface SelectRules { maxPerCategory?: number; maxPerRegion?: number; exclude?: ReadonlySet<string> }

// Deterministic PRNG so everyone gets the same five for the same seed (e.g. a date).
function seeded(seed: string): () => number {
 let h = 2166136261;
 for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
 return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/**
 * Picks five distinct people. Prefers at most `maxPerCategory` per category and `maxPerRegion` per origin region,
 * no repeated answer country, and nothing in `exclude` (recent days). Relaxes those preferences in a fixed order
 * (country → region → category → exclusions) only when the pool is too small, so it never fails on a thin pool.
 */
export function selectFive(pool: readonly Candidate[], seed: string, rules: SelectRules = {}): string[] {
 const { maxPerCategory = 2, maxPerRegion = 2, exclude = new Set<string>() } = rules;
 const random = seeded(seed);
 const order = [...pool].sort((a, b) => a.id < b.id ? -1 : 1).map(c => ({ c, k: random() })).sort((a, b) => a.k - b.k).map(x => x.c);
 const levels = [
  { country: true, region: true, category: true, fresh: true },
  { country: false, region: true, category: true, fresh: true },
  { country: false, region: false, category: true, fresh: true },
  { country: false, region: false, category: false, fresh: true },
  { country: false, region: false, category: false, fresh: false },
 ];
 const picked: Candidate[] = [];
 for (const level of levels) {
  for (const c of order) {
   if (picked.length === 5) break;
   if (picked.some(p => p.id === c.id || p.entityId === c.entityId)) continue;
   if (level.fresh && exclude.has(c.id)) continue;
   if (level.category && picked.filter(p => p.primaryCategory === c.primaryCategory).length >= maxPerCategory) continue;
   if (level.region && picked.filter(p => p.region === c.region).length >= maxPerRegion) continue;
   if (level.country && picked.some(p => p.answerCountryCode === c.answerCountryCode)) continue;
   picked.push(c);
  }
  if (picked.length === 5) break;
 }
 return picked.map(p => p.id);
}
