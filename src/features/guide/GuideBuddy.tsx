import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useSettings } from '../../stores/settingsStore';
import { useT } from '../../lib/i18n';
import { playSound } from '../audio/sounds';
import { useGuide, type ScreenKey } from './guideStore';
import { GUIDE } from './guideContent';
import { useIdle } from './useIdle';

const BUDDY_EMOJI = '🦉';
const IDLE_MS = 20_000;

function screenKeyFor(pathname: string): ScreenKey | null {
  if (pathname.startsWith('/quest')) return 'quest';
  if (pathname.startsWith('/map')) return 'map';
  if (pathname.startsWith('/inventory')) return 'inventory';
  if (pathname.startsWith('/settings')) return 'settings';
  return null;
}

export default function GuideBuddy() {
  const { pathname } = useLocation();
  const screen = screenKeyFor(pathname);
  const guideOn = useSettings((s) => s.guideOn);
  const { t, tl } = useT();
  const { bubble, questCtx, editorFocused, say, dismiss, hasGreeted, markGreeted } = useGuide();
  const [open, setOpen] = useState(false);

  // Greet once per screen.
  useEffect(() => {
    if (!guideOn || !screen) return;
    if (!hasGreeted(screen)) {
      markGreeted(screen);
      say(GUIDE.greeting[screen]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- greet on screen change only
  }, [screen, guideOn]);

  // Gentle idle nudge.
  useIdle(IDLE_MS, () => {
    if (guideOn && screen && !useGuide.getState().bubble) say(GUIDE.idle[screen]);
  });

  if (!guideOn || !screen) return null;
  if (editorFocused) return null; // get out of the way while the soft keyboard is up

  const revealHint = () => {
    setOpen(false);
    const ctx = questCtx;
    if (!ctx) return;
    const i = ctx.steps.findIndex((s, idx) => s.hint && !ctx.openHints.has(idx));
    if (i >= 0) {
      ctx.revealHint(i);
      const hint = ctx.steps[i].hint;
      if (hint) say(hint);
    } else {
      say(GUIDE.allHintsSeen);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 md:bottom-4">
      {bubble && (
        <div role="status" aria-live="polite" className="max-w-[16rem] rounded-xl border-2 border-night bg-paper p-3 font-body text-sm font-bold text-night shadow-[3px_3px_0_#0003]">
          {tl(bubble)}
          <button onClick={() => { playSound('click'); dismiss(); }} className="ml-2 cursor-pointer text-stone underline">{t('buddyDismiss')}</button>
        </div>
      )}
      {open && (
        <div className="flex flex-col items-stretch gap-1 rounded-xl border-2 border-night bg-paper p-2 shadow-[3px_3px_0_#0003]">
          {questCtx && (
            <button onClick={() => { playSound('click'); revealHint(); }} className="cursor-pointer rounded bg-gold/40 px-3 py-1.5 text-left font-body text-sm font-bold">💡 {t('buddyHint')}</button>
          )}
          <button onClick={() => { playSound('click'); setOpen(false); say(GUIDE.screenHelp[screen]); }} className="cursor-pointer rounded px-3 py-1.5 text-left font-body text-sm font-bold hover:bg-stone/10">❓ {t('buddyScreenHelp')}</button>
          {questCtx && (
            <button onClick={() => { playSound('click'); setOpen(false); say(questCtx.story); }} className="cursor-pointer rounded px-3 py-1.5 text-left font-body text-sm font-bold hover:bg-stone/10">📖 {t('buddyRecap')}</button>
          )}
        </div>
      )}
      <button
        aria-label={t('guideBuddy')}
        onClick={() => { playSound('click'); setOpen((o) => !o); }}
        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-4 border-night bg-paper text-3xl shadow-[3px_3px_0_#0004] active:translate-y-0.5"
      >
        {BUDDY_EMOJI}
      </button>
    </div>
  );
}
