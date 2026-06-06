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
    fireEvent.click(screen.getByRole('radio', { name: 'fox' }));
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));
    expect(useProfiles.getState().profiles[0]).toMatchObject({ name: 'Mai', avatar: 'fox' });
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

  test('deleting a profile requires confirmation, then hold-to-delete removes it', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useProfiles.getState().create('Tom', '🐺');
    renderAt();
    // Hold-to-delete is not shown until the user confirms intent.
    expect(screen.queryByRole('button', { name: /hold to delete/i })).toBeNull();
    fireEvent.click(await screen.findByRole('button', { name: /^delete$/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const del = screen.getByRole('button', { name: /hold to delete/i });
    fireEvent.mouseDown(del);
    act(() => void vi.advanceTimersByTime(1600));
    expect(useProfiles.getState().profiles).toHaveLength(0);
    vi.useRealTimers();
  });

  test('cancelling the delete confirmation keeps the profile', async () => {
    useProfiles.getState().create('Tom', '🐺');
    renderAt();
    fireEvent.click(await screen.findByRole('button', { name: /^delete$/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(useProfiles.getState().profiles).toHaveLength(1);
  });

  test('back link returns to the title screen', async () => {
    const router = renderAt('/players');
    fireEvent.click(await screen.findByRole('link', { name: /back to title/i }));
    expect(router.state.location.pathname).toBe('/');
  });
});
