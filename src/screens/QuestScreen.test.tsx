import { render, screen, fireEvent, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import type { Quest } from '../lib/types';

const { QUEST, QUEST2, QUEST3, runDomChecks } = vi.hoisted(() => {
  const L = (en: string, vi?: string) => ({ en, vi: vi ?? en });
  const QUEST: Quest = {
    id: 'html-01', world: 'html', xp: 50, badge: 'b-wood',
    title: L('Hello, World!'), story: L('A villager needs a sign.'),
    steps: [
      { text: L('Write a p tag'), hint: L('Like `<p>hi</p>`') },
      { text: L('Say Hello') },
    ],
    starterCode: '<!-- type here -->',
    checks: [
      { type: 'codeIncludes', value: '<p>', failMessage: L('No `<p>` yet!') },
    ],
  };
  const QUEST2: Quest = {
    id: 'html-02', world: 'html', xp: 50, badge: 'b-sign',
    title: L('Big Signs'), story: L('Another villager appears.'),
    steps: [{ text: L('Write an h2 tag') }],
    starterCode: '<!-- second -->',
    checks: [{ type: 'codeIncludes', value: '<h2>', failMessage: L('No `<h2>` yet!') }],
  };
  const QUEST3: Quest = {
    id: 'html-03', world: 'html', xp: 50, badge: 'b-stone',
    title: L('Reflecting'), story: L('Think it through.'),
    steps: [{ text: L('Type DONE') }],
    starterCode: '<!-- here -->',
    checks: [{ type: 'codeIncludes', value: 'DONE', failMessage: L('Type DONE!') }],
    reflect: { question: L('Which part selects it?'), answer: L('the selector picks it') },
    predict: {
      question: L('What happens?'),
      options: [
        { text: L('Outcome A'), correct: true },
        { text: L('Outcome B'), correct: false },
      ],
      explain: L('Because A is the right one'),
    },
  };
  const runDomChecks = vi.fn(async (checks: unknown[]) => checks.map(() => true));
  return { QUEST, QUEST2, QUEST3, runDomChecks };
});

vi.mock('../content/quests', () => ({
  ALL_QUESTS: [QUEST, QUEST2, QUEST3],
  QUESTS_BY_WORLD: { html: [QUEST, QUEST2, QUEST3], css: [], js: [] },
  QUESTS_BY_WORLD_IDS: { html: ['html-01'], css: [], js: [] },
  questById: (id: string) => [QUEST, QUEST2, QUEST3].find((q) => q.id === id),
  nextQuest: (id: string) => (id === 'html-01' ? QUEST2 : id === 'html-02' ? QUEST3 : null),
}));
vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

// Editor mock: a forwardRef textarea honoring the same contract + insertText.
// vi.mock factories are hoisted above imports, so React is pulled in via
// vi.importActual inside the async factory (referencing a top-level import would crash).
vi.mock('../features/editor/CodeEditor', async () => {
  const { forwardRef, useImperativeHandle, createElement } =
    await vi.importActual<typeof import('react')>('react');
  type Handle = { insertText: (text: string) => void };
  const Mock = forwardRef<Handle, { initialValue: string; onChange: (v: string) => void }>(
    ({ initialValue, onChange }, ref) => {
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
import { useGuide } from '../features/guide/guideStore';

function renderQuest() {
  return renderQuestAt('html-01');
}

function renderQuestAt(id: string) {
  useProfiles.getState().create('Mai', '🦊');
  useProfiles.getState().select(useProfiles.getState().profiles[0].id);
  const router = createMemoryRouter(routes, { initialEntries: [`/quest/${id}`] });
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
    // LessonText wraps the <p> in a <code> chip, so the message spans nodes.
    expect(await screen.findByRole('alert')).toHaveTextContent('No <p> yet!');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('passing check completes quest and shows victory overlay', async () => {
    renderQuest();
    fireEvent.change(await screen.findByTestId('code-editor'), { target: { value: '<p>Hello</p>' } });
    fireEvent.click(screen.getByRole('button', { name: /check my code/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(useProfiles.getState().profiles[0].quests['html-01']).toBeDefined();
    expect(screen.getByTestId('world-complete')).toBeInTheDocument();
  });

  test('opening a hint marks completion as hint-assisted', async () => {
    renderQuest();
    fireEvent.click(await screen.findByRole('button', { name: /hint/i }));
    // Hint text is split by LessonText's <code> chips — assert on the list's text.
    expect(await screen.findByRole('list')).toHaveTextContent('Like <p>hi</p>');
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

  // Force the phone (tabs) layout: min-width queries report false.
  function usePhoneViewport() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).matchMedia = (query: string) => ({
      matches: false, media: query, onchange: null,
      addEventListener: () => {}, removeEventListener: () => {},
      addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
    });
  }

  test('on phones, shows Lesson/Code/Preview tabs and switches panes', async () => {
    usePhoneViewport();
    renderQuest();
    expect(await screen.findByRole('tab', { name: /lesson/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /code/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /preview/i })).toBeInTheDocument();
    // Story is in the Lesson pane (default tab).
    expect(screen.getByText(/a villager needs a sign/i)).toBeInTheDocument();
  });

  test('on phones, the check button lives in the Code pane, not the Lesson pane', async () => {
    usePhoneViewport();
    renderQuest();
    await screen.findByRole('tab', { name: /lesson/i });
    // Panes stay mounted (toggled via CSS), so assert placement, not presence:
    // the check button shares the Code pane with the editor, away from the story.
    const codePane = screen.getByRole('button', { name: /check my code/i }).parentElement;
    expect(codePane).toContainElement(screen.getByTestId('code-editor'));
    expect(codePane).not.toContainElement(screen.getByText(/a villager needs a sign/i));
  });

  test('on phones, the check button is fixed to the bottom of the Code tab', async () => {
    usePhoneViewport();
    renderQuest();
    fireEvent.click(await screen.findByRole('tab', { name: /code/i }));
    expect(screen.getByRole('button', { name: /check my code/i })).toHaveClass('fixed');
    expect(screen.getByRole('button', { name: /check my code/i })).toHaveClass('bottom-[calc(4.75rem+env(safe-area-inset-bottom))]');
  });

  test('on phones, the Guide buddy steps aside on the Code tab and returns elsewhere', async () => {
    usePhoneViewport();
    renderQuest();
    // Present on the Lesson tab (default)...
    expect(await screen.findByRole('button', { name: /guide buddy/i })).toBeInTheDocument();
    // ...hidden on the Code tab so its owl + bubble can't cover the button or error...
    fireEvent.click(screen.getByRole('tab', { name: /code/i }));
    expect(screen.queryByRole('button', { name: /guide buddy/i })).not.toBeInTheDocument();
    // ...and back again on the Preview tab.
    fireEvent.click(screen.getByRole('tab', { name: /preview/i }));
    expect(screen.getByRole('button', { name: /guide buddy/i })).toBeInTheDocument();
  });

  test('on phones, a failed check stays on the Code tab and floats the error there', async () => {
    usePhoneViewport();
    renderQuest();
    fireEvent.click(await screen.findByRole('tab', { name: /code/i }));
    fireEvent.click(screen.getByRole('button', { name: /check my code/i }));
    // The error floats over the editor so the player can fix it in place...
    expect(await screen.findByRole('alert')).toHaveTextContent('No <p> yet!');
    // ...and we stay on the Code tab (no jump to Preview on failure).
    expect(screen.getByRole('tab', { name: /code/i })).toHaveAttribute('aria-selected', 'true');
  });

  test('on phones, a passing check jumps to the Preview tab and shows the victory overlay', async () => {
    usePhoneViewport();
    renderQuest();
    fireEvent.click(await screen.findByRole('tab', { name: /code/i }));
    fireEvent.change(screen.getByTestId('code-editor'), { target: { value: '<p>Hello</p>' } });
    fireEvent.click(screen.getByRole('button', { name: /check my code/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(useProfiles.getState().profiles[0].quests['html-01']).toBeDefined();
    // The pass switches the underlying tab to Preview.
    expect(screen.getByRole('tab', { name: /preview/i })).toHaveAttribute('aria-selected', 'true');
  });

  test('an invalid quest id publishes no guide context (no bogus hint/recap)', async () => {
    useProfiles.getState().create('Mai', '🦊');
    useProfiles.getState().select(useProfiles.getState().profiles[0].id);
    useGuide.setState({ questCtx: null });
    render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/quest/nope'] })} />);
    expect(await screen.findByText(/quest not found/i)).toBeInTheDocument();
    expect(useGuide.getState().questCtx).toBeNull();
  });

  test('a failing check on a reflect quest shows the Think nudge', async () => {
    renderQuestAt('html-03');
    fireEvent.click(await screen.findByRole('button', { name: /check my code/i }));
    expect(await screen.findByText(/peek at the think question/i)).toBeInTheDocument();
  });

  test('the nudge fires at most once, even after a second failed check', async () => {
    renderQuestAt('html-03');
    fireEvent.click(await screen.findByRole('button', { name: /check my code/i }));
    expect(await screen.findByText(/peek at the think question/i)).toBeInTheDocument();
    // a second failing check must not re-show the nudge (guard: !nudged)
    fireEvent.click(screen.getByRole('button', { name: /check my code/i }));
    await act(async () => {}); // let the second async onCheck settle inside act
    expect(screen.getByText(/peek at the think question/i)).toBeInTheDocument();
  });

  test('a passing check never shows the nudge', async () => {
    renderQuestAt('html-03');
    fireEvent.change(await screen.findByTestId('code-editor'), { target: { value: 'DONE' } });
    fireEvent.click(screen.getByRole('button', { name: /check my code/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument(); // victory
    expect(screen.queryByText(/peek at the think question/i)).not.toBeInTheDocument();
  });

  test('opening the Think answer clears the nudge', async () => {
    renderQuestAt('html-03');
    fireEvent.click(await screen.findByRole('button', { name: /check my code/i }));
    expect(await screen.findByText(/peek at the think question/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /show answer/i }));
    expect(screen.queryByText(/peek at the think question/i)).not.toBeInTheDocument();
    expect(screen.getByText(/the selector picks it/i)).toBeInTheDocument();
  });

  test('committing a predict choice reveals the explanation', async () => {
    renderQuestAt('html-03');
    fireEvent.click(await screen.findByRole('button', { name: /outcome a/i }));
    expect(screen.getByText(/because a is the right one/i)).toBeInTheDocument();
  });
});
