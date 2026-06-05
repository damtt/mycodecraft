import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import { routes } from '../app/router';
import { useSettings } from '../stores/settingsStore';

vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('TitleScreen', () => {
  beforeEach(() => useSettings.setState({ lang: 'en' }));

  test('start button navigates to player select', async () => {
    const router = renderAt('/');
    fireEvent.click(await screen.findByRole('button', { name: /press start/i }));
    expect(router.state.location.pathname).toBe('/players');
  });

  test('language toggle switches UI text', async () => {
    renderAt('/');
    fireEvent.click(await screen.findByTestId('lang-toggle-title'));
    expect(await screen.findByRole('button', { name: /bắt đầu/i })).toBeInTheDocument();
  });
});
