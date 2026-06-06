import { useEffect, useRef } from 'react';

const ACTIVITY = ['pointerdown', 'keydown', 'touchstart'] as const;

/** Calls `onIdle` after `ms` of no user activity; rearms on each activity event. */
export function useIdle(ms: number, onIdle: () => void): void {
  const cb = useRef(onIdle);
  cb.current = onIdle;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => cb.current(), ms);
    };
    ACTIVITY.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      ACTIVITY.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [ms]);
}
