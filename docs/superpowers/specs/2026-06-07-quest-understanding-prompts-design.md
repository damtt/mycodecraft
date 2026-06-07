# Quest Understanding Prompts — Design

**Date:** 2026-06-07
**Status:** Approved design, revised after multi-agent review; pending implementation plan

## Problem

CodeCraft's quest completion is gated entirely by declarative `checks` —
DOM/code/console pattern matches (`elementExists`, `textIncludes`,
`computedStyle`, `codeIncludes`, …). A kid can satisfy them by copying the
step's hint verbatim, which often contains the literal answer. The result is
that quests can be passed by pattern-matching without understanding *why* the
code works.

The game itself is clear, friendly, and motivating — a good first coding game.
The goal here is to add **depth**, not to rewrite what already works:

1. Tiny "what changed?" prompts that push kids to observe the preview.
2. More chances to experiment / tinker.
3. Occasional reflection questions ("Which part selected the button?").
4. (Added in review) **Predict-before-run** — make the kid commit a guess
   *before* seeing the result, the highest-yield fix for pattern-matching.

## Decisions

From brainstorming:

- **Mechanism:** Add lightweight schema + UI — real interactive affordances, not
  rhetorical text folded into existing steps.
- **Breadth:** All 30 quests in this pass, prompts placed **selectively** (only
  where they deepen understanding), not forced onto every quest.
- **Placement:** New prompts are **quest-level blocks rendered after the steps**,
  not attached per-step.

From multi-agent review (three reviewers: pedagogy, codebase-fit, content/i18n):

- **Add a real interactive `predict` affordance** (commit a guess → reveal
  outcome), not just predict-flavored text. It becomes the flagship
  cause→effect prompt.
- **Nudge fires only AFTER a failed Check**, not before the first Check. A
  correct first attempt goes straight to victory — never delayed, never trained
  to dismiss. The nudge appears alongside the fail message, once.
- **Use `<Icon>` not raw emoji**; the codebase renders all icons via a typed
  `IconName` union (`src/components/Icon.tsx`), never literal emoji glyphs.
- **Full-word field names** (`question`/`answer`), matching the house
  convention (`text`, `hint`, `failMessage`) — no single-letter `q`/`a`.
- **Tests must scan both `.en` and `.vi`** of new fields (nullish-guarded), and
  add cheap quality guards (`answer !== question`, `en !== vi`) because
  `filled()` alone won't catch a self-restating answer or untranslated
  Vietnamese.

## 1. Schema — `src/lib/types.ts`

Three new **optional** quest-level fields. Optionality keeps every existing
quest valid; "selective placement" is just setting them where they help.

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
  question: Localized;          // e.g. "If you change `red` to `blue`, what happens?"
  options: [PredictOption, PredictOption, ...PredictOption[]]; // >= 2; exactly one correct
  explain: Localized;           // revealed after the kid commits; explains the WHY
}

