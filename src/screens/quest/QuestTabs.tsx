import { type ReactNode } from 'react';
import { useT } from '../../lib/i18n';
import Icon, { type IconName } from '../../components/Icon';

export type Tab = 'lesson' | 'code' | 'run';

interface QuestTabsProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  lesson: ReactNode;
  editor: ReactNode;
  preview: ReactNode;
}

/** Phone layout (<768px): one full-height pane at a time. Tab state is owned by
 *  the parent so it survives a breakpoint-driven remount of this subtree. */
export default function QuestTabs({ tab, onTabChange, lesson, editor, preview }: QuestTabsProps) {
  const { t } = useT();
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
      <div className={`min-h-0 flex-1 ${tab === 'code' ? 'flex flex-col' : 'hidden'}`}>{editor}</div>
      <div className={`min-h-0 flex-1 ${tab === 'run' ? 'flex flex-col' : 'hidden'}`}>{preview}</div>
    </div>
  );
}
