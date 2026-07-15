/**
 * Accessibility tests for the search Visual Summary visualization cards.
 *
 * The cards live on `/search` inside the "Visual Summary" accordion (open by
 * default), rendered by SummaryGrid → VisualizationCard. Three cards are active
 * by default (src/pages/search.tsx DEFAULT_ACTIVE_VIZ_IDS):
 *   - "Date"             — a histogram chart (reads facets.hist_dates)
 *   - "Sources"          — a pie/bar chart  (reads facets["includedInDataCatalog.name"])
 *   - "Health Condition" — a pie/bar chart  (reads facets["healthCondition.name.raw"])
 *
 * Each card's data comes from the scoped aggregation hooks
 * (useSharedDatasetAggregation et al. in useVisualizationData), which all call
 * fetchSearchResults → the NDE `**\/query*` endpoint with `size=0`. So a single
 * `**\/query*` mock drives every card's loading / empty / populated / error
 * state deterministically. The site-wide search.spec.ts scans this route too,
 * but its fixture only carries the `@type` facet, so it only ever sees these
 * cards EMPTY — the populated, loading, error, modal, and bar-chart states are
 * the gap this spec fills.
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans. We report
 * every violation in the HTML report but only FAIL on `serious`/`critical`
 * impact (see e2e/utils/axe.ts and the canonical advanced-search.spec.ts).
 *
 * NOTE — results list vs. cards: to isolate the cards, the populated fixture
 * leaves the `@type` facet (and `hits`) empty, so the results list below the
 * summary sits in its own clean "No results found" state while the cards render
 * populated from their own facets. The two surfaces read different facets, so
 * decoupling them keeps the scanned card DOM deterministic. The screenshot will
 * therefore show populated charts above an empty results list — expected.
 *
 * Endpoints mocked (all client-side):
 *   - `**\/query*`        the NDE /query API (card aggregations + results list)
 *   - `**\/metadata*`     the NDE metadata endpoint backing the filters sidebar
 *   - `**\/api/diseases*` the Strapi diseases lookup behind the carousel
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans, waitForSearchFiltersSettled } from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/search';
const API_GLOBS = ['**/query*', '**/metadata*', '**/api/diseases*'];

// A terms facet helper — the NDE /query facet shape the aggregation hooks read.
const termsFacet = (
  terms: { term: string; count: number }[],
  total: number,
) => ({
  _type: 'terms',
  terms,
  other: 0,
  missing: 0,
  total,
});

// Facets that feed the three default-active cards. `hist_dates` (yearly buckets)
// drives the "Date" histogram; "includedInDataCatalog.name" drives "Sources";
// "healthCondition.name.raw" drives "Health Condition". Values are a
// representative subset of a real /query aggregation response.
const POPULATED_VIZ_FACETS = {
  date: termsFacet(
    [
      { count: 2780, term: '2015-04-16T00:00:00.000Z' },
      { count: 1075, term: '2026-03-16T00:00:00.000Z' },
      { count: 1043, term: '2018-08-15T00:00:00.000Z' },
      { count: 784, term: '2019-10-25T00:00:00.000Z' },
      { count: 750, term: '2023-06-30T00:00:00.000Z' },
      { count: 682, term: '2025-07-31T00:00:00.000Z' },
      { count: 667, term: '2020-10-22T00:00:00.000Z' },
      { count: 661, term: '2022-03-02T00:00:00.000Z' },
      { count: 418, term: '2021-05-19T00:00:00.000Z' },
      { count: 387, term: '2024-10-26T00:00:00.000Z' },
    ],
    16972,
  ),
  hist_dates: termsFacet(
    [
      { count: 2985, term: '2015-01-01T00:00:00.000Z' },
      { count: 3, term: '2016-01-01T00:00:00.000Z' },
      { count: 152, term: '2017-01-01T00:00:00.000Z' },
      { count: 2278, term: '2018-01-01T00:00:00.000Z' },
      { count: 3094, term: '2019-01-01T00:00:00.000Z' },
      { count: 1094, term: '2020-01-01T00:00:00.000Z' },
      { count: 1258, term: '2021-01-01T00:00:00.000Z' },
      { count: 1750, term: '2022-01-01T00:00:00.000Z' },
      { count: 900, term: '2023-01-01T00:00:00.000Z' },
      { count: 600, term: '2024-01-01T00:00:00.000Z' },
      { count: 1100, term: '2025-01-01T00:00:00.000Z' },
      { count: 758, term: '2026-01-01T00:00:00.000Z' },
    ],
    16972,
  ),
  'includedInDataCatalog.name': termsFacet(
    [
      { term: 'NCBI SRA', count: 12045 },
      { term: 'Vivli', count: 6803 },
      { term: 'Mendeley', count: 4521 },
      { term: 'Zenodo', count: 3310 },
      { term: 'Dryad', count: 2199 },
      { term: 'ImmPort', count: 1502 },
      { term: 'Harvard Dataverse', count: 980 },
      { term: 'figshare', count: 612 },
    ],
    32572,
  ),
  'healthCondition.name.raw': termsFacet(
    [
      { term: 'HIV infectious disease', count: 5210 },
      { term: 'AIDS', count: 3120 },
      { term: 'COVID-19', count: 2840 },
      { term: 'influenza', count: 1760 },
      { term: 'tuberculosis', count: 1320 },
      { term: 'malaria', count: 980 },
      { term: 'hepatitis B', count: 540 },
      { term: 'dengue', count: 410 },
    ],
    16180,
  ),
};

