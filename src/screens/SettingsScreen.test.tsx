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
  useSettings.setState({ lang: 'en', soundOn: true, fontScale: 'md' });
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

  test('font size radios update the setting', async () => {
    renderSettings();
    fireEvent.click(await screen.findByRole('radio', { name: /large/i }));
    expect(useSettings.getState().fontScale).toBe('lg');
  });

  test('reset asks for explicit confirmation before wiping', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderSettings();
    // No hold-to-reset until the confirmation dialog is opened.
    expect(screen.queryByRole('button', { name: /hold to reset/i })).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: /^reset progress$/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const hold = screen.getByRole('button', { name: /hold to reset/i });
    fireEvent.mouseDown(hold);
    act(() => void vi.advanceTimersByTime(1600));
    expect(useProfiles.getState().profiles[0].xp).toBe(0);
    vi.useRealTimers();
  });

  test('reset can be cancelled without wiping', async () => {
    renderSettings();
    fireEvent.click(await screen.findByRole('button', { name: /^reset progress$/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useProfiles.getState().profiles[0].xp).toBe(100);
  });
});
