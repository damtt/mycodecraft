import { type ReactNode } from 'react';
import { useT } from '../../lib/i18n';
import type { Localized } from '../../lib/types';
import Icon, { type IconName } from '../../components/Icon';
import PixelButton from '../../components/PixelButton';
import FailMessage from './FailMessage';

export type Tab = 'lesson' | 'code' | 'run';

interface QuestTabsProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  lesson: ReactNode;
  editor: ReactNode;
  preview: ReactNode;
  checking: boolean;
  onCheck: () => void;
  failMessage: Localized | null;
}

/** Phone layout (<768px): one full-height pane at a time. Tab state is owned by
 *  the parent so it survives a breakpoint-driven remount of this subtree.
 *
 *  The check button lives in the Code tab (right under the editor, where the
 *  player is typing) instead of the Lesson tab. A passing check jumps to the Run
 *  tab (QuestScreen drives that); a failing check keeps the player on the Code
 *  tab with the error floating over the editor so they can fix it in place. */
export default function QuestTabs({ tab, onTabChange, lesson, editor, preview, checking, onCheck, failMessage }: QuestTabsProps) {
  const { t, tl } = useT();
  const TABS: Array<{ id: Tab; icon: IconName; label: string }> = [
    { id: 'lesson', icon: 'book', label: t('tabLesson') },
    { id: 'code', icon: 'keyboard', label: t('tabCode') },
    { id: 'run', icon: 'eye', label: t('tabRun') },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div role="tablist" className="flex flex-shrink-0 gap-1">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={tab === tb.id}
            onClick={() => onTabChange(tb.id)}
            className={`flex-1 rounded-t-md py-2 font-body text-sm font-bold ${tab === tb.id ? 'bg-paper text-grass-dark' : 'bg-grass-dark/70 text-white'}`}
          >
            <Icon name={tb.icon} /> {tb.label}
          </button>
        ))}
      </div>
      <div className={`min-h-0 flex-1 ${tab === 'lesson' ? 'flex flex-col' : 'hidden'}`}>{lesson}</div>
      <div className={`relative min-h-0 flex-1 ${tab === 'code' ? 'flex flex-col' : 'hidden'}`}>
        {editor}
        {failMessage && (
          <FailMessage text={tl(failMessage)} className="pointer-events-none absolute inset-x-2 bottom-16 z-10 shadow-lg" />
        )}
        <PixelButton className="mt-2 flex-shrink-0" onClick={onCheck} disabled={checking}><Icon name="check" /> {t('checkMyCode')}</PixelButton>
      </div>
      <div className={`min-h-0 flex-1 ${tab === 'run' ? 'flex flex-col' : 'hidden'}`}>{preview}</div>
    </div>
  );
}
