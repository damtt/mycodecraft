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
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, [query]);

  return matches;
}

/** True on touch-primary devices (phones/tablets). Gates the code insert toolbar. */
export function useIsTouch(): boolean {
  return useMediaQuery('(pointer: coarse)');
}
