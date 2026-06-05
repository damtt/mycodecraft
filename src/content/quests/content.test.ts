import type { Localized } from '../../lib/types';
import { ALL_QUESTS, QUESTS_BY_WORLD } from './index';
import { BADGES } from '../badges';
import { WORLDS } from '../worlds';

const filled = (l: Localized) => l.en.trim() !== '' && l.vi.trim() !== '';

describe('quest content integrity', () => {
  test('30 quests, 10 per world, ids unique and well-formed', () => {
    expect(ALL_QUESTS).toHaveLength(30);
    for (const world of WORLDS) {
      expect(QUESTS_BY_WORLD[world.id]).toHaveLength(10);
    }
    const ids = ALL_QUESTS.map((q) => q.id);
    expect(new Set(ids).size).toBe(30);
    for (const q of ALL_QUESTS) {
      expect(q.id).toMatch(new RegExp(`^${q.world}-\\d{2}$`));
    }
  });

  test.each(ALL_QUESTS.map((q) => [q.id, q] as const))('%s is complete', (_id, q) => {
    expect(filled(q.title)).toBe(true);
    expect(filled(q.story)).toBe(true);
    expect(q.starterCode.trim()).not.toBe('');
    expect(q.steps.length).toBeGreaterThanOrEqual(1);
    expect(q.steps.length).toBeLessThanOrEqual(6);
    for (const step of q.steps) {
      expect(filled(step.text)).toBe(true);
      if (step.hint) expect(filled(step.hint)).toBe(true);
    }
    expect(q.checks.length).toBeGreaterThanOrEqual(1);
    for (const check of q.checks) {
      expect(filled(check.failMessage)).toBe(true);
      if ('selector' in check) expect(check.selector.trim()).not.toBe('');
      if (check.type === 'computedStyle') expect(check.equalsAny.length).toBeGreaterThan(0);
    }
    expect([50, 75, 100]).toContain(q.xp);
  });

  test('boss quests award 100 XP', () => {
    for (const q of ALL_QUESTS.filter((x) => x.id.endsWith('-10'))) {
      expect(q.xp).toBe(100);
    }
  });

  test('every quest badge exists, badges unique, all 30 used', () => {
    const badgeIds = new Set(BADGES.map((b) => b.id));
    const used = ALL_QUESTS.map((q) => q.badge);
    for (const b of used) expect(badgeIds.has(b)).toBe(true);
    expect(new Set(used).size).toBe(30);
    expect(BADGES).toHaveLength(30);
  });

  test('badges have icons and bilingual names', () => {
    for (const b of BADGES) {
      expect(b.icon.trim()).not.toBe('');
      expect(filled(b.name)).toBe(true);
    }
  });
});
