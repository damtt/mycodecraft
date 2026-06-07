import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { Localized, Rewards } from '../lib/types';
import { questById, nextQuest } from '../content/quests';
import { useProfiles, useActiveProfile } from '../stores/profileStore';
import { usePreview } from '../features/preview/usePreview';
import { runChecks } from '../features/validation/run';
import { playSound } from '../features/audio/sounds';
import { useIsWide } from '../lib/useMediaQuery';
import { useGuide } from '../features/guide/guideStore';
import { useQuestGuide } from '../features/guide/useQuestGuide';
import Panel from '../components/Panel';
import VictoryOverlay from '../components/VictoryOverlay';
import LessonPanel from './quest/LessonPanel';
import EditorPane from './quest/EditorPane';
import PreviewPane from './quest/PreviewPane';
import QuestColumns from './quest/QuestColumns';
import QuestTabs, { type Tab } from './quest/QuestTabs';
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
  const setEditorEngaged = useGuide((s) => s.setEditorEngaged);
  const { t } = useT();
  const isWide = useIsWide();

  const [code, setCode] = useState(quest?.starterCode ?? '');
  const [debounced, setDebounced] = useState(code);
  const [usedHint, setUsedHint] = useState(false);
  const [openHints, setOpenHints] = useState<Set<number>>(new Set());
  const [failMessage, setFailMessage] = useState<Localized | null>(null);
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [checking, setChecking] = useState(false);
  // Tab state lives here (not in QuestTabs) so it survives a breakpoint-driven
  // remount of the tabs subtree.
  const [tab, setTab] = useState<Tab>('lesson');
  const [reflectOpen, setReflectOpen] = useState(false);
  const [nudged, setNudged] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);

  const preview = usePreview(debounced);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(code), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [code]);

  // Keep the Guide Buddy out of the way while the editor/keyboard is up, and off
  // the phone Code tab entirely — there its owl + bubble would cover the Check
  // button and the floating error. It stays available on Lesson and Preview.
  useEffect(() => {
    setEditorEngaged(editorFocused || (!isWide && tab === 'code'));
  }, [editorFocused, isWide, tab, setEditorEngaged]);

  // Stable identity so useQuestGuide's effect only re-registers when quest data
  // actually changes (not on every QuestScreen render). Setters are stable.
  const onHint = useCallback((i: number) => {
    playSound('click');
    setUsedHint(true);
    setOpenHints((prev) => new Set(prev).add(i));
  }, []);

  const onReflect = useCallback(() => {
    playSound('click');
    setReflectOpen(true);
  }, []);

  // Publish quest context to the Guide Buddy (story recap + hint reveal share onHint).
  // Pass the quest directly so an invalid id publishes no context (not a bogus empty one).
  const questGuide = useQuestGuide(quest, openHints, onHint);

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
      if (quest.reflect && !reflectOpen && !nudged) setNudged(true);
      return;
    }
    // On phones, jump to Preview to show the working result (a failure stays
    // on the Code tab with the floating error). The wide columns layout has no tabs.
    if (!isWide) setTab('run');
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
      reflectOpen={reflectOpen}
      onReflect={onReflect}
      showNudge={nudged && !reflectOpen}
      // Wide layout hosts the check button + failure banner here; phones move
      // both to the Code tab (showCheck gates both inside LessonPanel).
      showCheck={isWide}
      className="min-h-0 flex-1"
    />
  );
  const editor = (
    <EditorPane
      // Seed from the LIVE code, not starterCode: if the layout swaps across the
      // breakpoint mid-quest (e.g. phone rotate), the remounted editor restores
      // the player's typed text instead of resetting to the starter.
      initialValue={code}
      onChange={setCode}
      onFocusChange={setEditorFocused}
      className="min-h-0 flex-1"
    />
  );
  const previewPane = <PreviewPane preview={preview} isJs={isJs} className="h-full" />;

  return (
    <div data-testid="quest-screen" className="flex min-h-0 flex-1 flex-col bg-dirt-light/30 p-3">
      {isWide
        ? <QuestColumns lesson={lesson} editor={editor} preview={previewPane} />
        : <QuestTabs tab={tab} onTabChange={setTab} lesson={lesson} editor={editor} preview={previewPane} checking={checking} onCheck={onCheck} failMessage={failMessage} />}

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
