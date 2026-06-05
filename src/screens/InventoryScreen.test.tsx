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
