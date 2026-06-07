# Quest Understanding Prompts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three optional, non-gating "understanding" prompts to CodeCraft quests — `reflect` (think + tap-to-reveal answer), `predict` (commit a guess → reveal outcome), and `experiment` (open tinker) — plus a one-time, after-a-failed-check nudge toward the reflect question, so kids learn *why* their code works instead of just pattern-matching the checks.

**Architecture:** Three optional quest-level fields on the `Quest` type. Presentational blocks render after the steps in `LessonPanel`; `predict` is a small self-contained `PredictBlock` component owning its own selection state. Only `reflect`'s open-state is lifted to `QuestScreen`, because the nudge (shown only on the `!result.pass` branch of `onCheck`) depends on it. Completion stays gated solely by the existing declarative `checks` — the new prompts never block. Content is added selectively across all 30 quests and guarded by `content.test.ts`.

**Tech Stack:** Vite 6, React 19, TypeScript (strict), Zustand, Vitest + jsdom + React Testing Library, react-markdown, Tailwind.

**Branch:** `feat/quest-understanding-prompts` (already checked out; the design spec lives at `docs/superpowers/specs/2026-06-07-quest-understanding-prompts-design.md`).

**Reference — the spec section each task implements:** Task 1 → §1, Task 2 → §2 (i18n), Task 3 → §2 (predict), Task 4 → §2 (rendering), Task 5 → §3 (nudge), Task 6 → §5 (content tests), Tasks 7–9 → §4 (content), Task 10 → §5 (gate).

---

## File Structure

- **Modify** `src/lib/types.ts` — add `Reflect`, `PredictOption`, `Predict` interfaces and three optional `Quest` fields.
- **Modify** `src/content/i18n/ui.ts` — add 7 bilingual UI strings.
- **Create** `src/screens/quest/PredictBlock.tsx` — interactive predict block (owns its picked-option state).
- **Create** `src/screens/quest/PredictBlock.test.tsx` — unit tests for it.
- **Modify** `src/screens/quest/LessonPanel.tsx` — render reflect / predict / experiment blocks + nudge line; 3 new props.
- **Create** `src/screens/quest/LessonPanel.test.tsx` — presentational tests for the new blocks.
- **Modify** `src/screens/QuestScreen.tsx` — `reflectOpen` / `nudged` state, `onReflect` handler, after-fail nudge in `onCheck`, thread props.
- **Modify** `src/screens/QuestScreen.test.tsx` — add a reflect+predict fixture and behavioral tests.
- **Modify** `src/content/quests/content.test.ts` — extend the two per-quest `test.each` loops to guard the new fields.
- **Modify** quest files under `src/content/quests/{html,css,js}/qNN.ts` — add prompts selectively.

---

## Task 1: Schema — add reflect / predict / experiment to the Quest type

**Files:**
- Modify: `src/lib/types.ts` (after the `Step` interface, ~line 10; and inside `Quest`, ~line 27-37)

- [ ] **Step 1: Add the three interfaces after `Step`**

In `src/lib/types.ts`, immediately after the `Step` interface (the block ending at line 10), insert:

```ts
export interface Reflect {
  question: Localized; // e.g. "Which part of your code selected the button?"
  answer: Localized;   // tap-to-reveal; explains the WHY (must not restate the question)
}

export interface PredictOption {
  text: Localized;
  correct: boolean;
}

export interface Predict {
  question: Localized;                                         // "If you change `red` to `blue`, what changes?"
  options: [PredictOption, PredictOption, ...PredictOption[]]; // >= 2 options; exactly one correct
  explain: Localized;                                          // revealed after a choice; explains the WHY
}
```

- [ ] **Step 2: Add the optional fields to `Quest`**

In the `Quest` interface, after the `badge: string;` line, add:

```ts
  reflect?: Reflect;
  predict?: Predict;
  experiment?: Localized; // open "change X → watch what happens" invitation
}
```

- [ ] **Step 3: Verify the types compile**

Run: `npm run typecheck`
Expected: PASS (no errors). Optional fields mean every existing quest stays valid.

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat(types): add optional reflect/predict/experiment fields to Quest"
```

---

## Task 2: i18n — add the understanding-prompt UI strings

**Files:**
- Modify: `src/content/i18n/ui.ts` (before the closing `} satisfies Record<string, Localized>;`, ~line 79)

- [ ] **Step 1: Add the bilingual keys**

In `src/content/i18n/ui.ts`, just before the `// Insert toolbar` comment (line 78), add:

