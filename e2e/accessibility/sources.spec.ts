/**
 * Accessibility tests for the Sources route (`/sources`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. We report every violation in the HTML report but only FAIL the
 * build on `serious` or `critical` impact, so minor/moderate noise doesn't block
 * CI. See e2e/utils/axe.ts and the canonical repository-matcher.spec.ts.
 *
 * What this route is — `src/pages/sources.tsx` lists every NDE data source. It
 * may seed its source data from `getStaticProps` (server-side: live `/metadata`
 * + per-source GitHub commit dates) but always (re)fetches the SAME NDE
 * `/metadata` endpoint client-side via `useQuery(['metadata'])`, with any
 * getStaticProps result as `placeholderData`. The view renders a left `nav`
 * sidebar of source names and a main column of source cards (`src/views/sources`).
 *
 * State coverage — the page now owns ALL of its states client-side. As of the
 * getStaticProps refactor, a server-side prefetch failure no longer renders an
 * SSR Error block: getStaticProps returns empty props and the page falls back to
 * the client query, so the route always loads content client-side and the only
 * Error UI is driven by the client query's `metadataError`. We therefore drive
 * every state through the interceptable client-side requests (`page.route` runs
 * in the browser; the getStaticProps fetch happens at build time and is out of
 * reach, but it can no longer gate the view):
 *   - loading   — `/metadata` kept pending → skeleton cards/text (`isFetching`)
 *   - empty     — `/metadata` resolved with no sources → "0 results."
 *   - populated — `/metadata` resolved with fixture sources → source cards
 *   - error     — `/metadata` aborted → the page's Error block (Retry button)
 *
 * Because getStaticProps no longer hard-renders an Error block, no state is
 * unreachable here and there is no SSR-error guard to skip data-driven scans —
 * a getStaticProps failure just means no `placeholderData`, and the mocked
 * client query drives the state regardless.
 *
 * Beyond the resting states, one interaction scan covers the per-source schema
 * "property transformation" table — a transient surface a user expands, with a
 * dark background and light text, exactly the kind of place contrast/structure
 * regressions hide and which the resting scans never see.
 *
 * Endpoints mocked (client-side):
 *   - `**\/metadata*` — the NDE metadata API (source list + build version).
 *   - `**\/query*` — the NDE search API. The route does NOT read `/metadata`
 *     alone: `useSourcesList` also calls `useResourceCatalogs`, which fetches
 *     `<API>\/query?q=@type:"ResourceCatalog"` and merges standalone catalogs
 *     into the SAME source list (USE_MERGED_SOURCES_AND_CATALOGS is on outside
 *     production, and the a11y export is built with `.env.staging`). Left
 *     unmocked it reaches the live staging API and adds ~45 real sources, which
 *     is what made the empty state a race: the count flipped from 0 to 45 as
 *     soon as that response landed. Every state mocks it.
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans } from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/sources';

// The two endpoints the route reads client-side. Neither sits under `/api/`:
// they are `<NEXT_PUBLIC_API_URL>/metadata` and `<NEXT_PUBLIC_API_URL>/query`.
const METADATA_GLOB = '**/metadata*';
const RESOURCE_CATALOG_GLOB = '**/query*';
const API_GLOBS = [METADATA_GLOB, RESOURCE_CATALOG_GLOB];

// Card title used as the populated-state proof. It is NOT in live data, so once
// it renders we know the mocked fixture — not the SSR seed — owns the DOM.
const FIXTURE_SOURCE_NAME = 'Fixture Source Alpha';

// Rendered as the "API Version: V.<version>" tag — but only once BOTH client
// queries have resolved (`isLoading` false). It is absent from the static
// export's pre-hydration markup, which makes it the proof that mocked client
// data, not the server-rendered HTML, owns the DOM.
const FIXTURE_BUILD_VERSION = '2026-06-01';

