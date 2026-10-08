// Daily streak for Today's Five: +1 for each consecutive UTC day completed, reset to 1 after a missed day.
export const STREAK_KEY = "startap:streak:v1";
export interface Streak { version: 1; currentStreak: number; longestStreak: number; lastCompletedDate: string | null }
export const emptyStreak = (): Streak => ({ version: 1, currentStreak: 0, longestStreak: 0, lastCompletedDate: null });
const DAY = 86400000;
const valid = (d: unknown): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d + "T00:00:00Z"));
const gap = (from: string, to: string) => Math.round((Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / DAY);

export function readStreak(raw: string | null): Streak {
 try {
  const v = JSON.parse(raw ?? "null");
  const int = (n: unknown) => typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 100000;
  if (v?.version !== 1 || !int(v.currentStreak) || !int(v.longestStreak) || (v.lastCompletedDate !== null && !valid(v.lastCompletedDate))) return emptyStreak();
  return { version: 1, currentStreak: v.currentStreak, longestStreak: Math.max(v.longestStreak, v.currentStreak), lastCompletedDate: v.lastCompletedDate };
 } catch { return emptyStreak(); }
}

/** Records a completed Today's Five. Same-day repeats change nothing; a missed day starts again at 1. */
export function recordCompletion(streak: Streak, day: string): Streak {
 if (!valid(day)) return streak;
 const last = streak.lastCompletedDate;
 if (last === day || (last && gap(last, day) < 0)) return streak;
 const current = last && gap(last, day) === 1 ? streak.currentStreak + 1 : 1;
 return { version: 1, currentStreak: current, longestStreak: Math.max(streak.longestStreak, current), lastCompletedDate: day };
}

/** The streak to display today: still alive if the last completion was today or yesterday. */
export function activeStreak(streak: Streak, today: string): number {
 const last = streak.lastCompletedDate;
 if (!last || !valid(today)) return 0;
 const g = gap(last, today);
 return g >= 0 && g <= 1 ? streak.currentStreak : 0;
}
