# Design: Home Navigation · Guide Buddy · Responsive Support

- **Date:** 2026-06-06
- **Status:** Approved (design); pending implementation plan
- **Scope:** Three user-requested changes to CodeCraft:
  1. A way to return to the home/title screen after pressing Start.
  2. A floating, in-app guidance feature ("Guide Buddy").
  3. First-class support for mobile, iPad, and tablet devices.

## 1. Context & Problem

CodeCraft is a local-first, bilingual (`{ en, vi }`) Vite 6 / React 19 / TypeScript game teaching HTML/CSS/JS to kids (~8–13). Progress is stored in `localStorage`; there is no backend.

A read-only audit established the starting state:

- **No route to `/`.** Nothing in the app calls `navigate('/')` or links `to="/"`. After `TitleScreen` (`/`) sends the user to `/players` via "Press Start" (`TitleScreen.tsx:26`), the title screen is unreachable in-app. A `deselect()` primitive exists in `profileStore.ts:75` but is never called.
- **No guidance system.** The only help mechanism is per-step hints inside `QuestScreen` (`QuestScreen.tsx:96-108`), which set a `usedHint` flag feeding no-hint achievements (`QuestScreen.tsx:34,53-57`). There is no onboarding, tooltip, tour, or floating helper anywhere.
- **Desktop-only layout.** The entire app uses exactly one responsive breakpoint (`sm:grid-cols-10` in `InventoryScreen.tsx:17`). The two blockers on small screens are `QuestScreen` (fixed `w-1/3` / `w-2/3` columns + `h-[calc(100vh-48px)]` / `h-1/2` height math, `QuestScreen.tsx:80,82,134,135,138`) and `HudBar` (a non-wrapping horizontal row that overflows, `HudBar.tsx:18,25`). CodeMirror works on touch but offers zero typing assistance (autocomplete deliberately disabled, `CodeEditor.tsx:30`).

## 2. Goals & Non-Goals

**Goals**
- Return to the title screen from anywhere in the game, without losing the active player.
- A friendly, gentle-proactive floating mascot ("Guide Buddy") on all game screens that surfaces existing quest hints, explains the current screen, recaps the lesson, and encourages.
- A fully usable experience on phones, iPads, and tablets — all three first-class — including comfortable code entry on touch keyboards.

**Non-Goals**
- No backend, accounts, analytics, or network calls (project is local-first).
- No PWA / installable app / offline service worker (may be a future task).
- No landscape-specific QuestScreen variant; layout is width-driven and portrait-first.
- No new quest content fields; the Buddy reuses existing `story` / `hint` data.
- No redesign of the visual theme; new UI reuses `PixelButton`, `Panel`, `.pixel-border`, `.cc-bevel`, `font-pixel` / `font-body`, and the `@theme` colors.

## 3. Decisions (locked during brainstorming)

| Topic | Decision |
| --- | --- |
| Guidance form | Guide Buddy (corner mascot), **not** a tour / FAB-only / tip-bar |
| Buddy behavior | **Gentle proactive** — greets once per screen, nudges on key moments, otherwise quiet, always tappable |
| Buddy helps with | Quest step hints · Screen/UI help · Encouragement · Lesson recap (all four) |
| Buddy presence | **All game screens** (mounted once in the `RequireProfile` layout) |
| Home nav | Home → title screen, **keep** the active player; avatar→player-select stays as "switch player" |
| Device scope | **All three first-class** (phone + iPad/tablet + desktop) |
| Tablet layout | **Keep side-by-side columns** on tablet/desktop; phone-only tabbed layout |
| Code typing | **Add a tap-to-insert toolbar** on touch devices |
| Buddy identity | 🦉 owl guide named **"Pip"** (distinct from player avatars; emoji only, swappable) |
| Buddy mute | Persisted `guideOn` toggle in Settings, default **on** |
| Buddy-revealed hints | **Count as `usedHint`** (single source of truth with inline hints) |

