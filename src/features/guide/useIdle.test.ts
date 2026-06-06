import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useIdle } from './useIdle';

describe('useIdle', () => {
  test('fires after the idle period elapses', () => {
    vi.useFakeTimers();
    const onIdle = vi.fn();
    renderHook(() => useIdle(1000, onIdle));
    expect(onIdle).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(1000));
    expect(onIdle).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  test('activity resets the timer', () => {
    vi.useFakeTimers();
    const onIdle = vi.fn();
    renderHook(() => useIdle(1000, onIdle));
    act(() => void vi.advanceTimersByTime(700));
    act(() => void window.dispatchEvent(new Event('pointerdown')));
    act(() => void vi.advanceTimersByTime(700));
    expect(onIdle).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(300));
    expect(onIdle).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
