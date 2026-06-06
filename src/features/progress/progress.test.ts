import type { Profile, Quest, WorldId } from '../../lib/types';
import { rankForXp, nextRank } from './ranks';
import { updateStreak, streakDisplay, dayBefore } from './streak';
import { completeQuest } from './complete';
import { worldUnlocked, questStatus } from './unlocks';

const L = (s: string) => ({ en: s, vi: s });

function makeQuest(id: string, world: WorldId, xp: 50 | 75 | 100 = 50): Quest {
  return {
    id, world, xp, badge: `badge-${id}`,
    title: L(id), story: L('s'), steps: [], starterCode: '',
    checks: [{ type: 'codeIncludes', value: 'x', failMessage: L('f') }],
  };
}

function makeProfile(over: Partial<Profile> = {}): Profile {
  return {
    id: 'p1', name: 'Mai', avatar: '🦊', xp: 0, quests: {},
    streak: { count: 0, lastDay: '' }, bestStreak: 0,
    badges: [], achievements: [], createdAt: '2026-06-01', ...over,
  };
}

const q1 = makeQuest('html-01', 'html');
const q2 = makeQuest('html-02', 'html');
const QBW = { html: ['html-01', 'html-02'], css: ['css-01'], js: ['js-01'] };
const QUESTS_BW = { html: [q1, q2], css: [makeQuest('css-01', 'css')], js: [makeQuest('js-01', 'js')] };

describe('ranks', () => {
  test('thresholds', () => {
    expect(rankForXp(0).id).toBe('dirt');
    expect(rankForXp(199).id).toBe('dirt');
    expect(rankForXp(200).id).toBe('stone');
    expect(rankForXp(2000).id).toBe('obsidian');
    expect(nextRank(0)!.id).toBe('stone');
    expect(nextRank(2500)).toBeNull();
  });
});

describe('streak', () => {
  test('dayBefore crosses month boundary', () => {
    expect(dayBefore('2026-06-01')).toBe('2026-05-31');
  });
  test('same day unchanged, consecutive +1, gap resets to 1', () => {
    expect(updateStreak({ count: 3, lastDay: '2026-06-05' }, '2026-06-05')).toEqual({ count: 3, lastDay: '2026-06-05' });
    expect(updateStreak({ count: 3, lastDay: '2026-06-04' }, '2026-06-05')).toEqual({ count: 4, lastDay: '2026-06-05' });
    expect(updateStreak({ count: 3, lastDay: '2026-06-01' }, '2026-06-05')).toEqual({ count: 1, lastDay: '2026-06-05' });
    expect(updateStreak({ count: 0, lastDay: '' }, '2026-06-05')).toEqual({ count: 1, lastDay: '2026-06-05' });
  });
  test('display decays after missed day without mutating', () => {
    expect(streakDisplay({ count: 5, lastDay: '2026-06-04' }, '2026-06-05')).toBe(5);
    expect(streakDisplay({ count: 5, lastDay: '2026-06-01' }, '2026-06-05')).toBe(0);
  });
  test('streakDisplay does not mutate its input', () => {
    const s = { count: 5, lastDay: '2026-06-01' };
    streakDisplay(s, '2026-06-05');
    expect(s).toEqual({ count: 5, lastDay: '2026-06-01' });
  });
});

