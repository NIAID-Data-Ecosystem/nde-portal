import type { Page, TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Result } from 'axe-core';

/**
 * WCAG 2.0 / 2.1 Level A and AA rule tags. axe-core maps every rule to one or
 * more of these tags, so scanning with this set covers conformance for forms,
 * buttons, headings, color contrast, etc. `best-practice` is included so the
 * structural landmark/heading-order rules (which axe classifies as
 * best-practice rather than WCAG) are evaluated too.
 */
export const WCAG_AA_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'best-practice',
];

/** Impact levels that should block CI. Minor/moderate issues are reported but
 * do not fail the build. */
export const BLOCKING_IMPACTS = ['serious', 'critical'] as const;

export type Impact = (typeof BLOCKING_IMPACTS)[number];

/**
 * Run an axe-core WCAG AA scan against the current page state.
 *
 * @param page    The Playwright page (already navigated to the target route).
 * @param options.include  Optional CSS selector(s) to scope the scan.
 * @param options.exclude  Optional CSS selector(s) to omit from the scan, e.g.
 *   a third-party widget whose markup this app does not own.
 */
export async function analyzeA11y(
  page: Page,
  options: { include?: string | string[]; exclude?: string | string[] } = {},
) {
  let builder = new AxeBuilder({ page }).withTags(WCAG_AA_TAGS);
  if (options.include) {
    builder = builder.include(options.include as any);
  }
  if (options.exclude) {
    builder = builder.exclude(options.exclude as any);
  }
  return builder.analyze();
}

/** Keep only violations whose impact is serious or critical. */
export function blockingViolations(violations: Result[]): Result[] {
  return violations.filter(v => BLOCKING_IMPACTS.includes(v.impact as Impact));
}

/** Compact, human-readable summary of violations for test output and CI logs. */
export function formatViolations(violations: Result[]): string {
  if (violations.length === 0) return 'No violations.';
  return violations
    .map(v => {
      const nodes = v.nodes
        .map(
          n =>
            `      - ${n.target.join(' ')}\n        ${n.failureSummary?.replace(
              /\n/g,
              '\n        ',
            )}`,
        )
        .join('\n');
      return `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.helpUrl}\n${nodes}`;
    })
    .join('\n\n');
}

/**
 * Attach the full axe results (and a readable summary) to the test report so
 * failures and passing-but-noisy scans are both inspectable in the HTML report.
 */
export async function attachA11yReport(
  testInfo: TestInfo,
  name: string,
  violations: Result[],
) {
  await testInfo.attach(`${name} — axe violations (json)`, {
    body: JSON.stringify(violations, null, 2),
    contentType: 'application/json',
  });
  await testInfo.attach(`${name} — axe violations (text)`, {
    body: formatViolations(violations),
    contentType: 'text/plain',
  });
}
