import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';

vi.mock('../audio/sounds', () => ({ playSound: vi.fn() }));

import GuideBuddy from './GuideBuddy';
import { useGuide } from './guideStore';
import { useSettings } from '../../stores/settingsStore';

beforeEach(() => {
  useGuide.setState({ bubble: null, greeted: new Set(), questCtx: null, editorFocused: false });
  useSettings.setState({ guideOn: true, lang: 'en' });
});

function renderBuddyAt(path: string) {
  const router = createMemoryRouter([{ path: '*', element: <GuideBuddy /> }], { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('GuideBuddy', () => {
  test('greets once on a screen with a text-only message (action buttons only after tapping)', async () => {
    renderBuddyAt('/map');
    expect(await screen.findByText(/pick a quest to start crafting/i)).toBeInTheDocument();
  });

  test('tapping the mascot reveals action buttons', async () => {
    renderBuddyAt('/map');
    fireEvent.click(await screen.findByRole('button', { name: /guide buddy/i }));
    expect(screen.getByRole('button', { name: /what's this screen/i })).toBeInTheDocument();
  });

  test('screen-help action shows the screen explanation', async () => {
    renderBuddyAt('/map');
    fireEvent.click(await screen.findByRole('button', { name: /guide buddy/i }));
    fireEvent.click(screen.getByRole('button', { name: /what's this screen/i }));
    expect(await screen.findByText(/tap a glowing quest/i)).toBeInTheDocument();
  });

  test('is not rendered when guideOn is false', () => {
    useSettings.setState({ guideOn: false });
    const { container } = render(
      <RouterProvider router={createMemoryRouter([{ path: '*', element: <GuideBuddy /> }], { initialEntries: ['/map'] })} />,
    );
    expect(container.textContent).toBe('');
  });
});
