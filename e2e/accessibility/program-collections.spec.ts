/**
 * Accessibility tests for the Program Collections route
 * (`src/pages/program-collections.tsx`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. We report every violation in the HTML report but only FAIL the
 * build on `serious` or `critical` impact, so minor/moderate noise doesn't block
 * CI. See e2e/utils/axe.ts and the canonical repository-matcher.spec.ts.
 *
 * Data flow — the page seeds its list from `getStaticProps` (server-side) and
 * then refetches client-side via a `['program-collections']` useQuery
 * (`fetchProgramCollections`). Only the client-side request runs in the browser,
 * so — as in about.spec.ts / knowledge-center.spec.ts — `page.route` can mock it
 * deterministically. `fetchProgramCollections` makes TWO kinds of request to the
 * NDE `/query` endpoint:
 *   1. one facet request (`facets=sourceOrganization.name`, `size=0`) to list the
 *      collection terms + counts, then
 *   2. one detail request per term (`sourceOrganization.name:"<term>"`, `size=1`)
 *      to resolve each collection's sourceOrganization.
 * The single `**\/query*` route handler below branches on the URL to serve both,
 * so a 3-collection fixture fires exactly one facet call + three detail calls. We
 * wait for the fixture's own "3 results." count before scanning, so the mock —
 * not the larger live seed from getStaticProps — owns the DOM we scan.
 *
 * State coverage notes:
 *   - LOADING has no distinct accessible surface: `placeholderData` seeds the
 *     query from the getStaticProps list, so content is shown on first paint and
 *     no skeleton/spinner renders while the client refetch is in flight.
 *     Unreachable, not skipped.
 *   - The page has no dedicated EMPTY message; an API returning zero terms just
 *     renders an empty card stack. The equivalent user-facing zero-state — the
 *     section search filtered to no matches, with its live "0 results." count —
 *     is covered as an interaction state below, so a redundant empty-via-API scan
 *     is omitted.
 *
 * MDX note: each collection's `sourceOrganization.abstract` is rendered through
 * `StyledCardDescription` (ReactMarkdown + the shared `src/components/mdx`
 * components). Mocking the query lets the populated scan exercise that card MDX
 * path against fixed content. The full untested MDX component set is exercised
 * in knowledge-center.spec.ts.
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans } from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/program-collections';

// Both fetchProgramCollections requests (facet list + per-term detail) hit the
// NDE `/query` endpoint, so a single glob covers them.
const QUERY_GLOB = '**/query*';

// The page's section search input is programmatically labelled with this
// aria-label (SearchInput links a visually-hidden <label htmlFor> to the input).
const SEARCH_NAME = /search for a program collection/i;

// A term guaranteed not to match any collection name/term/alternateName, used to
// drive the list down to "0 results." deterministically.
const NO_MATCH_QUERY = 'zzzz-no-such-collection-xyzq';

// Representative fixture derived from the live API shape. Each entry's `term`
// equals its sourceOrganization `name` lower-cased — fetchProgramCollections
// only keeps the org when `name.toLowerCase() === term`, so they must match.
const COLLECTIONS = [
  {
    id: 'amp network',
    term: 'amp network',
    count: 384,
    sourceOrganization: {
      '@type': 'ResearchProject',
      abstract:
        'The Accelerating Medicines Partnership (AMP) is a public-private collaboration aimed at identifying the genes, proteins, and pathways involved in disease progression and treatment response.',
      alternateName: ['AMP-RA/SLE', 'Accelerating Medicines Partnership'],
      name: 'AMP Network',
      parentOrganization: ['NIH'],
      url: 'https://fnih.org/our-programs/accelerating-medicines-partnership-amp/',
    },
  },
  {
    id: 'niaid aadcrc program',
    term: 'niaid aadcrc program',
    count: 829,
    sourceOrganization: {
      '@type': 'ResearchProject',
      abstract:
        'The Asthma and Allergic Diseases Cooperative Research Centers (AADCRCs) lead multidisciplinary research on the immunological mechanisms, diagnosis, treatment, and prevention of asthma and allergic diseases.',
      alternateName: [
        'Asthma and Allergic Diseases Cooperative Research Centers',
      ],
      name: 'NIAID AADCRC Program',
      parentOrganization: ['NIAID'],
      url: 'https://www.niaid.nih.gov/research/cooperative-research-centers',
    },
  },
  {
    id: 'niaid ace program',
    term: 'niaid ace program',
    count: 241,
    sourceOrganization: {
      '@type': 'ResearchProject',
      abstract:
        'The Autoimmunity Centers of Excellence (ACE) foster collaboration between clinicians and researchers to accelerate autoimmune disease research and therapy development.',
      alternateName: ['Autoimmunity Centers of Excellence'],
      name: 'NIAID ACE Program',
      parentOrganization: ['NIAID'],
      url: 'https://www.autoimmunitycenters.org/',
    },
  },
];

