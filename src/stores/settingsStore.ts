import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang } from '../lib/types';

export type FontScale = 'sm' | 'md' | 'lg';

interface SettingsState {
  lang: Lang;
  soundOn: boolean;
  fontScale: FontScale;
  guideOn: boolean;
  setLang(lang: Lang): void;
  toggleSound(): void;
  setFontScale(scale: FontScale): void;
  toggleGuide(): void;
}

/** Exported for unit testing the persist migration. */
export function migrateSettings(persisted: unknown, _version: number): SettingsState {
  const s = (persisted ?? {}) as Partial<SettingsState>;
  return { ...s, guideOn: s.guideOn ?? true } as SettingsState;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lang: 'en',
      soundOn: true,
      fontScale: 'md',
      guideOn: true,
      setLang: (lang) => set({ lang }),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      setFontScale: (fontScale) => set({ fontScale }),
      toggleGuide: () => set((s) => ({ guideOn: !s.guideOn })),
    }),
    { name: 'codecraft:settings', version: 2, migrate: migrateSettings },
  ),
);
