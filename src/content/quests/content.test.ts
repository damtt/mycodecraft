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
    expect(q.steps.length).toBeGreaterThanOrEqual(2);
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
      if ('value' in check) expect(check.value.trim()).not.toBe('');
      if (check.type === 'attrEquals') expect(check.attr.trim()).not.toBe('');
      if (check.type === 'computedStyle') expect(check.prop.trim()).not.toBe('');
      if (check.type === 'elementCount') expect(check.min).toBeGreaterThanOrEqual(1);
    }
    expect([50, 75, 100]).toContain(q.xp);
    if (q.reflect) {
      expect(filled(q.reflect.question)).toBe(true);
      expect(filled(q.reflect.answer)).toBe(true);
      expect(q.reflect.answer.en.trim()).not.toBe(q.reflect.question.en.trim());
      expect(q.reflect.question.en.trim()).not.toBe(q.reflect.question.vi.trim());
      expect(q.reflect.answer.en.trim()).not.toBe(q.reflect.answer.vi.trim());
    }
    if (q.predict) {
      expect(filled(q.predict.question)).toBe(true);
      expect(q.predict.options.length).toBeGreaterThanOrEqual(2);
      expect(q.predict.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.predict.options) expect(filled(o.text)).toBe(true);
      expect(filled(q.predict.explain)).toBe(true);
      expect(q.predict.question.en.trim()).not.toBe(q.predict.question.vi.trim());
      expect(q.predict.explain.en.trim()).not.toBe(q.predict.explain.vi.trim());
    }
    if (q.experiment) {
      expect(filled(q.experiment)).toBe(true);
      expect(q.experiment.en.trim()).not.toBe(q.experiment.vi.trim());
    }
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
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });

  test('badges have icons and bilingual names', () => {
    for (const b of BADGES) {
      expect(b.icon.trim()).not.toBe('');
      expect(filled(b.name)).toBe(true);
    }
  });

  test('worlds have icons and bilingual names and taglines', () => {
    for (const w of WORLDS) {
      expect(w.icon.trim()).not.toBe('');
      expect(filled(w.name)).toBe(true);
      expect(filled(w.tagline)).toBe(true);
    }
  });

  // Lesson prose renders through react-markdown, which drops raw HTML. So every
  // tag in story/steps/hints/failMessages MUST live inside a backtick span or a
  // fenced block — otherwise it silently vanishes for kids.
  test.each(ALL_QUESTS.map((q) => [q.id, q] as const))(
    '%s has no raw HTML tags outside code spans',
    (_id, q) => {
      const stripCode = (s: string) =>
        s.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, ''); // drop fences then inline code
      const fields: string[] = [
        q.story.en, q.story.vi,
        ...q.steps.flatMap((s) => [s.text.en, s.text.vi, s.hint?.en ?? '', s.hint?.vi ?? '']),
        ...q.checks.flatMap((c) => [c.failMessage.en, c.failMessage.vi]),
        q.reflect?.question.en ?? '', q.reflect?.question.vi ?? '',
        q.reflect?.answer.en ?? '', q.reflect?.answer.vi ?? '',
        q.predict?.question.en ?? '', q.predict?.question.vi ?? '',
        ...(q.predict?.options ?? []).flatMap((o) => [o.text.en, o.text.vi]),
        q.predict?.explain.en ?? '', q.predict?.explain.vi ?? '',
        q.experiment?.en ?? '', q.experiment?.vi ?? '',
      ];
      for (const field of fields) {
        expect(stripCode(field)).not.toMatch(/<\/?[a-zA-Z][^>]*>/);
      }
    },
  );
});
