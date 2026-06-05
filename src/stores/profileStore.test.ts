import type { Quest } from '../lib/types';
import { useProfiles, loadProfiles, INDEX_KEY, profileKey } from './profileStore';

const L = (s: string) => ({ en: s, vi: s });
const quest: Quest = {
  id: 'html-01', world: 'html', xp: 50, badge: 'b-wood',
  title: L('q'), story: L('s'), steps: [], starterCode: '',
  checks: [{ type: 'codeIncludes', value: 'x', failMessage: L('f') }],
};

function reset() {
  localStorage.clear();
  useProfiles.setState({ profiles: [], activeId: null });
}

describe('profileStore', () => {
  beforeEach(reset);

  test('create persists profile + index, select activates', () => {
    useProfiles.getState().create('Mai', '🦊');
    const p = useProfiles.getState().profiles[0];
    expect(p.name).toBe('Mai');
    expect(localStorage.getItem(INDEX_KEY)).toContain(p.id);
    expect(localStorage.getItem(profileKey(p.id))).toContain('Mai');
    useProfiles.getState().select(p.id);
    expect(useProfiles.getState().activeId).toBe(p.id);
  });

  test('loadProfiles round-trips from localStorage', () => {
    useProfiles.getState().create('Mai', '🦊');
    const saved = useProfiles.getState().profiles;
    useProfiles.setState({ profiles: [], activeId: null });
    expect(loadProfiles()).toEqual(saved);
  });

  test('remove deletes profile key and clears active', () => {
    useProfiles.getState().create('Mai', '🦊');
    const id = useProfiles.getState().profiles[0].id;
    useProfiles.getState().select(id);
    useProfiles.getState().remove(id);
    expect(useProfiles.getState().profiles).toHaveLength(0);
    expect(useProfiles.getState().activeId).toBeNull();
    expect(localStorage.getItem(profileKey(id))).toBeNull();
  });

  test('completeQuest updates active profile, persists, returns rewards', () => {
    useProfiles.getState().create('Mai', '🦊');
    useProfiles.getState().select(useProfiles.getState().profiles[0].id);
    const rewards = useProfiles.getState().completeQuest(quest, false, '2026-06-05');
    expect(rewards?.xpGained).toBe(70); // 50 + 20 daily
    const active = useProfiles.getState().profiles[0];
    expect(active.xp).toBe(70);
    expect(localStorage.getItem(profileKey(active.id))).toContain('"xp":70');
  });

  test('resetActive zeroes progress but keeps identity', () => {
    useProfiles.getState().create('Mai', '🦊');
    const id = useProfiles.getState().profiles[0].id;
    useProfiles.getState().select(id);
    useProfiles.getState().completeQuest(quest, false, '2026-06-05');
    useProfiles.getState().resetActive();
    const p = useProfiles.getState().profiles[0];
    expect(p.xp).toBe(0);
    expect(p.quests).toEqual({});
    expect(p.name).toBe('Mai');
  });

  test('corrupt profile is skipped on load, others survive', () => {
    useProfiles.getState().create('Mai', '🦊');
    useProfiles.getState().create('Tom', '🐺');
    const [a] = useProfiles.getState().profiles;
    localStorage.setItem(profileKey(a.id), '{broken');
    expect(loadProfiles()).toHaveLength(1);
  });
});
