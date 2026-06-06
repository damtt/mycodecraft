import { useEffect, useState } from 'react';

/** Reactive `window.matchMedia` boolean. SSR/jsdom-safe. */
export function useMediaQuery(query: string): boolean {
  const get = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(get);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    // Legacy Safari < 14 / older iPad WebViews expose only addListener.
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}

/** True on touch-primary devices (phones/tablets). Gates the code insert toolbar. */
export function useIsTouch(): boolean {
  return useMediaQuery('(pointer: coarse)');
}

/**
 * The phone↔tablet divider. Mirrors Tailwind's default `md` breakpoint (768px)
 * so JS layout branches (QuestScreen columns/tabs, BottomNav) stay in lockstep
 * with the `md:` utility classes used for CSS-only responsive bits.
 */
export const WIDE_QUERY = '(min-width: 768px)';

/** True at tablet/desktop widths (>= md). Drives the QuestScreen layout + BottomNav. */
export function useIsWide(): boolean {
  return useMediaQuery(WIDE_QUERY);
}
