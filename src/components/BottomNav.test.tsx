import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';

vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

import BottomNav from './BottomNav';

function mockWidth(isWide: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (query: string) => ({
    matches: /min-width/.test(query) ? isWide : false,
    media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  });
}

function renderNavAt(path: string) {
  const router = createMemoryRouter([{ path: '*', element: <BottomNav /> }], { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('BottomNav', () => {
  test('on phone, shows Home/Map/Inventory/Settings links', () => {
    mockWidth(false);
    renderNavAt('/map');
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /world map/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /chest/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  test('renders nothing on desktop widths', () => {
    mockWidth(true);
    const { container } = render(
      <RouterProvider router={createMemoryRouter([{ path: '*', element: <BottomNav /> }], { initialEntries: ['/map'] })} />,
    );
    expect(container.querySelector('nav')).toBeNull();
  });
});
