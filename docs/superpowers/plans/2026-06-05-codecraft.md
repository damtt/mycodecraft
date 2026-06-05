# CodeCraft Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build CodeCraft — a Minecraft-styled, bilingual (EN/VI) web app that teaches kids 9–12 HTML/CSS/JS through ~30 quests with a live editor, XP/ranks, badges, and streaks.

**Architecture:** Client-only Vite + React SPA. Quests are typed TS content files; a declarative check engine validates kid code inside a sandboxed iframe (`sandbox="allow-scripts"` — DOM checks run *inside* the iframe via postMessage since the parent cannot touch its DOM). Progress is pure functions feeding Zustand stores persisted to localStorage under versioned keys.

**Tech Stack:** React 19, TypeScript (strict), Vite, React Router 7, Zustand 5, Tailwind CSS 4, CodeMirror 6, Vitest + Testing Library, @fontsource fonts (offline-friendly).

**Spec:** `docs/superpowers/specs/2026-06-05-codecraft-design.md`

**Commit policy (user rule):** The repo owner requires confirmation before commits. Blanket approval for the commit steps in this plan must be obtained at execution kickoff; if it was not, ask before the first commit and treat the answer as covering all plan commits.

---

## File Structure

```
codecraft/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx                       # entry, font imports
│   ├── App.tsx                        # RouterProvider
│   ├── index.css                      # Tailwind 4 theme tokens + pixel utilities
│   ├── vite-env.d.ts
│   ├── test/setup.ts                  # jest-dom, localStorage reset
│   ├── lib/
│   │   ├── types.ts                   # Localized, Quest, Check, Profile, ...
│   │   ├── storage.ts                 # versioned localStorage wrapper
│   │   └── i18n.ts                    # lt() + useT() hook
│   ├── stores/
│   │   ├── settingsStore.ts           # lang, soundOn (zustand persist)
│   │   └── profileStore.ts            # profiles CRUD + completeQuest action
│   ├── features/
│   │   ├── progress/
│   │   │   ├── ranks.ts               # RANKS, rankForXp, nextRank
│   │   │   ├── streak.ts              # updateStreak, streakDisplay, todayString
│   │   │   ├── achievements.ts        # ACHIEVEMENTS, computeNewAchievements
│   │   │   ├── complete.ts            # completeQuest pure function
│   │   │   └── unlocks.ts             # worldUnlocked, questStatus
│   │   ├── validation/
│   │   │   ├── checks.ts              # evaluateDomCheck (self-contained!), evaluateLocalCheck
│   │   │   └── run.ts                 # runChecks orchestrator
│   │   ├── preview/
│   │   │   ├── runtime.ts             # buildSrcdoc (console bridge, check runner, ready ping)
│   │   │   └── usePreview.ts          # iframe state, watchdog, runDomChecks
│   │   ├── editor/CodeEditor.tsx      # CodeMirror 6 wrapper
│   │   └── audio/sounds.ts            # WebAudio synth: pop/success/levelup/badge
│   ├── components/
│   │   ├── PixelButton.tsx
│   │   ├── Panel.tsx
│   │   ├── HoldToConfirm.tsx
│   │   ├── XpBar.tsx
│   │   ├── HudBar.tsx
│   │   └── VictoryOverlay.tsx
│   ├── screens/
│   │   ├── TitleScreen.tsx
│   │   ├── PlayersScreen.tsx
│   │   ├── MapScreen.tsx
│   │   ├── QuestScreen.tsx
│   │   ├── InventoryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── app/router.tsx                 # routes + RequireProfile + AppLayout
│   └── content/
│       ├── worlds.ts                  # 3 world defs
│       ├── badges.ts                  # 30 badges + metadata
│       ├── i18n/ui.ts                 # UI string dictionary {en, vi}
│       └── quests/
│           ├── index.ts               # ALL_QUESTS, QUESTS_BY_WORLD, questById
│           ├── html/q01.ts … q10.ts
│           ├── css/q01.ts … q10.ts
│           └── js/q01.ts … q10.ts
└── docs/superpowers/...               # spec + this plan
```

**Design notes the engineer must keep in mind:**
- `evaluateDomCheck` must stay **self-contained** (no imports, no closures) — its compiled source is injected into the iframe via `.toString()`. A comment in the file says so.
- Content check semantics run in a **real browser** iframe; unit tests exercise the evaluator against jsdom documents, so tests use jsdom-safe properties (color, display) while content files may use browser-only shorthand expansion (border-top-style).
- All dates flow as local `YYYY-MM-DD` strings. Only `todayString()` touches `Date`.
- Deviation from spec (approved direction): sounds are synthesized with WebAudio instead of CC0 audio files — no asset sourcing, same effect.

---

### Task 1: Scaffold the project

The repo already exists at `/Users/henry/mydev/codecraft` with `docs/` committed. Author config files directly (no `npm create vite` — it balks at non-empty dirs).

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `.gitignore`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`, `src/test/setup.ts`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "codecraft",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@codemirror/lang-html": "^6.4.9",
    "@fontsource/nunito": "^5.1.0",
    "@fontsource/press-start-2p": "^5.1.0",
    "@tailwindcss/vite": "^4.0.0",
    "codemirror": "^6.0.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.1.0",
    "tailwindcss": "^4.0.0",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "typescript": "~5.7.0",
    "vite": "^6.0.0",
    "vitest": "^3.2.6"
  }
}
```

If `npm install` fails on a version, bump that range to the latest major and note it in the commit message.

- [ ] **Step 2: Write `vite.config.ts`**

```ts
// defineConfig from 'vitest/config' (not 'vite') so the `test` block typechecks
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 4: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CodeCraft</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Write `.gitignore`**

```
node_modules
dist
*.local
.DS_Store
```

- [ ] **Step 6: Write `src/index.css`** (Tailwind 4 theme + pixel utilities)

```css
@import 'tailwindcss';

@theme {
  --color-grass: #54b435;
  --color-grass-dark: #3d8527;
  --color-dirt: #79553a;
  --color-dirt-light: #8a6d3b;
  --color-stone: #6f6f6f;
  --color-night: #2b2b2b;
  --color-sky: #87ceeb;
  --color-diamond: #4aedd9;
  --color-gold: #ffd700;
  --color-paper: #fffef7;
  --font-pixel: 'Press Start 2P', monospace;
  --font-body: 'Nunito', sans-serif;
}

@layer components {
  .pixel-border {
    box-shadow: 0 0 0 4px #2b2b2b, 0 0 0 8px #555;
  }
  /* Raised Minecraft-button bevel */
  .mc-bevel {
    border-width: 4px;
    border-style: solid;
    border-color: #ffffff66 #00000055 #00000055 #ffffff66;
  }
  .bg-world {
    background: linear-gradient(
      to bottom,
      var(--color-sky) 0%,
      var(--color-sky) 60%,
      var(--color-grass) 60%,
      var(--color-grass) 67%,
      var(--color-dirt) 67%
    );
  }
}
```

- [ ] **Step 7: Write `src/vite-env.d.ts`, `src/main.tsx`, `src/App.tsx`**

`src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/press-start-2p';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/900.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`src/App.tsx` (placeholder until Task 11 adds the router):

```tsx
export default function App() {
  return <h1 className="font-pixel text-grass-dark p-8">CodeCraft</h1>;
}
```

- [ ] **Step 8: Write `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
});
```

- [ ] **Step 9: Write the smoke test `src/App.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the app name', () => {
  render(<App />);
  expect(screen.getByText(/codecraft/i)).toBeInTheDocument();
});
```

- [ ] **Step 10: Install and verify**

Run: `cd /Users/henry/mydev/codecraft && npm install && npm run test:run && npm run typecheck`
Expected: 1 test passes, typecheck clean.

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "chore: scaffold Vite + React 19 + TS + Tailwind 4 project"
```

---

### Task 2: Shared types

**Files:**
- Create: `src/lib/types.ts`

Pure type definitions — no test (the content-validation test in Task 21 and every TDD task downstream exercise them).

- [ ] **Step 1: Write `src/lib/types.ts`**

```ts
export type Lang = 'en' | 'vi';
export type Localized = { en: string; vi: string };
export type WorldId = 'html' | 'css' | 'js';

export interface Step {
  text: Localized;
  hint?: Localized;
}

/**
 * Declarative pass conditions. DOM checks (elementExists, textIncludes,
 * attrEquals, computedStyle, elementCount) are evaluated INSIDE the preview
 * iframe; local checks (codeIncludes, consoleIncludes) are evaluated in the
 * parent against the raw code string / captured console lines.
 */
export type Check =
  | { type: 'elementExists'; selector: string; failMessage: Localized }
  | { type: 'textIncludes'; selector: string; value: string; failMessage: Localized }
  | { type: 'attrEquals'; selector: string; attr: string; value: string; failMessage: Localized }
  | { type: 'computedStyle'; selector: string; prop: string; equalsAny: string[]; failMessage: Localized }
  | { type: 'elementCount'; selector: string; min: number; failMessage: Localized }
  | { type: 'codeIncludes'; value: string; failMessage: Localized }
  | { type: 'consoleIncludes'; value: string; failMessage: Localized };

export interface Quest {
  id: string; // e.g. "html-03"
  world: WorldId;
  title: Localized;
  story: Localized; // 1–2 sentence Minecraft-flavored intro
  steps: Step[];
  starterCode: string;
  checks: [Check, ...Check[]]; // non-empty — a quest with no checks would vacuously pass
  xp: 50 | 75 | 100; // easy / medium / boss
  badge: string; // BadgeId — every quest drops one collectible
}

export interface World {
  id: WorldId;
  name: Localized;
  icon: string; // emoji
  tagline: Localized;
}

export interface BadgeDef {
  id: string;
  icon: string; // emoji
  name: Localized;
}

export interface QuestRecord {
  completedAt: string; // YYYY-MM-DD of FIRST completion
  usedHint: boolean; // from first completion (achievements use this)
}

export interface Streak {
  count: number;
  lastDay: string; // YYYY-MM-DD; '' = never played (callers must never pass '' to dayBefore())
}

export interface Profile {
  id: string;
  name: string;
  avatar: string; // emoji head
  xp: number;
  quests: Record<string, QuestRecord>;
  streak: Streak;
  bestStreak: number;
  badges: string[];
  achievements: string[];
  createdAt: string; // YYYY-MM-DD
}

export interface Rewards {
  firstTime: boolean;
  xpGained: number; // quest xp (0 on replay) + daily bonus
  dailyBonus: boolean; // +20 granted (first completion of the day)
  leveledUp: boolean;
  newBadge: string | null;
  newAchievements: string[];
  streak: number;
}
```

- [ ] **Step 2: Verify and commit**

Run: `npm run typecheck`
Expected: clean.

```bash
git add src/lib/types.ts && git commit -m "feat: add shared domain types"
```

---

### Task 3: Versioned localStorage wrapper

**Files:**
- Create: `src/lib/storage.ts`
- Test: `src/lib/storage.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { saveData, loadData, removeData } from './storage';

const isNum = (v: unknown): v is number => typeof v === 'number';

