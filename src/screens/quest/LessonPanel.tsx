import type { Localized, Quest } from '../../lib/types';
import { useT } from '../../lib/i18n';
import Panel from '../../components/Panel';
import PixelButton from '../../components/PixelButton';
import LessonText from '../../components/LessonText';
import Icon from '../../components/Icon';
import PredictBlock from './PredictBlock';

interface LessonPanelProps {
  quest: Quest;
  alreadyDone: boolean;
  openHints: Set<number>;
  onHint: (i: number) => void;
  failMessage: Localized | null;
  runtimeErrorLine: number | null;
  stuck: boolean;
  onReload: () => void;
  checking: boolean;
  onCheck: () => void;
  reflectOpen: boolean;
  onReflect: () => void;
  showNudge: boolean;
  className?: string;
}

export default function LessonPanel(props: LessonPanelProps) {
  const {
    quest, alreadyDone, openHints, onHint, failMessage, runtimeErrorLine,
    stuck, onReload, checking, onCheck, reflectOpen, onReflect, showNudge, className = '',
  } = props;
  const { t, tl } = useT();

  return (
    <Panel className={`flex flex-col gap-3 overflow-y-auto ${className}`}>
      <h1 className="font-pixel text-sm text-grass-dark"><Icon name="pickaxe" /> {t('questLabel')}: {tl(quest.title)}</h1>
      {alreadyDone && <p className="font-body text-sm font-bold text-gold"><Icon name="star" /> {t('replayDone')}</p>}
      <div className="font-body font-bold italic text-dirt"><LessonText text={tl(quest.story)} /></div>
      <h2 className="font-pixel text-xs">{t('steps')}</h2>
      <ol className="flex flex-col gap-2">
        {quest.steps.map((step, i) => (
          <li key={i} className="font-body font-bold">
            <span className="mr-1 font-pixel text-xs text-grass-dark">{i + 1}.</span>
            <LessonText text={tl(step.text)} />
            {step.hint && !openHints.has(i) && (
              <button onClick={() => onHint(i)} className="ml-2 cursor-pointer rounded bg-gold/40 px-2 font-body text-xs font-bold"><Icon name="bulb" /> {t('hint')}</button>
            )}
            {step.hint && openHints.has(i) && (
              <div className="mt-1 rounded bg-gold/20 p-2 text-sm"><Icon name="bulb" /> <LessonText text={tl(step.hint)} /></div>
            )}
          </li>
        ))}
      </ol>
      {quest.reflect && (
        <div className="rounded-md border-2 border-grass/30 bg-grass/10 p-2">
          <h3 className="font-pixel text-xs"><Icon name="brain" /> {t('think')}</h3>
          <div className="mt-1 font-body font-bold"><LessonText text={tl(quest.reflect.question)} /></div>
          {reflectOpen ? (
            <div className="mt-1 rounded bg-gold/20 p-2 text-sm"><LessonText text={tl(quest.reflect.answer)} /></div>
          ) : (
            <button type="button" onClick={onReflect} className="mt-1 cursor-pointer rounded bg-gold/40 px-2 font-body text-xs font-bold"><Icon name="bulb" /> {t('showAnswer')}</button>
          )}
        </div>
      )}
      {quest.predict && <PredictBlock predict={quest.predict} />}
      {quest.experiment && (
        <div className="rounded-md border-2 border-stone/40 bg-stone/10 p-2">
          <h3 className="font-pixel text-xs"><Icon name="potion" /> {t('tryThis')}</h3>
          <div className="mt-1 font-body font-bold"><LessonText text={tl(quest.experiment)} /></div>
        </div>
      )}
      {failMessage && (
        <p role="alert" className="rounded-md border-2 border-red-400 bg-red-50 p-2 font-body font-bold text-red-700"><Icon name="red-tile" /> <span><LessonText text={tl(failMessage)} /></span></p>
      )}
      {showNudge && (
        <p role="alert" className="rounded-md bg-yellow-100 p-2 font-body font-bold"><Icon name="brain" /> {t('reflectNudge')}</p>
      )}
      {runtimeErrorLine !== null && (
        <p role="alert" className="rounded-md border-2 border-green-700 bg-green-50 p-2 font-body font-bold text-green-900"><Icon name="green-tile" /> {t('codeBoom')} {runtimeErrorLine}</p>
      )}
      {stuck && (
        <p role="alert" className="rounded-md bg-yellow-100 p-2 font-body font-bold"><Icon name="recycle" /> {t('stuckLoop')} <button onClick={onReload} aria-label={t('stuckLoop')} className="cursor-pointer underline"><Icon name="loop" /></button></p>
      )}
      <PixelButton className="mt-auto" onClick={onCheck} disabled={checking}><Icon name="check" /> {t('checkMyCode')}</PixelButton>
    </Panel>
  );
}
