import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

// Workaround for react-router v7 + jsdom + Node 24.
// jsdom replaces globalThis.AbortController with its own implementation.
// Node/undici's Request validates that the signal is an instance of its
// private AbortSignal class, which jsdom's signal is not.
// Fix: wrap globalThis.Request so that when the signal fails the instanceof
// check we drop it (safe for routing-only requests in tests).
const _NativeRequest = globalThis.Request;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).Request = function PatchedRequest(input: RequestInfo | URL, init?: RequestInit) {
  try {
    return new _NativeRequest(input, init);
  } catch {
    // Retry without signal — the AbortSignal from jsdom's AbortController
    // doesn't pass undici's instanceof check; dropping it is fine for tests.
    const { signal: _signal, ...rest } = (init ?? {}) as RequestInit & { signal?: unknown };
    return new _NativeRequest(input, rest as RequestInit);
  }
};
// Copy static properties so code that uses Request.json / Request.redirect etc. works.
Object.setPrototypeOf((globalThis as any).Request, _NativeRequest);
Object.defineProperties((globalThis as any).Request, Object.getOwnPropertyDescriptors(_NativeRequest));

// jsdom has no matchMedia. Default to "desktop, non-touch":
//   (min-width: ...) -> true  => QuestScreen renders the columns layout
//   (pointer: coarse) -> false => InsertToolbar hidden, BottomNav absent
// Reinstalled before EVERY test so per-test phone/touch overrides (which reassign
// window.matchMedia inside a test body) can never leak across tests if order changes.
function installDefaultMatchMedia() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (query: string) => ({
    matches: /min-width/.test(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
installDefaultMatchMedia();
beforeEach(() => installDefaultMatchMedia());

afterEach(() => {
  cleanup();
  localStorage.clear();
});