describe('storage', () => {
  test('round-trips data under a versioned envelope', () => {
    saveData('k', 42);
    expect(loadData('k', isNum)).toBe(42);
    expect(JSON.parse(localStorage.getItem('k')!)).toEqual({ version: 1, data: 42 });
  });

  test('returns null for missing key', () => {
    expect(loadData('nope', isNum)).toBeNull();
  });

  test('returns null for corrupt JSON', () => {
    localStorage.setItem('k', '{not json');
    expect(loadData('k', isNum)).toBeNull();
  });

  test('returns null for wrong version', () => {
    localStorage.setItem('k', JSON.stringify({ version: 99, data: 42 }));
    expect(loadData('k', isNum)).toBeNull();
  });

  test('returns null when validator rejects', () => {
    localStorage.setItem('k', JSON.stringify({ version: 1, data: 'str' }));
    expect(loadData('k', isNum)).toBeNull();
  });

  test('removeData deletes the key', () => {
    saveData('k', 1);
    removeData('k');
    expect(loadData('k', isNum)).toBeNull();
  });

  test('returns null for non-object envelope (primitive stored directly)', () => {
    localStorage.setItem('k', JSON.stringify(42));
    expect(loadData('k', isNum)).toBeNull();
  });

  test('returns null for null envelope', () => {
    localStorage.setItem('k', JSON.stringify(null));
    expect(loadData('k', isNum)).toBeNull();
  });

  test('saveData does not throw when storage is full', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    expect(() => saveData('k', 1)).not.toThrow();
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: FAIL — `Cannot find module './storage'`.

- [ ] **Step 3: Write `src/lib/storage.ts`**

```ts
export const STORAGE_VERSION = 1;

export function saveData(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, data }));
  } catch (err) {
    // Quota exceeded or storage unavailable — saves are <50KB so this is
    // exceptional; warn instead of crashing the caller (e.g., victory flow).
    console.warn('codecraft: failed to save', key, err);
  }
}

export function loadData<T>(key: string, validate: (v: unknown) => v is T): T | null {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' || parsed === null ||
      (parsed as { version?: unknown }).version !== STORAGE_VERSION
    ) {
      return null;
    }
    const data = (parsed as { data: unknown }).data;
    return validate(data) ? data : null;
  } catch {
    return null;
  }
}

export function removeData(key: string): void {
  localStorage.removeItem(key);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: 9 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.* && git commit -m "feat: add versioned localStorage wrapper"
```

---

### Task 4: Progress engine (pure functions)

The heart of gamification: ranks, streaks, achievements, quest completion, unlock rules. All pure — `today` is always a parameter.

**Files:**
- Create: `src/features/progress/ranks.ts`, `streak.ts`, `achievements.ts`, `complete.ts`, `unlocks.ts`
- Test: `src/features/progress/progress.test.ts`

- [ ] **Step 1: Write `src/features/progress/ranks.ts`** (data — write directly, tests cover via rankForXp)

```ts
import type { Localized } from '../../lib/types';

export interface Rank {
  level: number;
  id: string;
  icon: string;
  name: Localized;
  minXp: number;
}

export const RANKS: Rank[] = [
  { level: 1, id: 'dirt', icon: '🟫', name: { en: 'Dirt', vi: 'Đất' }, minXp: 0 },
  { level: 2, id: 'stone', icon: '🪨', name: { en: 'Stone', vi: 'Đá' }, minXp: 200 },
  { level: 3, id: 'iron', icon: '⛏️', name: { en: 'Iron', vi: 'Sắt' }, minXp: 500 },
  { level: 4, id: 'gold', icon: '🥇', name: { en: 'Gold', vi: 'Vàng' }, minXp: 900 },
  { level: 5, id: 'diamond', icon: '💎', name: { en: 'Diamond', vi: 'Kim cương' }, minXp: 1400 },
  { level: 6, id: 'netherite', icon: '🟪', name: { en: 'Netherite', vi: 'Netherite' }, minXp: 2000 },
];

export function rankForXp(xp: number): Rank {
  let current = RANKS[0];
  for (const r of RANKS) if (xp >= r.minXp) current = r;
  return current;
}

/** The rank after the current one, or null at max rank. */
export function nextRank(xp: number): Rank | null {
  const current = rankForXp(xp);
  return RANKS.find((r) => r.level === current.level + 1) ?? null;
}
```

- [ ] **Step 2: Write `src/features/progress/streak.ts`**

```ts
import type { Streak } from '../../lib/types';

/** Local YYYY-MM-DD. The ONLY place the app reads the clock for dates. */
export function todayString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dayBefore(day: string): string {
  const d = new Date(`${day}T12:00:00`); // noon dodges DST edges
  d.setDate(d.getDate() - 1);
  return todayString(d);
}

/** Called on quest completion. Same day → unchanged; yesterday → +1; gap → restart at 1. */
export function updateStreak(s: Streak, today: string): Streak {
  if (s.lastDay === today) return s;
  if (s.lastDay === dayBefore(today)) return { count: s.count + 1, lastDay: today };
  return { count: 1, lastDay: today };
}

/** What the HUD shows: streak decays to 0 visually if a day was missed. */
export function streakDisplay(s: Streak, today: string): number {
  if (s.lastDay === today || s.lastDay === dayBefore(today)) return s.count;
  return 0;
}
```

- [ ] **Step 3: Write `src/features/progress/achievements.ts`**

World-completion checks need the quest list, but content arrives in Tasks 18–20 — so quest ids per world are a **parameter**, never an import (also keeps this module pure and testable).

```ts
import type { Localized, Profile, WorldId } from '../../lib/types';

export interface AchievementDef {
  id: string;
  icon: string;
  name: Localized;
  desc: Localized;
  earned(p: Profile, questsByWorld: Record<WorldId, string[]>): boolean;
}

const doneCount = (p: Profile) => Object.keys(p.quests).length;
const worldDone = (p: Profile, ids: string[]) =>
  ids.length > 0 && ids.every((id) => id in p.quests);

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-quest', icon: '🌱',
    name: { en: 'First Quest', vi: 'Nhiệm vụ đầu tiên' },
    desc: { en: 'Complete your first quest', vi: 'Hoàn thành nhiệm vụ đầu tiên' },
    earned: (p) => doneCount(p) >= 1,
  },
  {
    id: 'world-html', icon: '🟫',
    name: { en: 'Grasslands Hero', vi: 'Anh hùng Đồng cỏ' },
    desc: { en: 'Finish every HTML quest', vi: 'Hoàn thành mọi nhiệm vụ HTML' },
    earned: (p, q) => worldDone(p, q.html),
  },
  {
    id: 'world-css', icon: '🟦',
    name: { en: 'Cave Painter', vi: 'Họa sĩ Hang động' },
    desc: { en: 'Finish every CSS quest', vi: 'Hoàn thành mọi nhiệm vụ CSS' },
    earned: (p, q) => worldDone(p, q.css),
  },
  {
    id: 'world-js', icon: '🟨',
    name: { en: 'Redstone Engineer', vi: 'Kỹ sư Redstone' },
    desc: { en: 'Finish every JS quest', vi: 'Hoàn thành mọi nhiệm vụ JS' },
    earned: (p, q) => worldDone(p, q.js),
  },
  {
    id: 'streak-7', icon: '🔥',
    name: { en: '7-Day Streak', vi: 'Chuỗi 7 ngày' },
    desc: { en: 'Play 7 days in a row', vi: 'Chơi 7 ngày liên tiếp' },
    earned: (p) => p.bestStreak >= 7,
  },
  {
    id: 'no-hint-10', icon: '🧠',
    name: { en: 'No-Hint Hero', vi: 'Anh hùng không gợi ý' },
    desc: { en: 'Beat 10 quests without hints', vi: 'Thắng 10 nhiệm vụ không cần gợi ý' },
    earned: (p) => Object.values(p.quests).filter((r) => !r.usedHint).length >= 10,
  },
];

export function computeNewAchievements(
  p: Profile,
  questsByWorld: Record<WorldId, string[]>,
): string[] {
  return ACHIEVEMENTS.filter(
    (a) => !p.achievements.includes(a.id) && a.earned(p, questsByWorld),
  ).map((a) => a.id);
}
```

- [ ] **Step 4: Write `src/features/progress/complete.ts`**

```ts
import type { Profile, Quest, Rewards, WorldId } from '../../lib/types';
import { rankForXp } from './ranks';
import { updateStreak } from './streak';
import { computeNewAchievements } from './achievements';

export const DAILY_BONUS_XP = 20;

/**
 * Pure quest-completion. Rules (spec §Gamification):
 * - First completion: quest.xp + badge. Replays: no XP, no badge.
 * - First completion of the calendar day (incl. replays): +20 daily bonus, streak extends.
 * - QuestRecord keeps FIRST completion's usedHint (replays never overwrite).
 */
export function completeQuest(
  profile: Profile,
  quest: Quest,
  opts: { usedHint: boolean; today: string; questsByWorld: Record<WorldId, string[]> },
): { profile: Profile; rewards: Rewards } {
  const firstTime = !(quest.id in profile.quests);
  const dailyBonus = profile.streak.lastDay !== opts.today;
  const xpGained = (firstTime ? quest.xp : 0) + (dailyBonus ? DAILY_BONUS_XP : 0);

  const streak = updateStreak(profile.streak, opts.today);
  const newBadge =
    firstTime && !profile.badges.includes(quest.badge) ? quest.badge : null;

  // Always fresh objects — the replay path must not share references with the input
  const next: Profile = {
    ...profile,
    xp: profile.xp + xpGained,
    quests: firstTime
      ? { ...profile.quests, [quest.id]: { completedAt: opts.today, usedHint: opts.usedHint } }
      : { ...profile.quests },
    streak,
    bestStreak: Math.max(profile.bestStreak, streak.count),
    badges: newBadge ? [...profile.badges, newBadge] : [...profile.badges],
  };

  const newAchievements = computeNewAchievements(next, opts.questsByWorld);
  next.achievements = [...profile.achievements, ...newAchievements];

  return {
    profile: next,
    rewards: {
      firstTime,
      xpGained,
      dailyBonus,
      leveledUp: rankForXp(next.xp).level > rankForXp(profile.xp).level,
      newBadge,
      newAchievements,
      streak: streak.count,
    },
  };
}
```

- [ ] **Step 5: Write `src/features/progress/unlocks.ts`**

```ts
import type { Profile, Quest, WorldId } from '../../lib/types';

const WORLD_ORDER: WorldId[] = ['html', 'css', 'js'];

export function worldUnlocked(
  world: WorldId,
  profile: Profile,
  questsByWorld: Record<WorldId, Quest[]>,
): boolean {
  const idx = WORLD_ORDER.indexOf(world);
  if (idx === 0) return true;
  const prev = questsByWorld[WORLD_ORDER[idx - 1]];
  // length guard: with content not yet loaded, [].every() is vacuously true —
  // an empty previous world must read as "not finished", not "finished"
  return prev.length > 0 && prev.every((q) => q.id in profile.quests);
}

export type QuestStatus = 'done' | 'current' | 'locked';

/** Linear unlock within a world: first not-done quest of an unlocked world is 'current'. */
export function questStatus(
  quest: Quest,
  profile: Profile,
  questsByWorld: Record<WorldId, Quest[]>,
): QuestStatus {
  if (quest.id in profile.quests) return 'done';
  if (!worldUnlocked(quest.world, profile, questsByWorld)) return 'locked';
  const firstOpen = questsByWorld[quest.world].find((q) => !(q.id in profile.quests));
  return firstOpen?.id === quest.id ? 'current' : 'locked';
}
```

- [ ] **Step 6: Write the failing tests `src/features/progress/progress.test.ts`**

```ts
import type { Profile, Quest, WorldId } from '../../lib/types';
import { rankForXp, nextRank } from './ranks';
import { updateStreak, streakDisplay, dayBefore } from './streak';
import { completeQuest } from './complete';
import { worldUnlocked, questStatus } from './unlocks';

const L = (s: string) => ({ en: s, vi: s });

function makeQuest(id: string, world: WorldId, xp: 50 | 75 | 100 = 50): Quest {
  return {
    id, world, xp, badge: `badge-${id}`,
    title: L(id), story: L('s'), steps: [], starterCode: '',
    checks: [{ type: 'codeIncludes', value: 'x', failMessage: L('f') }],
  };
}

function makeProfile(over: Partial<Profile> = {}): Profile {
  return {
    id: 'p1', name: 'Mai', avatar: '🦊', xp: 0, quests: {},
    streak: { count: 0, lastDay: '' }, bestStreak: 0,
    badges: [], achievements: [], createdAt: '2026-06-01', ...over,
  };
}

const q1 = makeQuest('html-01', 'html');
const q2 = makeQuest('html-02', 'html');
const QBW = { html: ['html-01', 'html-02'], css: ['css-01'], js: ['js-01'] };
const QUESTS_BW = { html: [q1, q2], css: [makeQuest('css-01', 'css')], js: [makeQuest('js-01', 'js')] };

describe('ranks', () => {
  test('thresholds', () => {
    expect(rankForXp(0).id).toBe('dirt');
    expect(rankForXp(199).id).toBe('dirt');
    expect(rankForXp(200).id).toBe('stone');
    expect(rankForXp(2000).id).toBe('netherite');
    expect(nextRank(0)!.id).toBe('stone');
    expect(nextRank(2500)).toBeNull();
  });
});

describe('streak', () => {
  test('dayBefore crosses month boundary', () => {
    expect(dayBefore('2026-06-01')).toBe('2026-05-31');
  });
  test('same day unchanged, consecutive +1, gap resets to 1', () => {
    expect(updateStreak({ count: 3, lastDay: '2026-06-05' }, '2026-06-05')).toEqual({ count: 3, lastDay: '2026-06-05' });
    expect(updateStreak({ count: 3, lastDay: '2026-06-04' }, '2026-06-05')).toEqual({ count: 4, lastDay: '2026-06-05' });
    expect(updateStreak({ count: 3, lastDay: '2026-06-01' }, '2026-06-05')).toEqual({ count: 1, lastDay: '2026-06-05' });
    expect(updateStreak({ count: 0, lastDay: '' }, '2026-06-05')).toEqual({ count: 1, lastDay: '2026-06-05' });
  });
  test('display decays after missed day without mutating', () => {
    expect(streakDisplay({ count: 5, lastDay: '2026-06-04' }, '2026-06-05')).toBe(5);
    expect(streakDisplay({ count: 5, lastDay: '2026-06-01' }, '2026-06-05')).toBe(0);
  });
});

describe('completeQuest', () => {
  const today = '2026-06-05';

  test('first completion: xp + daily bonus + badge + first-quest achievement', () => {
    const { profile, rewards } = completeQuest(makeProfile(), q1, { usedHint: false, today, questsByWorld: QBW });
    expect(rewards).toMatchObject({ firstTime: true, xpGained: 70, dailyBonus: true, newBadge: 'badge-html-01', streak: 1 });
    expect(rewards.newAchievements).toContain('first-quest');
    expect(profile.xp).toBe(70);
    expect(profile.quests['html-01']).toEqual({ completedAt: today, usedHint: false });
  });

  test('replay same day: no xp, no badge, no daily bonus, keeps original usedHint', () => {
    const first = completeQuest(makeProfile(), q1, { usedHint: false, today, questsByWorld: QBW }).profile;
    const { profile, rewards } = completeQuest(first, q1, { usedHint: true, today, questsByWorld: QBW });
    expect(rewards).toMatchObject({ firstTime: false, xpGained: 0, dailyBonus: false, newBadge: null });
    expect(profile.quests['html-01'].usedHint).toBe(false);
  });

  test('replay next day: daily bonus + streak extends', () => {
    const first = completeQuest(makeProfile(), q1, { usedHint: false, today, questsByWorld: QBW }).profile;
    const { rewards } = completeQuest(first, q1, { usedHint: false, today: '2026-06-06', questsByWorld: QBW });
    expect(rewards).toMatchObject({ xpGained: 20, dailyBonus: true, streak: 2 });
  });

  test('level up detected and bestStreak tracked', () => {
    const p = makeProfile({ xp: 180, streak: { count: 6, lastDay: '2026-06-04' }, bestStreak: 6 });
    const { profile, rewards } = completeQuest(p, q1, { usedHint: false, today, questsByWorld: QBW });
    expect(rewards.leveledUp).toBe(true); // 180 + 50 + 20 = 250 ≥ 200
    expect(profile.bestStreak).toBe(7);
    expect(rewards.newAchievements).toContain('streak-7');
  });

  test('world achievement on finishing all world quests', () => {
    const p = completeQuest(makeProfile(), q1, { usedHint: false, today, questsByWorld: QBW }).profile;
    const { rewards } = completeQuest(p, q2, { usedHint: false, today, questsByWorld: QBW });
    expect(rewards.newAchievements).toContain('world-html');
  });
});

describe('unlocks', () => {
  test('html open from start; css locked until html done', () => {
    const fresh = makeProfile();
    expect(worldUnlocked('html', fresh, QUESTS_BW)).toBe(true);
    expect(worldUnlocked('css', fresh, QUESTS_BW)).toBe(false);
    const done = makeProfile({ quests: {
      'html-01': { completedAt: '2026-06-05', usedHint: false },
      'html-02': { completedAt: '2026-06-05', usedHint: false },
    }});
    expect(worldUnlocked('css', done, QUESTS_BW)).toBe(true);
  });

  test('questStatus: done / current / locked', () => {
    const p = makeProfile({ quests: { 'html-01': { completedAt: '2026-06-05', usedHint: false } } });
    expect(questStatus(q1, p, QUESTS_BW)).toBe('done');
    expect(questStatus(q2, p, QUESTS_BW)).toBe('current');
    expect(questStatus(QUESTS_BW.css[0], p, QUESTS_BW)).toBe('locked');
  });
});
```

Review-approved additions to the test file (pin-down tests): streakDisplay non-mutation; completeQuest input immutability + no shared references (first-time and replay paths); leveledUp threshold-crossing comparison (multi-rank jumps unreachable: max gain 120 XP < smallest gap 200); bestStreak surviving a gap reset; worldUnlocked false for empty content arrays.

- [ ] **Step 7: Run tests — the suite must pass now** (implementation was written first for data-heavy modules; the tests are the spec lock)

Run: `npx vitest run src/features/progress`
Expected: all pass. If any fail, fix the implementation (not the test) — the test encodes spec rules.

- [ ] **Step 8: Commit**

```bash
git add src/features/progress && git commit -m "feat: add progress engine (ranks, streaks, achievements, completion, unlocks)"
```

---

### Task 5: i18n + settings store

**Files:**
- Create: `src/content/i18n/ui.ts`, `src/stores/settingsStore.ts`, `src/lib/i18n.ts`
- Test: `src/lib/i18n.test.ts`

- [ ] **Step 1: Write `src/content/i18n/ui.ts`** (the full UI dictionary — add keys here whenever a later task introduces UI text)

```ts
import type { Localized } from '../../lib/types';

export const UI = {
  appName: { en: 'CodeCraft', vi: 'CodeCraft' },
  tagline: { en: 'Mine knowledge. Craft code.', vi: 'Đào kiến thức. Chế tạo code.' },
  pressStart: { en: 'Press Start', vi: 'Bắt đầu' },
  choosePlayer: { en: 'Choose your player', vi: 'Chọn người chơi' },
  newPlayer: { en: 'New Player', vi: 'Người chơi mới' },
  playerName: { en: 'Your name', vi: 'Tên của bạn' },
  pickAvatar: { en: 'Pick your head', vi: 'Chọn đầu của bạn' },
  create: { en: 'Create', vi: 'Tạo' },
  cancel: { en: 'Cancel', vi: 'Hủy' },
  holdToDelete: { en: 'Hold to delete', vi: 'Giữ để xóa' },
  holdToReset: { en: 'Hold to reset progress', vi: 'Giữ để đặt lại tiến trình' },
  worldMap: { en: 'World Map', vi: 'Bản đồ' },
  inventory: { en: 'Chest', vi: 'Rương đồ' },
  settings: { en: 'Settings', vi: 'Cài đặt' },
  locked: { en: 'Locked', vi: 'Đã khóa' },
  questLabel: { en: 'Quest', vi: 'Nhiệm vụ' },
  checkMyCode: { en: 'Check my code', vi: 'Kiểm tra code' },
  hint: { en: 'Hint', vi: 'Gợi ý' },
  preview: { en: 'Preview', vi: 'Xem trước' },
  console: { en: 'Console', vi: 'Console' }, // loanword — what VI kids see in tech contexts
  victory: { en: 'Quest complete!', vi: 'Hoàn thành nhiệm vụ!' },
  xpGained: { en: 'XP earned', vi: 'XP nhận được' },
  dailyBonus: { en: 'Daily bonus!', vi: 'Thưởng hằng ngày!' },
  levelUp: { en: 'LEVEL UP!', vi: 'LÊN CẤP!' },
  newBadge: { en: 'New badge!', vi: 'Huy hiệu mới!' },
  newAchievement: { en: 'Achievement!', vi: 'Thành tích!' },
  nextQuest: { en: 'Next quest', vi: 'Nhiệm vụ tiếp theo' },
  backToMap: { en: 'Back to map', vi: 'Về bản đồ' },
  replayDone: { en: 'Nice mining! You already beat this quest.', vi: 'Đào giỏi lắm! Bạn đã thắng nhiệm vụ này rồi.' },
  stuckLoop: { en: 'Sssomething is stuck in a loop! Check your code and try again.', vi: 'Có gì đó bị kẹt trong vòng lặp! Kiểm tra code và thử lại nhé.' },
  // Prefix string — call sites must append the line number (e.g., t('codeBoom') + ' ' + line)
  codeBoom: { en: 'Sssomething went boom on line', vi: 'Có gì đó nổ tung ở dòng' },
  badges: { en: 'Badges', vi: 'Huy hiệu' },
  achievements: { en: 'Achievements', vi: 'Thành tích' },
  stats: { en: 'Stats', vi: 'Thống kê' },
  questsDone: { en: 'Quests completed', vi: 'Nhiệm vụ đã xong' },
  bestStreak: { en: 'Best streak', vi: 'Chuỗi dài nhất' },
  language: { en: 'Language', vi: 'Ngôn ngữ' },
  sound: { en: 'Sound', vi: 'Âm thanh' },
  on: { en: 'On', vi: 'Bật' },
  off: { en: 'Off', vi: 'Tắt' },
  resetProgress: { en: 'Reset progress', vi: 'Đặt lại tiến trình' },
  resetDone: { en: 'Progress reset.', vi: 'Đã đặt lại tiến trình.' },
  worldComplete: { en: 'World complete! A new world has opened!', vi: 'Hoàn thành thế giới! Một thế giới mới đã mở!' },
  steps: { en: 'Steps', vi: 'Các bước' },
  story: { en: 'Story', vi: 'Câu chuyện' },
} satisfies Record<string, Localized>;

export type UIKey = keyof typeof UI;
```

- [ ] **Step 2: Write `src/stores/settingsStore.ts`**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang } from '../lib/types';

interface SettingsState {
  lang: Lang;
  soundOn: boolean;
  setLang(lang: Lang): void;
  toggleSound(): void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lang: 'en',
      soundOn: true,
      setLang: (lang) => set({ lang }),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
    }),
    { name: 'codecraft:settings', version: 1 },
  ),
);
```

- [ ] **Step 3: Write `src/lib/i18n.ts`**

```ts
import type { Lang, Localized } from './types';
import { UI, type UIKey } from '../content/i18n/ui';
import { useSettings } from '../stores/settingsStore';

