import { expect, type Page, type TestInfo } from '@playwright/test';
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
 * Wait for in-flight CSS transitions and finite animations to finish before a
 * scan runs.
 *
 * Why this matters for axe: Chakra fades many surfaces in by animating opacity
 * 0→1 — `<Skeleton>` reveals its loaded contents, `<Collapse>` expands a panel,
 * cards fade up on mount. axe-core computes color-contrast against the
 * *rendered*, alpha-blended colors, so a scan that lands mid-fade composites
 * foreground/background through a still-transparent ancestor and reports false
 * contrast failures. (Concretely: the Sources CTA button is teal `#0B8484` at
 * 4.52:1 on white at rest, but composites to a lighter `#128787` at 4.33:1
 * while its card is still fading in.) Letting animations settle first means
 * every scan sees the final, opaque colors and is deterministic.
 *
 * Infinite animations (skeleton shimmer, spinners) never finish, so they are
 * treated as already settled rather than waited on — otherwise the loading
 * state would hang here. The wait is best-effort and bounded: if nothing
 * settles within `timeout` we scan anyway, so this can only make scans more
 * stable, never hang a previously-passing test.
 */
export async function waitForAnimationsSettled(page: Page, timeout = 5000) {
  try {
    await page.waitForFunction(
      () =>
        document.getAnimations().every(animation => {
          // A pending animation hasn't committed its first frame yet — wait.
          if (animation.pending) return false;
          const timing = animation.effect?.getComputedTiming?.();
          // Infinite loops (shimmer/spinner) never finish: treat as settled.
          if (timing?.iterations === Infinity) return true;
          return (
            animation.playState === 'finished' || animation.playState === 'idle'
          );
        }),
      undefined,
      { timeout },
    );
  } catch {
    // Best-effort: a stuck or unusually long finite animation must not fail the
    // scan. Falling through scans the current frame, matching prior behavior.
  }
}

/**
 * Wait for the search-filters "Clear All" button to finish fading in before a
 * scan on the `/search` route (search results and visual-summary specs).
 *
 * The button (`FiltersContainer`, a secondary `variant='link'` button) starts
 * `isDisabled` (opacity 0.4) on first paint, then the page seeds the default
 * date filter and flips it enabled — animating opacity 0.4 → 1 via Chakra's
 * default `transition: common`. Because that flip is a *late* React state
 * update, the transition often begins after `waitForAnimationsSettled` has
 * already run, so axe scans the button mid-fade (enabled but dimmed to ~2.3:1)
 * and reports a false, intermittent color-contrast failure. Its resting state
 * is fully opaque and passes (secondary.500 `#321EB5` ≈ 10:1 on white).
 *
 * Opacity 1 is the terminal, monotonic resting state (it never fades back
 * down), so waiting for it guarantees the fade is complete. An absent button
 * (should not occur on this route) counts as settled so this never hangs. This
 * complements `waitForAnimationsSettled`, which cannot catch a transition that
 * has not started yet.
 */
export async function waitForSearchFiltersSettled(page: Page, timeout = 5000) {
  try {
    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll('button'))
          .filter(b => b.textContent?.trim() === 'Clear All')
          .every(b => getComputedStyle(b).opacity === '1'),
      undefined,
      { timeout },
    );
  } catch {
    // Best-effort, matching waitForAnimationsSettled: never hang or fail a scan
    // on this wait; fall through and let the axe scan report the real state.
  }
}

/**
 * Run an axe-core WCAG AA scan against the current page state.
 *
 * Before scanning, this waits for in-flight transitions/finite animations to
 * settle (see `waitForAnimationsSettled`) so contrast is computed against the
 * final, opaque colors rather than a mid-fade frame. Because every spec scans
 * through this helper, that stabilization applies to all current and future
 * a11y tests automatically — no per-spec wait needed.
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
  await waitForAnimationsSettled(page);
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

/**
 * Attach a screenshot of the scanned state to the HTML report.
 *
 * This is diagnostic only — it runs after the axe assertions, so it must never
 * fail an otherwise-passing scan. A `fullPage` screenshot composites the entire
 * scrollable height into a single bitmap, which can crash the Chromium renderer
 * (SIGSEGV / "Target crashed") under software rendering (SwiftShader) on
 * GPU-less hosts such as WSL2 and CI when a page is very tall. So we prefer the
 * full-page capture, fall back to a viewport-only screenshot, and finally
 * swallow the error rather than turning a green scan red.
 */
export async function attachScreenshot(
  page: Page,
  testInfo: TestInfo,
  name: string,
) {
  try {
    await testInfo.attach(`${name}-screenshot`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  } catch {
    try {
      await testInfo.attach(`${name}-screenshot`, {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    } catch {
      // Screenshot capture is best-effort; ignore failures entirely.
    }
  }
}

/**
 * The canonical per-state axe check shared by every a11y spec.
 *
 * Runs a SINGLE full WCAG A/AA traversal, then derives the focused
 * color-contrast and button/link-name report sections by filtering that one
 * result by rule id. Because `WCAG_AA_TAGS` already includes the
 * `color-contrast`, `button-name`, and `link-name` rules, filtering the full
 * result is exactly equivalent to re-running axe with `runOnly` for those
 * rules — but walks the DOM once instead of three times. Each section is still
 * attached separately to the HTML report for easy triage, and a screenshot of
 * the scanned state is attached last (best-effort, never fails a green scan).
 *
 * Only `serious`/`critical` impacts fail the build (see `blockingViolations`);
 * minor/moderate noise is reported but non-blocking.
 *
 * @param options  Optional `include`/`exclude` selectors forwarded to
 *   `analyzeA11y` to scope the scan (e.g. excluding a third-party widget).
 */
export async function runAxeScans(
  page: Page,
  testInfo: TestInfo,
  state: string,
  options: { include?: string | string[]; exclude?: string | string[] } = {},
) {
  // Full-page WCAG A/AA scan — the backbone check. This single traversal also
  // evaluates color-contrast and button/link-name, which we slice out below.
  const results = await analyzeA11y(page, options);
  await attachA11yReport(testInfo, state, results.violations);

  const blocking = blockingViolations(results.violations);
  expect(
    blocking,
    `Serious/critical accessibility violations found:\n${formatViolations(
      blocking,
    )}`,
  ).toEqual([]);

  // Focused color-contrast section, reported separately for easy triage.
  const contrast = results.violations.filter(v => v.id === 'color-contrast');
  await attachA11yReport(testInfo, `${state} — contrast`, contrast);

  const blockingContrast = blockingViolations(contrast);
  expect(
    blockingContrast,
    `Color-contrast violations found:\n${formatViolations(blockingContrast)}`,
  ).toEqual([]);

  // Buttons/links: every button/link must expose an accessible name. axe's
  // `button-name`/`link-name` rules handle aria-label, aria-labelledby, text
  // content and titled icons.
  const names = results.violations.filter(
    v => v.id === 'button-name' || v.id === 'link-name',
  );
  await attachA11yReport(testInfo, `${state} — button-link-name`, names);

  const blockingNames = blockingViolations(names);
  expect(
    blockingNames,
    `Button/link name violations found:\n${formatViolations(blockingNames)}`,
  ).toEqual([]);

  // Screenshot into the HTML report so reviewers can see the scanned state.
  await attachScreenshot(page, testInfo, state);
}