const fulfillJson = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

/**
 * Mock both shapes of `/query` request fetchProgramCollections makes: the facet
 * list, and the per-term detail lookup (keyed off the term in the `q` param).
 */
async function mockCollections(page: Page) {
  await page.route(QUERY_GLOB, route => {
    const url = route.request().url();
    if (url.includes('facets=sourceOrganization.name')) {
      return route.fulfill(
        fulfillJson({
          facets: {
            'sourceOrganization.name': {
              terms: COLLECTIONS.map(c => ({ term: c.term, count: c.count })),
            },
          },
        }),
      );
    }
    // Per-term detail request — return the single matching org as a hit. axios
    // serializes spaces in the `q` param as `+` (not %20), and decodeURIComponent
    // leaves `+` untouched, so normalize it back to a space before matching.
    const decoded = decodeURIComponent(url).replace(/\+/g, ' ');
    const match = COLLECTIONS.find(c =>
      decoded.includes(`sourceOrganization.name:"${c.term}"`),
    );
    return route.fulfill(
      fulfillJson({
        hits: match ? [{ sourceOrganization: match.sourceOrganization }] : [],
      }),
    );
  });
}

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — also proves the page rendered the intended chrome.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Program Collections' }),
  ).toBeVisible();

  // Forms: the section search input must be programmatically labelled.
  const search = page.getByRole('textbox', { name: SEARCH_NAME });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  await runAxeScans(page, testInfo, state);
}

// --- Populated ---------------------------------------------------------------

test.describe('a11y: Program Collections — populated', () => {
  test('passes axe with the mocked collections list', async ({
    page,
  }, testInfo) => {
    await mockCollections(page);
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for content only the fixture renders: the "3 results." count (the
    // live seed has many more, so this proves the client mock resolved), a
    // collection card's CTA link, and an abstract rendered via StyledCardDescription.
    await expect(
      page.getByRole('heading', { level: 1, name: 'Program Collections' }),
    ).toBeVisible();
    await expect(page.getByText('3 results.')).toBeVisible();
    await expect(
      page.getByRole('link', {
        name: /search for resources related to amp network/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(/accelerating medicines partnership/i).first(),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Error -------------------------------------------------------------------

test.describe('a11y: Program Collections — error', () => {
  test('passes axe in the error state', async ({ page }, testInfo) => {
    // A 5xx makes the client `fetchProgramCollections` facet request throw, so the
    // `['program-collections']` query errors and the page swaps its content for
    // the shared <Error> block. (A bare abort would reject with `undefined`,
    // which the query treats differently; a 500 mirrors a real API failure.)
    await page.route(QUERY_GLOB, route =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      }),
    );
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // The shared <Error> renders an h2 "Something went wrong." plus the route's
    // "API Request:" detail text.
    await expect(
      page.getByRole('heading', { name: /something went wrong/i }),
    ).toBeVisible();
    await expect(page.getByText(/API Request:/i)).toBeVisible();

    await runAxeScans(page, testInfo, 'error');
  });
});

// --- Interaction: search filtered to zero matches ----------------------------
//
// The states above scan the page at rest. The section search filters the
// rendered card list client-side; filtering to zero matches is the user-facing
// zero-state (the live "0 results." count) and exercises the search control's
// filtered state.

test.describe('a11y: Program Collections — search empty', () => {
  test('passes axe when the search filters out every collection', async ({
    page,
  }, testInfo) => {
    await mockCollections(page);
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Make sure the mocked list rendered before we filter it.
    await expect(page.getByText('3 results.')).toBeVisible();

    const search = page.getByRole('textbox', { name: SEARCH_NAME });
    await search.fill(NO_MATCH_QUERY);

    // The SectionSearch count text resolves to "0 results." once nothing matches.
    await expect(page.getByText('0 results.')).toBeVisible();

    await runAxeScans(page, testInfo, 'search-empty');
  });
});