/** Pure lookup with EN fallback for blank/whitespace-only translations. */
export function lt(l: Localized, lang: Lang): string {
  return (lang === 'vi' && l.vi.trim()) || l.en;
}

/**
 * Hook: t('key') for UI strings, tl(localized) for content strings.
 * Note: t and tl are NOT referentially stable across renders — call them
 * inline in JSX; never put them in useEffect dependency arrays.
 */
export function useT() {
  const lang = useSettings((s) => s.lang);
  return {
    lang,
    t: (key: UIKey) => lt(UI[key], lang),
    tl: (l: Localized) => lt(l, lang),
  };
}
```

- [ ] **Step 4: Write the failing test `src/lib/i18n.test.ts`**

```tsx
import { renderHook, act } from '@testing-library/react';
import { lt, useT } from './i18n';
import { useSettings } from '../stores/settingsStore';

describe('i18n', () => {
  test('lt picks language with EN fallback', () => {
    expect(lt({ en: 'Hello', vi: 'Xin chào' }, 'vi')).toBe('Xin chào');
    expect(lt({ en: 'Hello', vi: 'Xin chào' }, 'en')).toBe('Hello');
    expect(lt({ en: 'Hello', vi: '' }, 'vi')).toBe('Hello');
  });

  test('useT reacts to language switch', () => {
    const { result } = renderHook(() => useT());
    expect(result.current.t('pressStart')).toBe('Press Start');
    act(() => useSettings.getState().setLang('vi'));
    expect(result.current.t('pressStart')).toBe('Bắt đầu');
  });
});
```

- [ ] **Step 5: Run, verify pass, commit**

Run: `npx vitest run src/lib/i18n.test.ts`
Expected: 2 passed.

```bash
git add src/content/i18n src/stores/settingsStore.ts src/lib/i18n.* && git commit -m "feat: add bilingual i18n dictionary and settings store"
```

---

### Task 6: Profile store

Zustand store, manually persisted through the Task 3 wrapper — index key `codecraft:profile-index` (string[] of ids) + one `codecraft:profile:<id>` key per profile (per spec §Persistence).

**Files:**
- Create: `src/stores/profileStore.ts`
- Test: `src/stores/profileStore.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import type { Quest } from '../lib/types';
import { useProfiles, loadProfiles, INDEX_KEY, profileKey } from './profileStore';

const L = (s: string) => ({ en: s, vi: s });
const quest: Quest = {
  id: 'html-01', world: 'html', xp: 50, badge: 'b-wood',
  title: L('q'), story: L('s'), steps: [], starterCode: '',
  checks: [{ type: 'codeIncludes', value: 'x', failMessage: L('f') }],
};

function reset() {
  localStorage.clear();
  useProfiles.setState({ profiles: [], activeId: null });
}

