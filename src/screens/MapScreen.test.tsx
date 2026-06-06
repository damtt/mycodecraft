import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import type { Quest, WorldId } from '../lib/types';

const { QUESTS } = vi.hoisted(() => {
  const L = (s: string) => ({ en: s, vi: s });
  const makeQuest = (id: string, world: WorldId): Quest => ({
    id, world, xp: 50, badge: `b-${id}`,
    title: L(`Quest ${id}`), story: L('s'), steps: [], starterCode: '',
    checks: [{ type: 'codeIncludes', value: 'x', failMessage: L('f') }],
  });
  return {
    QUESTS: [makeQuest('html-01', 'html'), makeQuest('html-02', 'html'), makeQuest('css-01', 'css')],
  };
});

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
    await screen.findByRole('button', { name: /quest html-01/i });
    expect(screen.getByRole('button', { name: /quest html-02/i })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /quest html-01/i }));
    expect(router.state.location.pathname).toBe('/quest/html-01');
  });

  test('locked world shows lock and disabled quests', async () => {
    renderMap();
    expect(await screen.findByRole('button', { name: /quest css-01/i })).toBeDisabled();
    expect(document.querySelectorAll('img[src$="/lock.png"]').length).toBeGreaterThan(0);
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
