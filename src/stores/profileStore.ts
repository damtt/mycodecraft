import { create } from 'zustand';
import type { Profile, Quest, Rewards, WorldId } from '../lib/types';
import { saveData, loadData, removeData } from '../lib/storage';
import { completeQuest as completeQuestPure } from '../features/progress/complete';
import { todayString } from '../features/progress/streak';

// Task 18 replaces this with: import { QUESTS_BY_WORLD_IDS } from '../content/quests';
const QUESTS_BY_WORLD_IDS: Record<WorldId, string[]> = { html: [], css: [], js: [] };

export const INDEX_KEY = 'codecraft:profile-index';
export const profileKey = (id: string) => `codecraft:profile:${id}`;

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

const isProfile = (v: unknown): v is Profile => {
  const p = v as Profile;
  return (
    typeof p === 'object' && p !== null &&
    typeof p.id === 'string' && typeof p.name === 'string' &&
    typeof p.xp === 'number' &&
    typeof p.quests === 'object' && p.quests !== null &&
    typeof p.streak === 'object' && p.streak !== null &&
    typeof p.streak.count === 'number' && typeof p.streak.lastDay === 'string' &&
    typeof p.bestStreak === 'number' &&
    Array.isArray(p.badges) && Array.isArray(p.achievements)
  );
};

/** Load all valid profiles; silently skips corrupt ones (spec §Error Handling). */
export function loadProfiles(): Profile[] {
  const ids = loadData(INDEX_KEY, isStringArray) ?? [];
  return ids
    .map((id) => loadData(profileKey(id), isProfile))
    .filter((p): p is Profile => p !== null);
}

function persist(profiles: Profile[]) {
  saveData(INDEX_KEY, profiles.map((p) => p.id));
  for (const p of profiles) saveData(profileKey(p.id), p);
}

interface ProfileState {
  profiles: Profile[];
  activeId: string | null;
  create(name: string, avatar: string): void;
  remove(id: string): void;
  select(id: string): void;
  deselect(): void;
  completeQuest(quest: Quest, usedHint: boolean, today?: string): Rewards | null;
  resetActive(): void;
}

export const useProfiles = create<ProfileState>()((set, get) => ({
  profiles: loadProfiles(),
  activeId: null,

  create: (name, avatar) => {
    const profile: Profile = {
      id: crypto.randomUUID(), name, avatar, xp: 0, quests: {},
      streak: { count: 0, lastDay: '' }, bestStreak: 0,
      badges: [], achievements: [], createdAt: todayString(),
    };
    const profiles = [...get().profiles, profile];
    persist(profiles);
    set({ profiles });
  },

  remove: (id) => {
    const profiles = get().profiles.filter((p) => p.id !== id);
    removeData(profileKey(id));
    persist(profiles);
    set({ profiles, activeId: get().activeId === id ? null : get().activeId });
  },

  select: (id) => set({ activeId: id }),
  deselect: () => set({ activeId: null }),

  completeQuest: (quest, usedHint, today = todayString()) => {
    const { profiles, activeId } = get();
    const active = profiles.find((p) => p.id === activeId);
    if (!active) return null;
    const { profile, rewards } = completeQuestPure(active, quest, {
      usedHint, today, questsByWorld: QUESTS_BY_WORLD_IDS,
    });
    const next = profiles.map((p) => (p.id === profile.id ? profile : p));
    persist(next);
    set({ profiles: next });
    return rewards;
  },

  resetActive: () => {
    const { profiles, activeId } = get();
    const next = profiles.map((p) =>
      p.id === activeId
        ? { ...p, xp: 0, quests: {}, streak: { count: 0, lastDay: '' }, bestStreak: 0, badges: [], achievements: [] }
        : p,
    );
    persist(next);
    set({ profiles: next });
  },
}));

/** Convenience selector — null when no profile is active. */
export const useActiveProfile = () =>
  useProfiles((s) => s.profiles.find((p) => p.id === s.activeId) ?? null);