// Empty variants of the same facets — present (so the hooks resolve) but with
// no terms, which is exactly what puts each card into its EmptyState.
const EMPTY_VIZ_FACETS = {
  date: termsFacet([], 0),
  hist_dates: termsFacet([], 0),
  'includedInDataCatalog.name': termsFacet([], 0),
  'healthCondition.name.raw': termsFacet([], 0),
};

// `@type` is left empty in both fixtures so the results list below the summary
// sits in its own clean empty state (see the header NOTE).
const EMPTY_TYPE_FACET = { '@type': termsFacet([], 0) };

const POPULATED_FIXTURE = {
  total: 0,
  hits: [],
  facets: { ...EMPTY_TYPE_FACET, ...POPULATED_VIZ_FACETS },
};

const EMPTY_FIXTURE = {
  total: 0,
  hits: [],
  facets: { ...EMPTY_TYPE_FACET, ...EMPTY_VIZ_FACETS },
};

const METADATA_BODY = { build_date: '2026-06-17T00:00:00Z', src: {} };
const DISEASES_BODY = { data: [] };

// Card-level UI proof. The "Sources" card is a pie/bar chart, so it renders a
// ChartTypePicker <select> labelled "Chart type for Sources" once it leaves
// loading/empty/error — the clearest accessible signal that a card populated.
const SOURCES_CHART_PICKER = /chart type for sources/i;
const EMPTY_CARD_TEXT = /no data available for the selected aggregation/i;
const CARD_ERROR_TEXT = /failed to load chart data/i;

// Mock helper — fulfill each glob with the given /query fixture (or keep
// `pending` to hold the loading state).
async function mockAll(
  page: Page,
  opts: { queryFixture?: object; pending?: boolean; abort?: boolean },
) {
  if (opts.pending) {
    for (const glob of API_GLOBS) {
      await page.route(glob, () => new Promise<void>(() => {}));
    }
    return;
  }
  if (opts.abort) {
    for (const glob of API_GLOBS) {
      await page.route(glob, route => route.abort());
    }
    return;
  }
  await page.route('**/query*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(opts.queryFixture),
    }),
  );
  await page.route('**/metadata*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(METADATA_BODY),
    }),
  );
  await page.route('**/api/diseases*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(DISEASES_BODY),
    }),
  );
}

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — proves the route chrome rendered around the cards.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: /showing all results/i }),
  ).toBeVisible();

  // The Visual Summary section header is always present, and each active card
  // exposes its title as an <h2>. These prove the cards (not just the page)
  // rendered before we scan.
  await expect(
    page.getByRole('heading', { level: 2, name: /^date$/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: /^sources$/i }),
  ).toBeVisible();

  // Forms: the site-wide search bar is rendered on this route.
  const search = page.getByRole('textbox', { name: /search for resources/i });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  // Let the filters' "Clear All" button finish fading from disabled to enabled
  // before scanning — otherwise axe can catch it mid-fade and report a false,
  // intermittent color-contrast failure. See waitForSearchFiltersSettled.
  await waitForSearchFiltersSettled(page);

  await runAxeScans(page, testInfo, state);
}

// --- Loading -----------------------------------------------------------------

