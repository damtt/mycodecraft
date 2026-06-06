# Repository Guidelines

## Project Structure & Module Organization

CodeCraft is a Vite 6, React 19, TypeScript game for teaching HTML, CSS, and JavaScript. Application code lives in `src/`. Route setup is in `src/app/`, top-level screens are in `src/screens/`, reusable UI is in `src/components/`, and domain logic is grouped under `src/features/` (`editor`, `preview`, `validation`, `progress`, `audio`). Quest and UI copy lives in `src/content/`, with one quest file per lesson such as `src/content/quests/html/q01.ts`. Zustand stores are in `src/stores/`, shared utilities and types are in `src/lib/`, test setup is in `src/test/setup.ts`, static files are in `public/`, and fonts are in `src/assets/fonts/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite dev server, normally at `http://localhost:5173`.
- `npm test`: run Vitest in watch mode.
- `npm run test:run`: run the full test suite once for CI-style verification.
- `npm run typecheck`: run `tsc --noEmit`.
- `npm run build`: typecheck and create the production bundle in `dist/`.
- `npm run preview`: serve the built bundle locally.

## Coding Style & Naming Conventions

Use strict TypeScript and React function components. Keep indentation at two spaces, prefer single quotes, and use semicolons, matching the existing files. Name components in PascalCase (`PixelButton.tsx`), hooks with `use` prefixes, stores as `profileStore.ts`, and quest files as `qNN.ts` with ids like `html-01`. Keep player-facing text bilingual with `{ en, vi }` objects. Do not add backend calls, analytics, or account flows; the app is local-first and stores progress in `localStorage`.

## Testing Guidelines

Tests use Vitest, jsdom, React Testing Library, and jest-dom globals. Place tests next to the code they cover using `*.test.ts` or `*.test.tsx`. Run `npm run test:run` before submitting changes, and run `npm run build` when touching types, routing, quest content, validation, or production behavior. Quest changes must satisfy `src/content/quests/content.test.ts`, including 30 total quests, bilingual completeness, valid badges, and no raw HTML tags outside Markdown code spans.

## Commit & Pull Request Guidelines

Recent history uses conventional prefixes such as `feat:`, `fix:`, and `chore:`. Keep commits focused on one behavior or maintenance change. Pull requests should explain the user-visible change, list verification commands run, link related issues when available, and include screenshots or short recordings for UI changes. For quest edits, mention affected worlds and confirm both English and Vietnamese copy were updated.
