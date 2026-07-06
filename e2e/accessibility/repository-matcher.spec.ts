import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  analyzeA11y,
  attachA11yReport,
  blockingViolations,
  formatViolations,
  WCAG_AA_TAGS,
} from '../utils/axe';

/**
 * Accessibility tests for the Repository Matcher route.
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against
 * the rendered page. We report every violation in the HTML report but only
 * FAIL the build on `serious` or `critical` impact, so minor/moderate noise
 * doesn't block CI.
 *
 * Covered concerns: forms, buttons, headings, landmarks, and color contrast —
 * all of which are part of the WCAG AA rule set scanned below, with extra
 * structural assertions to catch regressions early and give clearer failures.
 */

const ROUTE = '/repository-matcher';

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

function runRepositoryMatcherA11yTests() {
  test('has no serious or critical WCAG AA violations', async ({
    page,
  }, testInfo) => {
    const results = await analyzeA11y(page);

    await attachA11yReport(testInfo, 'full-page', results.violations);

    const blocking = blockingViolations(results.violations);
    expect(
      blocking,
      `Serious/critical accessibility violations found:\n${formatViolations(
        blocking,
      )}`,
    ).toEqual([]);
  });

  test('has no serious or critical color-contrast violations', async ({
    page,
  }, testInfo) => {
    // Scoped scan that runs ONLY the color-contrast rule for a focused report.
    const results = await new AxeBuilder({ page })
      .withTags(WCAG_AA_TAGS)
      .options({ runOnly: { type: 'rule', values: ['color-contrast'] } })
      .analyze();

    await attachA11yReport(testInfo, 'color-contrast', results.violations);

    const blocking = blockingViolations(results.violations);
    expect(
      blocking,
      `Color-contrast violations found:\n${formatViolations(blocking)}`,
    ).toEqual([]);
  });

  test('search form control has an accessible name', async ({ page }) => {
    // Forms: the search input is the primary form control on the route and
    // must be programmatically labelled.
    const search = page.getByRole('textbox', {
      name: /search repositories/i,
    });
    await expect(search).toBeVisible();
    await expect(search).toBeEditable();
  });

  test('buttons and links expose accessible names', async ({
    page,
  }, testInfo) => {
    // Buttons/links: at least one button must render, and every button/link
    // must have an accessible name. axe's `button-name` / `link-name` rules
    // handle aria-label, aria-labelledby, text content, and titled icons, so
    // we delegate the authoritative check to axe rather than reimplementing
    // accessible-name computation here.
    await expect(page.getByRole('button').first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_AA_TAGS)
      .options({
        runOnly: { type: 'rule', values: ['button-name', 'link-name'] },
      })
      .analyze();

    await attachA11yReport(testInfo, 'button-link-name', results.violations);

    const blocking = blockingViolations(results.violations);
    expect(
      blocking,
      `Button/link name violations found:\n${formatViolations(blocking)}`,
    ).toEqual([]);
  });
}

test.describe('Repository Matcher — loading state accessibility', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Keep both data endpoints pending so the route remains in its intentional
    // skeleton/loading state for this describe block.
    await page.route('**/query*', () => new Promise<void>(() => {}));
    await page.route('**/metadata*', () => new Promise<void>(() => {}));

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { level: 1, name: 'Repository Matcher' }),
    ).toBeVisible();
    await expect(
      page.locator('.custom-skeleton-loading').first(),
    ).toBeVisible();
    await expect(page.getByText('No repositories match')).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Accessibility Fixture Catalog' }),
    ).toHaveCount(0);

    await testInfo.attach('loading-page — screenshot', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });

  runRepositoryMatcherA11yTests();
});

test.describe('Repository Matcher — empty state accessibility', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Resolve both data endpoints with empty payloads so the route renders its
    // completed no-results UI instead of either skeletons or enriched rows.
    await page.route('**/query*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hits: [],
          total: 0,
          facets: null,
        }),
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

    await expect(
      page.getByRole('heading', { level: 1, name: 'Repository Matcher' }),
    ).toBeVisible();
    await expect(page.getByText('0 results')).toBeVisible();
    await expect(page.getByText('No repositories match')).toBeVisible();
    await expect(
      page.getByText('Try clearing some filters or broadening your search.'),
    ).toBeVisible();
    await expect(page.locator('.custom-skeleton-loading')).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Accessibility Fixture Catalog' }),
    ).toHaveCount(0);

    await testInfo.attach('empty-page — screenshot', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });

  runRepositoryMatcherA11yTests();
});

test.describe('Repository Matcher — enriched state accessibility', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Stub the two external data endpoints the route depends on so the page
    // reaches a deterministic, fully-loaded state with NO external network
    // dependency. These fixtures survive the repository-matcher enrichment
    // filter (`Accepting Data`, not Data/Sample Repository), so axe scans and
    // report screenshots cover the populated table rather than the skeleton
    // shell or empty state.
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

    // Wait for the route's primary heading and for enriched data rows to
    // render, so scans and report screenshots capture the real populated UI.
    await expect(
      page.getByRole('heading', { level: 1, name: 'Repository Matcher' }),
    ).toBeVisible();
    await expect(page.getByText('2 results')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Accessibility Fixture Catalog' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Accessibility Fixture Repository' }),
    ).toBeVisible();
    await expect(page.getByText('No repositories match')).toHaveCount(0);
    await expect(page.locator('.custom-skeleton-loading')).toHaveCount(0);

    await testInfo.attach('enriched-page — screenshot', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });

  runRepositoryMatcherA11yTests();
});
