import { useCallback, useEffect, useRef, useState } from 'react';
import type { DomCheck } from '../validation/checks';
import { buildSrcdoc } from './runtime';

export interface RuntimeError {
  message: string;
  line: number;
}

const WATCHDOG_MS = 2000;
const CHECK_TIMEOUT_MS = 1500;

/**
 * Owns the sandboxed preview iframe state. `code` should already be
 * debounced by the caller. Watchdog: if cc-ready doesn't arrive within 2s of
 * a srcdoc change, the frame is declared stuck (likely infinite loop) —
 * caller shows a friendly message and we force a reload via key bump.
 */
export function usePreview(code: string) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [runtimeError, setRuntimeError] = useState<RuntimeError | null>(null);
  const [stuck, setStuck] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const pending = useRef(new Map<number, (results: boolean[]) => void>());
  const nextId = useRef(0);
  const readyRef = useRef(false);

  const srcdoc = buildSrcdoc(code);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data ?? {};
      switch (data.type) {
        case 'cc-console':
          setConsoleLines((lines) => [...lines, String(data.text)]);
          break;
        case 'cc-error':
          setRuntimeError({ message: String(data.message), line: Number(data.line) });
          break;
        case 'cc-ready':
          readyRef.current = true;
          setStuck(false);
          break;
        case 'cc-check-results':
          pending.current.get(data.id)?.(data.results as boolean[]);
          pending.current.delete(data.id);
          break;
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Reset per-render state and arm the watchdog whenever the doc changes.
  useEffect(() => {
    setConsoleLines([]);
    setRuntimeError(null);
    readyRef.current = false;
    const timer = setTimeout(() => {
      if (!readyRef.current) setStuck(true);
    }, WATCHDOG_MS);
    return () => clearTimeout(timer);
  }, [srcdoc, reloadKey]);

  const reload = useCallback(() => {
    setStuck(false);
    setReloadKey((k) => k + 1);
  }, []);

  const runDomChecks = useCallback((checks: DomCheck[]): Promise<boolean[]> => {
    return new Promise((resolve) => {
      const id = nextId.current++;
      pending.current.set(id, resolve);
      iframeRef.current?.contentWindow?.postMessage({ type: 'cc-run-checks', id, checks }, '*');
      setTimeout(() => {
        if (pending.current.has(id)) {
          pending.current.delete(id);
          resolve(checks.map(() => false)); // unresponsive frame = checks fail
        }
      }, CHECK_TIMEOUT_MS);
    });
  }, []);

  return { iframeRef, srcdoc, reloadKey, consoleLines, runtimeError, stuck, reload, runDomChecks };
}
