/**
 * Accessibility tests for the Features route (`/features`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. We report every violation in the HTML report but only FAIL the
 * build on `serious` or `critical` impact, so minor/moderate noise doesn't block
 * CI. See e2e/utils/axe.ts and the canonical repository-matcher.spec.ts /
 * about.spec.ts.
 *
 * What is scanned and why — `src/pages/features/[[...slug]].tsx`:
 *   - Two routes share the file. The INDEX route (`/features`, no slug) renders
 *     `<TableOfContents>`; the DETAIL route (`/features/<slug>`) renders the
 *     banner + `<Main>`. We scan the INDEX route because it is the only
 *     deterministically reachable, fully mockable surface: `getStaticPaths`
 *     always emits `{ slug: undefined }` so `/features` resolves regardless of
 *     the CMS, and its data comes entirely from client-side `useQuery`
 *     (`fetchAllFeaturedPages` / `fetchFeaturedContent`) hitting the Strapi
 *     `**\/api/features*` endpoint, which `page.route` can intercept.
 *   - The DETAIL route is intentionally OUT OF SCOPE: `getStaticPaths` uses
 *     `fallback: false`, so a slug only resolves if it was returned by a live
 *     `fetchAllFeaturedPages()` call in the Next dev server (out of reach of
 *     `page.route`). Scanning it would depend on whatever the live dev CMS has
 *     published — non-deterministic — which this suite forbids. Its richer
 *     loading/empty UI (the `<Main>` skeletons, the "No content for this page
 *     exists." empty state) lives only on that route as a result.
 *
 * State coverage note — the index renders no distinct LOADING UI. The header
 * ("Features") and the search box paint immediately and do not depend on the
 * fetch; the cards depend on `featuredPages`, but there is no skeleton/spinner
 * on the index branch (skeletons live only on the detail route, above). So the
 * in-flight state is visually identical to the empty state — both show the
 * header, the search box, and "0 results." — and a separate loading scan would
 * be redundant. We therefore cover EMPTY, POPULATED, ERROR, plus the search
 * filter interaction state, rather than a standalone loading state.
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

const ROUTE = '/features';

// The Strapi CMS endpoint backing the Features page. Both client-side queries
// (`fetchAllFeaturedPages` for the index list and `fetchFeaturedContent` for the
// current page) hit `/api/features` with different query strings, so this single
// glob intercepts every request the route makes.
const API_GLOB = '**/api/features*';

// Minimal but representative CMS payload for the populated state. Strapi nests
// the collection under `data`, and `fetchAllFeaturedPages` returns
// `response.data.data` — hence the array under `data`. The abstracts render
// through ReactMarkdown so they exercise inline markup, and one card carries a
// thumbnail (with alt text) to cover the image path.
const POPULATED_FIXTURE = {
  data: [
    {
      id: 1,
      title: 'Advanced Search Guide',
      abstract: 'Learn how to build **complex queries** across repositories.',
      content: '## Advanced search\n\nDetailed walkthrough.',
      subtitle: 'Query like a pro',
      slug: 'advanced-search-guide',
      banner: null,
      thumbnail: null,
      categories: null,
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-10T00:00:00Z',
      publishedAt: '2026-06-10T00:00:00Z',
    },
    {
      id: 2,
      title: 'Data Visualization Tools',
      abstract: 'Explore the charts and graphs available in the portal.',
      content: '## Visualizations\n\nCharts and graphs.',
      subtitle: 'See your data',
      slug: 'data-visualization-tools',
      banner: null,
      thumbnail: {
        url: '/uploads/viz_thumbnail.png',
        alternativeText: 'Bar chart illustration',
      },
      categories: null,
      createdAt: '2026-06-02T00:00:00Z',
      updatedAt: '2026-06-11T00:00:00Z',
      publishedAt: '2026-06-11T00:00:00Z',
    },
    {
      id: 3,
      title: 'Repository Matcher Overview',
      abstract: 'Find the most suitable repository for your dataset.',
      content: '## Repository matcher\n\nMatch your data.',
      subtitle: 'Where should your data live?',
      slug: 'repository-matcher-overview',
      banner: null,
      thumbnail: null,
      categories: null,
      createdAt: '2026-06-03T00:00:00Z',
      updatedAt: '2026-06-12T00:00:00Z',
      publishedAt: '2026-06-12T00:00:00Z',
    },
  ],
};

const EMPTY_FIXTURE = { data: [] };

// --- Axe scans, reused by every state (resting and interaction) --------------

