import { useState } from 'react';
import type { Predict } from '../../lib/types';
import { useT } from '../../lib/i18n';
import LessonText from '../../components/LessonText';
import Icon from '../../components/Icon';

const OPTION_BASE =
  'w-full cursor-pointer rounded border-2 px-2 py-1 text-left font-body font-bold disabled:cursor-default';

function optionClass(revealed: boolean, correct: boolean, isPick: boolean): string {
  if (!revealed) return `${OPTION_BASE} border-stone/40 bg-white`;
  if (correct) return `${OPTION_BASE} border-green-500 bg-green-50`;
  if (isPick) return `${OPTION_BASE} border-red-400 bg-red-50`;
  return `${OPTION_BASE} border-stone/30 bg-stone/5 opacity-60`;
}

/** Non-gating "predict the outcome" block. Locks after the first pick. */
export default function PredictBlock({ predict }: { predict: Predict }) {
  const { t, tl } = useT();
  const [picked, setPicked] = useState<number | null>(null);
  const revealed = picked !== null;

  return (
    <div className="rounded-md border-2 border-stone/40 bg-stone/10 p-2">
      <h3 className="font-pixel text-xs"><Icon name="eye" /> {t('predict')}</h3>
      <div className="mt-1 font-body font-bold"><LessonText text={tl(predict.question)} /></div>
      <ul className="mt-1 flex flex-col gap-1">
        {predict.options.map((opt, i) => (
          <li key={i}>
            <button
              type="button"
              disabled={revealed}
              onClick={() => setPicked(i)}
              className={optionClass(revealed, opt.correct, i === picked)}
            >
              <LessonText text={tl(opt.text)} />
            </button>
          </li>
        ))}
      </ul>
      {picked !== null && (
        <p className="mt-2 text-sm">
          <span className="font-bold">
            {predict.options[picked].correct ? t('predictRight') : t('predictWrong')}
          </span>{' '}
          <LessonText text={tl(predict.explain)} />
        </p>
      )}
    </div>
  );
}
