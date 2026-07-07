/**
 * Accessibility tests for the About route (`/about`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. We report every violation in the HTML report but only FAIL the
 * build on `serious` or `critical` impact, so minor/moderate noise doesn't block
 * CI. See e2e/utils/axe.ts and the canonical repository-matcher.spec.ts.
 *
 * State coverage note — this route is intentionally NOT the full four-state
 * matrix, because of how `src/pages/about.tsx` is built:
 *   - The page seeds its `content` from `getStaticProps` (server-side) and then
 *     refetches the SAME Strapi `about-page` endpoint client-side via useQuery
 *     (`refetchOnMount`). Only the client-side request runs in the browser, so
 *     only it can be intercepted with `page.route`; the getStaticProps fetch
 *     happens in the Next dev server and is out of reach here. We wait for the
 *     client fixture's own text before scanning, so the mock — not whatever the
 *     server returned — owns the DOM we scan.
 *   - There is no loading UI: `content` is seeded from props on first paint, so
 *     no skeleton/spinner ever renders while the client query is in flight.
 *   - The error UI only renders when `contentError && !content`, but `content`
 *     is always seeded truthy by getStaticProps (real data, or the caught error
 *     object when Strapi is unreachable), so the error block is unreachable via
 *     browser-side mocking. There is likewise no distinct empty-state UI.
 * The deterministic, accessible state for this route is the populated content
 * state, which is what we scan below.
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans } from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/about';
// The Strapi CMS endpoint backing the About page (client-side useQuery refetch).
const API_GLOB = '**/api/about-page*';

// Minimal but representative CMS payload for the populated state. fetchContent()
// returns `data.data`, so the fixture is nested under `data`. The description is
// rendered through ReactMarkdown, so it exercises a sub-heading and a link too.
const POPULATED_FIXTURE = {
  data: {
    name: 'About the NDE Portal Fixture',
    subtitle: 'A deterministic About-page fixture for accessibility scanning.',
    description: [
      '## Our mission',
      '',
      'The NDE Portal helps researchers discover biomedical datasets across',
      'many repositories.',
      '',
      'Read the [data submission guidelines](https://example.org/guidelines)',
      'to learn more.',
    ].join('\n'),
    createdAt: '2026-06-17T00:00:00Z',
    updatedAt: '2026-06-17T00:00:00Z',
    publishedAt: '2026-06-17T00:00:00Z',
  },
};

// --- Shared checks run in every state ---------------------------------------

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — also proves the page rendered the intended chrome.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: POPULATED_FIXTURE.data.name }),
  ).toBeVisible();

  // Forms: the site-wide search bar is rendered on this route
  // (`includeSearchBar`) and its control must be programmatically labelled.
  const search = page.getByRole('textbox', { name: /search for resources/i });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  await runAxeScans(page, testInfo, state);
}

// --- Populated ---------------------------------------------------------------

test.describe('a11y: About — populated content', () => {
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
      page.getByRole('heading', { level: 2, name: 'Our mission' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'data submission guidelines' }),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'populated');
  });
});
