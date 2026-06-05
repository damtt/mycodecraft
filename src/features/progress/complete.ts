import type { Profile, Quest, Rewards, WorldId } from '../../lib/types';
import { rankForXp } from './ranks';
import { updateStreak } from './streak';
import { computeNewAchievements } from './achievements';

export const DAILY_BONUS_XP = 20;

/**
 * Pure quest-completion. Rules (spec §Gamification):
 * - First completion: quest.xp + badge. Replays: no XP, no badge.
 * - First completion of the calendar day (incl. replays): +20 daily bonus, streak extends.
 * - QuestRecord keeps FIRST completion's usedHint (replays never overwrite).
 */
export function completeQuest(
  profile: Profile,
  quest: Quest,
  opts: { usedHint: boolean; today: string; questsByWorld: Record<WorldId, string[]> },
): { profile: Profile; rewards: Rewards } {
  const firstTime = !(quest.id in profile.quests);
  const dailyBonus = profile.streak.lastDay !== opts.today;
  const xpGained = (firstTime ? quest.xp : 0) + (dailyBonus ? DAILY_BONUS_XP : 0);

  const streak = updateStreak(profile.streak, opts.today);
  const newBadge =
    firstTime && !profile.badges.includes(quest.badge) ? quest.badge : null;

  const next: Profile = {
    ...profile,
    xp: profile.xp + xpGained,
    quests: firstTime
      ? { ...profile.quests, [quest.id]: { completedAt: opts.today, usedHint: opts.usedHint } }
      : { ...profile.quests },
    streak,
    bestStreak: Math.max(profile.bestStreak, streak.count),
    badges: newBadge ? [...profile.badges, newBadge] : [...profile.badges],
  };

  const newAchievements = computeNewAchievements(next, opts.questsByWorld);
  next.achievements = [...profile.achievements, ...newAchievements];

  return {
    profile: next,
    rewards: {
      firstTime,
      xpGained,
      dailyBonus,
      leveledUp: rankForXp(next.xp).level > rankForXp(profile.xp).level,
      newBadge,
      newAchievements,
      streak: streak.count,
    },
  };
}
