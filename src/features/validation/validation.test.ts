import type { Check } from '../../lib/types';
import { evaluateDomCheck, evaluateLocalCheck, isDomCheck } from './checks';
import { runChecks } from './run';

const L = (s: string) => ({ en: s, vi: s });
const doc = (html: string) => new DOMParser().parseFromString(html, 'text/html');

describe('isDomCheck', () => {
  test('correctly identifies dom vs local checks', () => {
    expect(isDomCheck({ type: 'elementExists', selector: 'h1', failMessage: L('f') })).toBe(true);
    expect(isDomCheck({ type: 'codeIncludes', value: 'x', failMessage: L('f') })).toBe(false);
  });
});

describe('evaluateDomCheck', () => {
  test('elementExists', () => {
    const d = doc('<h1>Hi</h1>');
    expect(evaluateDomCheck({ type: 'elementExists', selector: 'h1', failMessage: L('f') }, d)).toBe(true);
    expect(evaluateDomCheck({ type: 'elementExists', selector: 'h2', failMessage: L('f') }, d)).toBe(false);
  });

  test('textIncludes is case-insensitive and trims', () => {
    const d = doc('<h1>  Hello World </h1>');
    expect(evaluateDomCheck({ type: 'textIncludes', selector: 'h1', value: 'hello', failMessage: L('f') }, d)).toBe(true);
    expect(evaluateDomCheck({ type: 'textIncludes', selector: 'h1', value: 'bye', failMessage: L('f') }, d)).toBe(false);
  });

  test('attrEquals', () => {
    const d = doc('<a href="https://example.com">x</a>');
    expect(evaluateDomCheck({ type: 'attrEquals', selector: 'a', attr: 'href', value: 'https://example.com', failMessage: L('f') }, d)).toBe(true);
    expect(evaluateDomCheck({ type: 'attrEquals', selector: 'a', attr: 'href', value: 'https://other.com', failMessage: L('f') }, d)).toBe(false);
  });

  test('elementCount min', () => {
    const d = doc('<ul><li>a</li><li>b</li><li>c</li></ul>');
    expect(evaluateDomCheck({ type: 'elementCount', selector: 'li', min: 3, failMessage: L('f') }, d)).toBe(true);
    expect(evaluateDomCheck({ type: 'elementCount', selector: 'li', min: 4, failMessage: L('f') }, d)).toBe(false);
  });

  test('computedStyle matches any accepted value', () => {
    const d = doc('<h1 style="color: red">Hi</h1>');
    expect(evaluateDomCheck({ type: 'computedStyle', selector: 'h1', prop: 'color', equalsAny: ['red', 'rgb(255, 0, 0)'], failMessage: L('f') }, d)).toBe(true);
    expect(evaluateDomCheck({ type: 'computedStyle', selector: 'h1', prop: 'color', equalsAny: ['blue', 'rgb(0, 0, 255)'], failMessage: L('f') }, d)).toBe(false);
  });

  test('missing element fails every dom check type', () => {
    const d = doc('<p>x</p>');
    expect(evaluateDomCheck({ type: 'textIncludes', selector: 'h1', value: 'x', failMessage: L('f') }, d)).toBe(false);
    expect(evaluateDomCheck({ type: 'computedStyle', selector: 'h1', prop: 'color', equalsAny: ['red'], failMessage: L('f') }, d)).toBe(false);
  });

  test('is self-contained: its source string survives Function() reconstruction', () => {
    const rebuilt = new Function(`return (${evaluateDomCheck.toString()})`)() as typeof evaluateDomCheck;
    const d = doc('<h1>Hi</h1>');
    expect(rebuilt({ type: 'elementExists', selector: 'h1', failMessage: L('f') }, d)).toBe(true);
  });
});

describe('evaluateLocalCheck', () => {
  test('codeIncludes ignores whitespace runs and case', () => {
    const ctx = { code: '<H1>hi</H1>', consoleLines: [] as string[] };
    expect(evaluateLocalCheck({ type: 'codeIncludes', value: '<h1>', failMessage: L('f') }, ctx)).toBe(true);
    expect(evaluateLocalCheck({ type: 'codeIncludes', value: 'class=', failMessage: L('f') }, ctx)).toBe(false);
  });

  test('consoleIncludes scans captured lines', () => {
    const ctx = { code: '', consoleLines: ['Hello, miner!', '128'] };
    expect(evaluateLocalCheck({ type: 'consoleIncludes', value: 'Hello, miner!', failMessage: L('f') }, ctx)).toBe(true);
    expect(evaluateLocalCheck({ type: 'consoleIncludes', value: 'creeper', failMessage: L('f') }, ctx)).toBe(false);
  });
});

describe('runChecks', () => {
  const checks: Check[] = [
    { type: 'codeIncludes', value: 'h1', failMessage: L('local-fail') },
    { type: 'elementExists', selector: 'h1', failMessage: L('dom-fail') },
  ];

  test('merges local and dom results in original order; first failure surfaces', async () => {
    const result = await runChecks(checks, {
      code: '<h1>x</h1>',
      consoleLines: [],
      runDomChecks: async (domChecks) => domChecks.map(() => false),
    });
    expect(result.pass).toBe(false);
    expect(result.results).toEqual([true, false]);
    expect(result.firstFail?.failMessage.en).toBe('dom-fail');
  });

  test('all pass', async () => {
    const result = await runChecks(checks, {
      code: '<h1>x</h1>',
      consoleLines: [],
      runDomChecks: async (domChecks) => domChecks.map(() => true),
    });
    expect(result).toMatchObject({ pass: true, firstFail: null });
  });
});
