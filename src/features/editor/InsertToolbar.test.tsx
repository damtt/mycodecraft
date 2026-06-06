import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../audio/sounds', () => ({ playSound: vi.fn() }));

import InsertToolbar from './InsertToolbar';

function mockTouch(isTouch: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (query: string) => ({
    matches: /coarse/.test(query) ? isTouch : false,
    media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  });
}

describe('InsertToolbar', () => {
  test('on touch, clicking a token calls onInsert with that token', () => {
    mockTouch(true);
    const onInsert = vi.fn();
    render(<InsertToolbar onInsert={onInsert} />);
    fireEvent.click(screen.getByRole('button', { name: '<' }));
    expect(onInsert).toHaveBeenCalledWith('<');
  });

  test('renders nothing on non-touch devices', () => {
    mockTouch(false);
    const { container } = render(<InsertToolbar onInsert={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
