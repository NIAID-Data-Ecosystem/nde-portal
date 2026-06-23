/**
 * Accessibility tests for the Changelog route (`/changelog`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. We report every violation in the HTML report but only FAIL the
 * build on `serious` or `critical` impact, so minor/moderate noise doesn't block
 * CI. See e2e/utils/axe.ts and the canonical repository-matcher.spec.ts.
 *
 * State coverage note — this route is intentionally a SINGLE state, not the
 * four-state matrix, because of how `src/pages/changelog.tsx` is built:
 *   - The page is fully static. It imports `CHANGELOG.md` (via raw-loader) and
 *     `package.json` at build time and renders them through ReactMarkdown. There
 *     is no data hook, no API request, and therefore no loading/empty/error
 *     state to drive — nothing here is interceptable with `page.route`, and the
 *     content is deterministic across runs.
 * The only meaningful, reachable state is the populated changelog content, which
 * is what we scan below.
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

const ROUTE = '/changelog';

// --- Shared checks run in every state ---------------------------------------

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Full-page WCAG A/AA scan. The helper's tag set (WCAG_AA_TAGS) already
  // includes color-contrast and the landmark/heading-order best-practice
  // rules, so this single scan is the backbone of the check.
  const results = await analyzeA11y(page);
  await attachA11yReport(testInfo, state, results.violations);

  const blocking = blockingViolations(results.violations);
  expect(
    blocking,
    `Serious/critical accessibility violations found:\n${formatViolations(
      blocking,
    )}`,
  ).toEqual([]);

  // Focused color-contrast scan, reported separately so contrast regressions
  // are easy to triage in the HTML report. There is no helper for this — run
  // the single color-contrast rule inline, matching the canonical spec.
  const contrast = await new AxeBuilder({ page })
    .withTags(WCAG_AA_TAGS)
    .options({ runOnly: { type: 'rule', values: ['color-contrast'] } })
    .analyze();
  await attachA11yReport(testInfo, `${state} — contrast`, contrast.violations);

  const blockingContrast = blockingViolations(contrast.violations);
  expect(
    blockingContrast,
    `Color-contrast violations found:\n${formatViolations(blockingContrast)}`,
  ).toEqual([]);

  // Structural sanity — also proves the page rendered the intended chrome. The
  // page renders exactly one h1 ("Changelog"); the markdown's own `# Changelog`
  // title is suppressed by the component, and every version entry is an h2/h3.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Changelog', exact: true }),
  ).toBeVisible();

  // This route does not render the site-wide search bar (PageContainer's
  // `includeSearchBar` defaults to false and Changelog does not opt in), so
  // there is no primary form control to assert here.

  // Buttons/links: every button/link must expose an accessible name. axe's
  // `button-name` / `link-name` rules handle aria-label, aria-labelledby, text
  // content and titled icons, so we delegate the authoritative check to axe.
  // The changelog body renders many GitHub compare links, so this is the most
  // exercised check on the page.
  const names = await new AxeBuilder({ page })
    .withTags(WCAG_AA_TAGS)
    .options({
      runOnly: { type: 'rule', values: ['button-name', 'link-name'] },
    })
    .analyze();
  await attachA11yReport(
    testInfo,
    `${state} — button-link-name`,
    names.violations,
  );

  const blockingNames = blockingViolations(names.violations);
  expect(
    blockingNames,
    `Button/link name violations found:\n${formatViolations(blockingNames)}`,
  ).toEqual([]);

  // Screenshot into the HTML report so reviewers can see the scanned state.
  await testInfo.attach(`${state}-screenshot`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
}

// --- Populated ---------------------------------------------------------------

test.describe('a11y: Changelog — populated content', () => {
  test('passes axe with the rendered changelog', async ({ page }, testInfo) => {
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for content that only the rendered changelog produces — the page h1
    // and the version badge — so we know the markdown finished rendering before
    // we scan.
    await expect(
      page.getByRole('heading', { level: 1, name: 'Changelog', exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/^V\./)).toBeVisible();

    await runSharedChecks(page, testInfo, 'populated');
  });
});
