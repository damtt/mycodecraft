import { create } from 'zustand';
import type { Localized, Step } from '../../lib/types';

export type ScreenKey = 'map' | 'quest' | 'inventory' | 'settings';

/** Published by QuestScreen so the Buddy can reveal step hints / recap the story. */
export interface QuestGuideContext {
  story: Localized;
  steps: Step[];
  openHints: Set<number>;
  revealHint: (stepIndex: number) => void; // same path as the inline 💡 button → sets usedHint
}

interface GuideState {
  bubble: Localized | null;
  greeted: Set<ScreenKey>;
  questCtx: QuestGuideContext | null;
  editorFocused: boolean;
  say: (text: Localized) => void;
  dismiss: () => void;
  hasGreeted: (s: ScreenKey) => boolean;
  markGreeted: (s: ScreenKey) => void;
  setQuestCtx: (ctx: QuestGuideContext | null) => void;
  setEditorFocused: (v: boolean) => void;
}

export const useGuide = create<GuideState>()((set, get) => ({
  bubble: null,
  greeted: new Set(),
  questCtx: null,
  editorFocused: false,
  say: (text) => set({ bubble: text }),
  dismiss: () => set({ bubble: null }),
  hasGreeted: (s) => get().greeted.has(s),
  markGreeted: (s) => set((st) => ({ greeted: new Set(st.greeted).add(s) })),
  setQuestCtx: (questCtx) => set({ questCtx }),
  setEditorFocused: (editorFocused) => set({ editorFocused }),
}));
