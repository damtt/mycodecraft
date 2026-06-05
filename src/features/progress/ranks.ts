import type { Localized } from '../../lib/types';

export interface Rank {
  level: number;
  id: string;
  icon: string;
  name: Localized;
  minXp: number;
}

export const RANKS: Rank[] = [
  { level: 1, id: 'dirt', icon: '🟫', name: { en: 'Dirt', vi: 'Đất' }, minXp: 0 },
  { level: 2, id: 'stone', icon: '🪨', name: { en: 'Stone', vi: 'Đá' }, minXp: 200 },
  { level: 3, id: 'iron', icon: '⛏️', name: { en: 'Iron', vi: 'Sắt' }, minXp: 500 },
  { level: 4, id: 'gold', icon: '🥇', name: { en: 'Gold', vi: 'Vàng' }, minXp: 900 },
  { level: 5, id: 'diamond', icon: '💎', name: { en: 'Diamond', vi: 'Kim cương' }, minXp: 1400 },
  { level: 6, id: 'netherite', icon: '🟪', name: { en: 'Netherite', vi: 'Netherite' }, minXp: 2000 },
];

export function rankForXp(xp: number): Rank {
  let current = RANKS[0];
  for (const r of RANKS) if (xp >= r.minXp) current = r;
  return current;
}

/** The rank after the current one, or null at max rank. */
export function nextRank(xp: number): Rank | null {
  const current = rankForXp(xp);
  return RANKS.find((r) => r.level === current.level + 1) ?? null;
}
