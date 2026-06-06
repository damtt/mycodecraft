# Home Nav · Guide Buddy · Responsive Support — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Home control back to the title screen, a gentle-proactive "Guide Buddy" mascot on all game screens, and first-class phone/iPad/tablet responsive support.

**Architecture:** A `useMediaQuery` hook drives a single JS layout branch on `QuestScreen` (columns ≥768px / tabs <768px); everything else uses Tailwind CSS breakpoints. The Guide Buddy is an isolated `src/features/guide/` feature: a non-persisted Zustand store + bilingual content map + a `fixed` mascot mounted once in the `RequireProfile` router layout. Code typing on touch is helped by an `InsertToolbar` that drives an imperative `insertText` on the CodeMirror editor.

**Tech Stack:** React 19, TypeScript (strict), React Router 7, Zustand 5, Tailwind v4, CodeMirror 6, Vitest + jsdom + React Testing Library.

---

## Conventions (read once, applies to every task)

- **Bilingual:** every user-facing string is `{ en, vi }` (`Localized`). UI strings go in `src/content/i18n/ui.ts` and are read with `t('key')`; data strings are read with `tl(localized)`. Both come from `useT()`.
- **Styling:** reuse `PixelButton`, `Panel`, and the CSS helpers `.pixel-border`, `.cc-bevel`, `.bg-world`; fonts `font-pixel` (headings) / `font-body`; theme colors `grass`/`grass-dark`/`dirt`/`stone`/`night`/`gold`/`paper`/`diamond`/`sky`. Z-index convention: modal `z-50` (VictoryOverlay), Buddy `z-40`, BottomNav `z-30`.
- **Tests:** mock sounds with `vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }))`. Render routed screens with `createMemoryRouter(routes, { initialEntries: [path] })`. Reset stores in `beforeEach` via `useProfiles.setState(...)` / `useSettings.setState(...)` / `useGuide.setState(...)`.
- **Breakpoint divider:** phone is `< 768px`; tablet/desktop is `≥ 768px` (Tailwind `md`). The insert toolbar is gated on `(pointer: coarse)`, independent of width.
- **Commit cadence:** one commit per task (or per red/green cycle). Conventional prefixes (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`).
- **After every task:** run `npm run test:run` and `npm run typecheck`. The plan calls these out explicitly at key points; run them anyway if unsure.

---

## Task 1: `useMediaQuery` hook + test `matchMedia` mock

**Files:**
- Modify: `src/test/setup.ts`
- Create: `src/lib/useMediaQuery.ts`
- Test: `src/lib/useMediaQuery.test.ts`

- [ ] **Step 1: Add a `matchMedia` mock to the test setup.** jsdom has no `matchMedia`; without it every component using the hook throws. Default it to **desktop, non-touch** so existing `QuestScreen` tests keep rendering the columns layout. Insert this block in `src/test/setup.ts` immediately before the final `afterEach(...)`:

```ts
// jsdom has no matchMedia. Default to "desktop, non-touch":
//   (min-width: ...) -> true  => QuestScreen renders the columns layout
//   (pointer: coarse) -> false => InsertToolbar hidden, BottomNav absent
// Tests that need a phone/touch viewport override window.matchMedia themselves.
if (!window.matchMedia) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (query: string) => ({
    matches: /min-width/.test(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
```

- [ ] **Step 2: Write the failing test** at `src/lib/useMediaQuery.test.ts`:

```ts
import { renderHook } from '@testing-library/react';
import { useMediaQuery, useIsTouch } from './useMediaQuery';

function mockMatch(matches: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (query: string) => ({
    matches, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  });
}

describe('useMediaQuery', () => {
  test('returns true when the query matches', () => {
    mockMatch(true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  test('returns false when the query does not match', () => {
    mockMatch(false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  test('useIsTouch reflects pointer:coarse', () => {
    mockMatch(true);
    const { result } = renderHook(() => useIsTouch());
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 3: Run it, expect FAIL** (module not found):

Run: `npm run test:run -- src/lib/useMediaQuery.test.ts`
Expected: FAIL — `Failed to resolve import "./useMediaQuery"`.

- [ ] **Step 4: Implement** `src/lib/useMediaQuery.ts`:

```ts
import { useEffect, useState } from 'react';

/** Reactive `window.matchMedia` boolean. SSR/jsdom-safe. */
export function useMediaQuery(query: string): boolean {
  const get = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(get);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, [query]);

  return matches;
}

/** True on touch-primary devices (phones/tablets). Gates the code insert toolbar. */
export function useIsTouch(): boolean {
  return useMediaQuery('(pointer: coarse)');
}
```

- [ ] **Step 5: Run tests, expect PASS:**

Run: `npm run test:run -- src/lib/useMediaQuery.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Confirm nothing else broke + commit:**

```bash
npm run test:run
git add src/lib/useMediaQuery.ts src/lib/useMediaQuery.test.ts src/test/setup.ts
git commit -m "feat: add useMediaQuery/useIsTouch hook and matchMedia test mock"
```

---

## Task 2: Add all new bilingual UI strings

**Files:**
- Modify: `src/content/i18n/ui.ts`

All strings used by later tasks are added here in one place. They are type-checked by `satisfies Record<string, Localized>`.

- [ ] **Step 1: Add these keys** inside the `UI = { ... }` object in `src/content/i18n/ui.ts` (before the closing `} satisfies`):

```ts
  // Navigation
  home: { en: 'Home', vi: 'Trang chủ' },
  backToTitle: { en: 'Back to title', vi: 'Về màn hình chính' },
  // Quest tabs (phone)
  tabLesson: { en: 'Lesson', vi: 'Bài học' },
  tabCode: { en: 'Code', vi: 'Code' },
  tabRun: { en: 'Run', vi: 'Chạy' },
  // Guide Buddy
  guideBuddy: { en: 'Guide buddy', vi: 'Bạn dẫn đường' },
  guideBuddyOn: { en: 'Guide buddy', vi: 'Bạn dẫn đường' },
  buddyHint: { en: 'Get a hint', vi: 'Xem gợi ý' },
  buddyScreenHelp: { en: "What's this screen?", vi: 'Màn hình này là gì?' },
  buddyRecap: { en: 'Remind me', vi: 'Nhắc lại' },
  buddyDismiss: { en: 'Got it', vi: 'Hiểu rồi' },
  // Insert toolbar
  insertToolbar: { en: 'Insert symbol', vi: 'Chèn ký hiệu' },
```

- [ ] **Step 2: Typecheck + commit:**

```bash
npm run typecheck
git add src/content/i18n/ui.ts
git commit -m "feat(i18n): add strings for home nav, quest tabs, guide buddy, insert toolbar"
```

---

## Task 3: `guideOn` setting + migration

**Files:**
- Modify: `src/stores/settingsStore.ts`
- Test: `src/stores/settingsStore.test.ts` (append a describe block)

- [ ] **Step 1: Write the failing test.** Append to `src/stores/settingsStore.test.ts`:

```ts
import { migrateSettings } from './settingsStore';

describe('guideOn setting', () => {
  test('defaults to true', () => {
    // Re-read default from a fresh selector call
    expect(useSettings.getState().guideOn).toBe(true);
  });

  test('toggleGuide flips it', () => {
    useSettings.setState({ guideOn: true });
    useSettings.getState().toggleGuide();
    expect(useSettings.getState().guideOn).toBe(false);
  });

  test('migrate adds guideOn:true to v1 payloads without it', () => {
    const migrated = migrateSettings({ lang: 'vi', soundOn: false, fontScale: 'lg' }, 1);
    expect(migrated.guideOn).toBe(true);
    expect(migrated.lang).toBe('vi');
  });

  test('migrate preserves an existing guideOn', () => {
    const migrated = migrateSettings({ guideOn: false }, 1);
    expect(migrated.guideOn).toBe(false);
  });
});
```

> `settingsStore.test.ts` already imports `useSettings`. The `import { migrateSettings } ...` line above is the only new import.

- [ ] **Step 2: Run it, expect FAIL:**

Run: `npm run test:run -- src/stores/settingsStore.test.ts`
Expected: FAIL — `migrateSettings` is not exported / `guideOn` is undefined.

- [ ] **Step 3: Implement.** Replace the contents of `src/stores/settingsStore.ts` with:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang } from '../lib/types';

export type FontScale = 'sm' | 'md' | 'lg';

interface SettingsState {
  lang: Lang;
  soundOn: boolean;
  fontScale: FontScale;
  guideOn: boolean;
  setLang(lang: Lang): void;
  toggleSound(): void;
  setFontScale(scale: FontScale): void;
  toggleGuide(): void;
}

/** Exported for unit testing the persist migration. */
export function migrateSettings(persisted: unknown, _version: number): SettingsState {
  const s = (persisted ?? {}) as Partial<SettingsState>;
  return { ...s, guideOn: s.guideOn ?? true } as SettingsState;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lang: 'en',
      soundOn: true,
      fontScale: 'md',
      guideOn: true,
      setLang: (lang) => set({ lang }),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      setFontScale: (fontScale) => set({ fontScale }),
      toggleGuide: () => set((s) => ({ guideOn: !s.guideOn })),
    }),
    { name: 'codecraft:settings', version: 2, migrate: migrateSettings },
  ),
);
```

- [ ] **Step 3b: Fix the EXISTING `toggleSound` test for the new persisted shape.** Adding `guideOn` and bumping to `version: 2` breaks the exact assertions in the existing first test. Make two edits in `src/stores/settingsStore.test.ts`:

  1. Update the `describe('settingsStore')` `beforeEach` (line 4) to seed `guideOn` so the test is order-independent:

```ts
  beforeEach(() => useSettings.setState({ lang: 'en', soundOn: true, fontScale: 'md', guideOn: true }));
```

  2. In the `'toggleSound flips and persists only data'` test, update the two assertions:

```ts
    expect(raw.state).toEqual({ lang: 'en', soundOn: false, fontScale: 'md', guideOn: true });
    expect(raw.version).toBe(2);
```

(from `toEqual({ lang: 'en', soundOn: false, fontScale: 'md' })` and `toBe(1)`.)

- [ ] **Step 4: Run tests, expect PASS:**

Run: `npm run test:run -- src/stores/settingsStore.test.ts`
Expected: PASS (existing 3 tests updated + 4 new = 7).

- [ ] **Step 5: Full suite + commit:**

```bash
npm run test:run
git add src/stores/settingsStore.ts src/stores/settingsStore.test.ts
git commit -m "feat(settings): add persisted guideOn toggle with v2 migration"
```

---

## Task 4: Home control in HudBar + back-to-title on PlayersScreen

**Files:**
- Modify: `src/components/HudBar.tsx`
- Modify: `src/screens/PlayersScreen.tsx`
- Test: `src/components/HudBar.test.tsx` (create)

- [ ] **Step 1: Write the failing test** at `src/components/HudBar.test.tsx`:

```ts
import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';

vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

import { routes } from '../app/router';
import { useProfiles } from '../stores/profileStore';
import { useSettings } from '../stores/settingsStore';

beforeEach(() => {
  localStorage.clear();
  useProfiles.setState({ profiles: [], activeId: null });
  useSettings.setState({ lang: 'en' });
});

function renderGame(path: string) {
  useProfiles.getState().create('Mai', '🦊');
  useProfiles.getState().select(useProfiles.getState().profiles[0].id);
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('HudBar home control', () => {
  test('Home navigates to the title screen and keeps the active player', async () => {
    const router = renderGame('/map');
    fireEvent.click(await screen.findByRole('link', { name: /home/i }));
    expect(router.state.location.pathname).toBe('/');
    expect(useProfiles.getState().activeId).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run it, expect FAIL** (no link named "home"):

Run: `npm run test:run -- src/components/HudBar.test.tsx`
Expected: FAIL — unable to find a link with name /home/i.

- [ ] **Step 3: Implement HudBar.** Replace `src/components/HudBar.tsx` with (adds a Home link + responsive nav; nav labels collapse on phone where the BottomNav takes over):

```tsx
import { Link } from 'react-router';
import { useActiveProfile } from '../stores/profileStore';
import { useSettings } from '../stores/settingsStore';
import { useT } from '../lib/i18n';
import { streakDisplay, todayString } from '../features/progress/streak';
import { playSound } from '../features/audio/sounds';
import XpBar from './XpBar';

export default function HudBar() {
  const profile = useActiveProfile();
  const { lang, t } = useT();
  const { soundOn, toggleSound, setLang } = useSettings();
  if (!profile) return null;

  const streak = streakDisplay(profile.streak, todayString());

  return (
    <header className="flex items-center gap-3 border-b-4 border-grass-dark bg-night px-3 py-2 text-white sm:gap-4 sm:px-4">
      <Link
        to="/"
        aria-label={t('home')}
        title={t('home')}
        onClick={() => playSound('click')}
        className="font-pixel text-base leading-none"
      >
        🏠
      </Link>
      <Link to="/players" className="text-2xl" title={profile.name}>{profile.avatar}</Link>
      <span className="hidden font-pixel text-xs text-white drop-shadow-[1px_1px_0_#000] sm:inline">{profile.name}</span>
      <XpBar xp={profile.xp} />
      <span className="font-body font-bold" data-testid="streak">🔥{streak}</span>
      {/* Decorative hearts — hidden on phone to save the row (spec §Gamification) */}
      <span aria-hidden className="hidden text-sm tracking-tighter sm:inline">❤️❤️❤️</span>
      <nav className="ml-auto flex items-center gap-3 font-body font-bold">
        {/* Screen-nav links live in BottomNav on phones; shown here from md up. */}
        <Link to="/map" onClick={() => playSound('click')} className="hidden md:inline">🗺️ {t('worldMap')}</Link>
        <Link to="/inventory" onClick={() => playSound('click')} className="hidden md:inline">🧰 {t('inventory')}</Link>
        <Link to="/settings" onClick={() => playSound('click')} className="hidden md:inline">⚙️ {t('settings')}</Link>
        <button onClick={() => { playSound('click'); toggleSound(); }} title={t('sound')} className="cursor-pointer p-1 text-lg">
          {soundOn ? '🔊' : '🔇'}
        </button>
        <button
          onClick={() => { playSound('click'); setLang(lang === 'en' ? 'vi' : 'en'); }}
          className="cursor-pointer p-1 font-pixel text-xs uppercase"
          data-testid="lang-toggle"
        >
          {lang}
        </button>
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Run the HudBar test, expect PASS:**

Run: `npm run test:run -- src/components/HudBar.test.tsx`
Expected: PASS.

- [ ] **Step 5: Add back-to-title to PlayersScreen.** In `src/screens/PlayersScreen.tsx`, add the import and a back link. Change the imports line for react-router to include `Link`:

```tsx
import { useNavigate, Link } from 'react-router';
```

Then change the root wrapper opening so it can host an absolutely-positioned back link, and add the link as the first child inside the root `<div data-testid="players-screen" ...>`:

```tsx
    <div data-testid="players-screen" className="bg-world relative flex min-h-screen flex-col items-center gap-8 pt-16">
      <Link
        to="/"
        aria-label={t('backToTitle')}
        title={t('backToTitle')}
        className="absolute left-4 top-4 cursor-pointer font-pixel text-sm text-white drop-shadow"
      >
        ← {t('home')}
      </Link>
```

(The root already had `relative` — confirm it is present; the snippet above includes it.)

- [ ] **Step 6: Add a PlayersScreen back test.** `src/screens/PlayersScreen.test.tsx` already has a `renderAt(path = '/players')` helper that returns the router, and already imports `screen`, `fireEvent`, `createMemoryRouter`, `RouterProvider`, and `routes`. Append this test inside `describe('PlayersScreen', ...)` — no new imports needed:

```ts
test('back link returns to the title screen', async () => {
  const router = renderAt('/players');
  fireEvent.click(await screen.findByRole('link', { name: /back to title/i }));
  expect(router.state.location.pathname).toBe('/');
});
```

> PlayersScreen is outside the `RequireProfile` layout, so no Guide Buddy/BottomNav render here — the `link` query is unambiguous.

- [ ] **Step 7: Full suite + commit:**

```bash
npm run test:run
git add src/components/HudBar.tsx src/components/HudBar.test.tsx src/screens/PlayersScreen.tsx src/screens/PlayersScreen.test.tsx
git commit -m "feat(nav): add Home control to HudBar and back-to-title on PlayersScreen"
```

---

## Task 5: BottomNav (phone navigation bar)

**Files:**
- Create: `src/components/BottomNav.tsx`
- Test: `src/components/BottomNav.test.tsx`
- Modify: `src/app/router.tsx`

- [ ] **Step 1: Write the failing test** at `src/components/BottomNav.test.tsx`:

```ts
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';

vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

import BottomNav from './BottomNav';

function mockWidth(isWide: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (query: string) => ({
    matches: /min-width/.test(query) ? isWide : false,
    media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  });
}

function renderNavAt(path: string) {
  const router = createMemoryRouter([{ path: '*', element: <BottomNav /> }], { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('BottomNav', () => {
  test('on phone, shows Home/Map/Inventory/Settings links', () => {
    mockWidth(false);
    renderNavAt('/map');
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /world map/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /chest/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  test('renders nothing on desktop widths', () => {
    mockWidth(true);
    const { container } = render(
      <RouterProvider router={createMemoryRouter([{ path: '*', element: <BottomNav /> }], { initialEntries: ['/map'] })} />,
    );
    expect(container.querySelector('nav')).toBeNull();
  });
});
```

- [ ] **Step 2: Run it, expect FAIL** (module not found):

Run: `npm run test:run -- src/components/BottomNav.test.tsx`
Expected: FAIL — cannot resolve `./BottomNav`.

- [ ] **Step 3: Implement** `src/components/BottomNav.tsx`:

```tsx
import { Link, useLocation } from 'react-router';
import { useT } from '../lib/i18n';
import { useMediaQuery } from '../lib/useMediaQuery';
import { playSound } from '../features/audio/sounds';

const ITEMS = [
  { to: '/', icon: '🏠', key: 'home' as const },
  { to: '/map', icon: '🗺️', key: 'worldMap' as const },
  { to: '/inventory', icon: '🧰', key: 'inventory' as const },
  { to: '/settings', icon: '⚙️', key: 'settings' as const },
];

/** Phone-only bottom navigation. Hidden (unmounted) at >=768px where HudBar carries nav. */
export default function BottomNav() {
  const isWide = useMediaQuery('(min-width: 768px)');
  const { pathname } = useLocation();
  const { t } = useT();
  if (isWide) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t-4 border-grass-dark bg-night text-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {ITEMS.map((item) => {
        const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-label={t(item.key)}
            onClick={() => playSound('click')}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-2 font-body text-[10px] font-bold ${active ? 'text-gold' : 'text-white'}`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Run the BottomNav test, expect PASS:**

Run: `npm run test:run -- src/components/BottomNav.test.tsx`
Expected: PASS.

- [ ] **Step 5: Mount it in the layout + pad main.** In `src/app/router.tsx`, import BottomNav and render it inside `RequireProfile`, and add bottom padding to `<main>` so phone content clears the bar:

```tsx
import BottomNav from '../components/BottomNav';
```

Replace the `RequireProfile` return block:

```tsx
  return (
    <div className="flex min-h-screen flex-col">
      <HudBar />
      <main className="flex-1 pb-16 md:pb-0"><Outlet /></main>
      <BottomNav />
    </div>
  );
```

- [ ] **Step 6: Full suite + commit** (confirms BottomNav returns null on desktop so existing game-screen tests are unaffected):

```bash
npm run test:run
git add src/components/BottomNav.tsx src/components/BottomNav.test.tsx src/app/router.tsx
git commit -m "feat(nav): add phone-only BottomNav and mount in game layout"
```

---

## Task 6: Guide store, content, and idle hook

**Files:**
- Create: `src/features/guide/guideStore.ts`
- Create: `src/features/guide/guideContent.ts`
- Create: `src/features/guide/useIdle.ts`
- Test: `src/features/guide/guideStore.test.ts`
- Test: `src/features/guide/useIdle.test.ts`

- [ ] **Step 1: Write the failing store test** at `src/features/guide/guideStore.test.ts`:

```ts
import { useGuide } from './guideStore';

beforeEach(() => {
  useGuide.setState({ bubble: null, greeted: new Set(), questCtx: null, editorFocused: false });
});

describe('guideStore', () => {
  test('say sets the bubble; dismiss clears it', () => {
    useGuide.getState().say({ en: 'hi', vi: 'chào' });
    expect(useGuide.getState().bubble).toEqual({ en: 'hi', vi: 'chào' });
    useGuide.getState().dismiss();
    expect(useGuide.getState().bubble).toBeNull();
  });

  test('greeted tracking is per key', () => {
    expect(useGuide.getState().hasGreeted('map')).toBe(false);
    useGuide.getState().markGreeted('map');
    expect(useGuide.getState().hasGreeted('map')).toBe(true);
    expect(useGuide.getState().hasGreeted('quest')).toBe(false);
  });

  test('editorFocused flag toggles', () => {
    useGuide.getState().setEditorFocused(true);
    expect(useGuide.getState().editorFocused).toBe(true);
  });
});
```

- [ ] **Step 2: Run it, expect FAIL** (module not found).

Run: `npm run test:run -- src/features/guide/guideStore.test.ts`
Expected: FAIL — cannot resolve `./guideStore`.

- [ ] **Step 3: Implement** `src/features/guide/guideStore.ts`:

```ts
import { create } from 'zustand';
import type { Localized, Step } from '../../lib/types';

export type ScreenKey = 'map' | 'quest' | 'inventory' | 'settings';

/** Published by QuestScreen so the Buddy can reveal step hints / recap the story. */
export interface QuestGuideContext {
  story: Localized;
  steps: Step[];
  openHints: Set<number>;
  revealHint: (stepIndex: number) => void; // same path as the inline 💡 button → sets usedHint
}

interface GuideState {
  bubble: Localized | null;
  greeted: Set<ScreenKey>;
  questCtx: QuestGuideContext | null;
  editorFocused: boolean;
  say: (text: Localized) => void;
  dismiss: () => void;
  hasGreeted: (s: ScreenKey) => boolean;
  markGreeted: (s: ScreenKey) => void;
  setQuestCtx: (ctx: QuestGuideContext | null) => void;
  setEditorFocused: (v: boolean) => void;
}

export const useGuide = create<GuideState>()((set, get) => ({
  bubble: null,
  greeted: new Set(),
  questCtx: null,
  editorFocused: false,
  say: (text) => set({ bubble: text }),
  dismiss: () => set({ bubble: null }),
  hasGreeted: (s) => get().greeted.has(s),
  markGreeted: (s) => set((st) => ({ greeted: new Set(st.greeted).add(s) })),
  setQuestCtx: (questCtx) => set({ questCtx }),
  setEditorFocused: (editorFocused) => set({ editorFocused }),
}));
```

- [ ] **Step 4: Run store test, expect PASS.**

Run: `npm run test:run -- src/features/guide/guideStore.test.ts`
Expected: PASS.

- [ ] **Step 5: Implement** `src/features/guide/guideContent.ts` (full bilingual copy, no schema changes to quests):

```ts
import type { Localized } from '../../lib/types';
import type { ScreenKey } from './guideStore';

type ByScreen = Record<ScreenKey, Localized>;

export const GUIDE: {
  greeting: ByScreen;
  screenHelp: ByScreen;
  idle: ByScreen;
  failedCheck: Localized;
  stuck: Localized;
  allHintsSeen: Localized;
} = {
  greeting: {
    map: { en: 'Pick a quest to start crafting! ⛏️', vi: 'Chọn một nhiệm vụ để bắt đầu chế tạo nhé! ⛏️' },
    quest: { en: 'Read the steps, write your code, then tap Check ✔', vi: 'Đọc các bước, viết code, rồi bấm Kiểm tra ✔' },
    inventory: { en: "Here are the badges you've earned. Awesome haul!", vi: 'Đây là các huy hiệu bạn đã kiếm được. Tuyệt quá!' },
    settings: { en: 'Change sound, language, and text size here.', vi: 'Đổi âm thanh, ngôn ngữ và cỡ chữ ở đây.' },
  },
  screenHelp: {
    map: { en: 'Tap a glowing quest to play it. Locked ones open as you level up!', vi: 'Bấm vào nhiệm vụ đang sáng để chơi. Nhiệm vụ bị khóa sẽ mở khi bạn lên cấp!' },
    quest: { en: 'Type code in the editor, watch it appear in Preview, then tap Check my code.', vi: 'Gõ code vào trình soạn thảo, xem nó hiện ra ở phần Xem trước, rồi bấm Kiểm tra code.' },
    inventory: { en: 'Every quest drops a badge. Try to collect them all!', vi: 'Mỗi nhiệm vụ tặng một huy hiệu. Hãy sưu tập hết nhé!' },
    settings: { en: 'Make the game feel just right for you here.', vi: 'Chỉnh cho trò chơi hợp với bạn nhất ở đây.' },
  },
  idle: {
    map: { en: 'Need a quest? The glowing one is next! ⛏️', vi: 'Cần một nhiệm vụ? Cái đang sáng là tiếp theo đó! ⛏️' },
    quest: { en: 'Stuck? Tap me for a hint anytime. 💡', vi: 'Bí à? Bấm vào mình để xem gợi ý bất cứ lúc nào nhé. 💡' },
    inventory: { en: 'Play more quests to fill your chest!', vi: 'Chơi thêm nhiệm vụ để lấp đầy rương nào!' },
    settings: { en: 'All set? Tap World Map to keep crafting.', vi: 'Xong chưa? Bấm Bản đồ để chế tạo tiếp nhé.' },
  },
  failedCheck: { en: 'So close! Check the steps again — tap me if you want a hint. 💡', vi: 'Sắp đúng rồi! Xem lại các bước nhé — bấm vào mình nếu cần gợi ý. 💡' },
  stuck: { en: 'Whoa, your code got stuck in a loop! Tap ↻ to reset and try again.', vi: 'Ối, code của bạn bị kẹt trong vòng lặp! Bấm ↻ để đặt lại và thử lại nhé.' },
  allHintsSeen: { en: "You've seen all the hints for this quest — you've got this! 💪", vi: 'Bạn đã xem hết gợi ý của nhiệm vụ này rồi — cố lên nhé! 💪' },
};
```

- [ ] **Step 6: Write the failing idle test** at `src/features/guide/useIdle.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useIdle } from './useIdle';

describe('useIdle', () => {
  test('fires after the idle period elapses', () => {
    vi.useFakeTimers();
    const onIdle = vi.fn();
    renderHook(() => useIdle(1000, onIdle));
    expect(onIdle).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(1000));
    expect(onIdle).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  test('activity resets the timer', () => {
    vi.useFakeTimers();
    const onIdle = vi.fn();
    renderHook(() => useIdle(1000, onIdle));
    act(() => void vi.advanceTimersByTime(700));
    act(() => void window.dispatchEvent(new Event('pointerdown')));
    act(() => void vi.advanceTimersByTime(700));
    expect(onIdle).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(300));
    expect(onIdle).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
```

- [ ] **Step 7: Run it, expect FAIL** (module not found).

Run: `npm run test:run -- src/features/guide/useIdle.test.ts`
Expected: FAIL — cannot resolve `./useIdle`.

- [ ] **Step 8: Implement** `src/features/guide/useIdle.ts`:

```ts
import { useEffect, useRef } from 'react';

const ACTIVITY = ['pointerdown', 'keydown', 'touchstart'] as const;

/** Calls `onIdle` after `ms` of no user activity; rearms on each activity event. */
export function useIdle(ms: number, onIdle: () => void): void {
  const cb = useRef(onIdle);
  cb.current = onIdle;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => cb.current(), ms);
    };
    ACTIVITY.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      ACTIVITY.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [ms]);
}
```

- [ ] **Step 9: Run idle test, expect PASS; then full suite + commit:**

```bash
npm run test:run -- src/features/guide/useIdle.test.ts
npm run test:run
git add src/features/guide/guideStore.ts src/features/guide/guideStore.test.ts src/features/guide/guideContent.ts src/features/guide/useIdle.ts src/features/guide/useIdle.test.ts
git commit -m "feat(guide): add guide store, bilingual content map, and idle hook"
```

---

## Task 7: GuideBuddy component, mount, and Settings toggle

**Files:**
- Create: `src/features/guide/GuideBuddy.tsx`
- Test: `src/features/guide/GuideBuddy.test.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/screens/SettingsScreen.tsx`

> **DOM-safety requirements (so already-mounted game-screen tests stay green):** the proactive bubble is **text-only** (no buttons); action buttons appear only after the user taps the mascot; the bubble container is an `aria-live` region with `role="status"` — **never** `role="dialog"`; the mascot is a `<button>` labeled `t('guideBuddy')`.

- [ ] **Step 1: Write the failing test** at `src/features/guide/GuideBuddy.test.tsx`:

```ts
import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';

vi.mock('../audio/sounds', () => ({ playSound: vi.fn() }));

import GuideBuddy from './GuideBuddy';
import { useGuide } from './guideStore';
import { useSettings } from '../../stores/settingsStore';

beforeEach(() => {
  useGuide.setState({ bubble: null, greeted: new Set(), questCtx: null, editorFocused: false });
  useSettings.setState({ guideOn: true, lang: 'en' });
});

function renderBuddyAt(path: string) {
  const router = createMemoryRouter([{ path: '*', element: <GuideBuddy /> }], { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('GuideBuddy', () => {
  test('greets once on a screen with a text-only bubble (no buttons in the bubble)', async () => {
    renderBuddyAt('/map');
    expect(await screen.findByText(/pick a quest to start crafting/i)).toBeInTheDocument();
  });

  test('tapping the mascot reveals action buttons', async () => {
    renderBuddyAt('/map');
    fireEvent.click(await screen.findByRole('button', { name: /guide buddy/i }));
    expect(screen.getByRole('button', { name: /what's this screen/i })).toBeInTheDocument();
  });

  test('screen-help action shows the screen explanation', async () => {
    renderBuddyAt('/map');
    fireEvent.click(await screen.findByRole('button', { name: /guide buddy/i }));
    fireEvent.click(screen.getByRole('button', { name: /what's this screen/i }));
    expect(await screen.findByText(/tap a glowing quest/i)).toBeInTheDocument();
  });

  test('is not rendered when guideOn is false', () => {
    useSettings.setState({ guideOn: false });
    const { container } = render(
      <RouterProvider router={createMemoryRouter([{ path: '*', element: <GuideBuddy /> }], { initialEntries: ['/map'] })} />,
    );
    expect(container.textContent).toBe('');
  });
});
```

- [ ] **Step 2: Run it, expect FAIL** (module not found).

Run: `npm run test:run -- src/features/guide/GuideBuddy.test.tsx`
Expected: FAIL — cannot resolve `./GuideBuddy`.

- [ ] **Step 3: Implement** `src/features/guide/GuideBuddy.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useSettings } from '../../stores/settingsStore';
import { useT } from '../../lib/i18n';
import { playSound } from '../audio/sounds';
import { useGuide, type ScreenKey } from './guideStore';
import { GUIDE } from './guideContent';
import { useIdle } from './useIdle';

const BUDDY_EMOJI = '🦉';
const IDLE_MS = 20_000;

function screenKeyFor(pathname: string): ScreenKey | null {
  if (pathname.startsWith('/quest')) return 'quest';
  if (pathname.startsWith('/map')) return 'map';
  if (pathname.startsWith('/inventory')) return 'inventory';
  if (pathname.startsWith('/settings')) return 'settings';
  return null;
}

export default function GuideBuddy() {
  const { pathname } = useLocation();
  const screen = screenKeyFor(pathname);
  const guideOn = useSettings((s) => s.guideOn);
  const { t, tl } = useT();
  const { bubble, questCtx, editorFocused, say, dismiss, hasGreeted, markGreeted } = useGuide();
  const [open, setOpen] = useState(false);

  // Greet once per screen.
  useEffect(() => {
    if (!guideOn || !screen) return;
    if (!hasGreeted(screen)) {
      markGreeted(screen);
      say(GUIDE.greeting[screen]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- greet on screen change only
  }, [screen, guideOn]);

  // Gentle idle nudge.
  useIdle(IDLE_MS, () => {
    if (guideOn && screen && !useGuide.getState().bubble) say(GUIDE.idle[screen]);
  });

  if (!guideOn || !screen) return null;
  if (editorFocused) return null; // get out of the way while the soft keyboard is up

  const revealHint = () => {
    setOpen(false);
    const ctx = questCtx;
    if (!ctx) return;
    const i = ctx.steps.findIndex((s, idx) => s.hint && !ctx.openHints.has(idx));
    if (i >= 0) {
      ctx.revealHint(i);
      const hint = ctx.steps[i].hint;
      if (hint) say(hint);
    } else {
      say(GUIDE.allHintsSeen);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 md:bottom-4">
      {bubble && (
        <div role="status" aria-live="polite" className="max-w-[16rem] rounded-xl border-2 border-night bg-paper p-3 font-body text-sm font-bold text-night shadow-[3px_3px_0_#0003]">
          {tl(bubble)}
          <button onClick={() => { playSound('click'); dismiss(); }} className="ml-2 cursor-pointer text-stone underline">{t('buddyDismiss')}</button>
        </div>
      )}
      {open && (
        <div className="flex flex-col items-stretch gap-1 rounded-xl border-2 border-night bg-paper p-2 shadow-[3px_3px_0_#0003]">
          {questCtx && (
            <button onClick={() => { playSound('click'); revealHint(); }} className="cursor-pointer rounded bg-gold/40 px-3 py-1.5 text-left font-body text-sm font-bold">💡 {t('buddyHint')}</button>
          )}
          <button onClick={() => { playSound('click'); setOpen(false); say(GUIDE.screenHelp[screen]); }} className="cursor-pointer rounded px-3 py-1.5 text-left font-body text-sm font-bold hover:bg-stone/10">❓ {t('buddyScreenHelp')}</button>
          {questCtx && (
            <button onClick={() => { playSound('click'); setOpen(false); say(questCtx.story); }} className="cursor-pointer rounded px-3 py-1.5 text-left font-body text-sm font-bold hover:bg-stone/10">📖 {t('buddyRecap')}</button>
          )}
        </div>
      )}
      <button
        aria-label={t('guideBuddy')}
        onClick={() => { playSound('click'); setOpen((o) => !o); }}
        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-4 border-night bg-paper text-3xl shadow-[3px_3px_0_#0004] active:translate-y-0.5"
      >
        {BUDDY_EMOJI}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run the Buddy test, expect PASS.**

Run: `npm run test:run -- src/features/guide/GuideBuddy.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Mount the Buddy in the layout.** In `src/app/router.tsx`, import and render it inside `RequireProfile` (after `<main>`, alongside `BottomNav`):

```tsx
import GuideBuddy from '../features/guide/GuideBuddy';
```

```tsx
  return (
    <div className="flex min-h-screen flex-col">
      <HudBar />
      <main className="flex-1 pb-16 md:pb-0"><Outlet /></main>
      <GuideBuddy />
      <BottomNav />
    </div>
  );
```

- [ ] **Step 6: Add the Settings mute toggle.** In `src/screens/SettingsScreen.tsx`, pull `guideOn`/`toggleGuide` from the store and add a checkbox row. Change the destructure on the `useSettings()` line:

```tsx
  const { lang, soundOn, fontScale, guideOn, setLang, toggleSound, setFontScale, toggleGuide } = useSettings();
```

Then add this row immediately after the sound `<label>...</label>` block (before the reset `<div>`):

```tsx
        <label className="flex cursor-pointer items-center gap-2 font-body font-black">
          <input
            type="checkbox"
            checked={guideOn}
            onChange={() => { playSound('click'); toggleGuide(); }}
          />
          🦉 {t('guideBuddy')}: {guideOn ? t('on') : t('off')}
        </label>
```

- [ ] **Step 7: Add a Settings toggle test.** Append to `src/screens/SettingsScreen.test.tsx` inside the `describe('SettingsScreen', ...)`:

```ts
test('guide buddy toggle flips the setting', async () => {
  renderSettings();
  fireEvent.click(await screen.findByRole('checkbox', { name: /guide buddy/i }));
  expect(useSettings.getState().guideOn).toBe(false);
});
```

> The `renderSettings()` helper sets `useSettings.setState({ lang: 'en', soundOn: true, fontScale: 'md' })` — this is a partial set, so `guideOn` keeps its default `true`. Good. (If a stricter test isolation is wanted, add `guideOn: true` to that setState.)

- [ ] **Step 8: Full suite + commit.** This is the integration checkpoint: the Buddy now renders on every game-screen test. Verify the whole suite is green (especially `QuestScreen.test.tsx`, `SettingsScreen.test.tsx`, `MapScreen.test.tsx`, `InventoryScreen.test.tsx`).

```bash
npm run test:run
git add src/features/guide/GuideBuddy.tsx src/features/guide/GuideBuddy.test.tsx src/app/router.tsx src/screens/SettingsScreen.tsx src/screens/SettingsScreen.test.tsx
git commit -m "feat(guide): add GuideBuddy mascot, mount in layout, add Settings mute toggle"
```

> **If a game-screen test breaks here:** the cause is almost certainly the greeting bubble adding text/role. Confirm the bubble is `role="status"` (not `dialog`) and text-only. If a test asserted an exact element count, scope its query (e.g., `within(...)`).

---

## Task 8: CodeEditor `insertText` + focus reporting + InsertToolbar

**Files:**
- Modify: `src/features/editor/CodeEditor.tsx`
- Create: `src/features/editor/InsertToolbar.tsx`
- Test: `src/features/editor/InsertToolbar.test.tsx`

- [ ] **Step 1: Convert CodeEditor to expose an imperative handle.** Replace `src/features/editor/CodeEditor.tsx` with:

```tsx
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { autocompletion } from '@codemirror/autocomplete';
import { codecraftEditorTheme } from './theme';

export interface CodeEditorHandle {
  insertText(text: string): void;
}

interface CodeEditorProps {
  /** Initial document. Parent must remount (key=quest.id) to change it. */
  initialValue: string;
  onChange(value: string): void;
  /** Fires true on focus, false on blur — drives the Guide Buddy auto-hide. */
  onFocusChange?(focused: boolean): void;
}

/**
 * Kid-friendly CodeMirror 6. All quests edit a full HTML document (lang-html
 * highlights nested CSS/JS too). Uncontrolled by design: CodeMirror owns the
 * text; React only hears about changes. Exposes insertText() for the touch
 * InsertToolbar.
 */
function CodeEditorImpl(
  { initialValue, onChange, onFocusChange }: CodeEditorProps,
  ref: React.Ref<CodeEditorHandle>,
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onFocusRef = useRef(onFocusChange);
  onFocusRef.current = onFocusChange;

  useImperativeHandle(ref, () => ({
    insertText(text: string) {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch(view.state.replaceSelection(text));
      view.focus();
    },
  }), []);

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      doc: initialValue,
      parent: hostRef.current,
      extensions: [
        basicSetup,
        autocompletion({ override: [] }), // no popups while kids type — re-enable deliberately later
        html(),
        EditorView.lineWrapping,
        codecraftEditorTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
        EditorView.domEventHandlers({
          focus: () => onFocusRef.current?.(true),
          blur: () => onFocusRef.current?.(false),
        }),
      ],
    });
    viewRef.current = view;
    return () => { view.destroy(); viewRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only; remount via key
  }, []);

  return <div ref={hostRef} aria-label="Code editor" data-testid="code-editor" className="h-full overflow-hidden rounded-lg" />;
}

const CodeEditor = forwardRef(CodeEditorImpl);
export default CodeEditor;
```

- [ ] **Step 2: Write the failing InsertToolbar test** at `src/features/editor/InsertToolbar.test.tsx`:

```ts
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../audio/sounds', () => ({ playSound: vi.fn() }));

import InsertToolbar from './InsertToolbar';

function mockTouch(isTouch: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (query: string) => ({
    matches: /coarse/.test(query) ? isTouch : false,
    media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  });
}

describe('InsertToolbar', () => {
  test('on touch, clicking a token calls onInsert with that token', () => {
    mockTouch(true);
    const onInsert = vi.fn();
    render(<InsertToolbar onInsert={onInsert} />);
    fireEvent.click(screen.getByRole('button', { name: '<' }));
    expect(onInsert).toHaveBeenCalledWith('<');
  });

  test('renders nothing on non-touch devices', () => {
    mockTouch(false);
    const { container } = render(<InsertToolbar onInsert={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 3: Run it, expect FAIL** (module not found).

Run: `npm run test:run -- src/features/editor/InsertToolbar.test.tsx`
Expected: FAIL — cannot resolve `./InsertToolbar`.

- [ ] **Step 4: Implement** `src/features/editor/InsertToolbar.tsx`:

```tsx
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
          onClick={() => { playSound('click'); onInsert(tk); }}
          className="min-w-10 flex-shrink-0 rounded bg-stone px-3 py-2 font-mono text-base font-bold text-white active:translate-y-0.5"
        >
          {tk}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run InsertToolbar test, expect PASS.**

Run: `npm run test:run -- src/features/editor/InsertToolbar.test.tsx`
Expected: PASS.

- [ ] **Step 6: Full suite + commit.** (`QuestScreen.test.tsx` still mocks CodeEditor as a plain function component; passing a ref to it will emit a React warning but not fail. It is updated in Task 9.)

```bash
npm run test:run
git add src/features/editor/CodeEditor.tsx src/features/editor/InsertToolbar.tsx src/features/editor/InsertToolbar.test.tsx
git commit -m "feat(editor): expose insertText handle + focus events; add touch InsertToolbar"
```

---

## Task 9: QuestScreen responsive refactor (panes + columns/tabs + guide & insert wiring)

**Files:**
- Create: `src/screens/quest/LessonPanel.tsx`
- Create: `src/screens/quest/EditorPane.tsx`
- Create: `src/screens/quest/PreviewPane.tsx`
- Create: `src/screens/quest/QuestColumns.tsx`
- Create: `src/screens/quest/QuestTabs.tsx`
- Create: `src/features/guide/useQuestGuide.ts`
- Modify: `src/screens/QuestScreen.tsx`
- Modify: `src/screens/QuestScreen.test.tsx` (CodeEditor mock → forwardRef; add a phone-tabs test)

This is the largest task. The container keeps all state; three presentational panes are arranged by either `QuestColumns` (≥768px) or `QuestTabs` (<768px). All existing `data-testid`/role contracts are preserved so the current tests pass unchanged in the default (desktop) test viewport.

- [ ] **Step 1: Create `useQuestGuide`** at `src/features/guide/useQuestGuide.ts`:

```ts
import { useEffect } from 'react';
import type { Localized, Step } from '../../lib/types';
import { useGuide } from './guideStore';
import { GUIDE } from './guideContent';

interface QuestGuideArgs {
  story: Localized;
  steps: Step[];
  openHints: Set<number>;
  revealHint: (stepIndex: number) => void;
}

/** Publishes quest context to the Guide store and returns event helpers. */
export function useQuestGuide({ story, steps, openHints, revealHint }: QuestGuideArgs) {
  const setQuestCtx = useGuide((s) => s.setQuestCtx);
  const say = useGuide((s) => s.say);

  useEffect(() => {
    setQuestCtx({ story, steps, openHints, revealHint });
    return () => setQuestCtx(null);
  }, [setQuestCtx, story, steps, openHints, revealHint]);

  return {
    onFailedCheck: () => say(GUIDE.failedCheck),
    onStuck: () => say(GUIDE.stuck),
  };
}
```

- [ ] **Step 2: Create `LessonPanel`** at `src/screens/quest/LessonPanel.tsx` (lifted verbatim from today's left column; preserves the `<ol>` list, hint buttons, `role="alert"` banners, and Check button):

```tsx
import type { Localized, Quest } from '../../lib/types';
import { useT } from '../../lib/i18n';
import Panel from '../../components/Panel';
import PixelButton from '../../components/PixelButton';
import LessonText from '../../components/LessonText';

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
  className?: string;
}

export default function LessonPanel(props: LessonPanelProps) {
  const { quest, alreadyDone, openHints, onHint, failMessage, runtimeErrorLine, stuck, onReload, checking, onCheck, className = '' } = props;
  const { t, tl } = useT();

  return (
    <Panel className={`flex flex-col gap-3 overflow-y-auto ${className}`}>
      <h1 className="font-pixel text-sm text-grass-dark">⛏️ {t('questLabel')}: {tl(quest.title)}</h1>
      {alreadyDone && <p className="font-body text-sm font-bold text-gold">★ {t('replayDone')}</p>}
      <div className="font-body font-bold italic text-dirt"><LessonText text={tl(quest.story)} /></div>
      <h2 className="font-pixel text-xs">{t('steps')}</h2>
      <ol className="flex flex-col gap-2">
        {quest.steps.map((step, i) => (
          <li key={i} className="font-body font-bold">
            <span className="mr-1 font-pixel text-xs text-grass-dark">{i + 1}.</span>
            <LessonText text={tl(step.text)} />
            {step.hint && !openHints.has(i) && (
              <button onClick={() => onHint(i)} className="ml-2 cursor-pointer rounded bg-gold/40 px-2 font-body text-xs font-bold">💡 {t('hint')}</button>
            )}
            {step.hint && openHints.has(i) && (
              <div className="mt-1 rounded bg-gold/20 p-2 text-sm">💡 <LessonText text={tl(step.hint)} /></div>
            )}
          </li>
        ))}
      </ol>
      {failMessage && (
        <p role="alert" className="rounded-md border-2 border-red-400 bg-red-50 p-2 font-body font-bold text-red-700">🟥 <span><LessonText text={tl(failMessage)} /></span></p>
      )}
      {runtimeErrorLine !== null && (
        <p role="alert" className="rounded-md border-2 border-green-700 bg-green-50 p-2 font-body font-bold text-green-900">🟩 {t('codeBoom')} {runtimeErrorLine}</p>
      )}
      {stuck && (
        <p role="alert" className="rounded-md bg-yellow-100 p-2 font-body font-bold">♻️ {t('stuckLoop')} <button onClick={onReload} className="cursor-pointer underline">↻</button></p>
      )}
      <PixelButton className="mt-auto" onClick={onCheck} disabled={checking}>✔ {t('checkMyCode')}</PixelButton>
    </Panel>
  );
}
```

> Note: the step-number span was `text-[10px]` and is bumped to `text-xs` for touch legibility (spec §responsive). The `runtimeErrorLine` prop replaces the inline `preview.runtimeError?.line` access.

- [ ] **Step 3: Create `EditorPane`** at `src/screens/quest/EditorPane.tsx`:

```tsx
import { useRef } from 'react';
import CodeEditor, { type CodeEditorHandle } from '../../features/editor/CodeEditor';
import InsertToolbar from '../../features/editor/InsertToolbar';

interface EditorPaneProps {
  questId: string;
  initialValue: string;
  onChange: (value: string) => void;
  onFocusChange?: (focused: boolean) => void;
  className?: string;
}

export default function EditorPane({ questId, initialValue, onChange, onFocusChange, className = '' }: EditorPaneProps) {
  const editorRef = useRef<CodeEditorHandle>(null);
  return (
    <div className={`flex min-h-0 flex-col overflow-hidden rounded-lg bg-[#1e1e2e] p-1 ${className}`}>
      <InsertToolbar onInsert={(text) => editorRef.current?.insertText(text)} />
      <div className="min-h-0 flex-1">
        <CodeEditor key={questId} ref={editorRef} initialValue={initialValue} onChange={onChange} onFocusChange={onFocusChange} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `PreviewPane`** at `src/screens/quest/PreviewPane.tsx` (preserves `getByTitle(/preview/i)` + `srcDoc` contract):

```tsx
import type { usePreview } from '../../features/preview/usePreview';
import { useT } from '../../lib/i18n';
import Panel from '../../components/Panel';

type Preview = ReturnType<typeof usePreview>;

export default function PreviewPane({ preview, isJs, className = '' }: { preview: Preview; isJs: boolean; className?: string }) {
  const { t } = useT();
  return (
    <Panel className={`flex min-h-0 flex-col !p-2 ${className}`}>
      <span className="font-pixel text-xs text-stone">👁 {t('preview')}</span>
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
          {preview.consoleLines.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
    </Panel>
  );
}
```

> The preview label was `text-[10px]`; bumped to `text-xs`.

- [ ] **Step 5: Create `QuestColumns`** at `src/screens/quest/QuestColumns.tsx`:

```tsx
import type { ReactNode } from 'react';

/** Tablet/desktop layout (>=768px): lesson left, editor over preview right. */
export default function QuestColumns({ lesson, editor, preview }: { lesson: ReactNode; editor: ReactNode; preview: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 gap-3">
      <div className="flex w-2/5 min-h-0 flex-col">{lesson}</div>
      <div className="flex w-3/5 min-h-0 flex-col gap-3">
        <div className="min-h-0 flex-1">{editor}</div>
        <div className="min-h-0 flex-1">{preview}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create `QuestTabs`** at `src/screens/quest/QuestTabs.tsx` (panes stay mounted; inactive ones hidden via CSS so editor text & the live preview persist across tab switches):

```tsx
import { useState, type ReactNode } from 'react';
import { useT } from '../../lib/i18n';

type Tab = 'lesson' | 'code' | 'run';

/** Phone layout (<768px): one full-height pane at a time. */
export default function QuestTabs({ lesson, editor, preview }: { lesson: ReactNode; editor: ReactNode; preview: ReactNode }) {
  const [tab, setTab] = useState<Tab>('lesson');
  const { t } = useT();
  const TABS: Array<{ id: Tab; icon: string; label: string }> = [
    { id: 'lesson', icon: '📖', label: t('tabLesson') },
    { id: 'code', icon: '⌨️', label: t('tabCode') },
    { id: 'run', icon: '👁', label: t('tabRun') },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div role="tablist" className="flex flex-shrink-0 gap-1">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={tab === tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex-1 rounded-t-md py-2 font-body text-sm font-bold ${tab === tb.id ? 'bg-paper text-grass-dark' : 'bg-grass-dark/70 text-white'}`}
          >
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>
      <div className={`min-h-0 flex-1 ${tab === 'lesson' ? 'flex flex-col' : 'hidden'}`}>{lesson}</div>
      <div className={`min-h-0 flex-1 ${tab === 'code' ? 'flex flex-col' : 'hidden'}`}>{editor}</div>
      <div className={`min-h-0 flex-1 ${tab === 'run' ? 'flex flex-col' : 'hidden'}`}>{preview}</div>
    </div>
  );
}
```

- [ ] **Step 7: Rewrite `QuestScreen.tsx`** to compose the panes and choose a layout. Replace `src/screens/QuestScreen.tsx` with:

```tsx
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
```

> The `<main className="flex-1">` wrapper gives this `h-full` something to fill; `min-h-0` lets the inner flex panes scroll instead of overflowing. This replaces the brittle `h-[calc(100vh-48px)]` + `h-1/2` math.

- [ ] **Step 8: Update the CodeEditor mock in `QuestScreen.test.tsx`** so the new `ref` doesn't warn, and to honor the focus prop. Replace the existing `vi.mock('../features/editor/CodeEditor', ...)` block with:

```tsx
// Editor mock: a forwardRef textarea honoring the same contract + insertText.
// vi.mock factories are hoisted above imports, so React is pulled in via
// vi.importActual inside the async factory (referencing a top-level import would crash).
vi.mock('../features/editor/CodeEditor', async () => {
  const { forwardRef, useImperativeHandle, createElement } =
    await vi.importActual<typeof import('react')>('react');
  const Mock = forwardRef(
    ({ initialValue, onChange }: { initialValue: string; onChange: (v: string) => void }, ref: unknown) => {
      useImperativeHandle(ref, () => ({ insertText: () => {} }));
      return createElement('textarea', {
        'data-testid': 'code-editor',
        defaultValue: initialValue,
        onChange: (e: { target: { value: string } }) => onChange(e.target.value),
      });
    },
  );
  return { default: Mock };
});
```

- [ ] **Step 9: Run the existing QuestScreen suite, expect PASS** (default desktop viewport → `QuestColumns` → all panes present):

Run: `npm run test:run -- src/screens/QuestScreen.test.tsx`
Expected: PASS (all 6 existing tests).

- [ ] **Step 10: Add a phone-tabs test.** Append inside `describe('QuestScreen', ...)` in `src/screens/QuestScreen.test.tsx`:

```tsx
test('on phones, shows Lesson/Code/Run tabs and switches panes', async () => {
  // Phone viewport: min-width queries are false.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  });
  renderQuest();
  expect(await screen.findByRole('tab', { name: /lesson/i })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /code/i })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /run/i })).toBeInTheDocument();
  // Story is in the Lesson pane (default tab).
  expect(screen.getByText(/a villager needs a sign/i)).toBeInTheDocument();
});
```

> Reset `window.matchMedia` afterward is unnecessary — `src/test/setup.ts` reinstalls the default mock per file, and this assignment is local to the test; but if a later test in the same file depends on desktop, restore it. The existing tests run before this one alphabetically/in-order; to be safe, place this test LAST in the describe block.

- [ ] **Step 11: Run it, expect PASS:**

Run: `npm run test:run -- src/screens/QuestScreen.test.tsx`
Expected: PASS (7 tests).

- [ ] **Step 12: Full suite + typecheck + commit:**

```bash
npm run test:run
npm run typecheck
git add src/screens/quest/ src/screens/QuestScreen.tsx src/screens/QuestScreen.test.tsx src/features/guide/useQuestGuide.ts
git commit -m "refactor(quest): extract panes; responsive columns/tabs; wire guide + insert toolbar"
```

---

## Task 10: Touch & small-screen polish

**Files:**
- Modify: `src/components/HoldToConfirm.tsx`
- Modify: `src/components/VictoryOverlay.tsx`
- Modify: `src/screens/TitleScreen.tsx`
- Modify: `index.html`
- Test: `src/components/components.test.tsx` (add a touch-cancel test)

- [ ] **Step 1: Write the failing HoldToConfirm touch-cancel test.** Add to the `describe('HoldToConfirm', ...)` in `src/components/components.test.tsx`:

```ts
test('touchCancel aborts a pending hold', () => {
  vi.useFakeTimers();
  const onConfirm = vi.fn();
  render(<HoldToConfirm label="Reset" holdMs={1500} onConfirm={onConfirm} />);
  const btn = screen.getByRole('button', { name: 'Reset' });
  fireEvent.touchStart(btn);
  act(() => vi.advanceTimersByTime(800));
  fireEvent.touchCancel(btn);
  act(() => vi.advanceTimersByTime(2000));
  expect(onConfirm).not.toHaveBeenCalled();
  vi.useRealTimers();
});
```

- [ ] **Step 2: Run it, expect FAIL** (touchCancel not handled → timer still fires → `onConfirm` called):

Run: `npm run test:run -- src/components/components.test.tsx`
Expected: FAIL — `onConfirm` was called once.

- [ ] **Step 3: Add `onTouchCancel` to HoldToConfirm.** In `src/components/HoldToConfirm.tsx`, add the handler to the `<button>` (next to `onTouchEnd`):

```tsx
      onTouchEnd={cancel}
      onTouchCancel={cancel}
```

- [ ] **Step 4: Run it, expect PASS:**

Run: `npm run test:run -- src/components/components.test.tsx`
Expected: PASS.

- [ ] **Step 5: Make VictoryOverlay phone-safe.** In `src/components/VictoryOverlay.tsx`, change the inner Panel className:

```tsx
      <Panel className="w-full max-w-96 mx-4 text-center">
```

(from `className="w-96 text-center"`.)

- [ ] **Step 6: Make the TitleScreen heading responsive.** In `src/screens/TitleScreen.tsx`, change the `<h1>` class:

```tsx
      <h1 className="font-pixel text-4xl text-white [text-shadow:4px_4px_0_#3d8527] sm:text-5xl">
```

(from `text-5xl`.) Also enlarge the lang-toggle tap target — change its className `text-xs` to `p-2 text-xs`.

- [ ] **Step 7: Update the viewport meta** in `index.html` line 5:

```html
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#2b2b2b" />
```

- [ ] **Step 8: Run full suite + typecheck + build + commit:**

```bash
npm run test:run
npm run typecheck
npm run build
git add src/components/HoldToConfirm.tsx src/components/VictoryOverlay.tsx src/screens/TitleScreen.tsx src/components/components.test.tsx index.html
git commit -m "fix(responsive): touchCancel guard, phone-safe overlay/title, viewport-fit"
```

---

## Task 11: Final verification

- [ ] **Step 1: Full automated gate.**

```bash
npm run test:run
npm run build
```
Expected: all tests pass; build (typecheck + Vite bundle) succeeds. The quest content integrity test `src/content/quests/content.test.ts` must be green (we added no quest content; all new UI strings are bilingual).

- [ ] **Step 2: Manual responsive verification.** `npm run dev`, then in the browser devtools device toolbar check:
  - **Phone (375px):** HudBar no longer overflows (nav labels hidden, BottomNav present); QuestScreen shows Lesson/Code/Run tabs; insert toolbar appears above the editor (enable touch emulation / `pointer: coarse`); Guide Buddy sits above the bottom bar and hides when the editor is focused; Home (🏠) in BottomNav returns to the title and the player stays selected (Press Start re-enters the game); VictoryOverlay fits without clipping.
  - **iPad portrait (768px):** QuestScreen keeps the side-by-side columns; HudBar shows the full nav; BottomNav is absent.
  - **Desktop:** unchanged from today plus the new 🏠 Home control and Guide Buddy.
  - **Buddy:** greets once per screen; idle nudge after ~20s; tapping opens Hint / What's this screen? / Remind me; Settings → Guide buddy toggle hides it.
  - **Languages:** toggle EN/VI; confirm all new strings (tabs, buddy lines, Home, insert toolbar label) are translated.

- [ ] **Step 3: Stop the brainstorming visual-companion server (cleanup, optional):**

```bash
/Users/henry/.claude/plugins/cache/claude-plugins-official/superpowers/5.1.0/skills/brainstorming/scripts/stop-server.sh /Users/henry/dev/codecraft/.superpowers/brainstorm/66697-1780743482
```

---

## Self-Review Notes (for the implementer)

- **Spec coverage:** Task 4 = home nav; Tasks 6–7 + 9 = Guide Buddy (store/content/idle/buddy/mount/settings/quest-wiring); Tasks 1, 5, 8, 9, 10 = responsive (breakpoint hook, BottomNav, HudBar, insert toolbar, QuestScreen columns/tabs, touch fixes). All eleven locked decisions from the spec are implemented.
- **Type consistency check:** `CodeEditorHandle.insertText`, `QuestGuideContext { story, steps, openHints, revealHint }`, `ScreenKey`, `GUIDE.greeting/screenHelp/idle/failedCheck/stuck/allHintsSeen`, `useMediaQuery`/`useIsTouch`, `migrateSettings`, `toggleGuide`/`guideOn` are referenced identically across tasks.
- **Test-integration guardrails:** the `matchMedia` default = desktop/non-touch (Task 1) keeps existing `QuestScreen`/game-screen tests on the columns layout with no toolbar and no BottomNav; the Guide Buddy is `role="status"`, text-only until tapped, so it never collides with `role="dialog"` or `/hint/i` queries.
