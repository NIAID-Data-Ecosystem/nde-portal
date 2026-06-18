/**
 * Accessibility spec template.
 *
 * Copy to e2e/accessibility/<route-or-feature>.spec.ts and replace every
 * REPLACE_ME. Uses the real e2e/utils/axe helpers: analyzeA11y runs the scan
 * and RETURNS results (it does not assert), so the spec decides what blocks
 * via blockingViolations (serious/critical only).
 *
 * The four describe blocks map to the four states every data-driven route
 * should cover. Delete a state only if it genuinely cannot occur — and think
 * twice before dropping the error state.
 */
import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import {
  analyzeA11y,
  attachA11yReport,
  blockingViolations,
  formatViolations,
  WCAG_AA_TAGS,
} from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/REPLACE_ME'; // route under test
const API_GLOB = '**/api/REPLACE_ME**'; // external API this route depends on

// Minimal but representative payload for the populated state.
const POPULATED_FIXTURE = {
  // REPLACE_ME
};

// --- Shared checks run in every state ---------------------------------------

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Full-page WCAG A/AA scan. The helper's tag set (WCAG_AA_TAGS) already
  // includes color-contrast and the landmark/heading-order best-practice
  // rules, so this single scan is the backbone of the check.
  const results = await analyzeA11y(page);
  await attachA11yReport(testInfo, state, results.violations);

  const blocking = blockingViolations(results.violations);
  expect(blocking, formatViolations(blocking)).toEqual([]);

  // Focused color-contrast scan, reported separately so contrast regressions
  // are easy to triage in the HTML report. (Covered by the scan above too, but
  // called out explicitly per the team's checklist.) There is no helper for
  // this — run the single color-contrast rule inline, matching the canonical
  // repository-matcher spec.
  const contrast = await new AxeBuilder({ page })
    .withTags(WCAG_AA_TAGS)
    .options({ runOnly: { type: 'rule', values: ['color-contrast'] } })
    .analyze();
  await attachA11yReport(testInfo, `${state} — contrast`, contrast.violations);

  const blockingContrast = blockingViolations(contrast.violations);
  expect(blockingContrast, formatViolations(blockingContrast)).toEqual([]);

  // Structural sanity — also proves the page rendered the intended chrome.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Screenshot into the HTML report so reviewers can see the scanned state.
  await testInfo.attach(`${state}-screenshot`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
}

// --- Loading -----------------------------------------------------------------

test.describe('a11y: <route or feature> — loading', () => {
  test('passes axe while loading', async ({ page }, testInfo) => {
    // Keep the request pending so the loading UI stays on screen.
    await page.route(API_GLOB, () => {
      /* intentionally never fulfilled */
    });
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for proof of the loading state. A test id is acceptable here only
    // because skeletons usually have no accessible surface to target.
    await expect(page.getByTestId('REPLACE_ME-skeleton')).toBeVisible();

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Empty -------------------------------------------------------------------

test.describe('a11y: <route or feature> — empty', () => {
  test('passes axe with no data', async ({ page }, testInfo) => {
    await page.route(API_GLOB, route =>
      route.fulfill({
        json: {
          /* resolved empty payload, REPLACE_ME */
        },
      }),
    );
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the user-facing empty-state message.
    await expect(page.getByText(/REPLACE_ME empty message/i)).toBeVisible();

    await runSharedChecks(page, testInfo, 'empty');
  });
});

// --- Populated ---------------------------------------------------------------

test.describe('a11y: <route or feature> — populated', () => {
  test('passes axe with representative data', async ({ page }, testInfo) => {
    await page.route(API_GLOB, route =>
      route.fulfill({ json: POPULATED_FIXTURE }),
    );
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for a user-facing element that only appears once data renders.
    await expect(page.getByRole('REPLACE_ME')).toBeVisible();

    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Error / permission ------------------------------------------------------

test.describe('a11y: <route or feature> — error', () => {
  test('passes axe in the error state', async ({ page }, testInfo) => {
    // Match how the app handles production failures: abort, or fulfill a 5xx.
    await page.route(API_GLOB, route => route.abort());
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the error UI (alert role, retry button, etc.).
    await expect(page.getByRole('alert')).toBeVisible();

    await runSharedChecks(page, testInfo, 'error');
  });
});
