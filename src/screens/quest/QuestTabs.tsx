import { useState, type ReactNode } from 'react';
import { useT } from '../../lib/i18n';

type Tab = 'lesson' | 'code' | 'run';

/** Phone layout (<768px): one full-height pane at a time. */
export default function QuestTabs({ lesson, editor, preview }: { lesson: ReactNode; editor: ReactNode; preview: ReactNode }) {
  const [tab, setTab] = useState<Tab>('lesson');
  const { t } = useT();
  const TABS: Array<{ id: Tab; icon: string; label: string }> = [
    { id: 'lesson', icon: '📖', label: t('tabLesson') },
    { id: 'code', icon: '⌨️', label: t('tabCode') },
    { id: 'run', icon: '👁', label: t('tabRun') },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div role="tablist" className="flex flex-shrink-0 gap-1">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={tab === tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex-1 rounded-t-md py-2 font-body text-sm font-bold ${tab === tb.id ? 'bg-paper text-grass-dark' : 'bg-grass-dark/70 text-white'}`}
          >
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>
      <div className={`min-h-0 flex-1 ${tab === 'lesson' ? 'flex flex-col' : 'hidden'}`}>{lesson}</div>
      <div className={`min-h-0 flex-1 ${tab === 'code' ? 'flex flex-col' : 'hidden'}`}>{editor}</div>
      <div className={`min-h-0 flex-1 ${tab === 'run' ? 'flex flex-col' : 'hidden'}`}>{preview}</div>
    </div>
  );
}
