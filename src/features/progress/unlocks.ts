import type { Profile, Quest, WorldId } from '../../lib/types';

const WORLD_ORDER: WorldId[] = ['html', 'css', 'js'];

export function worldUnlocked(
  world: WorldId,
  profile: Profile,
  questsByWorld: Record<WorldId, Quest[]>,
): boolean {
  const idx = WORLD_ORDER.indexOf(world);
  if (idx === 0) return true;
  const prev = questsByWorld[WORLD_ORDER[idx - 1]];
  return prev.every((q) => q.id in profile.quests);
}

export type QuestStatus = 'done' | 'current' | 'locked';

/** Linear unlock within a world: first not-done quest of an unlocked world is 'current'. */
export function questStatus(
  quest: Quest,
  profile: Profile,
  questsByWorld: Record<WorldId, Quest[]>,
): QuestStatus {
  if (quest.id in profile.quests) return 'done';
  if (!worldUnlocked(quest.world, profile, questsByWorld)) return 'locked';
  const firstOpen = questsByWorld[quest.world].find((q) => !(q.id in profile.quests));
  return firstOpen?.id === quest.id ? 'current' : 'locked';
}