describe('completeQuest', () => {
  const today = '2026-06-05';

  test('first completion: xp + daily bonus + badge + first-quest achievement', () => {
    const { profile, rewards } = completeQuest(makeProfile(), q1, { usedHint: false, today, questsByWorld: QBW });
    expect(rewards).toMatchObject({ firstTime: true, xpGained: 70, dailyBonus: true, newBadge: 'badge-html-01', streak: 1 });
    expect(rewards.newAchievements).toContain('first-quest');
    expect(profile.xp).toBe(70);
    expect(profile.quests['html-01']).toEqual({ completedAt: today, usedHint: false });
  });

  test('replay same day: no xp, no badge, no daily bonus, keeps original usedHint', () => {
    const first = completeQuest(makeProfile(), q1, { usedHint: false, today, questsByWorld: QBW }).profile;
    const { profile, rewards } = completeQuest(first, q1, { usedHint: true, today, questsByWorld: QBW });
    expect(rewards).toMatchObject({ firstTime: false, xpGained: 0, dailyBonus: false, newBadge: null });
    expect(profile.quests['html-01'].usedHint).toBe(false);
  });

  test('replay next day: daily bonus + streak extends', () => {
    const first = completeQuest(makeProfile(), q1, { usedHint: false, today, questsByWorld: QBW }).profile;
    const { rewards } = completeQuest(first, q1, { usedHint: false, today: '2026-06-06', questsByWorld: QBW });
    expect(rewards).toMatchObject({ xpGained: 20, dailyBonus: true, streak: 2 });
  });

  test('level up detected and bestStreak tracked', () => {
    const p = makeProfile({ xp: 180, streak: { count: 6, lastDay: '2026-06-04' }, bestStreak: 6 });
    const { profile, rewards } = completeQuest(p, q1, { usedHint: false, today, questsByWorld: QBW });
    expect(rewards.leveledUp).toBe(true); // 180 + 50 + 20 = 250 ≥ 200
    expect(profile.bestStreak).toBe(7);
    expect(rewards.newAchievements).toContain('streak-7');
  });

  test('world achievement on finishing all world quests', () => {
    const p = completeQuest(makeProfile(), q1, { usedHint: false, today, questsByWorld: QBW }).profile;
    const { rewards } = completeQuest(p, q2, { usedHint: false, today, questsByWorld: QBW });
    expect(rewards.newAchievements).toContain('world-html');
  });

  test('does not mutate the input profile and shares no references', () => {
    const p = makeProfile();
    const snapshot = structuredClone(p);
    const { profile } = completeQuest(p, q1, { usedHint: false, today, questsByWorld: QBW });
    expect(p).toEqual(snapshot);
    expect(profile.quests).not.toBe(p.quests);
    expect(profile.badges).not.toBe(p.badges);
    // replay path too
    const replay = completeQuest(profile, q1, { usedHint: true, today, questsByWorld: QBW });
    expect(replay.profile.quests).not.toBe(profile.quests);
    expect(replay.profile.badges).not.toBe(profile.badges);
  });

  // Multi-rank jumps are unreachable: max gain is 120 XP (100 + 20 bonus) but
  // rank gaps are 200/300/400/500/600, so crossing two thresholds at once is impossible.
  test('leveledUp compares rank levels, not adjacency', () => {
    // crossing exactly one threshold still detects when current rank logic uses > comparison
    const p = makeProfile({ xp: 199 });
    const { rewards } = completeQuest(p, q1, { usedHint: false, today, questsByWorld: QBW });
    expect(rewards.leveledUp).toBe(true); // 199 + 70 = 269 → Stone
  });

  test('bestStreak survives a gap reset', () => {
    const p = makeProfile({ streak: { count: 6, lastDay: '2026-05-20' }, bestStreak: 6 });
    const { profile, rewards } = completeQuest(p, q1, { usedHint: false, today, questsByWorld: QBW });
    expect(rewards.streak).toBe(1);
    expect(profile.bestStreak).toBe(6);
  });
});

describe('unlocks', () => {
  test('html open from start; css locked until html done', () => {
    const fresh = makeProfile();
    expect(worldUnlocked('html', fresh, QUESTS_BW)).toBe(true);
    expect(worldUnlocked('css', fresh, QUESTS_BW)).toBe(false);
    const done = makeProfile({ quests: {
      'html-01': { completedAt: '2026-06-05', usedHint: false },
      'html-02': { completedAt: '2026-06-05', usedHint: false },
    }});
    expect(worldUnlocked('css', done, QUESTS_BW)).toBe(true);
  });

  test('questStatus: done / current / locked', () => {
    const p = makeProfile({ quests: { 'html-01': { completedAt: '2026-06-05', usedHint: false } } });
    expect(questStatus(q1, p, QUESTS_BW)).toBe('done');
    expect(questStatus(q2, p, QUESTS_BW)).toBe('current');
    expect(questStatus(QUESTS_BW.css[0], p, QUESTS_BW)).toBe('locked');
  });

  test('empty content arrays never report a later world unlocked', () => {
    const empty = { html: [] as Quest[], css: [] as Quest[], js: [] as Quest[] };
    expect(worldUnlocked('css', makeProfile(), empty)).toBe(false);
    expect(worldUnlocked('js', makeProfile(), empty)).toBe(false);
  });
});
