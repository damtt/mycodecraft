# Quest Understanding Prompts — Design

**Date:** 2026-06-07
**Status:** Approved (design); pending implementation plan

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

## Decisions (from brainstorming)

- **Mechanism:** Add lightweight schema + UI — real interactive affordances, not
  rhetorical text folded into existing steps.
- **Breadth:** All 30 quests in this pass, but prompts placed **selectively**
  (only where they deepen understanding), not forced onto every quest.
- **Gating:** A one-time **soft nudge** toward the reflect question before
  Check. Never hard-blocks completion.
- **Placement:** `reflect`/`experiment` are **quest-level blocks rendered after
  the steps**, not attached per-step. They read as a "now that you've built it,
  think/play" beat and keep `Step` simple.

## 1. Schema — `src/lib/types.ts`

Two new **optional** quest-level fields. Optionality keeps every existing quest
valid and makes "selective placement" simply a matter of setting them where they
help.

```ts
export interface Reflect {
  q: Localized;  // comprehension question, e.g. "Which part of your code selected the button?"
  a: Localized;  // tap-to-reveal answer that explains the WHY (not a restatement)
}

export interface Quest {
  // …existing fields…
  reflect?: Reflect;
  experiment?: Localized;  // a "change X → what changed?" tinker invitation
}
```

## 2. Rendering — `src/screens/quest/LessonPanel.tsx`

After the steps `<ol>`, before the fail message / Check button, render when
present:

- **🔍 Think block** — shows `reflect.q` with a *Show answer* button. Mirrors the
  existing hint-reveal pattern (button → revealed answer in the same `gold/20`
  box). Open state is tracked.
- **🧪 Try this block** — shows `experiment`, always visible, explore-styled, no
  reveal. An open invitation to change code and re-run and watch the preview.

Both render through `LessonText` (Markdown + bilingual via `tl`), consistent
with story/steps/hints. All tags in copy must stay inside backtick spans / fenced
blocks (existing content rule).

New bilingual UI strings in `src/content/i18n/ui.ts`:

- `think` — "Think" / "Suy nghĩ"
- `tryThis` — "Try this" / "Thử xem"
- `showAnswer` — "Show answer" / "Xem đáp án"
- `reflectNudge` — the one-time nudge line (see §3)

(Final Vietnamese copy decided during implementation; keys are illustrative.)

## 3. Soft-nudge gating — `src/screens/QuestScreen.tsx` (+ `LessonPanel` props)

New state in `QuestScreenInner`: `reflectOpen: boolean`, `nudged: boolean`
(both reset per quest via the existing `key={id}` remount).

`onCheck` logic, before running checks:

```text
if (quest.reflect && !reflectOpen && !nudged) {
  setNudged(true);          // show the nudge exactly once
  return;                   // do NOT run checks this click
}
// …existing runChecks flow…
```

- The nudge ("🔍 Peek at the Think question first?") renders in `LessonPanel` as a
  soft yellow line (same family as the existing `stuck` notice — not an error).
- Opening the reflect answer sets `reflectOpen`, which also clears the nudge.
- The **next** Check click proceeds normally regardless. This is one gentle
  friction point, never a hard block. The existing code `checks` remain the only
  real completion gate.

`LessonPanel` gains props: `reflectOpen`, `onReflect` (reveal handler), and
`showNudge`. The reveal handler plays the existing `click` sound, matching
`onHint`.

## 4. Content pass — all 30 quests, selective

Placement criteria:

- **Add a `reflect`** where a kid could pattern-match without understanding the
  concept: CSS selectors, attribute-vs-text-content, the box model,
  variables/scope, `return` vs `console.log`, event wiring, etc. The answer
  explains the *why*.
- **Add an `experiment`** where there's a safe knob with a visible result: a
  color, a size, a number, a piece of text, a `true`/`false`. Phrase as
  "change X, re-run — what changed?".
- **Skip both** on pure-repetition quests where a prompt would feel formulaic.

Expected density: ~18–24 of 30 get a `reflect`, most get an `experiment`, a few
simple/boss quests get one or neither. Not a hard quota — placement follows the
criteria above.

Representative examples:

- `html-01` — experiment: "Add a second `<p>` with a different message. Where
  does it appear?"
- `css-01` — reflect Q: "Which word told the browser *what* to paint, and which
  told it *which color*?" A: explains selector (`h1`) vs property/value
  (`color: red`).
- A JS quest — reflect on `return` vs `console.log` (value handed back vs text
  printed).

Each new string is bilingual (en + vi) and obeys the no-raw-HTML-outside-code
rule.

## 5. Tests

- **`src/content/quests/content.test.ts`** — extend the existing two `test.each`
  loops:
  - "is complete": if `reflect` present, both `reflect.q` and `reflect.a` are
    bilingual-complete; if `experiment` present, it is bilingual-complete.
  - "no raw HTML tags outside code spans": include `reflect.q`, `reflect.a`, and
    `experiment` in the scanned `fields`.
- **`src/screens/QuestScreen.test.tsx`** — add cases:
  - reflect answer is hidden until *Show answer* is tapped, then revealed;
  - experiment text renders when present;
  - soft nudge fires once on Check (no completion), and the second Check
    proceeds to validation.
- `npm run test:run` and `npm run build` green.

## Out of scope

- Wholesale rewriting of existing steps / hints / stories. They stay intact;
  touched only for a small tie-in when a new prompt needs it.
- New `Check` types or any change to how completion is validated.
- Any gating that can *fail* a kid (the nudge only ever delays one click).
- Backend / accounts / network — the app stays local-first.
