import { render, screen, fireEvent, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import { routes } from '../app/router';
import { useProfiles } from '../stores/profileStore';

vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

function renderAt(path = '/players') {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  localStorage.clear();
  useProfiles.setState({ profiles: [], activeId: null });
});

describe('PlayersScreen', () => {
  test('creates a profile through the new-player form', async () => {
    renderAt();
    fireEvent.click(await screen.findByRole('button', { name: /new player/i }));
    fireEvent.change(screen.getByPlaceholderText(/your name/i), { target: { value: 'Mai' } });
    fireEvent.click(screen.getByRole('radio', { name: '🦊' }));
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));
    expect(useProfiles.getState().profiles[0]).toMatchObject({ name: 'Mai', avatar: '🦊' });
  });

  test('create is disabled with empty name', async () => {
    renderAt();
    fireEvent.click(await screen.findByRole('button', { name: /new player/i }));
    expect(screen.getByRole('button', { name: /^create$/i })).toBeDisabled();
  });

  test('selecting a profile activates it and navigates to map', async () => {
    useProfiles.getState().create('Tom', '🐺');
    const router = renderAt();
    fireEvent.click(await screen.findByRole('button', { name: /tom/i }));
    expect(useProfiles.getState().activeId).toBe(useProfiles.getState().profiles[0].id);
    expect(router.state.location.pathname).toBe('/map');
  });

  test('pressing Enter in the name field creates the profile', async () => {
    renderAt();
    fireEvent.click(await screen.findByRole('button', { name: /new player/i }));
    const input = screen.getByPlaceholderText(/your name/i);
    fireEvent.change(input, { target: { value: 'Lan' } });
    fireEvent.submit(input.closest('form')!);
    expect(useProfiles.getState().profiles[0]).toMatchObject({ name: 'Lan' });
  });

  test('hold-to-delete removes a profile', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useProfiles.getState().create('Tom', '🐺');
    renderAt();
    const del = await screen.findByRole('button', { name: /hold to delete/i });
    fireEvent.mouseDown(del);
    act(() => void vi.advanceTimersByTime(1600));
    expect(useProfiles.getState().profiles).toHaveLength(0);
    vi.useRealTimers();
  });
});
