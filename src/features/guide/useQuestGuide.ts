import { useEffect } from 'react';
import type { Quest } from '../../lib/types';
import { useGuide } from './guideStore';
import { GUIDE } from './guideContent';

/**
 * Publishes quest context to the Guide store so the globally-mounted Buddy can
 * reveal hints / recap the story. Only publishes when the quest actually exists,
 * so an invalid quest id never registers a bogus (empty) context.
 */
export function useQuestGuide(
  quest: Quest | undefined,
  openHints: Set<number>,
  revealHint: (stepIndex: number) => void,
) {
  const setQuestCtx = useGuide((s) => s.setQuestCtx);
  const say = useGuide((s) => s.say);

  useEffect(() => {
    if (!quest) {
      setQuestCtx(null);
      return;
    }
    setQuestCtx({ story: quest.story, steps: quest.steps, openHints, revealHint });
    return () => setQuestCtx(null);
  }, [setQuestCtx, quest, openHints, revealHint]);

  return {
    onFailedCheck: () => say(GUIDE.failedCheck),
    onStuck: () => say(GUIDE.stuck),
  };
}