## 4. Detailed Design

### 4.1 Home Navigation (task 1)

- **`HudBar`**: the leading `⛏️ CodeCraft`-style logo becomes a **Home control** — a `<Link to="/">` (keeps `activeId` set, so Press Start re-enters seamlessly). Reuse existing styling; add an accessible label (`aria-label`, bilingual `t('home')`).
- The existing avatar `<Link to="/players">` (`HudBar.tsx:19`) is unchanged and serves as "switch player."
- **`PlayersScreen`**: add a small back-to-title affordance (top-left `←`, `navigate('/')` / `<Link to="/">`) since the player-select screen also currently has no way back to the title.
- **No router changes.** `RequireProfile` continues to bounce profile-less routes to `/players`. Because `activeId` is not persisted (`profileStore.ts:54`), a hard reload still resets to player-select — unchanged, acceptable.
- New UI string: `home` (`{ en: 'Home', vi: 'Trang chủ' }`).

### 4.2 Guide Buddy (task 2)

New isolated feature folder **`src/features/guide/`**. The Buddy is a presentational consumer of a small store; quest-specific context and events are pushed *into* the store by `QuestScreen`, keeping coupling one-directional and testable.

**`guideStore.ts`** (Zustand, non-persisted):
```ts
import type { Localized } from '../../lib/types';
import type { Quest } from '../../lib/types';

export interface GuideAction {
  key: 'hint' | 'screen' | 'recap' | 'dismiss';
  label: Localized;
}

export interface QuestGuideContext {
  quest: Quest;
  openHints: Set<number>;
  revealHint: (stepIndex: number) => void; // same path as the inline 💡 button → sets usedHint
}

interface GuideState {
  bubble: { text: Localized; actions: GuideAction[] } | null;
  greeted: Set<string>;            // screen keys greeted this session (cleared on reload)
  questCtx: QuestGuideContext | null;
  editorFocused: boolean;          // true while the code editor has focus (keyboard up)
  say: (text: Localized, actions?: GuideAction[]) => void;
  dismiss: () => void;
  hasGreeted: (screenKey: string) => boolean;
  markGreeted: (screenKey: string) => void;
  setQuestCtx: (ctx: QuestGuideContext | null) => void;
  setEditorFocused: (v: boolean) => void;
}
```

**`guideContent.ts`** — bilingual content, no schema changes to quests:
```ts
export const GUIDE = {
  greeting: {
    map:       { en: "Pick a quest to start crafting! ⛏️", vi: "Chọn một nhiệm vụ để bắt đầu! ⛏️" },
    quest:     { en: "Read the steps, type your code, then tap Check ✔", vi: "..." },
    inventory: { en: "These are the badges you've earned. Nice haul!", vi: "..." },
    settings:  { en: "Tweak sound, language, and text size here.", vi: "..." },
  },
  screenHelp: { /* per-screen "what is this" copy, incl. quest editor/preview/console */ },
  idle:       { /* per-screen gentle nudge */ },
  failedCheck:{ en: "Almost! Check the step again — want a hint? 💡", vi: "..." },
  stuck:      { en: "Your code looped forever — tap ↻ to reset and try again.", vi: "..." },
} satisfies Record<string, Record<string, Localized>>;
```
All copy must be bilingually complete (EN + VI), matching the `Localized` convention.

**`GuideBuddy.tsx`** — `fixed bottom-4 right-4 z-40` mascot (below the `z-50` VictoryOverlay modal convention from `VictoryOverlay.tsx:21`):
- Reads the current screen key from `useLocation()`.
- **Greeting:** on screen change, if `guideOn` and `!hasGreeted(screen)`, `say(GUIDE.greeting[screen])` and `markGreeted(screen)`.
- **Idle nudge:** `useIdle(20_000)` fires `say(GUIDE.idle[screen])` once per idle period.
- **Tap:** opens the bubble with actions — **💡 Hint** (only when `questCtx`), **❓ Screen help**, **📖 Remind me** (lesson recap), **✕ Dismiss**.
  - Hint → `questCtx.revealHint(firstUnopenedHintStep)`; if all hints open, show an encouraging "you've seen them all" line.
  - Screen help → `say(GUIDE.screenHelp[screen])`.
  - Recap → `say(questCtx.quest.story)` on quest screen (else screen purpose).
