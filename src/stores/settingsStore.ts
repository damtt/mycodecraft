import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang } from '../lib/types';

export type FontScale = 'sm' | 'md' | 'lg';

interface SettingsState {
  lang: Lang;
  soundOn: boolean;
  fontScale: FontScale;
  setLang(lang: Lang): void;
  toggleSound(): void;
  setFontScale(scale: FontScale): void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lang: 'en',
      soundOn: true,
      fontScale: 'md',
      setLang: (lang) => set({ lang }),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      setFontScale: (fontScale) => set({ fontScale }),
    }),
    { name: 'codecraft:settings', version: 1 },
  ),
);