```ts
  // Understanding prompts
  think: { en: 'Think', vi: 'Suy nghĩ' },
  predict: { en: 'Predict', vi: 'Đoán thử' },
  tryThis: { en: 'Try this', vi: 'Thử xem' },
  showAnswer: { en: 'Show answer', vi: 'Xem đáp án' },
  predictRight: { en: "Yes — that's right!", vi: 'Đúng rồi!' },
  predictWrong: { en: 'Not quite — look:', vi: 'Chưa đúng — xem nhé:' },
  reflectNudge: {
    en: 'Stuck? Peek at the Think question — it might help.',
    vi: 'Bí à? Thử xem câu hỏi Suy nghĩ — có thể giúp được đó.',
  },
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: PASS (`satisfies Record<string, Localized>` forces `{en, vi}` on each new key at compile time).

- [ ] **Step 3: Commit**

```bash
git add src/content/i18n/ui.ts
git commit -m "feat(i18n): add UI strings for understanding prompts"
```

---

## Task 3: PredictBlock component (commit-a-guess → reveal)

**Files:**
- Create: `src/screens/quest/PredictBlock.tsx`
- Test: `src/screens/quest/PredictBlock.test.tsx`

Notes: the block owns its own `picked` state (no external consumer). Tapping an
option **locks** all options and reveals the explanation. Tests rely on the i18n
default language being `en` (the same assumption every existing screen test
makes). Using `vi === en` in fixture text keeps option/question assertions
lang-agnostic; only the `predictRight`/`predictWrong` lead-ins are real UI
strings, so those assertions depend on the `en` default.

- [ ] **Step 1: Write the failing test**

Create `src/screens/quest/PredictBlock.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PredictBlock from './PredictBlock';
import type { Predict } from '../../lib/types';

const L = (en: string) => ({ en, vi: en });
const predict: Predict = {
  question: L('What changes?'),
  options: [
    { text: L('The letters turn blue'), correct: true },
    { text: L('Nothing happens'), correct: false },
  ],
  explain: L('color paints the text itself'),
};

test('hides the explanation until a choice is committed', () => {
  render(<PredictBlock predict={predict} />);
  expect(screen.queryByText(/color paints the text itself/i)).not.toBeInTheDocument();
});