export interface Quest {
  // …existing fields…
  reflect?: Reflect;
  predict?: Predict;
  experiment?: Localized; // open "change X → watch what happens" invitation
}
```

When to use which (these are different learning moments, not redundant):

- **`predict`** — flagship. There's a runnable cause→effect: change a value,
  guess the result, run to verify. Most CSS/JS quests, some HTML.
- **`reflect`** — the insight is conceptual/structural and needs no run ("which
  part selected the button?", "what's the difference between the tag and the
  text inside it?"). Can also host a "spot the difference" between two snippets.
- **`experiment`** — open-ended play with no single right answer ("add more
  list items — what happens?"). Lowest structure; used sparingly.

## 2. Rendering — `src/screens/quest/LessonPanel.tsx`

After the steps `<ol>`, before the fail message / Check button, render when
present. All copy goes through `<LessonText text={tl(...)} />` (Markdown +
bilingual), consistent with story/steps/hints, so the no-raw-HTML content rule
applies identically. Section headers use `<Icon>` like the existing
`<Icon name="pickaxe" />` header — **no raw emoji**:

- **Reflect block** — `<Icon name="brain" />` "Think". Shows `reflect.question`
  with a *Show answer* button that mirrors the existing hint reveal (button →
  revealed `answer` in the same `gold/20` box).
- **Predict block** — `<Icon name="eye" />` "Predict". Shows `predict.question`
  and each option as a tappable button. On first tap the choice **locks**: the
  chosen option is marked right/wrong, the correct option is highlighted, and
  `predict.explain` reveals below. Non-gating — purely a learning interaction,
  independent of Check.
- **Experiment block** — `<Icon name="potion" />` "Try this". Shows
  `experiment`, always visible, no reveal. An open invitation to change code and
  watch the preview.

New bilingual UI strings in `src/content/i18n/ui.ts` (`UI satisfies
Record<string, Localized>` already forces `{en, vi}` at compile time):

- `think` — "Think" / "Suy nghĩ"
- `predict` — "Predict" / "Đoán thử"
- `tryThis` — "Try this" / "Thử xem"
- `showAnswer` — "Show answer" / "Xem đáp án"
- `predictRight` / `predictWrong` — short "Nice — that's right!" / "Not quite —
  look:" lead-ins for the predict reveal
- `reflectNudge` — the one-time after-fail nudge line (§3)

(Final Vietnamese copy decided during implementation; keys illustrative.)

## 3. After-fail soft nudge — `src/screens/QuestScreen.tsx` (+ `LessonPanel` props)

New state in `QuestScreenInner`: `reflectOpen: boolean`, `nudged: boolean`
(both reset per quest via the existing `key={id}` remount, like `openHints`).

`onCheck` runs checks normally. The nudge only ever appears next to a failure:

```text
// …runChecks as today…
if (!result.pass) {
  setFailMessage(result.firstFail?.failMessage ?? null);
  questGuide.onFailedCheck();
  if (quest.reflect && !reflectOpen && !nudged) setNudged(true); // show nudge once
  return;
}
// pass → complete quest, show victory (UNCHANGED — never nudged)
```

- A **passing** check is never delayed: the nudge code only runs on the
  `!result.pass` branch. (This is why moving the nudge here keeps the existing
  "passing check completes in one click" test green.)
- The nudge renders in `LessonPanel` as a soft yellow line (same family as the
  existing `stuck` notice, `bg-yellow-100`, `role="alert"`), shown when
  `nudged && quest.reflect && !reflectOpen`. Copy: "Stuck? Peek at the *Think*
  question — it might help." (led by `<Icon name="brain" />`, not emoji).
- Opening the reflect answer sets `reflectOpen`, which clears the nudge.
- It appears at most once per quest attempt and never blocks: a kid can re-Check
  immediately. The existing code `checks` remain the only real completion gate.

`LessonPanel` gains props: `reflectOpen: boolean`, `onReflect: () => void`,
`showNudge: boolean`. `reflect`/`predict`/`experiment` data is read from the
existing `quest` prop. The reflect reveal handler plays the `click` sound,
matching `onHint`. **Predict selection state is local to a small `PredictBlock`
component** (no external consumer — it doesn't touch Check or the nudge), to
avoid threading more state through QuestScreen.

## 4. Content pass — all 30 quests, selective and varied

Placement criteria:

- **`predict`** where a value can be changed with a visible, guessable result
  (a color, size, number, text, `true`/`false`). Options are 2–4 plausible
  outcomes with exactly one correct; `explain` says *why*.
- **`reflect`** where the insight is conceptual/structural and the `answer`
  teaches the *why* (not a restatement). Good for selectors vs. properties,
  attribute vs. content, scope, `return` vs `console.log`, and "spot the
  difference" between a working and broken snippet.
- **`experiment`** sparingly, for genuinely open play; include a short "what to
  look for" closure and a "you can change it back — this isn't graded"
  reassurance so kids feel safe.

Distribution guidance (not a hard quota):

- **Rotate the prompt types** across the 30 so it never feels formulaic —
  collectively a healthy mix of predict / reflect / experiment, not mostly one.
- **Most non-boss quests get exactly one** prompt; some get none. Avoid stacking
  all three on a single quest (overwhelming).
- **Boss quests get none** — `html-10`, `css-10`, `js-10` are synthesis; the
  doing *is* the comprehension. Pure-repetition quests stay bare too.

Representative examples:

- `html-01` — experiment: "Add a second `<p>` with a different message. Where
  does it appear?"
- `css-01` — predict Q: "If you change `red` to `blue`, what changes?" options:
  (the letters' color / the box behind them / nothing). explain: "`color` paints
  the text itself, not the background."
- `css-01` — reflect (alt): "Which word told the browser *what* to paint, and
  which told it *which color*?" answer explains selector (`h1`) vs.
  property/value (`color: red`).
- A JS quest — reflect on `return` vs `console.log` (value handed back vs. text
  printed).

Every new string is bilingual (en + vi), child-directed Vietnamese matching the
existing register (second-person `bạn`, soft `Hãy … nhé`), with all tags/code
kept inside backtick spans, and obeys the no-raw-HTML-outside-code rule.

## 5. Tests

**`src/content/quests/content.test.ts`** — extend the two per-quest `test.each`
loops:

- "is complete" — add guarded checks:
  ```ts
  if (q.reflect) {
    expect(filled(q.reflect.question)).toBe(true);
    expect(filled(q.reflect.answer)).toBe(true);
    expect(q.reflect.answer.en.trim()).not.toBe(q.reflect.question.en.trim()); // not a restatement
    expect(q.reflect.question.en.trim()).not.toBe(q.reflect.question.vi.trim()); // translated
    expect(q.reflect.answer.en.trim()).not.toBe(q.reflect.answer.vi.trim());
  }
  if (q.predict) {
    expect(filled(q.predict.question)).toBe(true);
    expect(q.predict.options.length).toBeGreaterThanOrEqual(2);
    expect(q.predict.options.filter((o) => o.correct)).toHaveLength(1); // exactly one
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
  (`en !== vi` is scoped to full-sentence prose only — NOT to `predict` option
  texts, which can be short/code-only and legitimately collide.)
- "no raw HTML tags outside code spans" — extend the inline `fields` array with
  BOTH halves of every new field, nullish-guarded like `s.hint?.en ?? ''`:
  ```ts
  q.reflect?.question.en ?? '', q.reflect?.question.vi ?? '',
  q.reflect?.answer.en ?? '',   q.reflect?.answer.vi ?? '',
  q.predict?.question.en ?? '', q.predict?.question.vi ?? '',
  ...(q.predict?.options ?? []).flatMap((o) => [o.text.en, o.text.vi]),
  q.predict?.explain.en ?? '',  q.predict?.explain.vi ?? '',
  q.experiment?.en ?? '',       q.experiment?.vi ?? '',
  ```

**`src/screens/QuestScreen.test.tsx`** — the existing `QUEST` (`html-01`) and
`QUEST2` fixtures stay **reflect/predict-free**, so the current "failing message"
and "one-click passing" tests are unaffected. Add a dedicated fixture
(reflect + predict + a failing check) mocked into `../content/quests`, and new
cases:

- reflect `answer` hidden until *Show answer* tapped, then revealed;
- predict: tapping an option locks the choice and reveals `explain` + the correct
  option;
- after-fail nudge: a failing Check on the reflect-bearing quest shows the nudge
  once; a passing Check never shows it; opening the answer clears it.

**Out-of-scope confirmations (no code, but stated so reviewers don't assume an
omission):** `i18n.test.ts` needs nothing (TS `satisfies` covers the new keys);
`validation.test.ts` is untouched (no new `Check` types); Guide Buddy /
`useQuestGuide` / `QuestGuideContext` do not surface reflect/predict/experiment;
`QuestTabs` passes the lesson as an opaque `ReactNode`, so the new blocks ride
along unchanged.

Gate: `npm run test:run` and `npm run build` green.

## Out of scope

- Wholesale rewriting of existing steps / hints / stories — kept intact, touched
  only for a small tie-in when a new prompt needs it.
- Changing the hints that already leak the answer (a known limiter the reviewer
  flagged) — out of scope for this pass; the new prompts add an understanding
  path without removing the existing copy-paste path.
- New `Check` types or any change to how completion is validated.
- Any gating that can *fail* a kid (the nudge only ever appears next to an
  already-failed Check and never blocks a re-Check).
- Backend / accounts / network — the app stays local-first.
