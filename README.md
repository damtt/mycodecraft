# ⛏️ CodeCraft

A blocky, voxel-builder-inspired web game that teaches kids (9–12) HTML, CSS, and JavaScript.
Three worlds, ~30 quests, XP and ranks from Dirt to Netherite, collectible badges,
daily streaks — bilingual English / Tiếng Việt.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

## For parents

- Everything is local: no accounts, no network calls, progress lives in the browser
  (localStorage). Multiple kid profiles supported.
- Reset progress: Settings → hold the red button.

## Develop

```bash
npm test         # vitest watch
npm run test:run # CI mode
npm run build    # typecheck + production build
```

Quest content lives in `src/content/quests/<world>/qNN.ts` — one typed file per
quest; `src/content/quests/content.test.ts` enforces structure and bilingual
completeness. Design spec: `docs/superpowers/specs/2026-06-05-codecraft-design.md`.