// Minimal but representative `Metadata` payload (see src/hooks/api/types.ts).
// fetchMetadata returns this object directly; the page's `select` turns
// `src` into the rendered source list. Two sources: one NIAID-funded (renders
// the NIAID badge) and one with a `schema` (renders the expandable property
// table scanned in the interaction state below).
const POPULATED_FIXTURE = {
  biothing_type: 'source',
  build_date: '2026-06-01T00:00:00Z',
  build_version: FIXTURE_BUILD_VERSION,
  src: {
    fixturealpha: {
      version: '2026-05-20T00:00:00Z',
      stats: { fixturealpha: 1234 },
      sourceInfo: {
        identifier: 'fixture_alpha',
        name: FIXTURE_SOURCE_NAME,
        description: 'A deterministic data source fixture for a11y scanning.',
        url: 'https://example.org/fixture-alpha',
        schema: {
          fixtureProperty: 'name',
          anotherProperty: 'description',
        },
      },
    },
    immport: {
      version: '2026-04-10T00:00:00Z',
      stats: { immport: 56789 },
      sourceInfo: {
        identifier: 'immport',
        // Exact name match drives getFundedByNIAID → the NIAID badge.
        name: 'ImmPort',
        description: 'A NIAID-funded source fixture, to exercise the badge.',
        url: 'https://example.org/immport',
        schema: null,
      },
    },
  },
};

// Resolved payload with no sources, for the empty state.
const EMPTY_FIXTURE = {
  biothing_type: 'source',
  build_date: '2026-06-01T00:00:00Z',
  build_version: FIXTURE_BUILD_VERSION,
  src: {},
};

// Search-API response carrying no resource catalogs, so the mocked `/metadata`
// payload alone determines the source list.
const EMPTY_CATALOG_RESPONSE = { took: 1, total: 0, max_score: null, hits: [] };

/** Fulfil both client-side endpoints for a resolved (non-loading) state. */
async function mockSourceEndpoints(page: Page, metadata: unknown) {
  await page.route(METADATA_GLOB, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(metadata),
    }),
  );
  await page.route(RESOURCE_CATALOG_GLOB, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(EMPTY_CATALOG_RESPONSE),
    }),
  );
}

/**
 * Resting-state checks: the view renders the same chrome (the "Data Sources"
 * h1 and the "Search for a source" input) in loading, empty, and populated.
 * The error state has neither, so it asserts its own chrome and calls
 * runAxeScans directly.
 */
async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — also proves the page rendered the intended chrome. The
  // PageContainer wraps content in a single `main` landmark; the SectionHeader
  // renders the page's only h1 ("Data Sources").
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: /data sources/i }),
  ).toBeVisible();

  // Forms: the source filter input is the page's primary form control. It is an
  // <input> labelled "Search for a source" via a visually-hidden <label> (see
  // SearchInput), so it must expose that accessible name and be editable.
  const search = page.getByRole('textbox', { name: /search for a source/i });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  await runAxeScans(page, testInfo, state);
}

// --- Loading -----------------------------------------------------------------

