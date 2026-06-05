import type { Quest, WorldId } from '../../lib/types';
import { HTML_QUESTS } from './html';
import { CSS_QUESTS } from './css';
import { JS_QUESTS } from './js';

/** Global quest order: html → css → js. nextQuest() relies on this ordering. */
export const ALL_QUESTS: Quest[] = [...HTML_QUESTS, ...CSS_QUESTS, ...JS_QUESTS];

export const QUESTS_BY_WORLD: Record<WorldId, Quest[]> = {
  html: ALL_QUESTS.filter((q) => q.world === 'html'),
  css: ALL_QUESTS.filter((q) => q.world === 'css'),
  js: ALL_QUESTS.filter((q) => q.world === 'js'),
};

export const QUESTS_BY_WORLD_IDS: Record<WorldId, string[]> = {
  html: QUESTS_BY_WORLD.html.map((q) => q.id),
  css: QUESTS_BY_WORLD.css.map((q) => q.id),
  js: QUESTS_BY_WORLD.js.map((q) => q.id),
};

export const questById = (id: string): Quest | undefined =>
  ALL_QUESTS.find((q) => q.id === id);

/** Next quest in global ALL_QUESTS order (html → css → js). Relies on quests being appended world-by-world. Returns null at end of all content. */
export function nextQuest(id: string): Quest | null {
  const idx = ALL_QUESTS.findIndex((q) => q.id === id);
  if (idx === -1 || idx === ALL_QUESTS.length - 1) return null;
  return ALL_QUESTS[idx + 1];
}
