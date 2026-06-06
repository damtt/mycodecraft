import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';

vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

import { routes } from '../app/router';
import { useProfiles } from '../stores/profileStore';
import { useSettings } from '../stores/settingsStore';

beforeEach(() => {
  localStorage.clear();
  useProfiles.setState({ profiles: [], activeId: null });
  useSettings.setState({ lang: 'en' });
});

function renderGame(path: string) {
  useProfiles.getState().create('Mai', '🦊');
  useProfiles.getState().select(useProfiles.getState().profiles[0].id);
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('HudBar home control', () => {
  test('Home navigates to the title screen and keeps the active player', async () => {
    const router = renderGame('/map');
    fireEvent.click(await screen.findByRole('link', { name: /home/i }));
    expect(router.state.location.pathname).toBe('/');
    expect(useProfiles.getState().activeId).not.toBeNull();
  });
});
