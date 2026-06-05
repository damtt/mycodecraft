import { render, screen, fireEvent, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import type { Quest } from '../lib/types';

const { QUEST, runDomChecks } = vi.hoisted(() => {
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
  const runDomChecks = vi.fn(async (checks: unknown[]) => checks.map(() => true));
  return { QUEST, runDomChecks };
});

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
