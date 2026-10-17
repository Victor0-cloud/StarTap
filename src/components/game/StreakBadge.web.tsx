"use client";
import { useSyncExternalStore } from "react";
import { dateKey } from "@/lib/game/daily";
import { activeStreak, readStreak, STREAK_KEY } from "@/lib/game/streak";
import { expandedStatsLocked } from "@/lib/premium/access";
import { usePremium } from "@/lib/premium/usePremium";

const subscribe = () => () => {};
const read = () => { try { return localStorage.getItem(STREAK_KEY); } catch { return null; } };

/** "🔥 3 DAY STREAK" for Today's Five. Shows nothing until there is a live streak; never nags. */
export function StreakBadge({ showLongest = false }: { showLongest?: boolean }) {
 const access = usePremium();
 const raw = useSyncExternalStore(subscribe, read, () => null);
 const streak = readStreak(raw);
 const current = activeStreak(streak, dateKey());
 const longest = showLongest && !expandedStatsLocked(access);
 if (!current) return null;
 return <p className="streak-badge" aria-label={`${current} day streak`}>
  <span aria-hidden="true">🔥</span> {current} DAY STREAK
  {longest && streak.longestStreak > current && <small> · BEST {streak.longestStreak}</small>}
 </p>;
}
