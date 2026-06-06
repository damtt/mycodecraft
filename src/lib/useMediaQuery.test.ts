import { renderHook } from '@testing-library/react';
import { useMediaQuery, useIsTouch } from './useMediaQuery';

function mockMatch(matches: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (query: string) => ({
    matches, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  });
}

describe('useMediaQuery', () => {
  test('returns true when the query matches', () => {
    mockMatch(true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  test('returns false when the query does not match', () => {
    mockMatch(false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  test('useIsTouch reflects pointer:coarse', () => {
    mockMatch(true);
    const { result } = renderHook(() => useIsTouch());
    expect(result.current).toBe(true);
  });
});