- **Mute:** when `guideOn` is false the Buddy is hidden entirely.
- **Mobile placement:** sits above the `BottomNav` bar (`bottom-20` on phone), and auto-hides while the code editor is focused (keyboard up): `CodeEditor` emits focus/blur, which sets `guideStore.editorFocused`; the Buddy hides when it is `true`.

**`useIdle.ts`** — resets a timer on `pointerdown` / `keydown` / `touchstart`; calls back after `ms` idle. Cleans up listeners on unmount.

**Mount point:** `RequireProfile` in `app/router.tsx:15-20` renders `<HudBar/>`, `<main>`, then `<GuideBuddy/>` and `<BottomNav/>`. This covers map/quest/inventory/settings automatically. Title and player-select (outside the wrapper) intentionally have no Buddy.

**QuestScreen integration:** on mount/update, `QuestScreen` calls `setQuestCtx({ quest, openHints, revealHint })` where `revealHint` is the existing `onHint` logic (`QuestScreen.tsx:53-57`, sets `usedHint` + `openHints`). On unmount it clears context (`setQuestCtx(null)`). On a failed Check it calls `say(GUIDE.failedCheck, [hintAction])`; on stuck-loop, `say(GUIDE.stuck)`. A thin `useQuestGuide()` hook encapsulates this wiring so `QuestScreen` stays readable.

**Settings:** add persisted `guideOn: boolean` (default `true`) to `settingsStore` and a toggle row in `SettingsScreen` (`t('guideBuddy')`). Bump `settingsStore` `version` 1→2 with a `migrate` that defaults `guideOn` to `true`.

### 4.3 Responsive Support (task 3)

