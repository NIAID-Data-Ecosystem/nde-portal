/**
 * Accessibility tests for the Home / index route (`/`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page in each meaningful state. Every violation is attached to the
 * HTML report, but the build only FAILS on `serious`/`critical` impact so
 * minor/moderate noise doesn't block CI. See e2e/utils/axe.ts and the canonical
 * about.spec.ts / repository-matcher.spec.ts.
 *
 * Data model for this route (src/pages/index.tsx):
 *   - The "Explore All Included Resources" table is fed by two CLIENT-SIDE
 *     TanStack Query hooks, both interceptable with `page.route`:
 *       * useResourceCatalogs -> NDE `/query`    (glob `**​/query*`)
 *       * useRepoData         -> NDE `/metadata` (glob `**​/metadata*`)
 *     The table's `isLoading` is the OR of both hooks.
 *   - News/events/features come from `getStaticProps` (server-side) and are out
 *     of reach of `page.route`; they render the same regardless of our mocks.
 *
 * State coverage note — ERROR state is deliberately scanned as the hero-only
 * fallback, NOT a four-state alert UI: when either hook errors, the page hides
 * the ENTIRE content section (`!(repositoriesError || resourceCatalogsError)`)
 * rather than rendering an `alert`/retry control. So the error state has no
 * dedicated accessible error surface — the deterministic, reachable DOM is the
 * HeroBanner + search bar with the content section removed. We assert the
 * content section is gone, then scan what remains.
 */
import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import {
  analyzeA11y,
  attachA11yReport,
  attachScreenshot,
  blockingViolations,
  formatViolations,
  WCAG_AA_TAGS,
} from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/';
const QUERY_GLOB = '**/query*'; // useResourceCatalogs (NDE /query)
const METADATA_GLOB = '**/metadata*'; // useRepoData (NDE /metadata)

// The hero <h1> text (configs/homepage.json -> sections.hero.heading).
const HERO_H1 = 'Discovery Portal';

// Raw `/query` response (fetchSearchResults reads `data.hits`). One resource
// catalog row for the table's populated state.
const QUERY_FIXTURE = {
  total: 1,
  hits: [
    {
      _id: 'rc-fixture-001',
      '@type': 'ResourceCatalog',
      name: 'Fixture Resource Catalog',
      abstract: 'A deterministic resource catalog fixture for a11y scanning.',
      conditionsOfAccess: 'Open',
      genre: ['IID'],
      url: 'https://example.org/catalog',
    },
  ],
};

// Raw `/metadata` response (fetchMetadata reads `data.src`; useRepoData keeps
// sources whose `sourceInfo.identifier` is truthy). One repository row.
const METADATA_FIXTURE = {
  src: {
    fixtureRepo: {
      sourceInfo: {
        _id: 'repo-fixture-001',
        identifier: 'fixture-repo',
        name: 'Fixture Dataset Repository',
        abstract: 'A deterministic repository fixture for a11y scanning.',
        type: 'Dataset Repository',
        conditionsOfAccess: 'Open',
        genre: ['IID'],
        url: 'https://example.org/repo',
      },
    },
  },
};

// --- Shared checks run in every state ---------------------------------------

/**
 * The axe scans every state runs: a full WCAG A/AA scan, a focused
 * color-contrast scan, and a focused button/link-name scan, each reported
 * separately, plus a screenshot. Split out from runSharedChecks so the
 * interaction state (open filter popover) can run the same scans without the
 * resting-layout structure/form assertions, which can flake when a portal is
 * covering the page chrome.
 */
async function runAxeScans(page: Page, testInfo: TestInfo, state: string) {
  // Full-page WCAG A/AA scan. WCAG_AA_TAGS already includes color-contrast and
  // the landmark/heading-order best-practice rules, so this single scan is the
  // backbone of the check.
  const results = await analyzeA11y(page);
  await attachA11yReport(testInfo, state, results.violations);

  const blocking = blockingViolations(results.violations);
  expect(
    blocking,
    `Serious/critical accessibility violations found:\n${formatViolations(
      blocking,
    )}`,
  ).toEqual([]);

  // Focused color-contrast scan, reported separately for easy triage. There is
  // no helper for this — run the single rule inline, matching the canonical spec.
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
  await attachScreenshot(page, testInfo, state);
}

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — also proves the page rendered the intended chrome.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: HERO_H1 }),
  ).toBeVisible();

  // Forms: the site-wide hero search bar must be programmatically labelled.
  // (The in-table "Search table" input is a separate control with its own name,
  // so this name stays unique across states.)
  const search = page.getByRole('textbox', { name: /search for resources/i });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  await runAxeScans(page, testInfo, state);
}

