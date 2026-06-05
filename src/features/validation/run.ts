import type { Check, Localized } from '../../lib/types';
import { isDomCheck, evaluateLocalCheck, type DomCheck } from './checks';

export interface RunContext {
  code: string;
  consoleLines: string[];
  /** Sends dom checks to the iframe; resolves per-check booleans in order. */
  runDomChecks(checks: DomCheck[]): Promise<boolean[]>;
}

export interface RunResult {
  pass: boolean;
  results: boolean[]; // same order as input checks
  firstFail: { failMessage: Localized } | null;
}

export async function runChecks(checks: Check[], ctx: RunContext): Promise<RunResult> {
  const domChecks = checks.filter(isDomCheck);
  const domResults = domChecks.length > 0 ? await ctx.runDomChecks(domChecks) : [];

  let domIdx = 0;
  const results = checks.map((check) =>
    isDomCheck(check)
      ? domResults[domIdx++] ?? false
      : evaluateLocalCheck(check, ctx),
  );

  const failIdx = results.indexOf(false);
  return {
    pass: failIdx === -1,
    results,
    firstFail: failIdx === -1 ? null : { failMessage: checks[failIdx].failMessage },
  };
}
