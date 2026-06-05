import type { Streak } from '../../lib/types';

/** Local YYYY-MM-DD. The ONLY place the app reads the clock for dates. */
export function todayString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dayBefore(day: string): string {
  const d = new Date(`${day}T12:00:00`); // noon dodges DST edges
  d.setDate(d.getDate() - 1);
  return todayString(d);
}

/** Called on quest completion. Same day → unchanged; yesterday → +1; gap → restart at 1. */
export function updateStreak(s: Streak, today: string): Streak {
  if (s.lastDay === today) return s;
  if (s.lastDay === dayBefore(today)) return { count: s.count + 1, lastDay: today };
  return { count: 1, lastDay: today };
}

/** What the HUD shows: streak decays to 0 visually if a day was missed. */
export function streakDisplay(s: Streak, today: string): number {
  if (s.lastDay === today || s.lastDay === dayBefore(today)) return s.count;
  return 0;
}
