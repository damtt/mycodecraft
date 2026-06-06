# CodeCraft — Design Spec

**Date:** 2026-06-05
**Status:** Approved by user (brainstorming session)

## Overview

CodeCraft is a voxel-builder-inspired web app that teaches children aged 9–12 the basics of HTML, CSS, and JavaScript. Kids progress through a quest map of three themed worlds, completing short coding challenges in a live editor with instant visual feedback, earning XP, ranks, and collectible badges.

It is a personal, local-first app for the developer's own children: no backend, no accounts, progress in `localStorage`, multiple kid profiles on one device, bilingual English/Vietnamese UI.

## Product Decisions

| Decision | Choice |
|---|---|
| Target age | 9–12 years |
| Deployment | Local/personal; static build; no backend |
| Core loop | Quest map (HTML → CSS → JS worlds) + live code editor |
| Language | Bilingual EN/VI, runtime toggle |
| V1 content | 3 worlds × ~10 quests (~30 total) |
| Gamification | XP + levels/ranks, collectible badges, sound effects, streaks & daily goals |
| Visual style | "Pixel HUD + readable body" — pixel fonts for headings/HUD/badges, rounded readable font (Nunito) for lesson text; sky/grass/dirt palette, blocky borders |
| Quest screen layout | Lesson panel left; editor top-right; live preview bottom-right |
| Profiles | Multiple local kid profiles, pick-your-player screen, no passwords |
| Name | CodeCraft (folder `codecraft`) |

## Screens & Navigation (React Router)

1. **`/` Title screen** — game logo, "press start"-style entry, EN/VI toggle.
2. **`/players` Profile select** — pick-your-player cards (name + pixel-art avatar head), create/delete profile (delete uses the same hold-to-confirm guard as settings reset).
3. **`/map` World map (hub)** — three islands/biomes: 🟫 HTML Grasslands → 🟦 CSS Caves → 🟨 JS Sparkstone Mines. Quest nodes on a path: done ✅ / current ⛏ / locked 🔒. HUD bar: avatar, level + rank, XP bar, streak flame, sound toggle, language toggle.
4. **`/quest/:id` Quest screen** — lesson panel left (story intro + numbered steps + hint button), CodeMirror editor top-right, sandboxed preview iframe bottom-right. "Check my code" → all checks pass → victory overlay (XP rain, sound, badge drop) → next quest.
5. **`/inventory` Inventory** — badges/blocks in a blocky-style chest grid, achievements, stats (quests done, streak record).
6. **`/settings` Settings** — language, sound on/off, reset progress (hold-to-confirm, parent-guarded).

**Unlock rules:** worlds unlock sequentially (complete HTML Grasslands → CSS Caves opens). Quests within a world unlock linearly. Completed quests are replayable anytime in free-play mode (same editor, no gating).

## Architecture

**Stack:** Vite + React 19 + TypeScript (strict) + React Router 7 + Zustand (persist → localStorage) + Tailwind CSS 4 (custom blocky theme) + CodeMirror 6 + Vitest + React Testing Library.

```
codecraft/
├── src/
│   ├── app/                  # Router, layout shell, providers
│   ├── screens/              # title/ players/ map/ quest/ inventory/ settings/
│   ├── components/           # shared UI: PixelButton, HudBar, XpBar, BadgeIcon...
│   ├── features/
│   │   ├── editor/           # CodeMirror wrapper, kid-friendly config
│   │   ├── preview/          # sandboxed iframe preview (srcdoc)
│   │   ├── validation/       # declarative check engine
│   │   ├── progress/         # XP/levels/streaks/badges logic (pure functions)
│   │   └── audio/            # sound manager (preloaded effects, mute toggle)
│   ├── content/
│   │   ├── worlds.ts         # world metadata (3 worlds)
│   │   ├── quests/           # html/01-hello-world.ts ... js/10-final.ts
│   │   └── i18n/             # UI string dictionaries {en, vi}
│   ├── stores/               # Zustand: profileStore, settingsStore
│   └── lib/                  # localStorage helpers, shared types
```

### Content model

Quests are typed TypeScript files — no CMS, no fetch.

```ts
type Localized = { en: string; vi: string };

interface Quest {
  id: string;                    // "html-03"
  world: 'html' | 'css' | 'js';
  title: Localized;
  story: Localized;              // 1–2 sentence blocky-world-flavored intro
  steps: Step[];                 // instructions; each step may carry a hint (Localized)
  starterCode: string;           // editor contents at quest start
  checks: Check[];               // pass conditions (see below)
  xp: number;                    // 50 easy / 75 medium / 100 boss
  badge?: BadgeId;               // collectible drop
}
```

### Validation engine

Declarative check objects — no eval of matcher code:

