import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import PixelButton from './PixelButton';
import HoldToConfirm from './HoldToConfirm';
import XpBar from './XpBar';

vi.mock('../features/audio/sounds', () => ({ playSound: vi.fn() }));

describe('PixelButton', () => {
  test('fires onClick', () => {
    const onClick = vi.fn();
    render(<PixelButton onClick={onClick}>Go</PixelButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('HoldToConfirm', () => {
  test('confirms only after full hold; early release cancels', () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    render(<HoldToConfirm label="Reset" holdMs={1500} onConfirm={onConfirm} />);
    const btn = screen.getByRole('button', { name: 'Reset' });

    fireEvent.mouseDown(btn);
    act(() => vi.advanceTimersByTime(800));
    fireEvent.mouseUp(btn);
    act(() => vi.advanceTimersByTime(2000));
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.mouseDown(btn);
    act(() => vi.advanceTimersByTime(1500));
    expect(onConfirm).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  test('touchCancel aborts a pending hold', () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    render(<HoldToConfirm label="Reset" holdMs={1500} onConfirm={onConfirm} />);
    const btn = screen.getByRole('button', { name: 'Reset' });
    fireEvent.touchStart(btn);
    act(() => vi.advanceTimersByTime(800));
    fireEvent.touchCancel(btn);
    act(() => vi.advanceTimersByTime(2000));
    expect(onConfirm).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('XpBar', () => {
  test('fills proportionally within the current rank', () => {
    render(<XpBar xp={100} />); // dirt 0 → stone 200: 50%
    expect(screen.getByTestId('xp-fill')).toHaveStyle({ width: '50%' });
  });
  test('caps at 100% at max rank', () => {
    render(<XpBar xp={9999} />);
    expect(screen.getByTestId('xp-fill')).toHaveStyle({ width: '100%' });
  });
});
