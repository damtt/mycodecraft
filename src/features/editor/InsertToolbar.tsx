import { useT } from '../../lib/i18n';
import { useIsTouch } from '../../lib/useMediaQuery';
import { playSound } from '../audio/sounds';

const TOKENS = ['<', '>', '/', '"', '=', '{', '}', '(', ')'] as const;

/** Touch-only quick-insert row above the editor. Self-hides on non-touch devices. */
export default function InsertToolbar({ onInsert }: { onInsert: (text: string) => void }) {
  const isTouch = useIsTouch();
  const { t } = useT();
  if (!isTouch) return null;

  return (
    <div aria-label={t('insertToolbar')} className="flex gap-1 overflow-x-auto rounded-t-lg bg-night/90 p-1">
      {TOKENS.map((tk) => (
        <button
          key={tk}
          type="button"
          aria-label={tk}
          // Keep the editor focused: stop the button stealing focus, which would
          // blur->refocus the editor on every tap (Buddy flicker + keyboard jitter).
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => { playSound('click'); onInsert(tk); }}
          className="min-w-10 flex-shrink-0 rounded bg-stone px-3 py-2 font-mono text-base font-bold text-white active:translate-y-0.5"
        >
          {tk}
        </button>
      ))}
    </div>
  );
}
