/**
 * Accessibility tests for the Disclaimer route (`/disclaimer`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. Every violation is attached to the HTML report, but the build
 * only FAILS on `serious`/`critical` impact. See e2e/utils/axe.ts and about.spec.ts.
 *
 * State coverage note — like about.spec.ts, this route is intentionally NOT the
 * full four-state matrix, because of how `src/pages/disclaimer.tsx` is built:
 *   - `content` is seeded from `getStaticProps` (server-side) and then refetched
 *     from the SAME Strapi `disclaimer-page` endpoint client-side via useQuery
 *     (`refetchOnMount`). Only the client-side request runs in the browser, so
 *     only it can be intercepted with `page.route`; we wait for the client
 *     fixture's own h1 text before scanning so the mock — not the SSR seed —
 *     owns the DOM we scan.
 *   - There is no loading UI: `content` is truthy from first paint, so no
 *     skeleton/spinner renders while the client query is in flight.
 *   - The error block only renders when `contentError && !content`, but
 *     `content` is always seeded truthy by getStaticProps, so it is unreachable
 *     via browser-side mocking. There is no distinct empty-state UI either.
 * The deterministic, accessible state for this route is the populated content
 * state, which is what we scan below. This route does NOT render the site-wide
 * search bar (no `includeSearchBar`), so there is no search control to assert.
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans } from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/disclaimer';
// The Strapi CMS endpoint backing the page (client-side useQuery refetch).
const API_GLOB = '**/api/disclaimer-page*';

// Minimal but representative CMS payload for the populated state. fetchContent()
// returns `data.data`, so the fixture is nested under `data`. The description is
// rendered through ReactMarkdown (with rehype-raw), so it exercises a
// sub-heading and a link too.
const POPULATED_FIXTURE = {
  data: {
    name: 'NDE Portal Disclaimer Fixture',
    subtitle: 'A deterministic disclaimer fixture for accessibility scanning.',
    description: [
      '## Use of this site',
      '',
      'The NIAID Data Ecosystem aggregates metadata from many external',
      'repositories.',
      '',
      'See the [terms of use](https://example.org/terms) for details.',
    ].join('\n'),
    createdAt: '2026-06-17T00:00:00Z',
    updatedAt: '2026-06-17T00:00:00Z',
    publishedAt: '2026-06-17T00:00:00Z',
  },
};

// --- Shared checks -----------------------------------------------------------

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — also proves the page rendered the intended chrome.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: POPULATED_FIXTURE.data.name,
    }),
  ).toBeVisible();

  await runAxeScans(page, testInfo, state);
}

// --- Populated ---------------------------------------------------------------

test.describe('a11y: Disclaimer — populated content', () => {
  test('passes axe with representative CMS content', async ({
    page,
  }, testInfo) => {
    // Intercept the client-side useQuery refetch so the rendered DOM is
    // deterministic and never depends on the live Strapi CMS.
    await page.route(API_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(POPULATED_FIXTURE),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for content that only the mocked fixture renders — the fixture's h1
    // and the markdown sub-heading + link — so we know the client query
    // resolved and we're scanning the populated DOM, not the SSR seed.
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: POPULATED_FIXTURE.data.name,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Use of this site' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'terms of use' }),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'populated');
  });
});
