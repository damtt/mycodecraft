import type { Localized, Profile, WorldId } from '../../lib/types';

export interface AchievementDef {
  id: string;
  icon: string;
  name: Localized;
  desc: Localized;
  earned(p: Profile, questsByWorld: Record<WorldId, string[]>): boolean;
}

const doneCount = (p: Profile) => Object.keys(p.quests).length;
const worldDone = (p: Profile, ids: string[]) =>
  ids.length > 0 && ids.every((id) => id in p.quests);

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-quest', icon: '🌱',
    name: { en: 'First Quest', vi: 'Nhiệm vụ đầu tiên' },
    desc: { en: 'Complete your first quest', vi: 'Hoàn thành nhiệm vụ đầu tiên' },
    earned: (p) => doneCount(p) >= 1,
  },
  {
    id: 'world-html', icon: '🟫',
    name: { en: 'Grasslands Hero', vi: 'Anh hùng Đồng cỏ' },
    desc: { en: 'Finish every HTML quest', vi: 'Hoàn thành mọi nhiệm vụ HTML' },
    earned: (p, q) => worldDone(p, q.html),
  },
  {
    id: 'world-css', icon: '🟦',
    name: { en: 'Cave Painter', vi: 'Họa sĩ Hang động' },
    desc: { en: 'Finish every CSS quest', vi: 'Hoàn thành mọi nhiệm vụ CSS' },
    earned: (p, q) => worldDone(p, q.css),
  },
  {
    id: 'world-js', icon: '🟨',
    name: { en: 'Redstone Engineer', vi: 'Kỹ sư Redstone' },
    desc: { en: 'Finish every JS quest', vi: 'Hoàn thành mọi nhiệm vụ JS' },
    earned: (p, q) => worldDone(p, q.js),
  },
  {
    id: 'streak-7', icon: '🔥',
    name: { en: '7-Day Streak', vi: 'Chuỗi 7 ngày' },
    desc: { en: 'Play 7 days in a row', vi: 'Chơi 7 ngày liên tiếp' },
    earned: (p) => p.bestStreak >= 7,
  },
  {
    id: 'no-hint-10', icon: '🧠',
    name: { en: 'No-Hint Hero', vi: 'Anh hùng không gợi ý' },
    desc: { en: 'Beat 10 quests without hints', vi: 'Thắng 10 nhiệm vụ không cần gợi ý' },
    earned: (p) => Object.values(p.quests).filter((r) => !r.usedHint).length >= 10,
  },
];

export function computeNewAchievements(
  p: Profile,
  questsByWorld: Record<WorldId, string[]>,
): string[] {
  return ACHIEVEMENTS.filter(
    (a) => !p.achievements.includes(a.id) && a.earned(p, questsByWorld),
  ).map((a) => a.id);
}
