import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import LessonPanel from './LessonPanel';
import type { Quest } from '../../lib/types';

// LessonPanel -> PixelButton -> audio/sounds; mock so jsdom doesn't touch audio.
vi.mock('../../features/audio/sounds', () => ({ playSound: vi.fn() }));

const L = (en: string) => ({ en, vi: en });
const base: Quest = {
  id: 'html-01', world: 'html', xp: 50, badge: 'b-wood',
  title: L('T'), story: L('S'),
  steps: [{ text: L('Step one') }],
  starterCode: 'x',
  checks: [{ type: 'codeIncludes', value: '<p>', failMessage: L('no p') }],
};

type Overrides = Partial<React.ComponentProps<typeof LessonPanel>>;
function renderPanel(quest: Quest, overrides: Overrides = {}) {
  const props = {
    quest,
    alreadyDone: false,
    openHints: new Set<number>(),
    onHint: () => {},
    failMessage: null,
    runtimeErrorLine: null,
    stuck: false,
    onReload: () => {},
    checking: false,
    onCheck: () => {},
    reflectOpen: false,
    onReflect: () => {},
    showNudge: false,
    ...overrides,
  };
  return render(<LessonPanel {...props} />);
}

test('reflect answer is hidden until revealed', () => {
  const q = { ...base, reflect: { question: L('Which part selects it?'), answer: L('the selector does') } };
  renderPanel(q);
  expect(screen.getByText(/which part selects it/i)).toBeInTheDocument();
  expect(screen.queryByText(/the selector does/i)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /show answer/i })).toBeInTheDocument();
});

test('Show answer calls onReflect', () => {
  const onReflect = vi.fn();
  const q = { ...base, reflect: { question: L('Q?'), answer: L('A.') } };
  renderPanel(q, { onReflect });
  fireEvent.click(screen.getByRole('button', { name: /show answer/i }));
  expect(onReflect).toHaveBeenCalledOnce();
});

test('reflect answer shows when reflectOpen is true', () => {
  const q = { ...base, reflect: { question: L('Q?'), answer: L('the selector does') } };
  renderPanel(q, { reflectOpen: true });
  expect(screen.getByText(/the selector does/i)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /show answer/i })).not.toBeInTheDocument();
});

test('renders the experiment Try this block', () => {
  const q = { ...base, experiment: L('Add a second tag and run') };
  renderPanel(q);
  expect(screen.getByText(/add a second tag and run/i)).toBeInTheDocument();
});

test('renders the predict block when present', () => {
  const q: Quest = {
    ...base,
    predict: {
      question: L('What changes?'),
      options: [{ text: L('Letters'), correct: true }, { text: L('Nothing'), correct: false }],
      explain: L('color paints text'),
    },
  };
  renderPanel(q);
  expect(screen.getByText(/what changes/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /letters/i })).toBeInTheDocument();
});

test('shows the nudge line when showNudge is true', () => {
  const q = { ...base, reflect: { question: L('Q?'), answer: L('A.') } };
  renderPanel(q, { showNudge: true });
  expect(screen.getByText(/peek at the think question/i)).toBeInTheDocument();
});

test('shows nudge even without a reflect block', () => {
  renderPanel(base, { showNudge: true });
  expect(screen.getByText(/peek at the think question/i)).toBeInTheDocument();
});