- **HTML/CSS:** render kid's code in the sandboxed iframe, run checks against the iframe DOM. Examples: `{ type: 'elementExists', selector: 'h1' }`, `{ type: 'textIncludes', selector: 'h1', value: '...' }`, `{ type: 'computedStyle', selector: 'p', prop: 'color', equals: 'rgb(255, 0, 0)' }`.
- **JS:** code runs inside the same sandboxed iframe; `console.log` is bridged out via `postMessage`. Checks assert on console output or resulting DOM: `{ type: 'consoleIncludes', value: 'Hello' }`.
- Every check carries a localized `failMessage` written to teach, not frustrate ("Hmm, I don't see an `<h1>` yet — signs need a big title!").

### Data flow

typing → debounce 300ms → iframe `srcdoc` re-render → user clicks "Check my code" → validation engine → all pass → `progress` pure functions compute XP/level/badge/streak deltas → Zustand store update → persisted to `localStorage` (`codecraft:profile:<id>`).

### Persistence

Zustand `persist` middleware behind a small versioned-schema wrapper (`{ version: 1, data: ... }`) so future releases can migrate old saves instead of crashing.

## Gamification Rules

**XP & ranks** — quest XP: easy 50 / medium 75 / boss 100. Ranks by total XP:

| Rank | Level | XP threshold |
|---|---|---|
| 🟫 Dirt | 1 | 0 |
| 🪨 Stone | 2 | 200 |
| ⛏ Iron | 3 | 500 |
| 🥇 Gold | 4 | 900 |
| 💎 Diamond | 5 | 1,400 |
| 🟪 Obsidian | 6 | 2,000 |

**Badges** — each quest drops a world-themed collectible (HTML: wood/sign/crafting table…; CSS: dyes/paintings/glass…; JS: Sparkstone/lever/piston…). Meta-achievements: First Quest, World Complete ×3, 7-Day Streak, No-Hint Hero.

**Streaks & daily goal** — ≥1 quest completion (incl. replays) per calendar day extends the streak (flame + count in HUD). Missed day quietly resets to 0 — no punishment messaging. Daily goal "1 quest a day" grants +20 bonus XP.

**Replays award no quest XP** (prevents grinding a single easy quest to Obsidian) — but they do count toward the streak and daily goal, so practicing old quests still keeps the flame alive.

**Sounds** — pop (click), success chime, level-up fanfare, badge drop. Preloaded `<audio>` from CC0 packs; global mute in settings. No background music in v1.

**Hearts in the HUD are decorative.** No lives, no penalties; checks can be retried forever; hints are free (only No-Hint Hero is gated on avoiding them).

## Error Handling & Edge Cases

- **Broken kid code is normal:** preview renders whatever the browser renders. JS runtime errors are caught in the iframe and surfaced as a friendly Creeper-themed message with the line number — never a raw stack trace.
- **Infinite loops:** watchdog — if the iframe doesn't ack within 2s, kill and reload it; show "your code is stuck in a loop!" message.
- **Sandboxing:** preview iframe uses `sandbox="allow-scripts"` only (no `allow-same-origin`, no top navigation, no popups).
- **localStorage corruption:** versioned wrapper validates on load; a corrupt profile offers reset of that profile only — never silently wipes all profiles. Saves are <50KB; quota is a non-issue.
- **Streak/date math:** last-active date stored as local `YYYY-MM-DD` string; date-string comparison avoids timezone/DST bugs.

## Testing Strategy

- **Unit (Vitest):** validation engine (every check type), progress pure functions (XP/level/streak/badge), versioned localStorage wrapper, i18n lookup.
- **Component (Testing Library):** quest screen flow (type → check → victory), profile create/select, map lock/unlock rendering.
- **Content validation test:** loads all ~30 quest files, asserts schema completeness — `en` and `vi` present everywhere, valid check definitions, XP set, badge IDs exist. Catches content typos at test-time, not kid-time.
- **Manual smoke:** play through quest 1 of each world in the real app before release.

E2E browser automation: out of scope for v1.

## Out of Scope (v1)

- Backend, accounts, cross-device sync (localStorage export/import is the future path)
- Background music
- Block-based (drag-and-drop) coding mode
- Free-form project sandbox outside quests
- Mobile-phone layout (target is laptop/desktop; tablet landscape should work but is not tuned)

## Curriculum Outline (~30 quests)

**HTML Grasslands (10):** hello world & tags → headings → paragraphs & line breaks → lists → links → images → buttons & inputs → tables → divs & structure → boss: build your fan page.

**CSS Caves (10):** colors → fonts & text styling → backgrounds → borders & spacing (box model) → sizes → classes & ids → flexbox row → flexbox layout → hover effects & transitions → boss: style the fan page into a real site.

**JS Sparkstone Mines (10):** console.log & strings → variables → numbers & math → if/else → functions → click events → changing the page (DOM) → loops → random & logic combo → boss: build a clicker mini-game.

Exact per-quest steps, hints, starter code, and checks are written during implementation; the content validation test enforces structural completeness in both languages.
