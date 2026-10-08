export const EDITION = "global-v5";
export const HINT_COST = 200;
export function dateKey(now = new Date()): string { return now.toISOString().slice(0, 10); }
export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && dateKey(date) === value;
}
export function dailyIndices(day: string, size: number): number[] {
  if (!validDate(day) || size < 5) throw new RangeError("Invalid challenge");
  const dayNumber = Math.floor(new Date(day + "T00:00:00Z").getTime() / 86400000);
  const start = ((dayNumber * 3) % size + size) % size;
  return Array.from({length:5}, (_, i) => (start + i) % size);
}
export function scoreWithHint(base: number, hintUsed: boolean): number {
 return Math.max(0, base - (hintUsed ? HINT_COST : 0));
}



// Non-overlapping five-star sets before a versioned collection cycles.
export function globalDailyIndices(day: string, size: number): number[] {
 if (!validDate(day) || size < 5 || size % 5 !== 0) throw new RangeError("Invalid global challenge");
 const dayNumber = Math.floor(new Date(day + "T00:00:00Z").getTime() / 86400000);
 const start = ((dayNumber * 5) % size + size) % size;
 return Array.from({length:5}, (_, i) => (start + i) % size);
}