describe('profileStore', () => {
  beforeEach(reset);

  test('create persists profile + index, select activates', () => {
    useProfiles.getState().create('Mai', '🦊');
    const p = useProfiles.getState().profiles[0];
    expect(p.name).toBe('Mai');
    expect(localStorage.getItem(INDEX_KEY)).toContain(p.id);
    expect(localStorage.getItem(profileKey(p.id))).toContain('Mai');
    useProfiles.getState().select(p.id);
    expect(useProfiles.getState().activeId).toBe(p.id);
  });

  test('loadProfiles round-trips from localStorage', () => {
    useProfiles.getState().create('Mai', '🦊');
    const saved = useProfiles.getState().profiles;
    useProfiles.setState({ profiles: [], activeId: null });
    expect(loadProfiles()).toEqual(saved);
  });

  test('remove deletes profile key and clears active', () => {
    useProfiles.getState().create('Mai', '🦊');
    const id = useProfiles.getState().profiles[0].id;
    useProfiles.getState().select(id);
    useProfiles.getState().remove(id);
    expect(useProfiles.getState().profiles).toHaveLength(0);
    expect(useProfiles.getState().activeId).toBeNull();
    expect(localStorage.getItem(profileKey(id))).toBeNull();
  });

  test('completeQuest updates active profile, persists, returns rewards', () => {
    useProfiles.getState().create('Mai', '🦊');
    useProfiles.getState().select(useProfiles.getState().profiles[0].id);
    const rewards = useProfiles.getState().completeQuest(quest, false, '2026-06-05');
    expect(rewards?.xpGained).toBe(70); // 50 + 20 daily
    const active = useProfiles.getState().profiles[0];
    expect(active.xp).toBe(70);
    expect(localStorage.getItem(profileKey(active.id))).toContain('"xp":70');
  });

  test('resetActive zeroes progress but keeps identity', () => {
    useProfiles.getState().create('Mai', '🦊');
    const id = useProfiles.getState().profiles[0].id;
    useProfiles.getState().select(id);
    useProfiles.getState().completeQuest(quest, false, '2026-06-05');
    useProfiles.getState().resetActive();
    const p = useProfiles.getState().profiles[0];
    expect(p.xp).toBe(0);
    expect(p.quests).toEqual({});
    expect(p.name).toBe('Mai');
  });

  test('corrupt profile is skipped on load, others survive', () => {
    useProfiles.getState().create('Mai', '🦊');
    useProfiles.getState().create('Tom', '🐺');
    const [a] = useProfiles.getState().profiles;
    localStorage.setItem(profileKey(a.id), '{broken');
    expect(loadProfiles()).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/stores/profileStore.test.ts`
Expected: FAIL — `Cannot find module './profileStore'`.

- [ ] **Step 3: Write `src/stores/profileStore.ts`**

Note: `QUESTS_BY_WORLD_IDS` import won't exist until Task 18 — until then use the placeholder shown; Task 18 swaps it for the content import (its checklist includes this).

```ts
import { create } from 'zustand';
import type { Profile, Quest, Rewards, WorldId } from '../lib/types';
import { saveData, loadData, removeData } from '../lib/storage';
import { completeQuest as completeQuestPure } from '../features/progress/complete';
import { todayString } from '../features/progress/streak';

// Task 18 replaces this with: import { QUESTS_BY_WORLD_IDS } from '../content/quests';
const QUESTS_BY_WORLD_IDS: Record<WorldId, string[]> = { html: [], css: [], js: [] };

export const INDEX_KEY = 'codecraft:profile-index';
export const profileKey = (id: string) => `codecraft:profile:${id}`;

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

const isProfile = (v: unknown): v is Profile => {
  const p = v as Profile;
  return (
    typeof p === 'object' && p !== null &&
    typeof p.id === 'string' && typeof p.name === 'string' &&
    typeof p.xp === 'number' &&
    typeof p.quests === 'object' && p.quests !== null &&
    typeof p.streak === 'object' && p.streak !== null &&
    typeof p.streak.count === 'number' && typeof p.streak.lastDay === 'string' &&
    typeof p.bestStreak === 'number' &&
    Array.isArray(p.badges) && Array.isArray(p.achievements)
  );
};

/** Load all valid profiles; silently skips corrupt ones (spec §Error Handling). */
export function loadProfiles(): Profile[] {
  const ids = loadData(INDEX_KEY, isStringArray) ?? [];
  return ids
    .map((id) => loadData(profileKey(id), isProfile))
    .filter((p): p is Profile => p !== null);
}

function persist(profiles: Profile[]) {
  saveData(INDEX_KEY, profiles.map((p) => p.id));
  for (const p of profiles) saveData(profileKey(p.id), p);
}

interface ProfileState {
  profiles: Profile[];
  activeId: string | null;
  create(name: string, avatar: string): void;
  remove(id: string): void;
  select(id: string): void;
  deselect(): void;
  completeQuest(quest: Quest, usedHint: boolean, today?: string): Rewards | null;
  resetActive(): void;
}

export const useProfiles = create<ProfileState>()((set, get) => ({
  profiles: loadProfiles(),
  activeId: null,

  create: (name, avatar) => {
    const profile: Profile = {
      id: crypto.randomUUID(), name, avatar, xp: 0, quests: {},
      streak: { count: 0, lastDay: '' }, bestStreak: 0,
      badges: [], achievements: [], createdAt: todayString(),
    };
    const profiles = [...get().profiles, profile];
    persist(profiles);
    set({ profiles });
  },

  remove: (id) => {
    const profiles = get().profiles.filter((p) => p.id !== id);
    removeData(profileKey(id));
    persist(profiles);
    set({ profiles, activeId: get().activeId === id ? null : get().activeId });
  },

  select: (id) => set({ activeId: id }),
  deselect: () => set({ activeId: null }),

  completeQuest: (quest, usedHint, today = todayString()) => {
    const { profiles, activeId } = get();
    const active = profiles.find((p) => p.id === activeId);
    if (!active) return null;
    const { profile, rewards } = completeQuestPure(active, quest, {
      usedHint, today, questsByWorld: QUESTS_BY_WORLD_IDS,
    });
    const next = profiles.map((p) => (p.id === profile.id ? profile : p));
    persist(next);
    set({ profiles: next });
    return rewards;
  },

  resetActive: () => {
    const { profiles, activeId } = get();
    const next = profiles.map((p) =>
      p.id === activeId
        ? { ...p, xp: 0, quests: {}, streak: { count: 0, lastDay: '' }, bestStreak: 0, badges: [], achievements: [] }
        : p,
    );
    persist(next);
    set({ profiles: next });
  },
}));

/** Convenience selector — null when no profile is active. */
export const useActiveProfile = () =>
  useProfiles((s) => s.profiles.find((p) => p.id === s.activeId) ?? null);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/stores/profileStore.test.ts`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/stores/profileStore.* && git commit -m "feat: add profile store with per-profile persistence"
```

---

### Task 7: Validation engine (pure)

DOM checks must run **inside** the sandboxed iframe (parent can't reach its DOM). Trick: `evaluateDomCheck` is written 100% self-contained so Task 8 can inject `evaluateDomCheck.toString()` into the iframe bootstrap.

**Files:**
- Create: `src/features/validation/checks.ts`, `src/features/validation/run.ts`
- Test: `src/features/validation/validation.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import type { Check } from '../../lib/types';
import { evaluateDomCheck, evaluateLocalCheck, isDomCheck } from './checks';
import { runChecks } from './run';

const L = (s: string) => ({ en: s, vi: s });
const doc = (html: string) => new DOMParser().parseFromString(html, 'text/html');

describe('evaluateDomCheck', () => {
  test('elementExists', () => {
    const d = doc('<h1>Hi</h1>');
    expect(evaluateDomCheck({ type: 'elementExists', selector: 'h1', failMessage: L('f') }, d)).toBe(true);
    expect(evaluateDomCheck({ type: 'elementExists', selector: 'h2', failMessage: L('f') }, d)).toBe(false);
  });

  test('textIncludes is case-insensitive and trims', () => {
    const d = doc('<h1>  Hello World </h1>');
    expect(evaluateDomCheck({ type: 'textIncludes', selector: 'h1', value: 'hello', failMessage: L('f') }, d)).toBe(true);
    expect(evaluateDomCheck({ type: 'textIncludes', selector: 'h1', value: 'bye', failMessage: L('f') }, d)).toBe(false);
  });

  test('attrEquals', () => {
    const d = doc('<a href="https://www.minecraft.net">x</a>');
    expect(evaluateDomCheck({ type: 'attrEquals', selector: 'a', attr: 'href', value: 'https://www.minecraft.net', failMessage: L('f') }, d)).toBe(true);
    expect(evaluateDomCheck({ type: 'attrEquals', selector: 'a', attr: 'href', value: 'https://other.com', failMessage: L('f') }, d)).toBe(false);
  });

  test('elementCount min', () => {
    const d = doc('<ul><li>a</li><li>b</li><li>c</li></ul>');
    expect(evaluateDomCheck({ type: 'elementCount', selector: 'li', min: 3, failMessage: L('f') }, d)).toBe(true);
    expect(evaluateDomCheck({ type: 'elementCount', selector: 'li', min: 4, failMessage: L('f') }, d)).toBe(false);
  });

  test('computedStyle matches any accepted value', () => {
    const d = doc('<h1 style="color: red">Hi</h1>');
    expect(evaluateDomCheck({ type: 'computedStyle', selector: 'h1', prop: 'color', equalsAny: ['red', 'rgb(255, 0, 0)'], failMessage: L('f') }, d)).toBe(true);
    expect(evaluateDomCheck({ type: 'computedStyle', selector: 'h1', prop: 'color', equalsAny: ['blue', 'rgb(0, 0, 255)'], failMessage: L('f') }, d)).toBe(false);
  });

  test('missing element fails every dom check type', () => {
    const d = doc('<p>x</p>');
    expect(evaluateDomCheck({ type: 'textIncludes', selector: 'h1', value: 'x', failMessage: L('f') }, d)).toBe(false);
    expect(evaluateDomCheck({ type: 'computedStyle', selector: 'h1', prop: 'color', equalsAny: ['red'], failMessage: L('f') }, d)).toBe(false);
  });

  test('is self-contained: its source string survives Function() reconstruction', () => {
    const rebuilt = new Function(`return (${evaluateDomCheck.toString()})`)() as typeof evaluateDomCheck;
    const d = doc('<h1>Hi</h1>');
    expect(rebuilt({ type: 'elementExists', selector: 'h1', failMessage: L('f') }, d)).toBe(true);
  });
});

describe('evaluateLocalCheck', () => {
  test('codeIncludes ignores whitespace runs and case', () => {
    const ctx = { code: '<H1>hi</H1>', consoleLines: [] as string[] };
    expect(evaluateLocalCheck({ type: 'codeIncludes', value: '<h1>', failMessage: L('f') }, ctx)).toBe(true);
    expect(evaluateLocalCheck({ type: 'codeIncludes', value: 'class=', failMessage: L('f') }, ctx)).toBe(false);
  });

  test('consoleIncludes scans captured lines', () => {
    const ctx = { code: '', consoleLines: ['Hello, miner!', '128'] };
    expect(evaluateLocalCheck({ type: 'consoleIncludes', value: 'Hello, miner!', failMessage: L('f') }, ctx)).toBe(true);
    expect(evaluateLocalCheck({ type: 'consoleIncludes', value: 'creeper', failMessage: L('f') }, ctx)).toBe(false);
  });
});

describe('runChecks', () => {
  const checks: Check[] = [
    { type: 'codeIncludes', value: 'h1', failMessage: L('local-fail') },
    { type: 'elementExists', selector: 'h1', failMessage: L('dom-fail') },
  ];

  test('merges local and dom results in original order; first failure surfaces', async () => {
    const result = await runChecks(checks, {
      code: '<h1>x</h1>',
      consoleLines: [],
      runDomChecks: async (domChecks) => domChecks.map(() => false),
    });
    expect(result.pass).toBe(false);
    expect(result.results).toEqual([true, false]);
    expect(result.firstFail?.failMessage.en).toBe('dom-fail');
  });

  test('all pass', async () => {
    const result = await runChecks(checks, {
      code: '<h1>x</h1>',
      consoleLines: [],
      runDomChecks: async (domChecks) => domChecks.map(() => true),
    });
    expect(result).toMatchObject({ pass: true, firstFail: null });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/validation`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/features/validation/checks.ts`**

```ts
import type { Check } from '../../lib/types';

export type DomCheck = Extract<
  Check,
  { type: 'elementExists' | 'textIncludes' | 'attrEquals' | 'computedStyle' | 'elementCount' }
>;
export type LocalCheck = Extract<Check, { type: 'codeIncludes' | 'consoleIncludes' }>;

export function isDomCheck(check: Check): check is DomCheck {
  return check.type !== 'codeIncludes' && check.type !== 'consoleIncludes';
}

/**
 * ⚠️ MUST STAY SELF-CONTAINED — no imports, no outer-scope references, no TS
 * enums. Its compiled source is injected into the preview iframe via
 * `evaluateDomCheck.toString()` (see features/preview/runtime.ts). The test
 * "is self-contained" enforces this.
 */
export function evaluateDomCheck(
  check: {
    type: string; selector?: string; value?: string; attr?: string;
    prop?: string; equalsAny?: string[]; min?: number;
  },
  doc: Document,
): boolean {
  const el = check.selector ? doc.querySelector(check.selector) : null;
  switch (check.type) {
    case 'elementExists':
      return el !== null;
    case 'textIncludes':
      return el !== null &&
        (el.textContent || '').toLowerCase().includes((check.value || '').toLowerCase());
    case 'attrEquals':
      return el !== null && el.getAttribute(check.attr || '') === check.value;
    case 'computedStyle': {
      if (el === null) return false;
      const view = doc.defaultView || window;
      const actual = view.getComputedStyle(el).getPropertyValue(check.prop || '').trim();
      return (check.equalsAny || []).some((v) => v === actual);
    }
    case 'elementCount':
      return doc.querySelectorAll(check.selector || '').length >= (check.min || 0);
    default:
      return false;
  }
}

export interface LocalContext {
  code: string;
  consoleLines: string[];
}

export function evaluateLocalCheck(check: LocalCheck, ctx: LocalContext): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ');
  switch (check.type) {
    case 'codeIncludes':
      return norm(ctx.code).includes(norm(check.value));
    case 'consoleIncludes':
      return ctx.consoleLines.some((line) => line.includes(check.value));
  }
}
```

- [ ] **Step 4: Write `src/features/validation/run.ts`**

```ts
import type { Check, Localized } from '../../lib/types';
import { isDomCheck, evaluateLocalCheck, type DomCheck } from './checks';

export interface RunContext {
  code: string;
  consoleLines: string[];
  /** Sends dom checks to the iframe; resolves per-check booleans in order. */
  runDomChecks(checks: DomCheck[]): Promise<boolean[]>;
}

export interface RunResult {
  pass: boolean;
  results: boolean[]; // same order as input checks
  firstFail: { failMessage: Localized } | null;
}

export async function runChecks(checks: Check[], ctx: RunContext): Promise<RunResult> {
  const domChecks = checks.filter(isDomCheck);
  const domResults = domChecks.length > 0 ? await ctx.runDomChecks(domChecks) : [];

  let domIdx = 0;
  const results = checks.map((check) =>
    isDomCheck(check)
      ? domResults[domIdx++] ?? false
      : evaluateLocalCheck(check, ctx),
  );

  const failIdx = results.indexOf(false);
  return {
    pass: failIdx === -1,
    results,
    firstFail: failIdx === -1 ? null : { failMessage: checks[failIdx].failMessage },
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/features/validation`
Expected: all pass. (If `computedStyle` tests fail under jsdom, keep `color` as the tested property — jsdom resolves inline `color` reliably.)

- [ ] **Step 6: Commit**

```bash
git add src/features/validation && git commit -m "feat: add declarative check engine with injectable dom evaluator"
```

---

### Task 8: Preview runtime + usePreview hook

**Files:**
- Create: `src/features/preview/runtime.ts`, `src/features/preview/usePreview.ts`
- Test: `src/features/preview/runtime.test.ts`

- [ ] **Step 1: Write the failing test `runtime.test.ts`** (the srcdoc builder is string assembly — testable; the hook is browser glue covered by Task 15's screen test + manual smoke)

```ts
import { buildSrcdoc } from './runtime';

describe('buildSrcdoc', () => {
  test('embeds user code after the bootstrap script', () => {
    const out = buildSrcdoc('<h1>Hello</h1>');
    expect(out).toContain('<h1>Hello</h1>');
    expect(out.indexOf('cc-bootstrap')).toBeLessThan(out.indexOf('<h1>Hello</h1>'));
  });

  test('bootstrap wires console bridge, error trap, check runner, ready ping', () => {
    const out = buildSrcdoc('');
    for (const marker of ['cc-console', 'cc-error', 'cc-run-checks', 'cc-check-results', 'cc-ready']) {
      expect(out).toContain(marker);
    }
  });

  test('injects the dom evaluator source', () => {
    expect(buildSrcdoc('')).toContain('function evaluateDomCheck');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/preview`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/features/preview/runtime.ts`**

```ts
import { evaluateDomCheck } from '../validation/checks';

/**
 * Wraps kid code in a srcdoc document with a bootstrap that:
 * - bridges console.log to the parent (cc-console)
 * - traps runtime errors (cc-error with line number)
 * - answers cc-run-checks by evaluating dom checks INSIDE the frame
 * - pings cc-ready on load (watchdog heartbeat)
 * Bootstrap comes FIRST so console/error capture precede user scripts.
 */
export function buildSrcdoc(code: string): string {
  const bootstrap = `<script id="cc-bootstrap">
(function () {
  var post = function (msg) { parent.postMessage(msg, '*'); };
  var origLog = console.log.bind(console);
  console.log = function () {
    var args = Array.prototype.slice.call(arguments);
    post({ type: 'cc-console', text: args.map(String).join(' ') });
    origLog.apply(null, args);
  };
  window.onerror = function (message, _src, line) {
    post({ type: 'cc-error', message: String(message), line: line || 0 });
    return true;
  };
  var evaluateDomCheck = ${evaluateDomCheck.toString()};
  window.addEventListener('message', function (event) {
    var data = event.data || {};
    if (data.type !== 'cc-run-checks') return;
    var results = (data.checks || []).map(function (c) {
      try { return evaluateDomCheck(c, document); } catch (e) { return false; }
    });
    post({ type: 'cc-check-results', id: data.id, results: results });
  });
  window.addEventListener('load', function () { post({ type: 'cc-ready' }); });
})();
</script>`;
  // Prepend, don't wrap: kid code may be a full document with its own
  // <style>/<script>. The browser parser creates the implied <html>/<body>
  // and merges everything; window 'load' still fires for the ready ping.
  return `${bootstrap}\n${code}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/preview`
Expected: 3 passed.

- [ ] **Step 5: Write `src/features/preview/usePreview.ts`** (browser glue — no unit test; exercised in Task 15 tests via mocking and the manual smoke)

```ts
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DomCheck } from '../validation/checks';
import { buildSrcdoc } from './runtime';

export interface RuntimeError {
  message: string;
  line: number;
}

const WATCHDOG_MS = 2000;
const CHECK_TIMEOUT_MS = 1500;

/**
 * Owns the sandboxed preview iframe state. `code` should already be
 * debounced by the caller. Watchdog: if cc-ready doesn't arrive within 2s of
 * a srcdoc change, the frame is declared stuck (likely infinite loop) —
 * caller shows a friendly message and we force a reload via key bump.
 */
export function usePreview(code: string) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [runtimeError, setRuntimeError] = useState<RuntimeError | null>(null);
  const [stuck, setStuck] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const pending = useRef(new Map<number, (results: boolean[]) => void>());
  const nextId = useRef(0);
  const readyRef = useRef(false);

  const srcdoc = buildSrcdoc(code);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data ?? {};
      switch (data.type) {
        case 'cc-console':
          setConsoleLines((lines) => [...lines, String(data.text)]);
          break;
        case 'cc-error':
          setRuntimeError({ message: String(data.message), line: Number(data.line) });
          break;
        case 'cc-ready':
          readyRef.current = true;
          setStuck(false);
          break;
        case 'cc-check-results':
          pending.current.get(data.id)?.(data.results as boolean[]);
          pending.current.delete(data.id);
          break;
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Reset per-render state and arm the watchdog whenever the doc changes.
  useEffect(() => {
    setConsoleLines([]);
    setRuntimeError(null);
    readyRef.current = false;
    const timer = setTimeout(() => {
      if (!readyRef.current) setStuck(true);
    }, WATCHDOG_MS);
    return () => clearTimeout(timer);
  }, [srcdoc, reloadKey]);

  const reload = useCallback(() => {
    setStuck(false);
    setReloadKey((k) => k + 1);
  }, []);

  const runDomChecks = useCallback((checks: DomCheck[]): Promise<boolean[]> => {
    return new Promise((resolve) => {
      const id = nextId.current++;
      pending.current.set(id, resolve);
      iframeRef.current?.contentWindow?.postMessage({ type: 'cc-run-checks', id, checks }, '*');
      setTimeout(() => {
        if (pending.current.has(id)) {
          pending.current.delete(id);
          resolve(checks.map(() => false)); // unresponsive frame = checks fail
        }
      }, CHECK_TIMEOUT_MS);
    });
  }, []);

  return { iframeRef, srcdoc, reloadKey, consoleLines, runtimeError, stuck, reload, runDomChecks };
}
```

- [ ] **Step 6: Typecheck and commit**

Run: `npm run typecheck`
Expected: clean.

```bash
git add src/features/preview && git commit -m "feat: add sandboxed preview runtime with console bridge and watchdog"
```

---

### Task 9: CodeMirror editor wrapper

**Files:**
- Create: `src/features/editor/CodeEditor.tsx`

CodeMirror doesn't run meaningfully under jsdom — **no unit test** (documented decision). Task 15's screen tests mock this component; the manual smoke covers real typing.

- [ ] **Step 1: Write `src/features/editor/CodeEditor.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';

interface CodeEditorProps {
  /** Initial document. Parent must remount (key=quest.id) to change it. */
  initialValue: string;
  onChange(value: string): void;
}

/**
 * Kid-friendly CodeMirror 6. All quests edit a full HTML document (lang-html
 * highlights nested CSS/JS too). Uncontrolled by design: CodeMirror owns the
 * text; React only hears about changes.
 */
export default function CodeEditor({ initialValue, onChange }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      doc: initialValue,
      parent: hostRef.current,
      extensions: [
        basicSetup,
        html(),
        EditorView.lineWrapping,
        EditorView.theme({
          '&': { fontSize: '15px', height: '100%' },
          '.cm-scroller': { fontFamily: 'ui-monospace, monospace' },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
      ],
    });
    return () => view.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only; remount via key
  }, []);

  return <div ref={hostRef} data-testid="code-editor" className="h-full overflow-hidden rounded-lg" />;
}
```

- [ ] **Step 2: Typecheck and commit**

Run: `npm run typecheck`
Expected: clean.

```bash
git add src/features/editor && git commit -m "feat: add CodeMirror 6 editor wrapper"
```

---

### Task 10: Audio manager (WebAudio synth)

Spec deviation (recorded in spec notes): synthesize Minecraft-y square-wave blips with WebAudio instead of sourcing CC0 files. Zero assets, instant load.

**Files:**
- Create: `src/features/audio/sounds.ts`
- Test: `src/features/audio/sounds.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { vi } from 'vitest';
import { playSound, _resetAudioForTests } from './sounds';
import { useSettings } from '../../stores/settingsStore';

function mockAudioContext() {
  const osc = {
    type: '', frequency: { value: 0 },
    connect: vi.fn().mockReturnThis(), start: vi.fn(), stop: vi.fn(),
  };
  const gain = {
    gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn().mockReturnThis(),
  };
  const ctx = {
    currentTime: 0, destination: {},
    createOscillator: vi.fn(() => osc),
    createGain: vi.fn(() => gain),
    resume: vi.fn(),
  };
  vi.stubGlobal('AudioContext', vi.fn(() => ctx));
  return { ctx, osc };
}

describe('playSound', () => {
  beforeEach(() => {
    _resetAudioForTests();
    useSettings.setState({ soundOn: true });
  });

  test('plays notes when sound is on', () => {
    const { ctx, osc } = mockAudioContext();
    playSound('pop');
    expect(ctx.createOscillator).toHaveBeenCalled();
    expect(osc.start).toHaveBeenCalled();
  });

  test('silent when sound is off', () => {
    const { ctx } = mockAudioContext();
    useSettings.setState({ soundOn: false });
    playSound('success');
    expect(ctx.createOscillator).not.toHaveBeenCalled();
  });

  test('never throws when AudioContext is unavailable', () => {
    vi.stubGlobal('AudioContext', undefined);
    expect(() => playSound('levelup')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/audio`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/features/audio/sounds.ts`**

```ts
import { useSettings } from '../../stores/settingsStore';

export type SoundName = 'pop' | 'success' | 'levelup' | 'badge';

// [frequency Hz, startOffset s, duration s]
const TUNES: Record<SoundName, Array<[number, number, number]>> = {
  pop: [[440, 0, 0.08]],
  success: [[659, 0, 0.1], [784, 0.1, 0.1], [1047, 0.2, 0.18]],
  levelup: [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1047, 0.36, 0.3]],
  badge: [[784, 0, 0.1], [1175, 0.1, 0.22]],
};

let ctx: AudioContext | null = null;

export function _resetAudioForTests(): void {
  ctx = null;
}

export function playSound(name: SoundName): void {
  if (!useSettings.getState().soundOn) return;
  try {
    if (!ctx) ctx = new AudioContext();
    void ctx.resume();
    const t0 = ctx.currentTime;
    for (const [freq, offset, dur] of TUNES[name]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, t0 + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + offset + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0 + offset);
      osc.stop(t0 + offset + dur);
    }
  } catch {
    // Audio is delight, never a crash.
  }
}
```

Note: the mock's `gain.connect` returns `this` (the gain mock), and `osc.stop` exists — if the test fails on a missing mock method, extend the mock, not the implementation.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/audio`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/features/audio && git commit -m "feat: add WebAudio sound effects"
```

---

### Task 11: UI components + app shell/router

**Files:**
- Create: `src/components/PixelButton.tsx`, `Panel.tsx`, `HoldToConfirm.tsx`, `XpBar.tsx`, `HudBar.tsx`, `VictoryOverlay.tsx`
- Create: `src/app/router.tsx`
- Create: placeholder screens (replaced by Tasks 12–17): `src/screens/TitleScreen.tsx`, `PlayersScreen.tsx`, `MapScreen.tsx`, `QuestScreen.tsx`, `InventoryScreen.tsx`, `SettingsScreen.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/components.test.tsx`

- [ ] **Step 1: Write `src/components/PixelButton.tsx`**

```tsx
import type { ButtonHTMLAttributes } from 'react';
import { playSound } from '../features/audio/sounds';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'grass' | 'stone' | 'danger';
}

const VARIANTS = {
  grass: 'bg-grass border-b-grass-dark text-white',
  stone: 'bg-stone border-b-night text-white',
  danger: 'bg-red-500 border-b-red-800 text-white',
};

export default function PixelButton({ variant = 'grass', className = '', onClick, ...rest }: PixelButtonProps) {
  return (
    <button
      {...rest}
      onClick={(e) => {
        playSound('pop');
        onClick?.(e);
      }}
      className={`rounded-md border-b-[5px] px-5 py-2.5 font-body font-black
        transition active:translate-y-0.5 active:border-b-2 disabled:opacity-40
        disabled:active:translate-y-0 cursor-pointer ${VARIANTS[variant]} ${className}`}
    />
  );
}
```

- [ ] **Step 2: Write `src/components/Panel.tsx`**

```tsx
import type { HTMLAttributes } from 'react';

/** Paper card with the chunky pixel border from index.css. */
export default function Panel({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={`pixel-border rounded-sm bg-paper p-4 ${className}`} />;
}
```

- [ ] **Step 3: Write `src/components/HoldToConfirm.tsx`**

```tsx
import { useRef, useState } from 'react';

interface HoldToConfirmProps {
  label: string;
  holdMs?: number;
  onConfirm(): void;
  className?: string;
}

/**
 * Parent-guard button: fires onConfirm only after an uninterrupted press of
 * holdMs (default 1500). Shows fill progress while holding.
 */
export default function HoldToConfirm({ label, holdMs = 1500, onConfirm, className = '' }: HoldToConfirmProps) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      onConfirm();
    }, holdMs);
  };
  const cancel = () => {
    setHolding(false);
    if (timer.current) clearTimeout(timer.current);
  };

  return (
    <button
      type="button"
      onMouseDown={start}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      onTouchStart={start}
      onTouchEnd={cancel}
      className={`relative overflow-hidden rounded-md border-b-[5px] border-b-red-800
        bg-red-500 px-5 py-2.5 font-body font-black text-white cursor-pointer ${className}`}
    >
      <span
        data-testid="hold-progress"
        className={`absolute inset-0 origin-left bg-red-800/50 ${holding ? 'scale-x-100' : 'scale-x-0'}`}
        style={{ transition: holding ? `transform ${holdMs}ms linear` : 'none' }}
      />
      <span className="relative">{label}</span>
    </button>
  );
}
```

- [ ] **Step 4: Write `src/components/XpBar.tsx`**

```tsx
import { rankForXp, nextRank } from '../features/progress/ranks';

export default function XpBar({ xp }: { xp: number }) {
  const rank = rankForXp(xp);
  const next = nextRank(xp);
  const pct = next
    ? Math.round(((xp - rank.minXp) / (next.minXp - rank.minXp)) * 100)
    : 100;
  return (
    <div className="flex items-center gap-2" title={`${xp} XP`}>
      <span className="font-pixel text-xs">{rank.icon}</span>
      <div className="h-3 w-28 rounded-full bg-night/30">
        <div
          data-testid="xp-fill"
          className="h-3 rounded-full bg-gradient-to-r from-grass to-diamond"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-pixel text-[10px] text-night">Lv{rank.level}</span>
    </div>
  );
}
```

- [ ] **Step 5: Write `src/components/HudBar.tsx`**

```tsx
import { Link } from 'react-router';
import { useActiveProfile } from '../stores/profileStore';
import { useSettings } from '../stores/settingsStore';
import { useT } from '../lib/i18n';
import { streakDisplay, todayString } from '../features/progress/streak';
import XpBar from './XpBar';

export default function HudBar() {
  const profile = useActiveProfile();
  const { lang, t } = useT();
  const { soundOn, toggleSound, setLang } = useSettings();
  if (!profile) return null;

  const streak = streakDisplay(profile.streak, todayString());

  return (
    <header className="flex items-center gap-4 bg-night/90 px-4 py-2 text-white">
      <Link to="/players" className="text-2xl" title={profile.name}>{profile.avatar}</Link>
      <span className="font-pixel text-xs">{profile.name}</span>
      <XpBar xp={profile.xp} />
      <span className="font-body font-bold" data-testid="streak">🔥{streak}</span>
      {/* Decorative hearts — no lives mechanic (spec §Gamification) */}
      <span aria-hidden className="text-sm tracking-tighter">❤️❤️❤️</span>
      <nav className="ml-auto flex items-center gap-3 font-body font-bold">
        <Link to="/map">🗺️ {t('worldMap')}</Link>
        <Link to="/inventory">🧰 {t('inventory')}</Link>
        <Link to="/settings">⚙️ {t('settings')}</Link>
        <button onClick={toggleSound} title={t('sound')} className="cursor-pointer">
          {soundOn ? '🔊' : '🔇'}
        </button>
        <button
          onClick={() => setLang(lang === 'en' ? 'vi' : 'en')}
          className="cursor-pointer font-pixel text-[10px] uppercase"
          data-testid="lang-toggle"
        >
          {lang}
        </button>
      </nav>
    </header>
  );
}
```

- [ ] **Step 6: Write `src/components/VictoryOverlay.tsx`**

```tsx
import type { Rewards } from '../lib/types';
import { BADGES } from '../content/badges';
import { ACHIEVEMENTS } from '../features/progress/achievements';
import { useT } from '../lib/i18n';
import Panel from './Panel';
import PixelButton from './PixelButton';

interface VictoryOverlayProps {
  rewards: Rewards;
  hasNext: boolean;
  onNext(): void;
  onBackToMap(): void;
}

export default function VictoryOverlay({ rewards, hasNext, onNext, onBackToMap }: VictoryOverlayProps) {
  const { t, tl } = useT();
  const badge = rewards.newBadge ? BADGES.find((b) => b.id === rewards.newBadge) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/80" role="dialog">
      <Panel className="w-96 text-center">
        <h2 className="font-pixel text-lg text-grass-dark">🎉 {t('victory')}</h2>
        <p className="mt-3 font-body text-xl font-black">
          +{rewards.xpGained} {t('xpGained')}
          {rewards.dailyBonus && <span className="ml-2 text-gold">☀️ {t('dailyBonus')}</span>}
        </p>
        {rewards.leveledUp && (
          <p className="mt-2 animate-bounce font-pixel text-sm text-gold">⬆️ {t('levelUp')}</p>
        )}
        {badge && (
          <p className="mt-2 font-body font-bold">
            {t('newBadge')} <span className="text-2xl">{badge.icon}</span> {tl(badge.name)}
          </p>
        )}
        {rewards.newAchievements.map((id) => {
          const a = ACHIEVEMENTS.find((x) => x.id === id);
          return a ? (
            <p key={id} className="mt-1 font-body font-bold text-dirt">
              {a.icon} {t('newAchievement')} {tl(a.name)}
            </p>
          ) : null;
        })}
        <div className="mt-5 flex justify-center gap-3">
          <PixelButton variant="stone" onClick={onBackToMap}>{t('backToMap')}</PixelButton>
          {hasNext && <PixelButton onClick={onNext}>{t('nextQuest')} →</PixelButton>}
        </div>
      </Panel>
    </div>
  );
}
```

Note: imports `BADGES` from `src/content/badges` — Task 11 creates a stub so this compiles; Task 18 fills it:

`src/content/badges.ts` (stub for now):

```ts
import type { BadgeDef } from '../lib/types';

export const BADGES: BadgeDef[] = []; // Task 18 fills all 30
```

- [ ] **Step 7: Write placeholder screens** — all six follow this exact pattern (swap the name):

```tsx
export default function TitleScreen() {
  return <div data-testid="title-screen">TitleScreen</div>;
}
```

- [ ] **Step 8: Write `src/app/router.tsx`**

```tsx
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router';
import { useProfiles } from '../stores/profileStore';
import HudBar from '../components/HudBar';
import TitleScreen from '../screens/TitleScreen';
import PlayersScreen from '../screens/PlayersScreen';
import MapScreen from '../screens/MapScreen';
import QuestScreen from '../screens/QuestScreen';
import InventoryScreen from '../screens/InventoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

/** Game routes need an active profile; otherwise bounce to player select. */
function RequireProfile() {
  const activeId = useProfiles((s) => s.activeId);
  const location = useLocation();
  if (!activeId) return <Navigate to="/players" replace state={{ from: location }} />;
  return (
    <div className="flex min-h-screen flex-col">
      <HudBar />
      <main className="flex-1"><Outlet /></main>
    </div>
  );
}

export const routes = [
  { path: '/', element: <TitleScreen /> },
  { path: '/players', element: <PlayersScreen /> },
  {
    element: <RequireProfile />,
    children: [
      { path: '/map', element: <MapScreen /> },
      { path: '/quest/:id', element: <QuestScreen /> },
      { path: '/inventory', element: <InventoryScreen /> },
      { path: '/settings', element: <SettingsScreen /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
```

- [ ] **Step 9: Replace `src/App.tsx`**

```tsx
import { RouterProvider } from 'react-router';
import { router } from './app/router';

export default function App() {
  return <RouterProvider router={router} />;
}
```

Also update `src/App.test.tsx` — the old smoke test breaks (router needs a DOM history). Replace with:

```tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from './app/router';

test('renders title screen at /', async () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] });
  render(<RouterProvider router={router} />);
  expect(await screen.findByTestId('title-screen')).toBeInTheDocument();
});

test('game routes redirect to /players when no profile is active', async () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/map'] });
  render(<RouterProvider router={router} />);
  expect(await screen.findByTestId('players-screen')).toBeInTheDocument();
});
```

(The placeholder screens carry `data-testid="title-screen"` / `"players-screen"` etc.)

- [ ] **Step 10: Write the failing component tests `src/components/components.test.tsx`**

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import PixelButton from './PixelButton';
import HoldToConfirm from './HoldToConfirm';
import XpBar from './XpBar';

vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

describe('PixelButton', () => {
  test('fires onClick', () => {
    const onClick = vi.fn();
    render(<PixelButton onClick={onClick}>Go</PixelButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('HoldToConfirm', () => {
  test('confirms only after full hold; early release cancels', () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    render(<HoldToConfirm label="Reset" holdMs={1500} onConfirm={onConfirm} />);
    const btn = screen.getByRole('button', { name: 'Reset' });

    fireEvent.mouseDown(btn);
    act(() => vi.advanceTimersByTime(800));
    fireEvent.mouseUp(btn);
    act(() => vi.advanceTimersByTime(2000));
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.mouseDown(btn);
    act(() => vi.advanceTimersByTime(1500));
    expect(onConfirm).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});

describe('XpBar', () => {
  test('fills proportionally within the current rank', () => {
    render(<XpBar xp={100} />); // dirt 0 → stone 200: 50%
    expect(screen.getByTestId('xp-fill')).toHaveStyle({ width: '50%' });
  });
  test('caps at 100% at max rank', () => {
    render(<XpBar xp={9999} />);
    expect(screen.getByTestId('xp-fill')).toHaveStyle({ width: '100%' });
  });
});
```

- [ ] **Step 11: Run all tests, typecheck**

Run: `npm run test:run && npm run typecheck`
Expected: all pass (App tests + component tests + earlier suites).

- [ ] **Step 12: Commit**

```bash
git add -A && git commit -m "feat: add UI component kit, router, and app shell"
```

---

### Task 12: Title screen

**Files:**
- Modify: `src/screens/TitleScreen.tsx` (replace placeholder)
- Test: `src/screens/TitleScreen.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import { routes } from '../app/router';
import { useSettings } from '../stores/settingsStore';

vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('TitleScreen', () => {
  beforeEach(() => useSettings.setState({ lang: 'en' }));

  test('start button navigates to player select', async () => {
    const router = renderAt('/');
    fireEvent.click(await screen.findByRole('button', { name: /press start/i }));
    expect(router.state.location.pathname).toBe('/players');
  });

  test('language toggle switches UI text', async () => {
    renderAt('/');
    fireEvent.click(await screen.findByTestId('lang-toggle-title'));
    expect(await screen.findByRole('button', { name: /bắt đầu/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/TitleScreen.test.tsx`
Expected: FAIL — placeholder has no button.

- [ ] **Step 3: Write `src/screens/TitleScreen.tsx`**

```tsx
import { useNavigate } from 'react-router';
import { useSettings } from '../stores/settingsStore';
import { useT } from '../lib/i18n';
import PixelButton from '../components/PixelButton';

export default function TitleScreen() {
  const navigate = useNavigate();
  const { lang, t } = useT();
  const setLang = useSettings((s) => s.setLang);

  return (
    <div data-testid="title-screen" className="bg-world flex min-h-screen flex-col items-center justify-center gap-8">
      <button
        data-testid="lang-toggle-title"
        onClick={() => setLang(lang === 'en' ? 'vi' : 'en')}
        className="absolute right-4 top-4 cursor-pointer font-pixel text-xs text-white drop-shadow"
      >
        🌐 {lang.toUpperCase()}
      </button>
      <h1 className="font-pixel text-5xl text-white [text-shadow:4px_4px_0_#3d8527]">
        ⛏️ CodeCraft
      </h1>
      <p className="font-body text-xl font-bold text-night">{t('tagline')}</p>
      <PixelButton className="text-xl" onClick={() => navigate('/players')}>
        ▶ {t('pressStart')}
      </PixelButton>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes, commit**

Run: `npx vitest run src/screens/TitleScreen.test.tsx`
Expected: 2 passed.

```bash
git add src/screens/TitleScreen.* && git commit -m "feat: add title screen"
```

---

### Task 13: Players screen (profile select)

**Files:**
- Modify: `src/screens/PlayersScreen.tsx` (replace placeholder)
- Test: `src/screens/PlayersScreen.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import { routes } from '../app/router';
import { useProfiles } from '../stores/profileStore';

vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

function renderAt(path = '/players') {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  localStorage.clear();
  useProfiles.setState({ profiles: [], activeId: null });
});

describe('PlayersScreen', () => {
  test('creates a profile through the new-player form', async () => {
    renderAt();
    fireEvent.click(await screen.findByRole('button', { name: /new player/i }));
    fireEvent.change(screen.getByPlaceholderText(/your name/i), { target: { value: 'Mai' } });
    fireEvent.click(screen.getByRole('radio', { name: '🦊' }));
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));
    expect(useProfiles.getState().profiles[0]).toMatchObject({ name: 'Mai', avatar: '🦊' });
  });

  test('create is disabled with empty name', async () => {
    renderAt();
    fireEvent.click(await screen.findByRole('button', { name: /new player/i }));
    expect(screen.getByRole('button', { name: /^create$/i })).toBeDisabled();
  });

  test('selecting a profile activates it and navigates to map', async () => {
    useProfiles.getState().create('Tom', '🐺');
    const router = renderAt();
    fireEvent.click(await screen.findByRole('button', { name: /tom/i }));
    expect(useProfiles.getState().activeId).toBe(useProfiles.getState().profiles[0].id);
    expect(router.state.location.pathname).toBe('/map');
  });

  test('hold-to-delete removes a profile', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useProfiles.getState().create('Tom', '🐺');
    renderAt();
    const del = await screen.findByRole('button', { name: /hold to delete/i });
    fireEvent.mouseDown(del);
    act(() => void vi.advanceTimersByTime(1600));
    expect(useProfiles.getState().profiles).toHaveLength(0);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/screens/PlayersScreen.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write `src/screens/PlayersScreen.tsx`**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useProfiles } from '../stores/profileStore';
import { rankForXp } from '../features/progress/ranks';
import { useT } from '../lib/i18n';
import Panel from '../components/Panel';
import PixelButton from '../components/PixelButton';
import HoldToConfirm from '../components/HoldToConfirm';

export const AVATARS = ['🟩', '🐷', '🦊', '🐺', '💀', '🤖', '🐱', '🐸'];
const MAX_NAME = 12;

export default function PlayersScreen() {
  const { profiles, create, remove, select } = useProfiles();
  const navigate = useNavigate();
  const { t, tl } = useT();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  const submit = () => {
    create(name.trim(), avatar);
    setCreating(false);
    setName('');
  };

  return (
    <div data-testid="players-screen" className="bg-world flex min-h-screen flex-col items-center gap-8 pt-16">
      <h1 className="font-pixel text-2xl text-white [text-shadow:3px_3px_0_#3d8527]">
        {t('choosePlayer')}
      </h1>
      <div className="flex flex-wrap justify-center gap-6">
        {profiles.map((p) => (
          <Panel key={p.id} className="flex w-44 flex-col items-center gap-2">
            <button
              onClick={() => { select(p.id); navigate('/map'); }}
              className="flex cursor-pointer flex-col items-center gap-1"
              aria-label={p.name}
            >
              <span className="text-6xl">{p.avatar}</span>
              <span className="font-body text-lg font-black">{p.name}</span>
              <span className="font-pixel text-[10px]">
                {rankForXp(p.xp).icon} {tl(rankForXp(p.xp).name)}
              </span>
            </button>
            <HoldToConfirm label={t('holdToDelete')} onConfirm={() => remove(p.id)} className="text-xs" />
          </Panel>
        ))}

        {creating ? (
          <Panel className="flex w-64 flex-col gap-3">
            <input
              autoFocus
              value={name}
              maxLength={MAX_NAME}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('playerName')}
              className="rounded border-2 border-stone p-2 font-body font-bold"
            />
            <p className="font-body text-sm font-bold">{t('pickAvatar')}</p>
            <div role="radiogroup" className="grid grid-cols-4 gap-1 text-3xl">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  role="radio"
                  aria-checked={avatar === a}
                  aria-label={a}
                  onClick={() => setAvatar(a)}
                  className={`cursor-pointer rounded p-1 ${avatar === a ? 'bg-grass/40 ring-2 ring-grass-dark' : ''}`}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <PixelButton disabled={name.trim() === ''} onClick={submit}>{t('create')}</PixelButton>
              <PixelButton variant="stone" onClick={() => setCreating(false)}>{t('cancel')}</PixelButton>
            </div>
          </Panel>
        ) : (
          <Panel className="flex w-44 items-center justify-center">
            <PixelButton onClick={() => setCreating(true)}>＋ {t('newPlayer')}</PixelButton>
          </Panel>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass, commit**

Run: `npx vitest run src/screens/PlayersScreen.test.tsx`
Expected: 4 passed.

```bash
git add src/screens/PlayersScreen.* && git commit -m "feat: add player profile select screen"
```

---

### Task 14: Map screen

**Files:**
- Modify: `src/screens/MapScreen.tsx` (replace placeholder)
- Test: `src/screens/MapScreen.test.tsx`

Depends on `src/content/quests` existing — Task 11 made `badges.ts`; make the quests stub now, Task 18 fills it.

- [ ] **Step 1: Create the content stub `src/content/quests/index.ts`**

```ts
import type { Quest, WorldId } from '../../lib/types';

// Tasks 18–20 fill these from real quest files.
export const ALL_QUESTS: Quest[] = [];

export const QUESTS_BY_WORLD: Record<WorldId, Quest[]> = {
  html: ALL_QUESTS.filter((q) => q.world === 'html'),
  css: ALL_QUESTS.filter((q) => q.world === 'css'),
  js: ALL_QUESTS.filter((q) => q.world === 'js'),
};

export const QUESTS_BY_WORLD_IDS: Record<WorldId, string[]> = {
  html: QUESTS_BY_WORLD.html.map((q) => q.id),
  css: QUESTS_BY_WORLD.css.map((q) => q.id),
  js: QUESTS_BY_WORLD.js.map((q) => q.id),
};

export const questById = (id: string): Quest | undefined =>
  ALL_QUESTS.find((q) => q.id === id);

/** Next quest in the same world, else first quest of the next world, else null. */
export function nextQuest(id: string): Quest | null {
  const idx = ALL_QUESTS.findIndex((q) => q.id === id);
  if (idx === -1 || idx === ALL_QUESTS.length - 1) return null;
  return ALL_QUESTS[idx + 1];
}
```

And `src/content/worlds.ts` (real now — it's tiny):

```ts
import type { World } from '../lib/types';

export const WORLDS: World[] = [
  {
    id: 'html', icon: '🟫',
    name: { en: 'HTML Grasslands', vi: 'Đồng cỏ HTML' },
    tagline: { en: 'Build with blocks of text', vi: 'Xây dựng bằng các khối văn bản' },
  },
  {
    id: 'css', icon: '🟦',
    name: { en: 'CSS Caves', vi: 'Hang động CSS' },
    tagline: { en: 'Paint and decorate your world', vi: 'Tô màu và trang trí thế giới' },
  },
  {
    id: 'js', icon: '🟨',
    name: { en: 'JS Redstone Mines', vi: 'Mỏ Redstone JS' },
    tagline: { en: 'Make things move and think', vi: 'Làm mọi thứ chuyển động và suy nghĩ' },
  },
];
```

- [ ] **Step 2: Write the failing tests `src/screens/MapScreen.test.tsx`**

Tests can't rely on real content (empty until Task 18) — mock the quest module:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import type { Quest, WorldId } from '../lib/types';

const L = (s: string) => ({ en: s, vi: s });
const makeQuest = (id: string, world: WorldId): Quest => ({
  id, world, xp: 50, badge: `b-${id}`,
  title: L(`Quest ${id}`), story: L('s'), steps: [], starterCode: '',
  checks: [{ type: 'codeIncludes', value: 'x', failMessage: L('f') }],
});

const QUESTS = [makeQuest('html-01', 'html'), makeQuest('html-02', 'html'), makeQuest('css-01', 'css')];

vi.mock('../content/quests', () => {
  const byWorld = (w: string) => QUESTS.filter((q) => q.world === w);
  return {
    ALL_QUESTS: QUESTS,
    QUESTS_BY_WORLD: { html: byWorld('html'), css: byWorld('css'), js: byWorld('js') },
    QUESTS_BY_WORLD_IDS: { html: ['html-01', 'html-02'], css: ['css-01'], js: [] },
    questById: (id: string) => QUESTS.find((q) => q.id === id),
    nextQuest: () => null,
  };
});
vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

import { routes } from '../app/router';
import { useProfiles } from '../stores/profileStore';

function renderMap() {
  useProfiles.getState().create('Mai', '🦊');
  useProfiles.getState().select(useProfiles.getState().profiles[0].id);
  const router = createMemoryRouter(routes, { initialEntries: ['/map'] });
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  localStorage.clear();
  useProfiles.setState({ profiles: [], activeId: null });
});

describe('MapScreen', () => {
  test('first quest is current (clickable), rest locked', async () => {
    const router = renderMap();
    fireEvent.click(await screen.findByRole('button', { name: /quest html-01/i }));
    expect(router.state.location.pathname).toBe('/quest/html-01');
    expect(screen.getByRole('button', { name: /quest html-02/i })).toBeDisabled();
  });

  test('locked world shows lock and disabled quests', async () => {
    renderMap();
    expect((await screen.findAllByText(/🔒/)).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /quest css-01/i })).toBeDisabled();
  });

  test('done quests are replayable', async () => {
    useProfiles.getState().create('Mai', '🦊');
    useProfiles.getState().select(useProfiles.getState().profiles[0].id);
    useProfiles.setState((s) => ({
      profiles: s.profiles.map((p) => ({
        ...p, quests: { 'html-01': { completedAt: '2026-06-05', usedHint: false } },
      })),
    }));
    const router = createMemoryRouter(routes, { initialEntries: ['/map'] });
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: /quest html-01/i }));
    expect(router.state.location.pathname).toBe('/quest/html-01');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/screens/MapScreen.test.tsx`
Expected: FAIL.

- [ ] **Step 4: Write `src/screens/MapScreen.tsx`**

```tsx
import { useNavigate } from 'react-router';
import { WORLDS } from '../content/worlds';
import { QUESTS_BY_WORLD } from '../content/quests';
import { useActiveProfile } from '../stores/profileStore';
import { questStatus, worldUnlocked } from '../features/progress/unlocks';
import { useT } from '../lib/i18n';
import Panel from '../components/Panel';

const STATUS_ICON = { done: '✅', current: '⛏️', locked: '🔒' } as const;

export default function MapScreen() {
  const profile = useActiveProfile();
  const navigate = useNavigate();
  const { t, tl } = useT();
  if (!profile) return null;

  return (
    <div data-testid="map-screen" className="bg-world min-h-full p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {WORLDS.map((world) => {
          const unlocked = worldUnlocked(world.id, profile, QUESTS_BY_WORLD);
          return (
            <Panel key={world.id} className={unlocked ? '' : 'opacity-70'}>
              <h2 className="font-pixel text-sm text-grass-dark">
                {world.icon} {tl(world.name)} {!unlocked && `🔒 ${t('locked')}`}
              </h2>
              <p className="mt-1 font-body text-sm font-bold text-stone">{tl(world.tagline)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUESTS_BY_WORLD[world.id].map((quest, i) => {
                  const status = questStatus(quest, profile, QUESTS_BY_WORLD);
                  return (
                    <button
                      key={quest.id}
                      disabled={status === 'locked'}
                      onClick={() => navigate(`/quest/${quest.id}`)}
                      title={tl(quest.title)}
                      aria-label={`${t('questLabel')} ${quest.id}`}
                      className={`flex h-14 w-14 cursor-pointer flex-col items-center justify-center
                        rounded-md font-body font-black text-white mc-bevel
                        disabled:cursor-not-allowed
                        ${status === 'done' ? 'bg-grass' : status === 'current' ? 'bg-gold animate-pulse' : 'bg-stone'}`}
                    >
                      <span>{STATUS_ICON[status]}</span>
                      <span className="text-xs">{i + 1}</span>
                    </button>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass, commit**

Run: `npx vitest run src/screens/MapScreen.test.tsx`
Expected: 3 passed.

```bash
git add src/screens/MapScreen.* src/content && git commit -m "feat: add world map with lock/unlock progression"
```

---

### Task 15: Quest screen (the core loop)

Layout B from spec: lesson panel left; editor top-right; preview bottom-right. Type → debounced preview → "Check my code" → friendly fail message OR victory overlay.

**Files:**
- Modify: `src/screens/QuestScreen.tsx` (replace placeholder)
- Test: `src/screens/QuestScreen.test.tsx`

- [ ] **Step 1: Write the failing tests**

CodeEditor and usePreview are browser glue — mock both. The test drives the same props/contract the real ones implement.

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import type { Quest } from '../lib/types';

const L = (en: string, vi?: string) => ({ en, vi: vi ?? en });

const QUEST: Quest = {
  id: 'html-01', world: 'html', xp: 50, badge: 'b-wood',
  title: L('Hello, World!'), story: L('A villager needs a sign.'),
  steps: [
    { text: L('Write a p tag'), hint: L('Like <p>hi</p>') },
    { text: L('Say Hello') },
  ],
  starterCode: '<!-- type here -->',
  checks: [
    { type: 'codeIncludes', value: '<p>', failMessage: L('No <p> yet!') },
  ],
};

vi.mock('../content/quests', () => ({
  ALL_QUESTS: [QUEST],
  QUESTS_BY_WORLD: { html: [QUEST], css: [], js: [] },
  QUESTS_BY_WORLD_IDS: { html: ['html-01'], css: [], js: [] },
  questById: (id: string) => (id === 'html-01' ? QUEST : undefined),
  nextQuest: () => null,
}));
vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

// Editor mock: a textarea honoring the same contract.
vi.mock('../features/editor/CodeEditor', () => ({
  default: ({ initialValue, onChange }: { initialValue: string; onChange: (v: string) => void }) => (
    <textarea
      data-testid="code-editor"
      defaultValue={initialValue}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// Preview mock: checks resolve true; surface srcdoc for assertions.
const runDomChecks = vi.fn(async (checks: unknown[]) => checks.map(() => true));
vi.mock('../features/preview/usePreview', () => ({
  usePreview: (code: string) => ({
    iframeRef: { current: null }, srcdoc: `SRC:${code}`, reloadKey: 0,
    consoleLines: [], runtimeError: null, stuck: false,
    reload: vi.fn(), runDomChecks,
  }),
}));

import { routes } from '../app/router';
import { useProfiles } from '../stores/profileStore';

function renderQuest() {
  useProfiles.getState().create('Mai', '🦊');
  useProfiles.getState().select(useProfiles.getState().profiles[0].id);
  const router = createMemoryRouter(routes, { initialEntries: ['/quest/html-01'] });
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useProfiles.setState({ profiles: [], activeId: null });
});
afterEach(() => vi.useRealTimers());

describe('QuestScreen', () => {
  test('renders story, steps, starter code', async () => {
    renderQuest();
    expect(await screen.findByText(/a villager needs a sign/i)).toBeInTheDocument();
    expect(screen.getByText(/write a p tag/i)).toBeInTheDocument();
    expect(screen.getByTestId('code-editor')).toHaveValue('<!-- type here -->');
  });

  test('failing check shows friendly message, no victory', async () => {
    renderQuest();
    fireEvent.click(await screen.findByRole('button', { name: /check my code/i }));
    expect(await screen.findByText('No <p> yet!')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('passing check completes quest and shows victory overlay', async () => {
    renderQuest();
    fireEvent.change(await screen.findByTestId('code-editor'), { target: { value: '<p>Hello</p>' } });
    fireEvent.click(screen.getByRole('button', { name: /check my code/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(useProfiles.getState().profiles[0].quests['html-01']).toBeDefined();
  });

  test('opening a hint marks completion as hint-assisted', async () => {
    renderQuest();
    fireEvent.click(await screen.findByRole('button', { name: /hint/i }));
    expect(await screen.findByText(/like <p>hi<\/p>/i)).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('code-editor'), { target: { value: '<p>Hello</p>' } });
    fireEvent.click(screen.getByRole('button', { name: /check my code/i }));
    await screen.findByRole('dialog');
    expect(useProfiles.getState().profiles[0].quests['html-01'].usedHint).toBe(true);
  });

  test('preview updates after debounce', async () => {
    renderQuest();
    fireEvent.change(await screen.findByTestId('code-editor'), { target: { value: '<p>x</p>' } });
    act(() => void vi.advanceTimersByTime(350));
    expect(screen.getByTitle(/preview/i)).toHaveAttribute('srcdoc', 'SRC:<p>x</p>');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/screens/QuestScreen.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write `src/screens/QuestScreen.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { Localized, Rewards } from '../lib/types';
import { questById, nextQuest, QUESTS_BY_WORLD } from '../content/quests';
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
      code: debounced,
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
            🟥 {tl(failMessage)}
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
```

Implementation notes:
- Navigating to the next quest remounts the screen via route param change; all `useState` initializers re-run because the router renders a fresh element per `:id`. If state leaks between quests, add `key={quest.id}` to the screen's root from the router (verify in the smoke test).
- The JS-world console panel doubles as the data source for `consoleIncludes` checks — those read `preview.consoleLines`, which exist because the preview ran the code already.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/screens/QuestScreen.test.tsx`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/screens/QuestScreen.* && git commit -m "feat: add quest screen with editor, live preview, and check flow"
```

---

### Task 16: Inventory screen

**Files:**
- Modify: `src/screens/InventoryScreen.tsx` (replace placeholder)
- Test: `src/screens/InventoryScreen.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';

vi.mock('../content/badges', () => ({
  BADGES: [
    { id: 'b-wood', icon: '🪵', name: { en: 'Wood', vi: 'Gỗ' } },
    { id: 'b-sign', icon: '🪧', name: { en: 'Sign', vi: 'Biển' } },
  ],
}));
vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

import { routes } from '../app/router';
import { useProfiles } from '../stores/profileStore';

beforeEach(() => {
  localStorage.clear();
  useProfiles.setState({ profiles: [], activeId: null });
});

function renderInventory(badges: string[] = []) {
  useProfiles.getState().create('Mai', '🦊');
  const id = useProfiles.getState().profiles[0].id;
  useProfiles.setState((s) => ({
    profiles: s.profiles.map((p) => ({
      ...p, badges,
      quests: { 'html-01': { completedAt: '2026-06-05', usedHint: false } },
      bestStreak: 4,
    })),
  }));
  useProfiles.getState().select(id);
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/inventory'] })} />);
}

describe('InventoryScreen', () => {
  test('owned badges bright, unowned dimmed', async () => {
    renderInventory(['b-wood']);
    expect(await screen.findByTestId('badge-b-wood')).not.toHaveClass('grayscale');
    expect(screen.getByTestId('badge-b-sign')).toHaveClass('grayscale');
  });

  test('shows stats', async () => {
    renderInventory();
    expect(await screen.findByText(/quests completed/i)).toBeInTheDocument();
    expect(screen.getByTestId('stat-quests')).toHaveTextContent('1');
    expect(screen.getByTestId('stat-streak')).toHaveTextContent('4');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/screens/InventoryScreen.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write `src/screens/InventoryScreen.tsx`**

```tsx
import { BADGES } from '../content/badges';
import { ACHIEVEMENTS } from '../features/progress/achievements';
import { useActiveProfile } from '../stores/profileStore';
import { useT } from '../lib/i18n';
import Panel from '../components/Panel';

export default function InventoryScreen() {
  const profile = useActiveProfile();
  const { t, tl } = useT();
  if (!profile) return null;

  return (
    <div data-testid="inventory-screen" className="bg-world min-h-full p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Panel>
          <h2 className="font-pixel text-sm text-grass-dark">🧰 {t('badges')}</h2>
          <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-10">
            {BADGES.map((badge) => {
              const owned = profile.badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  data-testid={`badge-${badge.id}`}
                  title={tl(badge.name)}
                  className={`mc-bevel flex h-12 w-12 items-center justify-center rounded
                    bg-dirt-light text-2xl ${owned ? '' : 'opacity-30 grayscale'}`}
                >
                  {badge.icon}
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <h2 className="font-pixel text-sm text-grass-dark">🏆 {t('achievements')}</h2>
          <ul className="mt-3 flex flex-col gap-1">
            {ACHIEVEMENTS.map((a) => {
              const earned = profile.achievements.includes(a.id);
              return (
                <li key={a.id} className={`font-body font-bold ${earned ? '' : 'opacity-40'}`}>
                  {a.icon} {tl(a.name)} — <span className="text-sm">{tl(a.desc)}</span> {earned && '✅'}
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel>
          <h2 className="font-pixel text-sm text-grass-dark">📊 {t('stats')}</h2>
          <p className="mt-2 font-body font-bold">
            {t('questsDone')}: <span data-testid="stat-quests">{Object.keys(profile.quests).length}</span>
          </p>
          <p className="font-body font-bold">
            {t('bestStreak')}: 🔥<span data-testid="stat-streak">{profile.bestStreak}</span>
          </p>
        </Panel>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass, commit**

Run: `npx vitest run src/screens/InventoryScreen.test.tsx`
Expected: 2 passed.

```bash
git add src/screens/InventoryScreen.* && git commit -m "feat: add inventory screen with badges, achievements, stats"
```

---

### Task 17: Settings screen

**Files:**
- Modify: `src/screens/SettingsScreen.tsx` (replace placeholder)
- Test: `src/screens/SettingsScreen.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';

vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

import { routes } from '../app/router';
import { useProfiles } from '../stores/profileStore';
import { useSettings } from '../stores/settingsStore';

beforeEach(() => {
  localStorage.clear();
  useProfiles.setState({ profiles: [], activeId: null });
  useSettings.setState({ lang: 'en', soundOn: true });
});

function renderSettings() {
  useProfiles.getState().create('Mai', '🦊');
  const id = useProfiles.getState().profiles[0].id;
  useProfiles.setState((s) => ({
    profiles: s.profiles.map((p) => ({ ...p, xp: 100 })),
  }));
  useProfiles.getState().select(id);
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/settings'] })} />);
}

describe('SettingsScreen', () => {
  test('language radios switch the app language', async () => {
    renderSettings();
    fireEvent.click(await screen.findByRole('radio', { name: /tiếng việt/i }));
    expect(useSettings.getState().lang).toBe('vi');
  });

  test('sound toggle flips setting', async () => {
    renderSettings();
    fireEvent.click(await screen.findByRole('checkbox', { name: /sound/i }));
    expect(useSettings.getState().soundOn).toBe(false);
  });

  test('hold-to-reset zeroes active profile progress', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderSettings();
    const btn = await screen.findByRole('button', { name: /hold to reset/i });
    fireEvent.mouseDown(btn);
    act(() => void vi.advanceTimersByTime(2100));
    expect(useProfiles.getState().profiles[0].xp).toBe(0);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/screens/SettingsScreen.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write `src/screens/SettingsScreen.tsx`**

```tsx
import { useState } from 'react';
import type { Lang } from '../lib/types';
import { useSettings } from '../stores/settingsStore';
import { useProfiles } from '../stores/profileStore';
import { useT } from '../lib/i18n';
import Panel from '../components/Panel';
import HoldToConfirm from '../components/HoldToConfirm';

const LANGS: Array<{ value: Lang; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt' },
];

export default function SettingsScreen() {
  const { lang, soundOn, setLang, toggleSound } = useSettings();
  const resetActive = useProfiles((s) => s.resetActive);
  const { t } = useT();
  const [resetDone, setResetDone] = useState(false);

  return (
    <div data-testid="settings-screen" className="bg-world min-h-full p-6">
      <Panel className="mx-auto flex max-w-md flex-col gap-5">
        <h1 className="font-pixel text-sm text-grass-dark">⚙️ {t('settings')}</h1>

        <fieldset>
          <legend className="font-body font-black">🌐 {t('language')}</legend>
          <div className="mt-2 flex gap-4">
            {LANGS.map(({ value, label }) => (
              <label key={value} className="flex cursor-pointer items-center gap-1 font-body font-bold">
                <input
                  type="radio"
                  name="lang"
                  checked={lang === value}
                  onChange={() => setLang(value)}
                  aria-label={label}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-center gap-2 font-body font-black">
          <input type="checkbox" checked={soundOn} onChange={toggleSound} aria-label={t('sound')} />
          🔊 {t('sound')}: {soundOn ? t('on') : t('off')}
        </label>

        <div>
          <p className="mb-2 font-body font-black text-red-700">⚠️ {t('resetProgress')}</p>
          <HoldToConfirm
            label={t('holdToReset')}
            holdMs={2000}
            onConfirm={() => { resetActive(); setResetDone(true); }}
          />
          {resetDone && <p className="mt-2 font-body font-bold">{t('resetDone')}</p>}
        </div>
      </Panel>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass, commit**

Run: `npx vitest run src/screens/SettingsScreen.test.tsx`
Expected: 3 passed.

```bash
git add src/screens/SettingsScreen.* && git commit -m "feat: add settings screen with language, sound, reset"
```

---

## Content Tasks (18–20): shared writing rules

The quest **structure** (ids, checks, XP, badges, starter code shape) is fully specified in the tables below. The **prose** (story, steps, hints, fail messages + Vietnamese translations) is authored during implementation under these rules — they are requirements, not suggestions:

- **Reading level:** ages 9–12. Short sentences. Explain every new word once.
- **Tone:** playful Minecraft flavor — villagers, creepers (cartoon "sss…", nothing scary), mining, crafting, biomes. Kid is "you", a builder/miner.
- **story:** 1–2 sentences setting up why the code matters in-world.
- **steps:** 2–4 per quest (boss quests up to 6). Each step = one concrete action naming the exact tag/property/function. Any step introducing new syntax gets a `hint` containing a tiny example snippet.
- **failMessage:** teaches, never scolds — name what's missing and nudge ("Hmm, I don't see an `<h1>` yet — signs need a big title!").
- **Vietnamese:** natural kid-friendly Vietnamese, not literal translation. Code terms (tag names, properties, keywords) stay in English.
- **starterCode:** valid HTML that renders something, with `<!-- -->` scaffold comments telling the kid where to type. CSS quests start with a filled `<body>` and an empty/partial `<style>`. JS quests start with HTML + `<script>` containing a comment marker.

### Task 18: Badges + HTML Grasslands quests

**Files:**
- Modify: `src/content/badges.ts` (replace stub with all 30)
- Create: `src/content/quests/html/q01.ts` … `q10.ts`, `src/content/quests/html/index.ts`
- Create: `src/content/quests/css/index.ts`, `src/content/quests/js/index.ts` (empty barrels for now)
- Modify: `src/content/quests/index.ts` (wire real content)
- Modify: `src/stores/profileStore.ts` (swap placeholder import)

- [ ] **Step 1: Fill `src/content/badges.ts`** — all 30, ids/icons exactly as the quest tables reference:

```ts
import type { BadgeDef } from '../lib/types';

export const BADGES: BadgeDef[] = [
  // HTML Grasslands
  { id: 'b-wood', icon: '🪵', name: { en: 'Wood Block', vi: 'Khối gỗ' } },
  { id: 'b-sign', icon: '🪧', name: { en: 'Sign', vi: 'Biển báo' } },
  { id: 'b-book', icon: '📖', name: { en: 'Book', vi: 'Sách' } },
  { id: 'b-ladder', icon: '🪜', name: { en: 'Ladder', vi: 'Thang' } },
  { id: 'b-compass', icon: '🧭', name: { en: 'Compass', vi: 'La bàn' } },
  { id: 'b-painting', icon: '🖼️', name: { en: 'Painting', vi: 'Bức tranh' } },
  { id: 'b-button', icon: '🔘', name: { en: 'Button', vi: 'Nút bấm' } },
  { id: 'b-crafting', icon: '🛠️', name: { en: 'Crafting Table', vi: 'Bàn chế tạo' } },
  { id: 'b-bricks', icon: '🧱', name: { en: 'Bricks', vi: 'Gạch' } },
  { id: 'b-grass', icon: '🟩', name: { en: 'Grass Block', vi: 'Khối cỏ' } },
  // CSS Caves
  { id: 'b-red-dye', icon: '🔴', name: { en: 'Red Dye', vi: 'Thuốc nhuộm đỏ' } },
  { id: 'b-feather', icon: '🪶', name: { en: 'Feather', vi: 'Lông vũ' } },
  { id: 'b-blue-dye', icon: '🔵', name: { en: 'Blue Dye', vi: 'Thuốc nhuộm xanh' } },
  { id: 'b-shield', icon: '🛡️', name: { en: 'Shield', vi: 'Khiên' } },
  { id: 'b-glass', icon: '🪟', name: { en: 'Glass', vi: 'Kính' } },
  { id: 'b-nametag', icon: '🏷️', name: { en: 'Name Tag', vi: 'Thẻ tên' } },
  { id: 'b-rail', icon: '🛤️', name: { en: 'Rail', vi: 'Đường ray' } },
  { id: 'b-beacon', icon: '🔆', name: { en: 'Beacon', vi: 'Hải đăng' } },
  { id: 'b-potion', icon: '🧪', name: { en: 'Potion', vi: 'Thuốc tiên' } },
  { id: 'b-diamond', icon: '💎', name: { en: 'Diamond', vi: 'Kim cương' } },
  // JS Redstone Mines
  { id: 'b-torch', icon: '🔦', name: { en: 'Redstone Torch', vi: 'Đuốc Redstone' } },
  { id: 'b-chest', icon: '📦', name: { en: 'Chest', vi: 'Rương' } },
  { id: 'b-emerald', icon: '💚', name: { en: 'Emerald', vi: 'Ngọc lục bảo' } },
  { id: 'b-zombie', icon: '🧟', name: { en: 'Zombie Helmet', vi: 'Mũ Zombie' } },
  { id: 'b-command', icon: '🟧', name: { en: 'Command Block', vi: 'Khối lệnh' } },
  { id: 'b-lever', icon: '🎚️', name: { en: 'Lever', vi: 'Cần gạt' } },
  { id: 'b-piston', icon: '⚙️', name: { en: 'Piston', vi: 'Pít-tông' } },
  { id: 'b-minecart', icon: '🛒', name: { en: 'Minecart', vi: 'Xe mỏ' } },
  { id: 'b-dice', icon: '🎲', name: { en: 'Lucky Dice', vi: 'Xúc xắc may mắn' } },
  { id: 'b-trophy', icon: '🏆', name: { en: 'Builder Trophy', vi: 'Cúp xây dựng' } },
];
```

- [ ] **Step 2: Write the fully-worked example `src/content/quests/html/q01.ts`** (the template every quest file copies):

```ts
import type { Quest } from '../../../lib/types';

export const q01: Quest = {
  id: 'html-01',
  world: 'html',
  xp: 50,
  badge: 'b-wood',
  title: { en: 'Hello, World!', vi: 'Xin chào, Thế giới!' },
  story: {
    en: 'A villager wants to greet travelers, but the welcome sign is blank! Write your first HTML to fill it.',
    vi: 'Một dân làng muốn chào du khách, nhưng tấm biển chào mừng đang trống trơn! Hãy viết dòng HTML đầu tiên để điền vào nhé.',
  },
  steps: [
    {
      text: {
        en: 'HTML is written in tags. A tag is a word inside angle brackets, like <p>. Find the comment in the editor.',
        vi: 'HTML được viết bằng các tag. Tag là một từ nằm trong dấu ngoặc nhọn, ví dụ <p>. Hãy tìm dòng ghi chú trong trình soạn thảo.',
      },
    },
    {
      text: {
        en: 'Write a paragraph that says Hello, world! using the <p> tag.',
        vi: 'Viết một đoạn văn nói Hello, world! bằng tag <p>.',
      },
      hint: {
        en: 'A paragraph looks like this: <p>Hello, world!</p> — the second tag with the / closes it.',
        vi: 'Một đoạn văn trông như thế này: <p>Hello, world!</p> — tag thứ hai có dấu / để đóng lại.',
      },
    },
  ],
  starterCode: '<!-- ⛏️ Type your code below this line! -->\n',
  checks: [
    {
      type: 'elementExists',
      selector: 'p',
      failMessage: {
        en: "Hmm, I don't see a <p> tag yet. Paragraphs start with <p> and end with </p>!",
        vi: 'Hmm, mình chưa thấy tag <p> nào. Đoạn văn bắt đầu bằng <p> và kết thúc bằng </p> nhé!',
      },
    },
    {
      type: 'textIncludes',
      selector: 'p',
      value: 'hello',
      failMessage: {
        en: 'Your paragraph is there, but it should say Hello, world!',
        vi: 'Đoạn văn có rồi, nhưng nó cần nói Hello, world!',
      },
    },
  ],
};
```

- [ ] **Step 3: Write `q02.ts` … `q10.ts` per this table** (same file shape as q01; prose per the shared writing rules):

| id | title (EN) | teaches | starterCode scaffold | checks (exact) | xp | badge |
|---|---|---|---|---|---|---|
| html-02 | Big Signs | headings h1/h2 | comment + `<p>` from q01 world | `elementExists h1`; `elementExists h2` | 50 | b-sign |
| html-03 | Story Pages | paragraphs | comment only | `elementCount p min 2` | 50 | b-book |
| html-04 | Crafting List | ul/li | comment + `<h2>My chest</h2>` | `elementExists ul`; `elementCount li min 3` | 50 | b-ladder |
| html-05 | Portal Links | a href | comment + one `<p>` | `elementExists a`; `attrEquals a href https://www.minecraft.net` | 75 | b-compass |
| html-06 | Hang a Painting | img src/alt | comment; lesson supplies `https://picsum.photos/200` as src | `elementExists img`; `elementExists img[alt]` | 75 | b-painting |
| html-07 | Buttons & Levers | button, input | comment | `elementExists button`; `elementExists input` | 75 | b-button |
| html-08 | Inventory Table | table/tr/td | comment + `<h2>` | `elementExists table`; `elementCount td min 4` | 75 | b-crafting |
| html-09 | Building Rooms | div structure | comment | `elementExists div > h2`; `elementExists div > p` | 75 | b-bricks |
| html-10 | BOSS: Fan Page | combine all | comment + `<h2>` hints layout | `elementExists h1`; `elementExists img[alt]`; `elementCount li min 3`; `elementExists a`; `elementCount p min 2` | 100 | b-grass |

Each file exports `qNN`. Boss quest (html-10) steps walk through assembling the page section by section (up to 6 steps).

- [ ] **Step 4: Write the world barrels**

`src/content/quests/html/index.ts`:

```ts
import type { Quest } from '../../../lib/types';
import { q01 } from './q01'; import { q02 } from './q02'; import { q03 } from './q03';
import { q04 } from './q04'; import { q05 } from './q05'; import { q06 } from './q06';
import { q07 } from './q07'; import { q08 } from './q08'; import { q09 } from './q09';
import { q10 } from './q10';

export const HTML_QUESTS: Quest[] = [q01, q02, q03, q04, q05, q06, q07, q08, q09, q10];
```

`src/content/quests/css/index.ts` and `js/index.ts` (until Tasks 19/20):

```ts
import type { Quest } from '../../../lib/types';
export const CSS_QUESTS: Quest[] = []; // Task 19 fills
```

- [ ] **Step 5: Replace the stub `src/content/quests/index.ts` top with real imports**

```ts
import { HTML_QUESTS } from './html';
import { CSS_QUESTS } from './css';
import { JS_QUESTS } from './js';

export const ALL_QUESTS: Quest[] = [...HTML_QUESTS, ...CSS_QUESTS, ...JS_QUESTS];
```

(keep `QUESTS_BY_WORLD`, `QUESTS_BY_WORLD_IDS`, `questById`, `nextQuest` exactly as written in Task 14).

- [ ] **Step 6: Swap the profileStore placeholder** — in `src/stores/profileStore.ts` delete the local `QUESTS_BY_WORLD_IDS` const and add:

```ts
import { QUESTS_BY_WORLD_IDS } from '../content/quests';
```

- [ ] **Step 7: Run everything**

Run: `npm run test:run && npm run typecheck`
Expected: all green (screen tests mock content; store tests pass — empty-world guard in `worldDone` keeps achievements correct).

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add badges and HTML Grasslands quest content (10 quests)"
```

---

### Task 19: CSS Caves quests

**Files:**
- Create: `src/content/quests/css/q01.ts` … `q10.ts`
- Modify: `src/content/quests/css/index.ts` (real barrel, same shape as html’s)

- [ ] **Step 1: Write the fully-worked example `src/content/quests/css/q01.ts`:**

```ts
import type { Quest } from '../../../lib/types';

export const q01: Quest = {
  id: 'css-01',
  world: 'css',
  xp: 50,
  badge: 'b-red-dye',
  title: { en: 'Dye It Red', vi: 'Nhuộm màu đỏ' },
  story: {
    en: 'Deep in the caves you found red dye! CSS is the magic that paints your HTML. Time to color a heading.',
    vi: 'Sâu trong hang động bạn tìm thấy thuốc nhuộm đỏ! CSS là phép thuật tô màu cho HTML. Hãy tô màu cho tiêu đề nào.',
  },
  steps: [
    {
      text: {
        en: 'CSS lives inside a <style> tag. Find it at the top of the editor.',
        vi: 'CSS nằm trong tag <style>. Hãy tìm nó ở đầu trình soạn thảo.',
      },
    },
    {
      text: {
        en: 'Inside the style tag, make the h1 red: select it with h1, then set color to red.',
        vi: 'Bên trong tag style, làm cho h1 màu đỏ: chọn nó bằng h1, rồi đặt color thành red.',
      },
      hint: {
        en: 'It looks like this:\nh1 {\n  color: red;\n}',
        vi: 'Nó trông như thế này:\nh1 {\n  color: red;\n}',
      },
    },
  ],
  starterCode:
    '<style>\n  /* 🎨 Your CSS goes here */\n\n</style>\n\n<h1>Welcome to my cave!</h1>\n<p>It is very cozy.</p>\n',
  checks: [
    {
      type: 'computedStyle',
      selector: 'h1',
      prop: 'color',
      equalsAny: ['red', 'rgb(255, 0, 0)'],
      failMessage: {
        en: "The h1 isn't red yet. Inside <style>, write: h1 { color: red; }",
        vi: 'h1 chưa có màu đỏ. Bên trong <style>, hãy viết: h1 { color: red; }',
      },
    },
  ],
};
```

- [ ] **Step 2: Write `q02.ts` … `q10.ts` per this table** (every starterCode = `<style>` block + a small pre-built body to style):

| id | title (EN) | teaches | checks (exact) | xp | badge |
|---|---|---|---|---|---|
| css-02 | Fancy Lettering | font-size, text-align | `computedStyle p font-size ['32px']`; `computedStyle h1 text-align ['center']` | 50 | b-feather |
| css-03 | Paint the Sky | background-color | `computedStyle body background-color ['skyblue', 'rgb(135, 206, 235)']` | 50 | b-blue-dye |
| css-04 | Armor Up | border, padding (box model) | `computedStyle .box border-top-style ['solid']`; `computedStyle .box padding-top ['16px']` | 75 | b-shield |
| css-05 | Resize Blocks | width, height | `computedStyle .block width ['200px']`; `computedStyle .block height ['100px']` | 75 | b-glass |
| css-06 | Name Tags | class vs id selectors | `computedStyle .mob color ['green', 'rgb(0, 128, 0)']`; `computedStyle #boss color ['red', 'rgb(255, 0, 0)']` | 75 | b-nametag |
| css-07 | Lay the Rails | display:flex | `computedStyle .row display ['flex']`; `computedStyle .row gap ['10px']` | 75 | b-rail |
| css-08 | Beacon Beam | justify-content, align-items | `computedStyle .center justify-content ['center']`; `computedStyle .center align-items ['center']` | 75 | b-beacon |
| css-09 | Magic Potions | :hover, transition (not computable) | `codeIncludes ':hover'`; `codeIncludes 'transition'` | 75 | b-potion |
| css-10 | BOSS: Style the Fan Page | combine all | `computedStyle body background-color ['lightyellow', 'rgb(255, 255, 224)']`; `computedStyle h1 color ['green', 'rgb(0, 128, 0)']`; `computedStyle .card border-radius ['12px']`; `computedStyle .cards display ['flex']` | 100 | b-diamond |

css-10's starterCode is the *finished html-10 fan page markup* (h1, img, ul, cards as divs with class `card` inside `.cards`) + empty `<style>` — story: "your fan page works, now make it beautiful."

Note on `computedStyle` values: these run in a real browser iframe (not jsdom), so shorthand expansion (`border` → `border-top-style`) and color keywords→rgb both resolve; `equalsAny` lists both keyword and rgb forms wherever a kid might write either.

- [ ] **Step 3: Fill `src/content/quests/css/index.ts`** (same barrel shape as html), run, commit

Run: `npm run test:run && npm run typecheck`
Expected: green.

```bash
git add src/content/quests/css && git commit -m "feat: add CSS Caves quest content (10 quests)"
```

---

### Task 20: JS Redstone Mines quests

**Files:**
- Create: `src/content/quests/js/q01.ts` … `q10.ts`
- Modify: `src/content/quests/js/index.ts` (real barrel)

- [ ] **Step 1: Write the fully-worked example `src/content/quests/js/q01.ts`:**

```ts
import type { Quest } from '../../../lib/types';

export const q01: Quest = {
  id: 'js-01',
  world: 'js',
  xp: 50,
  badge: 'b-torch',
  title: { en: 'First Spark', vi: 'Tia lửa đầu tiên' },
  story: {
    en: 'Redstone makes things DO stuff — and so does JavaScript! Light your first redstone torch by printing a message.',
    vi: 'Redstone làm mọi thứ HOẠT ĐỘNG — JavaScript cũng vậy! Hãy thắp ngọn đuốc redstone đầu tiên bằng cách in ra một thông điệp.',
  },
  steps: [
    {
      text: {
        en: 'JavaScript lives inside a <script> tag. Find it in the editor.',
        vi: 'JavaScript nằm trong tag <script>. Hãy tìm nó trong trình soạn thảo.',
      },
    },
    {
      text: {
        en: 'Use console.log to print exactly: Hello, miner!  Watch it appear in the Console panel below the preview.',
        vi: 'Dùng console.log để in ra đúng dòng: Hello, miner!  Xem nó hiện ra ở bảng Console bên dưới phần xem trước.',
      },
      hint: {
        en: "It looks like this: console.log('Hello, miner!');",
        vi: "Nó trông như thế này: console.log('Hello, miner!');",
      },
    },
  ],
  starterCode:
    '<h1>Redstone Lab</h1>\n\n<script>\n  // ⚡ Your JavaScript goes here\n\n</script>\n',
  checks: [
    {
      type: 'consoleIncludes',
      value: 'Hello, miner!',
      failMessage: {
        en: "I don't see Hello, miner! in the console yet. Try console.log('Hello, miner!');",
        vi: "Mình chưa thấy Hello, miner! trong console. Thử console.log('Hello, miner!'); nhé",
      },
    },
  ],
};
```

- [ ] **Step 2: Write `q02.ts` … `q10.ts` per this table** (every starterCode = small HTML + `<script>` with comment marker):

| id | title (EN) | teaches | checks (exact) | xp | badge |
|---|---|---|---|---|---|
| js-02 | Treasure Chests | variables (let) | `codeIncludes 'let'`; `consoleIncludes 'diamond'` (lesson: store 'diamond' in a variable, log it) | 50 | b-chest |
| js-03 | Stack the Blocks | numbers & math | `codeIncludes '*'`; `consoleIncludes '128'` (64 × 2 stacks) | 50 | b-emerald |
| js-04 | Creeper Alert | if/else | `codeIncludes 'if'`; `consoleIncludes 'Run away!'` (starter sets `let creeperNearby = true`) | 75 | b-zombie |
| js-05 | Crafting Recipes | functions | `codeIncludes 'function'`; `consoleIncludes 'Hello, Steve!'` (write greet(name), call with 'Steve') | 75 | b-command |
| js-06 | Pull the Lever | click events | `elementExists button`; `codeIncludes 'addEventListener'` | 75 | b-lever |
| js-07 | Piston Power | DOM textContent | `codeIncludes 'getElementById'`; `textIncludes #status 'Mining...'` (starter has `<p id="status">Idle</p>`; script must set it on load) | 75 | b-piston |
| js-08 | Minecart Loop | for loops | `codeIncludes 'for'`; `consoleIncludes 'Mined block 5'` (loop 1..5 logging `Mined block ${i}`) | 75 | b-minecart |
| js-09 | Lucky Drops | Math.random | `codeIncludes 'Math.random'`; `codeIncludes 'Math.floor'` (random 1–6 dice roll logged; output value can't be asserted) | 75 | b-dice |
| js-10 | BOSS: Clicker Game | combine all | `elementExists button`; `elementExists #score`; `codeIncludes 'addEventListener'`; `codeIncludes 'score'` (click button → score span counts up) | 100 | b-trophy |

- [ ] **Step 3: Fill `src/content/quests/js/index.ts`**, run, commit

Run: `npm run test:run && npm run typecheck`
Expected: green.

```bash
git add src/content/quests/js && git commit -m "feat: add JS Redstone Mines quest content (10 quests)"
```

---

### Task 21: Content validation test

The schema cop: catches missing translations, bad badge refs, broken check definitions at test-time, not kid-time (spec §Testing).

**Files:**
- Test: `src/content/quests/content.test.ts`

- [ ] **Step 1: Write the test**

```ts
import type { Localized } from '../../lib/types';
import { ALL_QUESTS, QUESTS_BY_WORLD } from './index';
import { BADGES } from '../badges';
import { WORLDS } from '../worlds';

const filled = (l: Localized) => l.en.trim() !== '' && l.vi.trim() !== '';

describe('quest content integrity', () => {
  test('30 quests, 10 per world, ids unique and well-formed', () => {
    expect(ALL_QUESTS).toHaveLength(30);
    for (const world of WORLDS) {
      expect(QUESTS_BY_WORLD[world.id]).toHaveLength(10);
    }
    const ids = ALL_QUESTS.map((q) => q.id);
    expect(new Set(ids).size).toBe(30);
    for (const q of ALL_QUESTS) {
      expect(q.id).toMatch(new RegExp(`^${q.world}-\\d{2}$`));
    }
  });

  test.each(ALL_QUESTS.map((q) => [q.id, q] as const))('%s is complete', (_id, q) => {
    expect(filled(q.title)).toBe(true);
    expect(filled(q.story)).toBe(true);
    expect(q.starterCode.trim()).not.toBe('');
    expect(q.steps.length).toBeGreaterThanOrEqual(1);
    expect(q.steps.length).toBeLessThanOrEqual(6);
    for (const step of q.steps) {
      expect(filled(step.text)).toBe(true);
      if (step.hint) expect(filled(step.hint)).toBe(true);
    }
    expect(q.checks.length).toBeGreaterThanOrEqual(1);
    for (const check of q.checks) {
      expect(filled(check.failMessage)).toBe(true);
      if ('selector' in check) expect(check.selector.trim()).not.toBe('');
      if (check.type === 'computedStyle') expect(check.equalsAny.length).toBeGreaterThan(0);
    }
    expect([50, 75, 100]).toContain(q.xp);
  });

  test('boss quests award 100 XP', () => {
    for (const q of ALL_QUESTS.filter((x) => x.id.endsWith('-10'))) {
      expect(q.xp).toBe(100);
    }
  });

  test('every quest badge exists, badges unique, all 30 used', () => {
    const badgeIds = new Set(BADGES.map((b) => b.id));
    const used = ALL_QUESTS.map((q) => q.badge);
    for (const b of used) expect(badgeIds.has(b)).toBe(true);
    expect(new Set(used).size).toBe(30);
    expect(BADGES).toHaveLength(30);
  });

  test('badges have icons and bilingual names', () => {
    for (const b of BADGES) {
      expect(b.icon.trim()).not.toBe('');
      expect(filled(b.name)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run, fix any content failures it finds, commit**

Run: `npx vitest run src/content`
Expected: all pass. Failures here are content bugs — fix the quest files.

```bash
git add src/content/quests/content.test.ts && git commit -m "test: add content integrity validation"
```

---

### Task 22: Final verification, README, smoke test

**Files:**
- Create: `README.md`

- [ ] **Step 1: Full suite + build**

Run: `npm run test:run && npm run build`
Expected: every suite green; production build succeeds.

- [ ] **Step 2: Manual smoke test (real browser)** — run `npm run dev`, then:

1. Title → Press Start → create profile (name + avatar) → land on map
2. Play **html-01** for real: type wrong code → friendly fail message; fix → victory overlay, +70 XP (50 + 20 daily), badge drop, sound
3. HUD shows XP fill, 🔥1 streak
4. Map: html-02 now `current`, html-01 replayable
5. Switch language to VI on HUD — lesson + UI flip to Vietnamese
6. Quick-play **css-01** path: complete remaining HTML quests via copy-paste if needed OR temporarily select css world by completing HTML (manual grind is fine — it also verifies progression); verify a `computedStyle` check passes in a real browser
7. **js-01**: type `console.log('Hello, miner!')` → line appears in console panel → check passes
8. Write `while(true){}` in a JS quest → "stuck in a loop" message appears within ~2s, reload link recovers
9. Inventory: badge bright, achievements correct; Settings: sound toggle, hold-to-reset works
10. Refresh browser — profile, progress, language all persist

Record any failures, fix, re-run affected unit tests.

- [ ] **Step 3: Write `README.md`**

```markdown
# ⛏️ CodeCraft

A Minecraft-inspired web game that teaches kids (9–12) HTML, CSS, and JavaScript.
Three worlds, ~30 quests, XP and ranks from Dirt to Netherite, collectible badges,
daily streaks — bilingual English / Tiếng Việt.

## Run it

\`\`\`bash
npm install
npm run dev      # http://localhost:5173
\`\`\`

## For parents

- Everything is local: no accounts, no network calls, progress lives in the browser
  (localStorage). Multiple kid profiles supported.
- Reset progress: Settings → hold the red button.

## Develop

\`\`\`bash
npm test         # vitest watch
npm run test:run # CI mode
npm run build    # typecheck + production build
\`\`\`

Quest content lives in `src/content/quests/<world>/qNN.ts` — one typed file per
quest; `src/content/quests/content.test.ts` enforces structure and bilingual
completeness. Design spec: `docs/superpowers/specs/2026-06-05-codecraft-design.md`.
```

- [ ] **Step 4: Final commit**

```bash
git add -A && git commit -m "docs: add README; complete v1"
```

---

## Plan Self-Review Notes (kept for the record)

- **Spec coverage:** screens (T11–17), quest map + unlock rules (T4, T14), editor/preview/check loop (T7–9, T15), gamification incl. replay-no-XP + daily bonus + bestStreak (T4), profiles + corrupt-save isolation (T6), bilingual EN/VI (T5 + content tasks), sounds (T10), watchdog/sandbox/friendly errors (T8, T15), content 3×10 quests (T18–20), content integrity test (T21), manual smoke (T22). Out-of-scope items from spec remain out.
- **Known deviation:** WebAudio synth instead of CC0 audio files (recorded in spec §design notes rationale: zero assets).
- **Type consistency spot-checks:** `Rewards` shape (T2) matches producers/consumers (T4, T6, T15, VictoryOverlay); `runDomChecks(checks) → Promise<boolean[]>` identical in usePreview (T8), RunContext (T7), QuestScreen mock (T15); `QUESTS_BY_WORLD_IDS` placeholder (T6) swapped in T18 Step 6; `initialValue/onChange` contract identical in CodeEditor (T9) and its T15 mock.







