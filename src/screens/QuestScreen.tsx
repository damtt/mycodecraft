import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { Localized, Rewards } from '../lib/types';
import { questById, nextQuest } from '../content/quests';
import { useProfiles, useActiveProfile } from '../stores/profileStore';
import { usePreview } from '../features/preview/usePreview';
import { runChecks } from '../features/validation/run';
import { playSound } from '../features/audio/sounds';
import { useT } from '../lib/i18n';
import CodeEditor from '../features/editor/CodeEditor';
import Panel from '../components/Panel';
import PixelButton from '../components/PixelButton';
import VictoryOverlay from '../components/VictoryOverlay';

const DEBOUNCE_MS = 300;

export default function QuestScreen() {
  const { id = '' } = useParams();
  const quest = questById(id);
  const navigate = useNavigate();
  const profile = useActiveProfile();
  const completeQuest = useProfiles((s) => s.completeQuest);
  const { t, tl } = useT();

  const [code, setCode] = useState(quest?.starterCode ?? '');
  const [debounced, setDebounced] = useState(code);
  const [usedHint, setUsedHint] = useState(false);
  const [openHints, setOpenHints] = useState<Set<number>>(new Set());
  const [failMessage, setFailMessage] = useState<Localized | null>(null);
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [checking, setChecking] = useState(false);

  const preview = usePreview(debounced);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(code), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [code]);

  if (!quest || !profile) return <Panel className="m-8">Quest not found.</Panel>;

  const alreadyDone = quest.id in profile.quests;
  const next = nextQuest(quest.id);
  const isJs = quest.world === 'js';

  const onHint = (i: number) => {
    setUsedHint(true);
    setOpenHints((prev) => new Set(prev).add(i));
  };

  const onCheck = async () => {
    setChecking(true);
    setFailMessage(null);
    const result = await runChecks(quest.checks, {
      code,
      consoleLines: preview.consoleLines,
      runDomChecks: preview.runDomChecks,
    });
    setChecking(false);
    if (!result.pass) {
      setFailMessage(result.firstFail?.failMessage ?? null);
      return;
    }
    const r = completeQuest(quest, usedHint);
    if (r) {
      playSound(r.leveledUp ? 'levelup' : r.newBadge ? 'badge' : 'success');
      setRewards(r);
    }
  };

  return (
    <div data-testid="quest-screen" className="flex h-[calc(100vh-48px)] gap-3 bg-dirt-light/30 p-3">
      {/* Lesson panel (left) */}
      <Panel className="flex w-1/3 flex-col gap-3 overflow-y-auto">
        <h1 className="font-pixel text-sm text-grass-dark">
          ⛏️ {t('questLabel')}: {tl(quest.title)}
        </h1>
        {alreadyDone && <p className="font-body text-sm font-bold text-gold">★ {t('replayDone')}</p>}
        <p className="font-body font-bold italic text-dirt">{tl(quest.story)}</p>
        <h2 className="font-pixel text-xs">{t('steps')}</h2>
        <ol className="flex flex-col gap-2">
          {quest.steps.map((step, i) => (
            <li key={i} className="font-body font-bold">
              <span className="mr-1 font-pixel text-[10px] text-grass-dark">{i + 1}.</span>
              {tl(step.text)}
              {step.hint && !openHints.has(i) && (
                <button
                  onClick={() => onHint(i)}
                  className="ml-2 cursor-pointer rounded bg-gold/40 px-2 font-body text-xs font-bold"
                >
                  💡 {t('hint')}
                </button>
              )}
              {step.hint && openHints.has(i) && (
                <span className="mt-1 block rounded bg-gold/20 p-2 text-sm">💡 {tl(step.hint)}</span>
              )}
            </li>
          ))}
        </ol>
        {failMessage && (
          <p role="alert" className="rounded-md border-2 border-red-400 bg-red-50 p-2 font-body font-bold text-red-700">
            🟥 <span>{tl(failMessage)}</span>
          </p>
        )}
        {preview.runtimeError && (
          <p role="alert" className="rounded-md border-2 border-green-700 bg-green-50 p-2 font-body font-bold text-green-900">
            🟩 {t('codeBoom')} {preview.runtimeError.line}
          </p>
        )}
        {preview.stuck && (
          <p role="alert" className="rounded-md bg-yellow-100 p-2 font-body font-bold">
            ♻️ {t('stuckLoop')}{' '}
            <button onClick={preview.reload} className="cursor-pointer underline">↻</button>
          </p>
        )}
        <PixelButton className="mt-auto" onClick={onCheck} disabled={checking}>
          ✔ {t('checkMyCode')}
        </PixelButton>
      </Panel>

      {/* Editor over preview (right) */}
      <div className="flex w-2/3 flex-col gap-3">
        <div className="h-1/2 overflow-hidden rounded-lg bg-[#1e1e2e] p-1">
          <CodeEditor key={quest.id} initialValue={quest.starterCode} onChange={setCode} />
        </div>
        <Panel className="flex h-1/2 flex-col !p-2">
          <span className="font-pixel text-[10px] text-stone">👁 {t('preview')}</span>
          <iframe
            key={preview.reloadKey}
            ref={preview.iframeRef}
            title={t('preview')}
            sandbox="allow-scripts"
            srcDoc={preview.srcdoc}
            className="w-full flex-1 rounded bg-white"
          />
          {isJs && (
            <div className="mt-1 max-h-24 overflow-y-auto rounded bg-night p-2 font-mono text-xs text-green-400">
              <span className="text-stone">▸ {t('console')}</span>
              {preview.consoleLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {rewards && (
        <VictoryOverlay
          rewards={rewards}
          hasNext={next !== null}
          onNext={() => next && navigate(`/quest/${next.id}`)}
          onBackToMap={() => navigate('/map')}
        />
      )}
    </div>
  );
}
