import type { Localized } from '../../lib/types';
import type { IconName } from '../../components/Icon';

export interface Rank {
  level: number;
  id: string;
  icon: IconName;
  name: Localized;
  minXp: number;
}

export const RANKS: Rank[] = [
  { level: 1, id: 'dirt', icon: 'dirt', name: { en: 'Dirt', vi: 'Đất' }, minXp: 0 },
  { level: 2, id: 'stone', icon: 'rock', name: { en: 'Stone', vi: 'Đá' }, minXp: 200 },
  { level: 3, id: 'iron', icon: 'pickaxe', name: { en: 'Iron', vi: 'Sắt' }, minXp: 500 },
  { level: 4, id: 'gold', icon: 'medal', name: { en: 'Gold', vi: 'Vàng' }, minXp: 900 },
  { level: 5, id: 'diamond', icon: 'diamond', name: { en: 'Diamond', vi: 'Kim cương' }, minXp: 1400 },
  { level: 6, id: 'obsidian', icon: 'black-tile', name: { en: 'Obsidian', vi: 'Obsidian' }, minXp: 2000 },
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
