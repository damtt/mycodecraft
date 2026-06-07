import type { Check } from '../../lib/types';

export type DomCheck = Extract<
  Check,
  { type: 'elementExists' | 'textIncludes' | 'textNonEmpty' | 'attrEquals' | 'attrMatches' | 'computedStyle' | 'elementCount' }
>;
export type LocalCheck = Extract<Check, { type: 'codeIncludes' | 'consoleIncludes' }>;

export function isDomCheck(check: Check): check is DomCheck {
  return check.type !== 'codeIncludes' && check.type !== 'consoleIncludes';
}

/**
 * ⚠️ MUST STAY SELF-CONTAINED — no imports, no outer-scope references, no TS
 * enums. Its compiled source is injected into the preview iframe via
 * `evaluateDomCheck.toString()` (see features/preview/runtime.ts). The test
 * "is self-contained" enforces this.
 *
 * Caller contract: kid code can sabotage the DOM (e.g., override
 * document.querySelector or add throwing getters) — callers MUST wrap each
 * invocation in try/catch and treat a throw as `false`. The iframe-side
 * runner (features/preview/runtime.ts) does this.
 */
export function evaluateDomCheck(
  check: {
    type: string; selector?: string; value?: string; attr?: string; pattern?: string;
    prop?: string; equalsAny?: string[]; min?: number; failMessage?: unknown;
  },
  doc: Document,
): boolean {
  const el = check.selector ? doc.querySelector(check.selector) : null;
  switch (check.type) {
    case 'elementExists':
      return el !== null;
    case 'textIncludes':
      return el !== null &&
        (el.textContent || '').toLowerCase().includes((check.value || '').toLowerCase());
    case 'textNonEmpty':
      return el !== null && (el.textContent || '').trim() !== '';
    case 'attrEquals':
      return el !== null && el.getAttribute(check.attr || '') === check.value;
    case 'attrMatches': {
      if (el === null) return false;
      const raw = el.getAttribute(check.attr || '');
      return raw !== null && new RegExp(check.pattern || '').test(raw);
    }
    case 'computedStyle': {
      if (el === null) return false;
      const view = doc.defaultView || window;
      const actual = view.getComputedStyle(el).getPropertyValue(check.prop || '').trim();
      return (check.equalsAny || []).some((v) => v === actual);
    }
    case 'elementCount':
      return doc.querySelectorAll(check.selector || '').length >= (check.min || 0);
    default:
      return false;
  }
}

export interface LocalContext {
  code: string;
  consoleLines: string[];
}

export function evaluateLocalCheck(check: LocalCheck, ctx: LocalContext): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ');
  switch (check.type) {
    case 'codeIncludes':
      return norm(ctx.code).includes(norm(check.value));
    // Deliberately case- and whitespace-SENSITIVE (unlike codeIncludes):
    // console checks assert on exact program output, e.g. 'Hello, miner!'.
    case 'consoleIncludes':
      return ctx.consoleLines.some((line) => line.includes(check.value));
  }
}