async function runAxeScans(page: Page, testInfo: TestInfo, state: string) {
  // Full-page WCAG A/AA scan. The helper's tag set (WCAG_AA_TAGS) already
  // includes color-contrast and the landmark/heading-order best-practice rules,
  // so this single scan is the backbone of the check.
  const results = await analyzeA11y(page);
  await attachA11yReport(testInfo, state, results.violations);

  const blocking = blockingViolations(results.violations);
  expect(
    blocking,
    `Serious/critical accessibility violations found:\n${formatViolations(
      blocking,
    )}`,
  ).toEqual([]);

  // Focused color-contrast scan, reported separately so contrast regressions are
  // easy to triage in the HTML report. There is no helper for this — run the
  // single color-contrast rule inline, matching the canonical spec.
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

// --- Resting-layout checks (the TableOfContents states) ----------------------

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — also proves the page rendered the intended chrome.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Features' }),
  ).toBeVisible();

  // Landmark: the featured-pages list is a labelled <nav> (Sidebar). It is
  // hidden below the `md` breakpoint but visible at the Desktop Chrome viewport.
  await expect(
    page.getByRole('navigation', {
      name: /navigation for list of featured pages/i,
    }),
  ).toBeVisible();

  // Form: the page's only form control is the featured-page search box, which
  // must be programmatically labelled (SearchInput links a VisuallyHidden label
  // to the input by id) and editable.
  const search = page.getByRole('textbox', {
    name: /search for a featured page/i,
  });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  await runAxeScans(page, testInfo, state);
}

// --- Empty -------------------------------------------------------------------

test.describe('a11y: Features — empty', () => {
  test('passes axe with no featured pages', async ({ page }, testInfo) => {
    await page.route(API_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(EMPTY_FIXTURE),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // The results count is the empty-state proof: with no pages it reads
    // "0 results." (this is also what the in-flight loading frame shows — see
    // the state-coverage note in the header).
    await expect(page.getByText(/0\s+results\./i)).toBeVisible();

    await runSharedChecks(page, testInfo, 'empty');
  });
});

// --- Populated ---------------------------------------------------------------

test.describe('a11y: Features — populated', () => {
  test('passes axe with representative featured pages', async ({
    page,
  }, testInfo) => {
    await page.route(API_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(POPULATED_FIXTURE),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for content that only the mocked fixture produces: the fixture's
    // three pages yield "3 results." and a card CTA link per page, so we know
    // the client query resolved and we're scanning the populated DOM.
    await expect(page.getByText(/3\s+results\./i)).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Data Visualization Tools' }).first(),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Error -------------------------------------------------------------------

test.describe('a11y: Features — error', () => {
  test('passes axe in the error state', async ({ page }, testInfo) => {
    // Fulfill a 5xx so `fetchFeaturedContent` (which drives the page-level
    // `error`) throws an axios error WITH a `.response` — it does `throw
    // err.response`, so a bare network abort would throw `undefined` and the
    // page's `error ? …` guard would stay falsy and never render <Error>.
    await page.route(API_GLOB, route =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // The Error component renders an <h2> "Something went wrong." — there is no
    // <h1> in this state, so we assert the error heading instead. Allow extra
    // time for React Query's default 3 retries (with backoff) before it settles.
    await expect(
      page.getByRole('heading', { level: 2, name: /something went wrong/i }),
    ).toBeVisible({ timeout: 25_000 });

    // The error branch replaces the TableOfContents, so only the <main> landmark
    // and the axe scans apply — no h1/nav/search on this state.
    await expect(page.getByRole('main')).toBeVisible();

    await runAxeScans(page, testInfo, 'error');
  });
});

// --- Interaction: search filter (no matches) ---------------------------------
//
// Typing into the featured-page search box filters the card list client-side and
// re-renders it. The filtered/no-results DOM doesn't exist on first paint, so the
// resting scans never see it — scan it here.

test.describe('a11y: Features — search filter', () => {
  test('passes axe when the search yields no matches', async ({
    page,
  }, testInfo) => {
    await page.route(API_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(POPULATED_FIXTURE),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Start from the populated state.
    await expect(page.getByText(/3\s+results\./i)).toBeVisible();

    // Filter to nothing and wait for the count to drop to "0 results." so we
    // know the re-render landed before scanning.
    const search = page.getByRole('textbox', {
      name: /search for a featured page/i,
    });
    await search.fill('zzz-no-such-feature');
    await expect(page.getByText(/0\s+results\./i)).toBeVisible();

    await runAxeScans(page, testInfo, 'search-filter-no-matches');
  });
});
