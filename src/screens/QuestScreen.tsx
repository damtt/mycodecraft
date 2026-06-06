import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { Localized, Rewards } from '../lib/types';
import { questById, nextQuest } from '../content/quests';
import { useProfiles, useActiveProfile } from '../stores/profileStore';
import { usePreview } from '../features/preview/usePreview';
import { runChecks } from '../features/validation/run';
import { playSound } from '../features/audio/sounds';
import { useMediaQuery } from '../lib/useMediaQuery';
import { useGuide } from '../features/guide/guideStore';
import { useQuestGuide } from '../features/guide/useQuestGuide';
import Panel from '../components/Panel';
import VictoryOverlay from '../components/VictoryOverlay';
import LessonPanel from './quest/LessonPanel';
import EditorPane from './quest/EditorPane';
import PreviewPane from './quest/PreviewPane';
import QuestColumns from './quest/QuestColumns';
import QuestTabs from './quest/QuestTabs';
import { useT } from '../lib/i18n';

const DEBOUNCE_MS = 300;

export default function QuestScreen() {
  const { id = '' } = useParams();
  // React Router does NOT remount route elements on param change — the key
  // forces a full remount per quest so all useState initializers re-run.
  return <QuestScreenInner key={id} questId={id} />;
}

function QuestScreenInner({ questId }: { questId: string }) {
  const quest = questById(questId);
  const navigate = useNavigate();
  const profile = useActiveProfile();
  const completeQuest = useProfiles((s) => s.completeQuest);
  const setEditorFocused = useGuide((s) => s.setEditorFocused);
  const { t } = useT();
  const isWide = useMediaQuery('(min-width: 768px)');

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

  const onHint = (i: number) => {
    playSound('click');
    setUsedHint(true);
    setOpenHints((prev) => new Set(prev).add(i));
  };

  // Publish quest context to the Guide Buddy (story recap + hint reveal share onHint).
  const questGuide = useQuestGuide({
    story: quest?.story ?? { en: '', vi: '' },
    steps: quest?.steps ?? [],
    openHints,
    revealHint: onHint,
  });

  // Buddy reacts to the stuck-loop state.
  useEffect(() => {
    if (preview.stuck) questGuide.onStuck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview.stuck]);

  if (!quest || !profile) return <Panel className="m-8">{t('questNotFound')}</Panel>;

  const alreadyDone = quest.id in profile.quests;
  const next = nextQuest(quest.id);
  const isJs = quest.world === 'js';

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
      questGuide.onFailedCheck();
      return;
    }
    const r = completeQuest(quest, usedHint);
    if (r) {
      playSound(r.leveledUp ? 'levelup' : r.newBadge ? 'badge' : 'success');
      setRewards(r);
    }
  };

  const lesson = (
    <LessonPanel
      quest={quest}
      alreadyDone={alreadyDone}
      openHints={openHints}
      onHint={onHint}
      failMessage={failMessage}
      runtimeErrorLine={preview.runtimeError?.line ?? null}
      stuck={preview.stuck}
      onReload={preview.reload}
      checking={checking}
      onCheck={onCheck}
      className="h-full"
    />
  );
  const editor = (
    <EditorPane
      questId={quest.id}
      initialValue={quest.starterCode}
      onChange={setCode}
      onFocusChange={setEditorFocused}
      className="h-full"
    />
  );
  const previewPane = <PreviewPane preview={preview} isJs={isJs} className="h-full" />;

  return (
    <div data-testid="quest-screen" className="h-full min-h-0 bg-dirt-light/30 p-3">
      {isWide
        ? <QuestColumns lesson={lesson} editor={editor} preview={previewPane} />
        : <QuestTabs lesson={lesson} editor={editor} preview={previewPane} />}

      {rewards && (
        <VictoryOverlay
          rewards={rewards}
          worldComplete={rewards.newAchievements.some((a) => a.startsWith('world-'))}
          hasNext={next !== null}
          onNext={() => next && navigate(`/quest/${next.id}`)}
          onBackToMap={() => navigate('/map')}
        />
      )}
    </div>
  );
}
