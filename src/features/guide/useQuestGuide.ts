import { useEffect } from 'react';
import type { Localized, Step } from '../../lib/types';
import { useGuide } from './guideStore';
import { GUIDE } from './guideContent';

interface QuestGuideArgs {
  story: Localized;
  steps: Step[];
  openHints: Set<number>;
  revealHint: (stepIndex: number) => void;
}

/** Publishes quest context to the Guide store and returns event helpers. */
export function useQuestGuide({ story, steps, openHints, revealHint }: QuestGuideArgs) {
  const setQuestCtx = useGuide((s) => s.setQuestCtx);
  const say = useGuide((s) => s.say);

  useEffect(() => {
    setQuestCtx({ story, steps, openHints, revealHint });
    return () => setQuestCtx(null);
  }, [setQuestCtx, story, steps, openHints, revealHint]);

  return {
    onFailedCheck: () => say(GUIDE.failedCheck),
    onStuck: () => say(GUIDE.stuck),
  };
}
