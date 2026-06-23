/**
 * Accessibility tests for the Repository Matcher route (`/repository-matcher`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. We report every violation in the HTML report but only FAIL the
 * build on `serious` or `critical` impact, so minor/moderate noise doesn't block
 * CI. See e2e/utils/axe.ts and the canonical about.spec.ts.
 *
 * The route reads two client-side endpoints, both mocked per state so the page
 * is deterministic and never touches the live network:
 *   - `**​/query*`    — ResourceCatalog search (useResourceCatalogs)
 *   - `**​/metadata*` — repository metadata (useRepoData)
 *
 * State coverage note — this route covers loading / empty / populated but NOT a
 * distinct error state. `src/pages/repository-matcher.tsx` destructures only
 * `{ data, isLoading }` from `useRepositoryMatcherData` and ignores the hook's
 * `error`. When a request fails, `data` resolves to `[]` and `isLoading`
 * becomes false, so the page renders the same "No repositories match" empty UI
 * — there is no error-specific surface (alert, retry) to scan. The empty-state
 * scan below already covers that DOM, so a separate error describe would only
 * re-scan the empty state (with added retry-backoff flakiness).
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

const ROUTE = '/repository-matcher';

// External API(s) this route depends on (NOT under `/api/` — they're the NDE
// query + metadata endpoints). Mock both so the page never hits the network.
const API_GLOBS = ['**/query*', '**/metadata*'];

// A ResourceCatalog hit (served from `**/query*`). It survives the route's
// enrichment filter (`creativeWorkStatus === 'Accepting Data'`, not a
// Data/Sample Repository) so it renders as a populated table row.
const RESOURCE_CATALOG_FIXTURE = {
  _id: 'catalog-accessibility-fixture',
  '@type': 'ResourceCatalog',
  name: 'Accessibility Fixture Catalog',
  description:
    'A deterministic resource catalog fixture used to verify the enriched repository matcher page.',
  url: '/resources/catalog-accessibility-fixture',
  creativeWorkStatus: 'Accepting Data',
  genre: ['IID'],
  conditionsOfAccess: 'Open',
  healthCondition: [{ name: 'Influenza' }],
  infectiousAgent: [{ name: 'Influenza A virus' }],
  species: [{ name: 'Human' }],
  measurementTechnique: [{ name: 'Sequencing' }],
  topicCategory: [{ name: 'Genomics' }],
  temporalCoverage: [{ startDate: '2020-01-01', endDate: '2024-12-31' }],
  license: 'CC-BY-4.0',
};

// A repository source (served from `**/metadata*`). Also `Accepting Data` and
// neither a Data nor Sample Repository, so it survives enrichment too.
const METADATA_FIXTURE = {
  build_date: '2026-06-17T00:00:00Z',
  src: {
    fixtureRepository: {
      sourceInfo: {
        identifier: 'fixture-repository',
        name: 'Accessibility Fixture Repository',
        description:
          'A deterministic repository fixture that exercises the metadata-enriched table state.',
        url: '/resources/fixture-repository',
        creativeWorkStatus: 'Accepting Data',
        type: ['Resource Catalog'],
        genre: ['Generalist'],
        conditionsOfAccess: 'Registered',
        healthCondition: [{ name: 'COVID-19' }],
        infectiousAgent: [{ name: 'SARS-CoV-2' }],
        species: [{ name: 'Human' }],
        measurementTechnique: [{ name: 'Proteomics' }],
        topicCategory: [{ name: 'Immunology' }],
        temporalCoverage: [{ name: 'Current' }],
        license: 'https://creativecommons.org/licenses/by/4.0/',
      },
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

  // Structural sanity — also proves the page rendered the intended chrome.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Repository Matcher' }),
  ).toBeVisible();

  // Forms: the search input is the primary form control on the route and must
  // be programmatically labelled (ariaLabel on the SearchInput).
  const search = page.getByRole('textbox', { name: /search repositories/i });
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

test.describe('a11y: Repository Matcher — loading', () => {
  test('passes axe while loading', async ({ page }, testInfo) => {
    // Keep both data endpoints pending so the route stays in its skeleton state.
    for (const glob of API_GLOBS) {
      await page.route(glob, () => new Promise<void>(() => {}));
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the heading plus a skeleton row. Skeletons render through
    // src/components/skeleton with `.custom-skeleton-loading` and have no
    // accessible surface, so a CSS selector is acceptable for that marker only.
    await expect(
      page.getByRole('heading', { level: 1, name: 'Repository Matcher' }),
    ).toBeVisible();
    await expect(
      page.locator('.custom-skeleton-loading').first(),
    ).toBeVisible();
    // Prove we're not already in the empty or populated DOM.
    await expect(page.getByText('No repositories match')).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Accessibility Fixture Catalog' }),
    ).toHaveCount(0);

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Empty -------------------------------------------------------------------

test.describe('a11y: Repository Matcher — empty', () => {
  test('passes axe with no matching repositories', async ({
    page,
  }, testInfo) => {
    // Resolve both endpoints with empty payloads so the route renders its
    // completed no-results UI instead of skeletons or enriched rows.
    await page.route('**/query*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hits: [], total: 0, facets: null }),
      }),
    );
    await page.route('**/metadata*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          build_date: METADATA_FIXTURE.build_date,
          src: {},
        }),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the user-facing empty-state message.
    await expect(page.getByText('0 results')).toBeVisible();
    await expect(page.getByText('No repositories match')).toBeVisible();
    await expect(
      page.getByText('Try clearing some filters or broadening your search.'),
    ).toBeVisible();
    await expect(page.locator('.custom-skeleton-loading')).toHaveCount(0);

    await runSharedChecks(page, testInfo, 'empty');
  });
});

// --- Populated ---------------------------------------------------------------

test.describe('a11y: Repository Matcher — populated', () => {
  test('passes axe with enriched table data', async ({ page }, testInfo) => {
    // Fulfill both endpoints with fixtures that survive the enrichment filter
    // so the page reaches a deterministic, fully-loaded populated table.
    await page.route('**/query*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hits: [RESOURCE_CATALOG_FIXTURE],
          total: 1,
          facets: null,
        }),
      }),
    );
    await page.route('**/metadata*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(METADATA_FIXTURE),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for both enriched rows (1 catalog + 1 repository) so scans and the
    // report screenshot capture the real populated UI, not the skeleton shell.
    await expect(page.getByText('2 results')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Accessibility Fixture Catalog' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Accessibility Fixture Repository' }),
    ).toBeVisible();
    await expect(page.getByText('No repositories match')).toHaveCount(0);
    await expect(page.locator('.custom-skeleton-loading')).toHaveCount(0);

    await runSharedChecks(page, testInfo, 'populated');
  });
});
