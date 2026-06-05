import { buildSrcdoc } from './runtime';

describe('buildSrcdoc', () => {
  test('embeds user code after the bootstrap script', () => {
    const out = buildSrcdoc('<h1>Hello</h1>');
    expect(out).toContain('<h1>Hello</h1>');
    expect(out.indexOf('cc-bootstrap')).toBeLessThan(out.indexOf('<h1>Hello</h1>'));
  });

  test('bootstrap wires console bridge, error trap, check runner, ready ping', () => {
    const out = buildSrcdoc('');
    for (const marker of ['cc-console', 'cc-error', 'cc-run-checks', 'cc-check-results', 'cc-ready']) {
      expect(out).toContain(marker);
    }
  });

  test('injects the dom evaluator source', () => {
    expect(buildSrcdoc('')).toContain('function evaluateDomCheck');
  });
});