// --- Loading -----------------------------------------------------------------

test.describe('a11y: Home — loading', () => {
  test('passes axe while the resources table is loading', async ({
    page,
  }, testInfo) => {
    // Keep both data requests pending so the table stays in its skeleton state.
    await page.route(QUERY_GLOB, () => new Promise<void>(() => {}));
    await page.route(METADATA_GLOB, () => new Promise<void>(() => {}));

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Proof of the loading state: the table renders skeleton cells tagged
    // data-testid="loading" (src/views/home/components/TableWithSearch). There
    // is no accessible surface for a skeleton, so a testid marker is correct.
    await expect(page.getByTestId('loading').first()).toBeVisible();

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Empty -------------------------------------------------------------------

test.describe('a11y: Home — empty', () => {
  test('passes axe with no repositories or catalogs', async ({
    page,
  }, testInfo) => {
    await page.route(QUERY_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ total: 0, hits: [] }),
      }),
    );
    await page.route(METADATA_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ src: {} }),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // The empty-state message rendered by TableWithSearch when data is empty.
    await expect(page.getByText('No results found.')).toBeVisible();

    await runSharedChecks(page, testInfo, 'empty');
  });
});

// --- Populated ---------------------------------------------------------------

test.describe('a11y: Home — populated', () => {
  test('passes axe with representative table data', async ({
    page,
  }, testInfo) => {
    await page.route(QUERY_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(QUERY_FIXTURE),
      }),
    );
    await page.route(METADATA_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(METADATA_FIXTURE),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for rows that only the mocked fixtures render, so we know both client
    // queries resolved and we're scanning the populated table.
    await expect(
      page.getByRole('link', { name: 'Fixture Resource Catalog' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Fixture Dataset Repository' }),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Error -------------------------------------------------------------------

test.describe('a11y: Home — error', () => {
  test('passes axe when the data requests fail', async ({ page }, testInfo) => {
    // Match production failure handling: aborted requests surface as hook errors
    // (after TanStack Query's default retries).
    await page.route(QUERY_GLOB, route => route.abort());
    await page.route(METADATA_GLOB, route => route.abort());

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // There is no error/alert UI on this route — on error the whole content
    // section is removed. Prove we reached the error state by waiting for the
    // "Getting Started" card (part of that section) to be detached, then scan
    // the hero-only fallback DOM.
    await expect(page.locator('#getting-started-card')).toHaveCount(0);
    await expect(
      page.getByRole('heading', { level: 1, name: HERO_H1 }),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'error');
  });
});

// --- Interaction states ------------------------------------------------------
//
// The states above scan the page at rest. The "Explore Resources" table exposes
// three filter popovers (Type / Research Domain / Access), all the same
// src/components/checkbox-list Popover — mounted-on-open markup a resting scan
// never sees (axe skips hidden nodes). We scan ONE (Research Domain) as the
// representative significant state change; the other two are the identical
// component with different option lists.
//
// NOT separately scanned: the news carousel (advancing it re-renders the same
// card markup — "more of the same") and the applied-filter tags (plain Chakra
// Tag/close buttons covered by the resting button-name scan).

// --- Filter popover (CheckboxList) -------------------------------------------

test.describe('a11y: Home — filter popover', () => {
  test('passes axe with a table filter popover open', async ({
    page,
  }, testInfo) => {
    await page.route(QUERY_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(QUERY_FIXTURE),
      }),
    );
    await page.route(METADATA_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(METADATA_FIXTURE),
      }),
    );
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the populated table, then open the "Research Domain" filter
    // (label is unique to the table, so it can't collide with the search bar).
    await expect(
      page.getByRole('link', { name: 'Fixture Resource Catalog' }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Research Domain', exact: true })
      .click();
    // The popover's checkbox group only exists once open; the fixtures' genre
    // ('IID') is one of the options.
    await expect(
      page.getByRole('checkbox', { name: /IID/i }).first(),
    ).toBeVisible();

    await runAxeScans(page, testInfo, 'filter-popover');
  });
});