**Breakpoint strategy.** Tailwind defaults only (no config file; theme is in `index.css`'s `@theme`). The divider between "phone" and "tablet/desktop" is **`md` (768px)**:
- `< md` (phones): tabbed QuestScreen + bottom nav bar + condensed HUD.
- `≥ md` (iPad portrait ≈768, tablets, desktop): keep current side-by-side columns.
- The **insert toolbar** is gated on **`(pointer: coarse)`**, not width, so touch tablets also get it.

**`lib/useMediaQuery.ts`** — `matchMedia`-based hook returning a boolean; SSR-safe default. Used for the single QuestScreen layout branch (`useMediaQuery('(min-width: 768px)')`) and for `(pointer: coarse)` touch detection (`useIsTouch`). Test setup must mock `window.matchMedia`.

**`HudBar` (responsive).**
- Leading logo → Home link (§4.1).
- The screen-nav links (Map / Inventory / Settings) become `hidden md:flex`; on phone they live in `BottomNav`.
- Always-visible compact cluster: avatar, name, `XpBar`, streak, sound + lang icon buttons. Allow `flex-wrap` / hide decorative hearts (`HudBar.tsx:24`) below `md` to prevent overflow.
- Enlarge the lang button tap target (currently `text-[10px]`, `HudBar.tsx:34`).

**`components/BottomNav.tsx`** (new) — `fixed bottom-0 inset-x-0 z-30 md:hidden`, a row of large tap targets: 🏠 Home (`/`, keeps player) · 🗺️ Map · 🧰 Inventory · ⚙️ Settings, with active-route highlight via `useLocation()`, `playSound('click')` on tap, `.cc-bevel`/theme styling, and `padding-bottom: env(safe-area-inset-bottom)`. The layout `<main>` gets `pb-16 md:pb-0` so content isn't hidden behind it.

**`QuestScreen` refactor** (improves an over-long, multi-responsibility file):
- Extract presentational panes from the current monolith:
  - `screens/quest/LessonPanel.tsx` — title, story, steps + inline hints, fail/runtime/stuck banners, Check button (today's left column, `QuestScreen.tsx:82-131`).
  - `screens/quest/EditorPane.tsx` — wraps `CodeEditor` + the new `InsertToolbar`.
  - `screens/quest/PreviewPane.tsx` — preview `<iframe>` + JS console (`QuestScreen.tsx:138-156`).
- `QuestScreenInner` keeps all state (code, debounced, hints, fail, rewards, checking, preview) and passes props down.
- Two layouts consume the panes:
  - `QuestColumns.tsx` (≥md): today's side-by-side, ratios tightened (~`md:w-2/5` lesson / `md:w-3/5` editor+preview). Replace `h-[calc(100vh-48px)]` with a flex column using `flex-1 min-h-0` so it fills available height robustly regardless of HUD height / font scale.
  - `QuestTabs.tsx` (<md): a tab strip **📖 Lesson / ⌨️ Code / 👁 Run** (one full-height pane at a time; the Run tab may optionally badge when preview output changes). Uses `min-h-0` flex, not viewport math.
- Branch chosen via `useMediaQuery('(min-width: 768px)')`.

**Code insert toolbar.**
- `features/editor/InsertToolbar.tsx` — rendered above the editor when `useIsTouch()`. Buttons insert: `<`, `>`, `/`, `"`, `=`, `{`, `}`, and a few common tags. Horizontally scrollable; large tap targets; uses theme styling.
- `CodeEditor.tsx` — convert to `forwardRef` exposing an imperative `insertText(text: string)` that dispatches `view.dispatch(view.state.replaceSelection(text))` then `view.focus()`. Also expose/emit focus + blur (for the Buddy auto-hide). Existing `key={quest.id}` remount behavior preserved.

**Other touch / small-screen fixes.**
- `HoldToConfirm.tsx`: add `onTouchCancel` (and treat it like cancel) so a scroll-away aborts the hold (`HoldToConfirm.tsx:40-41` currently has touch start/end only).
- `VictoryOverlay.tsx`: inner Panel `w-96` → `w-full max-w-96 mx-4` (avoid clipping at 375px).
- `TitleScreen.tsx`: heading `text-5xl` → `text-4xl sm:text-5xl`; ensure lang toggle tap target ≥ ~40px.
- `QuestScreen` tiny text (`text-[10px]` step numbers / preview label) bumped on phone.
- `index.html`: add `viewport-fit=cover` to the existing viewport meta and a `theme-color` meta. (PWA meta out of scope.)
- `index.css`: optional safe-area helper utility for the bottom bar.

## 5. File-Change Map

**New**
- `src/features/guide/guideStore.ts`
- `src/features/guide/guideContent.ts`
- `src/features/guide/GuideBuddy.tsx`
- `src/features/guide/useIdle.ts`
- `src/features/guide/useQuestGuide.ts`
- `src/components/BottomNav.tsx`
- `src/features/editor/InsertToolbar.tsx`
- `src/lib/useMediaQuery.ts`
- `src/screens/quest/LessonPanel.tsx`
- `src/screens/quest/EditorPane.tsx`
- `src/screens/quest/PreviewPane.tsx`
- `src/screens/quest/QuestColumns.tsx`
- `src/screens/quest/QuestTabs.tsx`
- Co-located `*.test.tsx` for the above where behavior warrants.

**Changed**
- `src/app/router.tsx` — mount `GuideBuddy` + `BottomNav` in `RequireProfile`; `main` bottom padding.
- `src/components/HudBar.tsx` — Home control; responsive nav.
- `src/screens/QuestScreen.tsx` — slim container delegating to extracted panes + layout branch + guide wiring.
- `src/features/editor/CodeEditor.tsx` — `forwardRef` `insertText`, focus/blur emit.
- `src/components/HoldToConfirm.tsx` — `onTouchCancel`.
- `src/components/VictoryOverlay.tsx` — responsive width.
- `src/screens/TitleScreen.tsx` — responsive heading/tap target.
- `src/screens/PlayersScreen.tsx` — back-to-title affordance + minor responsive.
- `src/screens/SettingsScreen.tsx` — Guide Buddy mute toggle.
- `src/content/i18n/ui.ts` — new bilingual strings: `home`, `guideBuddy`, tab labels (`tabLesson`/`tabCode`/`tabRun`), buddy action labels, insert-toolbar tooltips.
- `src/stores/settingsStore.ts` — `guideOn` + setter; version bump + migrate.
- `index.html` — viewport-fit, theme-color.
- `src/index.css` — optional safe-area utility.

## 6. Error Handling & Edge Cases

- **Buddy with no quest context** (map/inventory/settings): Hint action hidden; only Screen help / Recap / Dismiss shown.
- **All hints already open:** Hint action shows an encouraging line instead of failing.
- **`guideOn` off:** Buddy fully hidden; no greetings/nudges.
- **`matchMedia` unavailable** (jsdom/tests): hook returns a safe default (treat as desktop / non-touch) and must not throw; tests mock it explicitly.
- **Viewport resize across the `md` divider:** the QuestScreen layout switches; editor remounts only on quest change (`key`), so code state persists across a layout switch (state lives in the container, not the pane).
- **Insert toolbar before editor ready:** `insertText` is a no-op until the `EditorView` exists.
- **Settings migration:** old persisted settings (version 1) gain `guideOn: true` without data loss.

## 7. Testing Strategy

Vitest + jsdom + React Testing Library, co-located tests. Add a `window.matchMedia` mock to `src/test/setup.ts`.
- **Home nav:** clicking Home navigates to `/` and the active profile is still set.
- **PlayersScreen back:** back affordance navigates to `/`.
- **GuideBuddy:** greets once per screen (not twice); tap reveals actions; Hint calls `revealHint` and flips `usedHint`; hidden when `guideOn` is false; idle nudge fires after the timer (fake timers).
- **BottomNav:** renders below `md` (mocked matchMedia), links navigate, active route highlighted.
- **InsertToolbar:** a button calls `CodeEditor.insertText` with the right token; hidden when not touch.
- **QuestScreen layout branch:** tabs render below `md`, columns at/above; switching tabs shows the right pane; code state survives a simulated resize.
- **HoldToConfirm:** `onTouchCancel` aborts the pending confirm.
- **Content integrity:** `src/content/quests/content.test.ts` stays green; all new `{ en, vi }` strings are complete.
- **Commands:** `npm run test:run` and `npm run build` (typecheck) must pass. Manual verification pass at phone (375px), iPad portrait (768px), and desktop widths, plus a touch device-emulation check of the insert toolbar and Buddy.

## 8. Build Sequence (high level; detailed in the implementation plan)

1. Foundations: `useMediaQuery` + matchMedia test mock; `ui.ts` strings; `settingsStore.guideOn` + migration.
2. Home nav: `HudBar` Home control + `PlayersScreen` back.
3. Responsive shell: `HudBar` responsive + `BottomNav` + layout padding.
4. QuestScreen refactor: extract panes; `QuestColumns` / `QuestTabs` + branch.
5. Touch typing: `CodeEditor` `insertText` + `InsertToolbar`.
6. Guide Buddy: store, content, `useIdle`, `GuideBuddy`, `useQuestGuide`; mount; Settings toggle.
7. Polish + touch fixes: `HoldToConfirm`, `VictoryOverlay`, `TitleScreen`, tap targets, `index.html`, safe-area.
8. Full test + build + manual responsive verification.

## 9. Resolved Defaults (open items closed during brainstorming)

- Buddy = 🦉 "Pip", emoji only, name swappable in one place.
- Mute toggle in Settings, default on.
- Buddy-revealed hints set `usedHint` (consistent with inline hints).