test.describe('a11y: Sources — loading', () => {
  test('passes axe while metadata is loading', async ({ page }, testInfo) => {
    // Keep the metadata request pending so the skeleton UI stays on screen.
    for (const glob of API_GLOBS) {
      await page.route(glob, () => new Promise<void>(() => {}));
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
    // Proof of the loading state. The view's SkeletonText/Skeleton render
    // through Chakra with the `chakra-skeleton` class while `isFetching` is
    // true — a CSS selector is acceptable here only because skeletons have no
    // accessible surface to target.
    await expect(page.locator('.chakra-skeleton').first()).toBeVisible();

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Empty -------------------------------------------------------------------

test.describe('a11y: Sources — empty', () => {
  test('passes axe with no sources', async ({ page }, testInfo) => {
    await mockSourceEndpoints(page, EMPTY_FIXTURE);
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // "0 results." on its own does NOT prove the empty state: the static export
    // ships the page's pre-hydration markup, where the source list is still
    // empty, so that text is in the HTML before any client query runs. Wait for
    // the mocked build version first — it renders only once both client queries
    // have resolved — then assert the count.
    await expect(page.getByText(`V.${FIXTURE_BUILD_VERSION}`)).toBeVisible();
    // The SectionSearch result counter reads the filtered source list; with the
    // mocked data resolved and empty, it reads "0 results.".
    await expect(page.getByText(/0 results\./i)).toBeVisible();

    await runSharedChecks(page, testInfo, 'empty');
  });
});

// --- Populated ---------------------------------------------------------------

test.describe('a11y: Sources — populated', () => {
  test('passes axe with representative sources', async ({ page }, testInfo) => {
    await mockSourceEndpoints(page, POPULATED_FIXTURE);
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
    // Wait for a fixture source name (rendered as a card title and a sidebar
    // heading) that only appears once the mocked query resolves, so we scan the
    // populated DOM and not the loading or SSR-seed state.
    const fixtureSourceCard = page.locator('section', {
      hasText: FIXTURE_SOURCE_NAME,
    });
    await expect(fixtureSourceCard).toBeVisible();
    // Also wait for the per-source CTA, which only renders with resolved data.
    await expect(
      fixtureSourceCard.getByRole('link', { name: /see search results/i }),
    ).toBeVisible();
    // The CTA is a Chakra solid button (primary.500, #0B8484 — 4.52:1 on white,
    // clearing AA only just) inside a <Skeleton> card that fades its contents
    // in. Scanning mid-fade composites the teal through the still-transparent
    // card and reads a lighter ~#128787 (4.33:1) — a false contrast failure.
    // analyzeA11y waits for that fade to settle (waitForAnimationsSettled), so
    // no per-test opacity wait is needed here.
    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Error -------------------------------------------------------------------

test.describe('a11y: Sources — error', () => {
  test('passes axe when the metadata fetch fails', async ({
    page,
  }, testInfo) => {
    // Abort the metadata request so the query rejects (after its retries),
    // matching a production network failure. The page then renders its Error
    // block with a Retry button instead of the source list.
    for (const glob of API_GLOBS) {
      await page.route(glob, route => route.abort());
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the error UI. The Error component has no `alert` role, so we
    // wait for its heading and the Retry control that prove the error path.
    //
    // This takes longer than the 15s default expect timeout: surfacing the
    // error means exhausting two layered retry policies — fetchMetadata's own
    // loop (MAX_RETRIES=3, ~2.1s backoff per call; see src/hooks/api/helpers.ts)
    // wrapped by react-query's default 3 retries (1s+2s+4s backoff). That is
    // ~16-18s end to end, so wait explicitly within the 60s per-test budget.
    const ERROR_TIMEOUT = 40_000;
    await expect(
      page.getByRole('heading', { name: /something went wrong/i }),
    ).toBeVisible({ timeout: ERROR_TIMEOUT });
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();

    // The error state has no h1 or source-search input, so assert only the
    // landmark here and run the axe scans directly.
    await expect(page.getByRole('main')).toBeVisible();

    await runAxeScans(page, testInfo, 'error');
  });
});

// --- Interaction state -------------------------------------------------------
//
// The states above scan the page at rest. A source card with a `schema` renders
// a collapsed "property transformation" table the user expands by clicking the
// "Visualization of … properties" toggle. That table is a transient surface
// with a dark background and light text — never present on first paint and a
// likely home for contrast/structure regressions — so we open it and run the
// same axe scans.

test.describe('a11y: Sources — schema property table', () => {
  test('passes axe with a source schema table expanded', async ({
    page,
  }, testInfo) => {
    await mockSourceEndpoints(page, POPULATED_FIXTURE);
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
    // Wait for the populated card, then expand its schema table. dispatchEvent
    // fires the toggle's React onClick directly, bypassing the Next.js dev
    // overlay (`<nextjs-portal>`) that can intercept real clicks while the route
    // is still compiling.
    await expect(page.getByText(FIXTURE_SOURCE_NAME).first()).toBeVisible();
    await page
      .getByRole('button', {
        name: new RegExp(
          `Mapping of ${FIXTURE_SOURCE_NAME} Properties to NIAID Data Ecosystem Properties`,
          'i',
        ),
      })
      .dispatchEvent('click');

    // Wait for the expanded table's header cell so we scan the open surface.
    await expect(
      page.getByText(`${FIXTURE_SOURCE_NAME} Property`),
    ).toBeVisible();

    // The table lives inside a Chakra <Collapse>, which fades the wrapper's
    // opacity 0→1 as it expands. axe computes color-contrast against the
    // *rendered* (alpha-blended) background, so scanning mid-fade reports false
    // contrast failures — a half-opaque dark table (#374151) over the white page
    // reads as a mid-gray (~#8c929b) and fails the 4.5:1 check. analyzeA11y (via
    // runAxeScans) waits for that <Collapse> fade to settle before scanning, so
    // no per-test opacity wait is needed here.
    await runAxeScans(page, testInfo, 'schema-table');
  });
});