test('a correct pick reveals the explanation with the "right" lead-in', () => {
  render(<PredictBlock predict={predict} />);
  fireEvent.click(screen.getByRole('button', { name: /the letters turn blue/i }));
  expect(screen.getByText(/that's right/i)).toBeInTheDocument();
  expect(screen.getByText(/color paints the text itself/i)).toBeInTheDocument();
});

test('a wrong pick reveals the explanation with the "not quite" lead-in and locks options', () => {
  render(<PredictBlock predict={predict} />);
  fireEvent.click(screen.getByRole('button', { name: /nothing happens/i }));
  expect(screen.getByText(/not quite/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /the letters turn blue/i })).toBeDisabled();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:run -- src/screens/quest/PredictBlock.test.tsx`
Expected: FAIL — cannot resolve module `./PredictBlock`.

- [ ] **Step 3: Implement the component**

Create `src/screens/quest/PredictBlock.tsx`:

```tsx
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
      {revealed && (
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test:run -- src/screens/quest/PredictBlock.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/screens/quest/PredictBlock.tsx src/screens/quest/PredictBlock.test.tsx
git commit -m "feat(quest): add interactive PredictBlock (commit guess, reveal outcome)"
```

---

## Task 4: LessonPanel — render reflect / predict / experiment + nudge

**Files:**
- Modify: `src/screens/quest/LessonPanel.tsx`
- Test: `src/screens/quest/LessonPanel.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

Create `src/screens/quest/LessonPanel.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import LessonPanel from './LessonPanel';
import type { Quest } from '../../lib/types';

// LessonPanel -> PixelButton -> audio/sounds; mock so jsdom doesn't touch audio.
vi.mock('../../features/audio/sounds', () => ({ playSound: vi.fn() }));

const L = (en: string) => ({ en, vi: en });
const base: Quest = {
  id: 'html-01', world: 'html', xp: 50, badge: 'b-wood',
  title: L('T'), story: L('S'),
  steps: [{ text: L('Step one') }],
  starterCode: 'x',
  checks: [{ type: 'codeIncludes', value: '<p>', failMessage: L('no p') }],
};

type Overrides = Partial<React.ComponentProps<typeof LessonPanel>>;
function renderPanel(quest: Quest, overrides: Overrides = {}) {
  const props = {
    quest,
    alreadyDone: false,
    openHints: new Set<number>(),
    onHint: () => {},
    failMessage: null,
    runtimeErrorLine: null,
    stuck: false,
    onReload: () => {},
    checking: false,
    onCheck: () => {},
    reflectOpen: false,
    onReflect: () => {},
    showNudge: false,
    ...overrides,
  };
  return render(<LessonPanel {...props} />);
}

test('reflect answer is hidden until revealed', () => {
  const q = { ...base, reflect: { question: L('Which part selects it?'), answer: L('the selector does') } };
  renderPanel(q);
  expect(screen.getByText(/which part selects it/i)).toBeInTheDocument();
  expect(screen.queryByText(/the selector does/i)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /show answer/i })).toBeInTheDocument();
});

test('Show answer calls onReflect', () => {
  const onReflect = vi.fn();
  const q = { ...base, reflect: { question: L('Q?'), answer: L('A.') } };
  renderPanel(q, { onReflect });
  fireEvent.click(screen.getByRole('button', { name: /show answer/i }));
  expect(onReflect).toHaveBeenCalledOnce();
});

test('reflect answer shows when reflectOpen is true', () => {
  const q = { ...base, reflect: { question: L('Q?'), answer: L('the selector does') } };
  renderPanel(q, { reflectOpen: true });
  expect(screen.getByText(/the selector does/i)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /show answer/i })).not.toBeInTheDocument();
});

test('renders the experiment Try this block', () => {
  const q = { ...base, experiment: L('Add a second tag and run') };
  renderPanel(q);
  expect(screen.getByText(/add a second tag and run/i)).toBeInTheDocument();
});

test('renders the predict block when present', () => {
  const q: Quest = {
    ...base,
    predict: {
      question: L('What changes?'),
      options: [{ text: L('Letters'), correct: true }, { text: L('Nothing'), correct: false }],
      explain: L('color paints text'),
    },
  };
  renderPanel(q);
  expect(screen.getByText(/what changes/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /letters/i })).toBeInTheDocument();
});

test('shows the nudge line when showNudge is true', () => {
  const q = { ...base, reflect: { question: L('Q?'), answer: L('A.') } };
  renderPanel(q, { showNudge: true });
  expect(screen.getByText(/peek at the think question/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:run -- src/screens/quest/LessonPanel.test.tsx`
Expected: FAIL — LessonPanel does not accept `reflectOpen`/`onReflect`/`showNudge` and renders none of the new blocks.

- [ ] **Step 3: Add the props to the interface**

In `src/screens/quest/LessonPanel.tsx`, add to `LessonPanelProps` (after `onCheck: () => void;`):

```ts
  reflectOpen: boolean;
  onReflect: () => void;
  showNudge: boolean;
```

And add them to the destructure on the `const { … } = props;` line:

```ts
  const { quest, alreadyDone, openHints, onHint, failMessage, runtimeErrorLine, stuck, onReload, checking, onCheck, reflectOpen, onReflect, showNudge, className = '' } = props;
```

- [ ] **Step 4: Import PredictBlock**

At the top of the file, after `import Icon from '../../components/Icon';`:

```ts
import PredictBlock from './PredictBlock';
```

- [ ] **Step 5: Render the three blocks after the steps list**

Immediately after the closing `</ol>` of the steps list, insert:

```tsx
      {quest.reflect && (
        <div className="rounded-md border-2 border-grass/30 bg-grass/10 p-2">
          <h3 className="font-pixel text-xs"><Icon name="brain" /> {t('think')}</h3>
          <div className="mt-1 font-body font-bold"><LessonText text={tl(quest.reflect.question)} /></div>
          {reflectOpen ? (
            <div className="mt-1 rounded bg-gold/20 p-2 text-sm"><LessonText text={tl(quest.reflect.answer)} /></div>
          ) : (
            <button onClick={onReflect} className="mt-1 cursor-pointer rounded bg-gold/40 px-2 font-body text-xs font-bold"><Icon name="bulb" /> {t('showAnswer')}</button>
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
```

- [ ] **Step 6: Render the nudge line after the failMessage block**

Immediately after the `failMessage && ( … )` block (the one with `role="alert"` and `red-tile`), insert:

```tsx
      {showNudge && (
        <p role="alert" className="rounded-md bg-yellow-100 p-2 font-body font-bold"><Icon name="brain" /> {t('reflectNudge')}</p>
      )}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm run test:run -- src/screens/quest/LessonPanel.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 8: Commit**

```bash
git add src/screens/quest/LessonPanel.tsx src/screens/quest/LessonPanel.test.tsx
git commit -m "feat(quest): render reflect/predict/experiment blocks and reflect nudge in LessonPanel"
```

---

## Task 5: QuestScreen — reflect state + after-fail nudge wiring

**Files:**
- Modify: `src/screens/QuestScreen.tsx`
- Test: `src/screens/QuestScreen.test.tsx`

- [ ] **Step 1: Add a reflect+predict fixture and failing-check behavioral tests**

In `src/screens/QuestScreen.test.tsx`, inside the `vi.hoisted(() => { … })` block, add a third quest after `QUEST2` (before `const runDomChecks`):

```ts
  const QUEST3: Quest = {
    id: 'html-03', world: 'html', xp: 50, badge: 'b-stone',
    title: L('Reflecting'), story: L('Think it through.'),
    steps: [{ text: L('Type DONE') }],
    starterCode: '<!-- here -->',
    checks: [{ type: 'codeIncludes', value: 'DONE', failMessage: L('Type DONE!') }],
    reflect: { question: L('Which part selects it?'), answer: L('the selector picks it') },
    predict: {
      question: L('What happens?'),
      options: [
        { text: L('Outcome A'), correct: true },
        { text: L('Outcome B'), correct: false },
      ],
      explain: L('Because A is the right one'),
    },
  };
```

Update the `return` of the hoisted block to include it:

```ts
  return { QUEST, QUEST2, QUEST3, runDomChecks };
```

Update the `vi.mock('../content/quests', …)` factory to include `QUEST3` everywhere it lists quests:

```ts
vi.mock('../content/quests', () => ({
  ALL_QUESTS: [QUEST, QUEST2, QUEST3],
  QUESTS_BY_WORLD: { html: [QUEST, QUEST2, QUEST3], css: [], js: [] },
  QUESTS_BY_WORLD_IDS: { html: ['html-01', 'html-02', 'html-03'], css: [], js: [] },
  questById: (id: string) => [QUEST, QUEST2, QUEST3].find((q) => q.id === id),
  nextQuest: (id: string) => (id === 'html-01' ? QUEST2 : id === 'html-02' ? QUEST3 : null),
}));
```

Add a helper next to `renderQuest` (after it, ~line 79):

```ts
function renderQuestAt(id: string) {
  useProfiles.getState().create('Mai', '🦊');
  useProfiles.getState().select(useProfiles.getState().profiles[0].id);
  const router = createMemoryRouter(routes, { initialEntries: [`/quest/${id}`] });
  render(<RouterProvider router={router} />);
  return router;
}
```

Add these tests inside the `describe('QuestScreen', …)` block:

```ts
  test('a failing check on a reflect quest shows the Think nudge', async () => {
    renderQuestAt('html-03');
    fireEvent.click(await screen.findByRole('button', { name: /check my code/i }));
    expect(await screen.findByText(/peek at the think question/i)).toBeInTheDocument();
  });

  test('a passing check never shows the nudge', async () => {
    renderQuestAt('html-03');
    fireEvent.change(await screen.findByTestId('code-editor'), { target: { value: 'DONE' } });
    fireEvent.click(screen.getByRole('button', { name: /check my code/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument(); // victory
    expect(screen.queryByText(/peek at the think question/i)).not.toBeInTheDocument();
  });

  test('opening the Think answer clears the nudge', async () => {
    renderQuestAt('html-03');
    fireEvent.click(await screen.findByRole('button', { name: /check my code/i }));
    expect(await screen.findByText(/peek at the think question/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /show answer/i }));
    expect(screen.queryByText(/peek at the think question/i)).not.toBeInTheDocument();
    expect(screen.getByText(/the selector picks it/i)).toBeInTheDocument();
  });

  test('committing a predict choice reveals the explanation', async () => {
    renderQuestAt('html-03');
    fireEvent.click(await screen.findByRole('button', { name: /outcome a/i }));
    expect(screen.getByText(/because a is the right one/i)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run: `npm run test:run -- src/screens/QuestScreen.test.tsx`
Expected: FAIL — the nudge never renders (QuestScreen doesn't pass `showNudge`/`reflectOpen`/`onReflect` yet), so the 3 nudge/reflect tests fail. (The predict test may already pass via LessonPanel→PredictBlock; that's fine.)

- [ ] **Step 3: Add reflect/nudge state to QuestScreen**

In `src/screens/QuestScreen.tsx`, after the `const [tab, setTab] = useState<Tab>('lesson');` line (~line 48), add:

```ts
  const [reflectOpen, setReflectOpen] = useState(false);
  const [nudged, setNudged] = useState(false);
```

- [ ] **Step 4: Add the `onReflect` handler**

After the `onHint` `useCallback` (~line 63), add:

```ts
  const onReflect = () => {
    playSound('click');
    setReflectOpen(true);
  };
```

- [ ] **Step 5: Trigger the nudge on the failed-check branch**

In `onCheck`, change the `if (!result.pass) { … }` block to set the nudge (only fires when the quest has a still-unopened reflect, and only once):

```ts
    if (!result.pass) {
      setFailMessage(result.firstFail?.failMessage ?? null);
      questGuide.onFailedCheck();
      if (quest.reflect && !reflectOpen && !nudged) setNudged(true);
      return;
    }
```

- [ ] **Step 6: Thread the new props into LessonPanel**

In the `lesson` JSX, add three props to `<LessonPanel … />` (after `onCheck={onCheck}`):

```tsx
      reflectOpen={reflectOpen}
      onReflect={onReflect}
      showNudge={nudged && !reflectOpen}
```

- [ ] **Step 7: Run the full QuestScreen suite to verify it passes**

Run: `npm run test:run -- src/screens/QuestScreen.test.tsx`
Expected: PASS — all original tests still green (QUEST/QUEST2 have no reflect, so existing "failing check" and "one-click passing" tests are unaffected) plus the 4 new tests.

- [ ] **Step 8: Commit**

```bash
git add src/screens/QuestScreen.tsx src/screens/QuestScreen.test.tsx
git commit -m "feat(quest): wire reflect state and after-fail nudge into QuestScreen"
```

---

## Task 6: Content test — guard the new fields

**Files:**
- Modify: `src/content/quests/content.test.ts`

These guards pass trivially today (no quest has the fields yet) and become
meaningful as content lands in Tasks 7–9. `en !== vi` is scoped to full-sentence
prose only — NOT to `predict` option texts, which may be short/code-only and can
legitimately match across languages.

- [ ] **Step 1: Extend the "is complete" loop**

In the `test.each(...)('%s is complete', …)` body, after the line
`expect([50, 75, 100]).toContain(q.xp);`, insert:

```ts
    if (q.reflect) {
      expect(filled(q.reflect.question)).toBe(true);
      expect(filled(q.reflect.answer)).toBe(true);
      expect(q.reflect.answer.en.trim()).not.toBe(q.reflect.question.en.trim());
      expect(q.reflect.question.en.trim()).not.toBe(q.reflect.question.vi.trim());
      expect(q.reflect.answer.en.trim()).not.toBe(q.reflect.answer.vi.trim());
    }
    if (q.predict) {
      expect(filled(q.predict.question)).toBe(true);
      expect(q.predict.options.length).toBeGreaterThanOrEqual(2);
      expect(q.predict.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.predict.options) expect(filled(o.text)).toBe(true);
      expect(filled(q.predict.explain)).toBe(true);
      expect(q.predict.question.en.trim()).not.toBe(q.predict.question.vi.trim());
      expect(q.predict.explain.en.trim()).not.toBe(q.predict.explain.vi.trim());
    }
    if (q.experiment) {
      expect(filled(q.experiment)).toBe(true);
      expect(q.experiment.en.trim()).not.toBe(q.experiment.vi.trim());
    }
```

- [ ] **Step 2: Extend the "no raw HTML" loop**

In the `test.each(...)('%s has no raw HTML tags outside code spans', …)` body,
extend the `const fields: string[] = [ … ];` array to include both halves of the
new fields (nullish-guarded, like the existing `s.hint?.en ?? ''`):

```ts
      const fields: string[] = [
        q.story.en, q.story.vi,
        ...q.steps.flatMap((s) => [s.text.en, s.text.vi, s.hint?.en ?? '', s.hint?.vi ?? '']),
        ...q.checks.flatMap((c) => [c.failMessage.en, c.failMessage.vi]),
        q.reflect?.question.en ?? '', q.reflect?.question.vi ?? '',
        q.reflect?.answer.en ?? '', q.reflect?.answer.vi ?? '',
        q.predict?.question.en ?? '', q.predict?.question.vi ?? '',
        ...(q.predict?.options ?? []).flatMap((o) => [o.text.en, o.text.vi]),
        q.predict?.explain.en ?? '', q.predict?.explain.vi ?? '',
        q.experiment?.en ?? '', q.experiment?.vi ?? '',
      ];
```

- [ ] **Step 3: Run the content tests to verify they pass**

Run: `npm run test:run -- src/content/quests/content.test.ts`
Expected: PASS (guards are vacuous until content is added).

- [ ] **Step 4: Commit**

```bash
git add src/content/quests/content.test.ts
git commit -m "test(content): guard reflect/predict/experiment bilingual + no-raw-HTML"
```

---

## Task 7: Content pass — HTML world

**Files:**
- Modify: selected files under `src/content/quests/html/q01.ts … q10.ts`

**How to do this well (read first, then author):** Open each of `html/q01.ts`
through `html/q10.ts`. For each non-boss quest decide whether a prompt deepens
understanding, following the spec's criteria, and author it in the same warm,
bilingual, second-person register the quests already use. Run the content test
after each file so a mistake surfaces immediately.

**Rules (enforced by Task 6's tests — a violation fails CI):**
- Every new string is bilingual: both `en` and `vi` non-empty, and (for prose)
  `en !== vi`. Vietnamese matches the house voice (`bạn`, soft `Hãy … nhé`).
- Any tag or code MUST sit inside backticks (`` `<p>` ``, `` `<a href>` ``) —
  never a bare `<p>` in either language.
- `predict`: 2–4 options, **exactly one** `correct: true`; `explain` says *why*.
- `reflect.answer` must NOT restate `reflect.question`.

**Distribution target for this world:**
- At least 6 of the 9 non-boss quests (`html-01`…`html-09`) get exactly one prompt.
- Rotate types — a healthy mix of `predict`, `reflect`, and `experiment`, not all one kind.
- `html-10` (boss) gets **none**. Do not stack all three fields on one quest.

- [ ] **Step 1: Add the canonical example to `html/q01.ts`**

In `src/content/quests/html/q01.ts`, add to the `q01` object (after `checks`,
before the closing `}`):

```ts
  experiment: {
    en: 'Add a second `<p>` with a different message, then run. Where does the new line appear? You can change it back — this part is not graded.',
    vi: 'Thêm một `<p>` thứ hai với lời nhắn khác rồi chạy thử. Dòng mới xuất hiện ở đâu? Bạn có thể đổi lại — phần này không bị chấm điểm đâu nhé.',
  },
```

- [ ] **Step 2: Author prompts for ≥5 more non-boss HTML quests**

Read `html/q02.ts`…`html/q09.ts`. Pick at least five and add ONE prompt each,
matching the shape below to the quest's concept. Use these worked shapes as the
quality bar (adapt the wording to each quest's actual topic):

`reflect` (use where an insight is structural — e.g. a tag with an attribute):
```ts
  reflect: {
    question: { en: 'In `<a href="...">`, which part is the *address* and which part is the *clickable words*?', vi: 'Trong `<a href="...">`, phần nào là *địa chỉ* và phần nào là *chữ bấm được*?' },
    answer: { en: 'The `href="..."` is the address the link points to; the text between `<a>` and `</a>` is what the reader sees and clicks.', vi: '`href="..."` là địa chỉ mà liên kết trỏ tới; chữ nằm giữa `<a>` và `</a>` là phần người đọc nhìn thấy và bấm vào.' },
  },
```

`predict` (use where a tag swap has a visible result):
```ts
  predict: {
    question: { en: 'If you change `<h1>` to `<h3>`, what happens to the heading?', vi: 'Nếu bạn đổi `<h1>` thành `<h3>`, tiêu đề sẽ thế nào?' },
    options: [
      { text: { en: 'It gets smaller', vi: 'Nó nhỏ lại' }, correct: true },
      { text: { en: 'It disappears', vi: 'Nó biến mất' }, correct: false },
      { text: { en: 'It turns red', vi: 'Nó chuyển sang đỏ' }, correct: false },
    ],
    explain: { en: 'Headings go from `<h1>` (biggest) to `<h6>` (smallest) — the number sets the size and importance, not the color.', vi: 'Tiêu đề đi từ `<h1>` (to nhất) đến `<h6>` (nhỏ nhất) — con số quyết định cỡ và độ quan trọng, không phải màu.' },
  },
```

- [ ] **Step 3: Run the content test after each file**

Run: `npm run test:run -- src/content/quests/content.test.ts`
Expected: PASS. If a `not.toBe` guard fails, you left `en === vi` or an answer
that restates its question — fix the copy. If the raw-HTML test fails, you left a
bare tag outside backticks.

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: typecheck + bundle succeed.

- [ ] **Step 5: Commit**

```bash
git add src/content/quests/html
git commit -m "content(html): add reflect/predict/experiment prompts to HTML quests"
```

---

## Task 8: Content pass — CSS world

**Files:**
- Modify: selected files under `src/content/quests/css/q01.ts … q10.ts`

Same rules and distribution target as Task 7 (≥6 of `css-01`…`css-09`, rotate
types, `css-10` boss gets none, no field-stacking).

- [ ] **Step 1: Add the canonical example to `css/q01.ts`**

In `src/content/quests/css/q01.ts`, add to the `q01` object (after `checks`):

```ts
  predict: {
    question: { en: 'Before you run it — if you change `red` to `blue`, what changes?', vi: 'Trước khi chạy thử — nếu bạn đổi `red` thành `blue`, điều gì sẽ thay đổi?' },
    options: [
      { text: { en: 'The letters of the heading turn blue', vi: 'Các chữ của tiêu đề chuyển sang xanh' }, correct: true },
      { text: { en: 'The background behind the heading turns blue', vi: 'Nền phía sau tiêu đề chuyển sang xanh' }, correct: false },
      { text: { en: 'Nothing changes', vi: 'Không có gì thay đổi' }, correct: false },
    ],
    explain: { en: '`color` paints the text itself, not the background. To paint behind the text you would use `background-color`.', vi: '`color` tô màu cho chính chữ, không phải nền. Muốn tô phía sau chữ thì dùng `background-color`.' },
  },
```

- [ ] **Step 2: Author prompts for ≥5 more non-boss CSS quests**

Read `css/q02.ts`…`css/q09.ts`. Add ONE prompt to at least five, rotating types.
A `reflect` shape that fits CSS well (selector vs. declaration):
```ts
  reflect: {
    question: { en: 'In `h1 { color: red; }`, which part chooses *what* to style, and which part says *how* to style it?', vi: 'Trong `h1 { color: red; }`, phần nào chọn *cái gì* để trang trí, và phần nào nói *trang trí thế nào*?' },
    answer: { en: '`h1` is the selector — it picks the elements. `color: red` is the declaration — it says how those elements should look.', vi: '`h1` là bộ chọn — nó chọn các phần tử. `color: red` là khai báo — nó nói các phần tử đó trông ra sao.' },
  },
```

- [ ] **Step 3: Run the content test, then build**

Run: `npm run test:run -- src/content/quests/content.test.ts`
Then: `npm run build`
Expected: both PASS.

- [ ] **Step 4: Commit**

```bash
git add src/content/quests/css
git commit -m "content(css): add reflect/predict/experiment prompts to CSS quests"
```

---

## Task 9: Content pass — JS world

**Files:**
- Modify: selected files under `src/content/quests/js/q01.ts … q10.ts`

Same rules and distribution target (≥6 of `js-01`…`js-09`, rotate types, `js-10`
boss gets none, no field-stacking).

- [ ] **Step 1: Add the canonical example to `js/q01.ts`**

In `src/content/quests/js/q01.ts`, add to the `q01` object (after `checks`):

```ts
  reflect: {
    question: { en: 'Your message printed in the Console. Did `console.log` change anything you can SEE on the page itself?', vi: 'Thông điệp của bạn in ra ở Console. `console.log` có thay đổi điều gì bạn NHÌN THẤY trên trang không?' },
    answer: { en: 'No — `console.log` only writes to the Console, a place for messages to the programmer. It does not change the page the player sees.', vi: 'Không — `console.log` chỉ ghi ra Console, nơi nhắn tin cho lập trình viên. Nó không thay đổi trang mà người chơi nhìn thấy.' },
  },
```

- [ ] **Step 2: Author prompts for ≥5 more non-boss JS quests**

Read `js/q02.ts`…`js/q09.ts`. Add ONE prompt to at least five, rotating types.
A `predict` shape that fits JS (a value/operator change with a visible result):
```ts
  predict: {
    question: { en: 'If you change `2 + 3` to `2 * 3`, what will the Console show?', vi: 'Nếu bạn đổi `2 + 3` thành `2 * 3`, Console sẽ hiện gì?' },
    options: [
      { text: { en: '6', vi: '6' }, correct: true },
      { text: { en: '5', vi: '5' }, correct: false },
      { text: { en: '23', vi: '23' }, correct: false },
    ],
    explain: { en: '`*` means multiply, so `2 * 3` is 6. `+` would add them to make 5.', vi: '`*` nghĩa là nhân, nên `2 * 3` là 6. `+` sẽ cộng lại thành 5.' },
  },
```
(Note: short numeric option texts like `6`/`5` are allowed to have `en === vi` —
the `en !== vi` guard applies only to question/answer/explain/experiment prose.)

- [ ] **Step 3: Run the content test, then build**

Run: `npm run test:run -- src/content/quests/content.test.ts`
Then: `npm run build`
Expected: both PASS.

- [ ] **Step 4: Commit**

```bash
git add src/content/quests/js
git commit -m "content(js): add reflect/predict/experiment prompts to JS quests"
```

---

## Task 10: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the entire test suite once**

Run: `npm run test:run`
Expected: PASS — all suites green, including the new PredictBlock, LessonPanel,
QuestScreen, and content guards.

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: typecheck + bundle succeed with no errors.

- [ ] **Step 3 (optional manual smoke): run the dev server**

Run: `npm run dev`, open a quest that has each prompt type (e.g. `css-01` for
predict, `js-01` for reflect, `html-01` for experiment), and confirm: the Think
answer reveals on tap; a predict choice locks and reveals the explanation; a
*failed* Check on a reflect quest shows the nudge while a passing one does not.

- [ ] **Step 4: Confirm the branch is clean and ready**

Run: `git status` (expect clean) and `git log --oneline` (expect the per-task
commits). The feature is ready for a PR / merge via the
`superpowers:finishing-a-development-branch` skill.

---

## Self-Review (completed by plan author)

**Spec coverage:** §1 schema → Task 1. §2 i18n → Task 2; predict UI → Task 3;
LessonPanel rendering → Task 4. §3 after-fail nudge → Task 5. §4 content
(all worlds, selective, boss-none, rotate types) → Tasks 7–9. §5 tests →
Tasks 3/4/5 (behavior) + Task 6 (content guards) + Task 10 (gate). Out-of-scope
items (hints left as-is, no new Check types, no Guide Buddy/QuestTabs change)
are respected — no task touches them.

**Type consistency:** `Reflect.{question,answer}`, `PredictOption.{text,correct}`,
`Predict.{question,options,explain}`, and `Quest.{reflect,predict,experiment}`
are used identically in every task (types, components, tests, content). The
LessonPanel props (`reflectOpen`, `onReflect`, `showNudge`) match between the
interface (Task 4), the test (Task 4), and the QuestScreen call site (Task 5).
The nudge condition `nudged && !reflectOpen` (Task 5 Step 6) is consistent with
LessonPanel's `showNudge` gate (Task 4 Step 6).

**Placeholder scan:** mechanism tasks (1–6) contain complete code and exact
commands. Content tasks (7–9) intentionally have the author read each quest and
write copy in-context (the only way to get quality, quest-fitting bilingual
prose), but each provides a full canonical example, fully-worked shape templates,
explicit pass/fail rules enforced by Task 6's tests, and a concrete distribution
target — so "done" is unambiguous and machine-checkable.
