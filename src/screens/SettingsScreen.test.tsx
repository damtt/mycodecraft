import { render, screen, fireEvent, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';

vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

import { routes } from '../app/router';
import { useProfiles } from '../stores/profileStore';
import { useSettings } from '../stores/settingsStore';

beforeEach(() => {
  localStorage.clear();
  useProfiles.setState({ profiles: [], activeId: null });
  useSettings.setState({ lang: 'en', soundOn: true });
});

function renderSettings() {
  useProfiles.getState().create('Mai', '🦊');
  const id = useProfiles.getState().profiles[0].id;
  useProfiles.setState((s) => ({
    profiles: s.profiles.map((p) => ({ ...p, xp: 100 })),
  }));
  useProfiles.getState().select(id);
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/settings'] })} />);
}

describe('SettingsScreen', () => {
  test('language radios switch the app language', async () => {
    renderSettings();
    fireEvent.click(await screen.findByRole('radio', { name: /tiếng việt/i }));
    expect(useSettings.getState().lang).toBe('vi');
  });

  test('sound toggle flips setting', async () => {
    renderSettings();
    fireEvent.click(await screen.findByRole('checkbox', { name: /sound/i }));
    expect(useSettings.getState().soundOn).toBe(false);
  });

  test('hold-to-reset zeroes active profile progress', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderSettings();
    const btn = await screen.findByRole('button', { name: /hold to reset/i });
    fireEvent.mouseDown(btn);
    act(() => void vi.advanceTimersByTime(2100));
    expect(useProfiles.getState().profiles[0].xp).toBe(0);
    vi.useRealTimers();
  });
});
