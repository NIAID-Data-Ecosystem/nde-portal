/**
 * Accessibility tests for the Search route (`/search`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. We report every violation in the HTML report but only FAIL the
 * build on `serious` or `critical` impact, so minor/moderate noise doesn't block
 * CI. See e2e/utils/axe.ts and the canonical repository-matcher.spec.ts.
 *
 * State coverage — the full four-state matrix is reachable here. `src/pages/
 * search.tsx` seeds `initialData` from getStaticProps, but every results view is
 * driven by client-side TanStack Query hooks (useSearchResultsData →
 * useSearchResultsQuery, the filter aggregations, the disease carousel), so
 * `page.route` can put the browser-side DOM into loading / empty / populated /
 * error deterministically. We always wait for state-specific UI before scanning
 * so we know we're scanning the mocked DOM, not the SSR seed.
 *
 * Endpoints mocked (all client-side):
 *   - `**\/query*`        the NDE /query API (results + @type facet aggregations)
 *   - `**\/metadata*`     the NDE metadata endpoint backing the filters sidebar
 *   - `**\/api/diseases*` the Strapi diseases lookup behind the carousel
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

const ROUTE = '/search';

// Every external endpoint the route reads. The NDE API endpoints are NOT under
// `/api/`; only the Strapi CMS diseases lookup is.
const API_GLOBS = ['**/query*', '**/metadata*', '**/api/diseases*'];

// A full _meta.completeness block so the per-card completeness badge renders
// without runtime errors when the populated card scrolls into view.
const META = {
  completeness: {
    augmented_recommended_ratio: 0.5,
    augmented_required_ratio: 1,
    recommended_max_score: 10,
    recommended_score: 5,
    recommended_score_ratio: 0.5,
    required_max_score: 10,
    required_ratio: 1,
    required_score: 10,
    total_max_score: 20,
    total_recommended_augmented: 5,
    total_required_augmented: 10,
    total_score: 15,
    weighted_score: 0.75,
  },
  recommended_augmented_fields: [],
  required_augmented_fields: [],
  recommended_fields: ['description'],
  required_fields: ['name'],
};

// Minimal but representative raw NDE /query response for the populated state.
// fetchSearchResults reads `hits`, `total`, and `facets`, so the fixture mirrors
// that shape. A single Dataset hit + a matching `@type` facet count puts the
// default ("d") tab into its populated, card-rendering state.
const DATASET_NAME = 'Accessibility Fixture Dataset';
const POPULATED_FIXTURE = {
  total: 1,
  hits: [
    {
      _id: 'accessibility-fixture-dataset',
      '@type': 'Dataset',
      name: DATASET_NAME,
      description:
        'A deterministic dataset fixture used to verify the populated search results state.',
      date: '2024-01-01',
      includedInDataCatalog: { name: 'Accessibility Fixture Repository' },
      conditionsOfAccess: 'Open',
      isAccessibleForFree: true,
      _meta: META,
    },
  ],
  facets: {
    '@type': {
      _type: 'terms',
      terms: [{ term: 'Dataset', count: 1 }],
      total: 1,
      other: 0,
      missing: 0,
    },
  },
};

const EMPTY_FIXTURE = {
  total: 0,
  hits: [],
  facets: {
    '@type': {
      _type: 'terms',
      terms: [],
      total: 0,
      other: 0,
      missing: 0,
    },
  },
};

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
  // search results header renders the page's single h1 ("Showing all results")
  // in every state, above the results region that varies by state.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: /showing all results/i }),
  ).toBeVisible();

  // Forms: the site-wide search bar is rendered on this route
  // (`includeSearchBar`) and its control must be programmatically labelled.
  const search = page.getByRole('textbox', { name: /search for resources/i });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  // Buttons/links: every button/link must expose an accessible name. axe's
  // `button-name` / `link-name` rules handle aria-label, aria-labelledby, text
  // content and titled icons, so we delegate the authoritative check to axe.
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

// --- Loading -----------------------------------------------------------------

test.describe('a11y: Search — loading', () => {
  test('passes axe while loading', async ({ page }, testInfo) => {
    // Keep every request pending so the loading UI stays on screen.
    for (const glob of API_GLOBS) {
      await page.route(glob, () => new Promise<void>(() => {}));
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // The header h1 renders immediately; the results cards render skeletons
    // through src/components/skeleton with the `.custom-skeleton-loading`
    // class — a CSS selector is acceptable here only because skeletons have no
    // accessible surface to target.
    await expect(
      page.getByRole('heading', { level: 1, name: /showing all results/i }),
    ).toBeVisible();
    await expect(
      page.locator('.custom-skeleton-loading').first(),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Empty -------------------------------------------------------------------

test.describe('a11y: Search — empty', () => {
  test('passes axe with no results', async ({ page }, testInfo) => {
    await page.route('**/query*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(EMPTY_FIXTURE),
      }),
    );
    await page.route('**/metadata*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ build_date: '2026-06-17T00:00:00Z', src: {} }),
      }),
    );
    await page.route('**/api/diseases*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      }),
    );
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the user-facing empty-state message rendered by EmptyState.
    // The default tab renders an EmptyState for both the "Other Resources" and
    // the "Datasets" sections; only the Datasets accordion is expanded by
    // default, so its (last) empty message is the visible one.
    await expect(
      page.getByText('No results found. Please try again.').last(),
    ).toBeVisible();
    await expect(page.locator('.custom-skeleton-loading')).toHaveCount(0);

    await runSharedChecks(page, testInfo, 'empty');
  });
});

// --- Populated ---------------------------------------------------------------

test.describe('a11y: Search — populated', () => {
  test('passes axe with representative data', async ({ page }, testInfo) => {
    await page.route('**/query*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(POPULATED_FIXTURE),
      }),
    );
    await page.route('**/metadata*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ build_date: '2026-06-17T00:00:00Z', src: {} }),
      }),
    );
    await page.route('**/api/diseases*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      }),
    );
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the fixture's result card to render — its title link only exists
    // once the populated data resolves — so we know we're scanning the
    // populated DOM and not the loading or empty state.
    await expect(
      page.getByRole('link', { name: new RegExp(DATASET_NAME, 'i') }).first(),
    ).toBeVisible();
    await expect(page.locator('.custom-skeleton-loading')).toHaveCount(0);

    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Error -------------------------------------------------------------------

test.describe('a11y: Search — error', () => {
  test('passes axe in the error state', async ({ page }, testInfo) => {
    // Abort every data request so the results query rejects and the route
    // renders its ErrorMessage UI, matching a production network failure.
    for (const glob of API_GLOBS) {
      await page.route(glob, route => route.abort());
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the error UI: the ErrorMessage's heading and Retry control.
    await expect(
      page.getByRole('heading', { name: /something went wrong/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /retry/i }).first(),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'error');
  });
});
