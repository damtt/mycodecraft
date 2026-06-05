import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang } from '../lib/types';

interface SettingsState {
  lang: Lang;
  soundOn: boolean;
  setLang(lang: Lang): void;
  toggleSound(): void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lang: 'en',
      soundOn: true,
      setLang: (lang) => set({ lang }),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
    }),
    { name: 'codecraft:settings' },
  ),
);
