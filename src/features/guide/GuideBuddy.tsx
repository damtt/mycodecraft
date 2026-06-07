import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useSettings } from '../../stores/settingsStore';
import { useT } from '../../lib/i18n';
import { playSound } from '../audio/sounds';
import { useGuide, type ScreenKey } from './guideStore';
import { GUIDE } from './guideContent';
import { useIdle } from './useIdle';
import Icon from '../../components/Icon';
import IconText from '../../components/IconText';

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
  const bubble = useGuide((s) => s.bubble);
  const questCtx = useGuide((s) => s.questCtx);
  const editorEngaged = useGuide((s) => s.editorEngaged);
  const say = useGuide((s) => s.say);
  const dismiss = useGuide((s) => s.dismiss);
  const hasGreeted = useGuide((s) => s.hasGreeted);
  const markGreeted = useGuide((s) => s.markGreeted);
  const [open, setOpen] = useState(false);

  // Greet once per screen; on revisits, clear any bubble left over from the
  // previous screen so a stale, out-of-context message never lingers.
  useEffect(() => {
    if (!guideOn || !screen) return;
    if (!hasGreeted(screen)) {
      markGreeted(screen);
      say(GUIDE.greeting[screen]);
    } else {
      dismiss();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- greet/clear on screen change only
  }, [screen, guideOn]);

  // Gentle idle nudge: skip while the editor/keyboard is up, and allow the nudge
  // to replace a passive greeting (but not a hint/help/fail bubble the kid is reading).
  useIdle(IDLE_MS, () => {
    if (!guideOn || !screen) return;
    const { bubble: current, editorEngaged: engaged } = useGuide.getState();
    if (engaged) return;
    if (current === null || current === GUIDE.greeting[screen]) say(GUIDE.idle[screen]);
  });

  if (!guideOn || !screen) return null;
  if (editorEngaged) return null; // get out of the way while the editor context is up (keyboard / Code tab)

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
          <IconText text={tl(bubble)} />
          <button onClick={() => { playSound('click'); dismiss(); }} className="ml-2 cursor-pointer text-stone underline">{t('buddyDismiss')}</button>
        </div>
      )}
      {open && (
        <div className="flex flex-col items-stretch gap-1 rounded-xl border-2 border-night bg-paper p-2 shadow-[3px_3px_0_#0003]">
          {questCtx && (
            <button onClick={() => { playSound('click'); revealHint(); }} className="cursor-pointer rounded bg-gold/40 px-3 py-1.5 text-left font-body text-sm font-bold"><Icon name="bulb" /> {t('buddyHint')}</button>
          )}
          <button onClick={() => { playSound('click'); setOpen(false); say(GUIDE.screenHelp[screen]); }} className="cursor-pointer rounded px-3 py-1.5 text-left font-body text-sm font-bold hover:bg-stone/10"><Icon name="question" /> {t('buddyScreenHelp')}</button>
          {questCtx && (
            <button onClick={() => { playSound('click'); setOpen(false); say(questCtx.story); }} className="cursor-pointer rounded px-3 py-1.5 text-left font-body text-sm font-bold hover:bg-stone/10"><Icon name="book" /> {t('buddyRecap')}</button>
          )}
        </div>
      )}
      <button
        aria-label={t('guideBuddy')}
        onClick={() => { playSound('click'); setOpen((o) => !o); }}
        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-4 border-night bg-paper text-3xl shadow-[3px_3px_0_#0004] active:translate-y-0.5"
      >
        <Icon name="owl" />
      </button>
    </div>
  );
}
