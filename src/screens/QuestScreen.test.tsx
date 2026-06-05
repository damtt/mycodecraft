import { render, screen, fireEvent, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import type { Quest } from '../lib/types';

const { QUEST, QUEST2, runDomChecks } = vi.hoisted(() => {
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
  const QUEST2: Quest = {
    id: 'html-02', world: 'html', xp: 50, badge: 'b-sign',
    title: L('Big Signs'), story: L('Another villager appears.'),
    steps: [{ text: L('Write an h2 tag') }],
    starterCode: '<!-- second -->',
    checks: [{ type: 'codeIncludes', value: '<h2>', failMessage: L('No <h2> yet!') }],
  };
  const runDomChecks = vi.fn(async (checks: unknown[]) => checks.map(() => true));
  return { QUEST, QUEST2, runDomChecks };
});

vi.mock('../content/quests', () => ({
  ALL_QUESTS: [QUEST, QUEST2],
  QUESTS_BY_WORLD: { html: [QUEST, QUEST2], css: [], js: [] },
  QUESTS_BY_WORLD_IDS: { html: ['html-01', 'html-02'], css: [], js: [] },
  questById: (id: string) => [QUEST, QUEST2].find((q) => q.id === id),
  nextQuest: (id: string) => (id === 'html-01' ? QUEST2 : null),
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

  test('next-quest navigation resets all quest state', async () => {
    renderQuest();
    fireEvent.click(await screen.findByRole('button', { name: /hint/i })); // create leak sources
    fireEvent.change(screen.getByTestId('code-editor'), { target: { value: '<p>Hello</p>' } });
    fireEvent.click(screen.getByRole('button', { name: /check my code/i }));
    fireEvent.click(await screen.findByRole('button', { name: /next quest/i }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); // overlay reset
    expect(await screen.findByTestId('code-editor')).toHaveValue('<!-- second -->'); // fresh starter
    expect(screen.queryByText(/like <p>hi<\/p>/i)).not.toBeInTheDocument(); // hints reset
    expect(screen.getByText(/another villager appears/i)).toBeInTheDocument(); // new quest rendered
  });
});