test.describe('a11y: Visualization cards — loading', () => {
  test('passes axe while the card aggregations are loading', async ({
    page,
  }, testInfo) => {
    // Keep every request pending so each card stays in its loading state.
    await mockAll(page, { pending: true });
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // The card header (h2 "Date") renders immediately; the loading overlay is a
    // Chakra <Spinner> (`.chakra-spinner`) — a loading marker with no meaningful
    // accessible surface, so the class selector is acceptable here.
    await expect(
      page.getByRole('heading', { level: 2, name: /^date$/i }),
    ).toBeVisible();
    await expect(page.locator('.chakra-spinner').first()).toBeVisible();

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Empty -------------------------------------------------------------------

test.describe('a11y: Visualization cards — empty', () => {
  test('passes axe when the aggregations have no terms', async ({
    page,
  }, testInfo) => {
    await mockAll(page, { queryFixture: EMPTY_FIXTURE });
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Every active card renders the EmptyState message when its facet has no
    // terms. Waiting for it proves we're scanning the populated-but-empty card
    // DOM, not loading.
    await expect(page.getByText(EMPTY_CARD_TEXT).first()).toBeVisible();
    await expect(page.locator('.chakra-spinner')).toHaveCount(0);

    await runSharedChecks(page, testInfo, 'empty');
  });
});

// --- Populated ---------------------------------------------------------------

test.describe('a11y: Visualization cards — populated', () => {
  test('passes axe once the charts render', async ({ page }, testInfo) => {
    await mockAll(page, { queryFixture: POPULATED_FIXTURE });
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // The Sources card's chart-type <select> only renders once that card leaves
    // loading/empty/error, so it proves the cards are populated. No card should
    // show the empty message, and no spinner should remain.
    await expect(
      page.getByRole('combobox', { name: SOURCES_CHART_PICKER }),
    ).toBeVisible();
    await expect(page.getByText(EMPTY_CARD_TEXT)).toHaveCount(0);
    await expect(page.locator('.chakra-spinner')).toHaveCount(0);

    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Error -------------------------------------------------------------------

test.describe('a11y: Visualization cards — error', () => {
  test('passes axe when the aggregations fail', async ({ page }, testInfo) => {
    // Abort every data request so each card's aggregation query rejects and the
    // card renders its ErrorState (alert + Retry), matching a network failure.
    await mockAll(page, { abort: true });
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for a card's error UI: the alert text and its Retry control.
    await expect(page.getByText(CARD_ERROR_TEXT).first()).toBeVisible();
    await expect(
      page.getByRole('button', { name: /retry/i }).first(),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'error');
  });
});

// --- Interaction states ------------------------------------------------------
//
// The states above scan the cards at rest. These scan markup that only exists
// after a user action: the expanded-chart modal (a portal axe never sees in a
// resting scan) and the bar chart that replaces the pie when the chart-type
// select changes (a different visx component with its own a11y surface). Each
// runs the same axe scans via runAxeScans, skipping the resting-layout asserts
// because the open modal covers the page chrome.

/** Put the page into the populated, charts-rendered state. */
async function gotoPopulated(page: Page) {
  await mockAll(page, { queryFixture: POPULATED_FIXTURE });
  await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('combobox', { name: SOURCES_CHART_PICKER }),
  ).toBeVisible();
  // Let the filters' "Clear All" button finish fading in before the interaction
  // scans run (see waitForSearchFiltersSettled) so its mid-fade opacity can't
  // trip a false color-contrast failure.
  await waitForSearchFiltersSettled(page);
}

// --- Expanded chart modal ----------------------------------------------------

test.describe('a11y: Visualization cards — expand modal', () => {
  test('passes axe with a chart expanded into the modal', async ({
    page,
  }, testInfo) => {
    await gotoPopulated(page);

    // Each populated card exposes an "Expand chart to modal view" icon button.
    // Open the first; the ModalViewer renders a Chakra Modal (role="dialog")
    // with the chart inside. dispatchEvent fires the React onClick directly,
    // bypassing the Next.js dev overlay (`<nextjs-portal>`) that can intercept
    // real clicks while the route is still compiling.
    await page
      .getByRole('button', { name: /expand chart to modal view/i })
      .first()
      .dispatchEvent('click');
    await expect(page.getByRole('dialog')).toBeVisible();

    await runAxeScans(page, testInfo, 'expand-modal');
  });
});

// --- Bar chart (chart-type change) -------------------------------------------

test.describe('a11y: Visualization cards — bar chart', () => {
  test('passes axe after switching a card to the bar chart', async ({
    page,
  }, testInfo) => {
    await gotoPopulated(page);

    // Switch the Sources card from its default pie to the bar chart, which
    // renders a different visx component (the resting scans only see the pie).
    const picker = page.getByRole('combobox', { name: SOURCES_CHART_PICKER });
    await picker.selectOption('bar');
    await expect(picker).toHaveValue('bar');

    await runAxeScans(page, testInfo, 'bar-chart');
  });
});
