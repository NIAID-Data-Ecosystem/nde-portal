/**
 * Accessibility tests for the FAQ route (`/faq`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. Every violation is attached to the HTML report, but the build
 * only FAILS on `serious`/`critical` impact. See e2e/utils/axe.ts and about.spec.ts.
 *
 * State coverage note — this route is intentionally a SINGLE (populated) state:
 *   - `src/pages/faq.tsx` fetches its content ONLY in `getStaticProps`
 *     (server-side) from Strapi `/api/docs` and has NO client-side refetch, so
 *     there is nothing for `page.route` to intercept in the browser. In the a11y
 *     static export the data is therefore baked at build time by the mock Strapi
 *     server (e2e/mock-strapi-server.js `/api/docs` → DOCS_FIXTURE), which makes
 *     the populated DOM deterministic without a client mock (see the
 *     server-side-data section of the a11y skill's references/patterns.md).
 *   - There is no loading UI (content is present on first paint from props), and
 *     the empty (`Nothing to display.`) and error branches depend on the
 *     build-time fetch returning null/throwing — unreachable from the browser
 *     since the mock server always answers `/api/docs` with a fixture.
 * The FAQ body is rendered through ReactMarkdown with rehype-raw (raw HTML in
 * markdown), which is exactly the kind of content that produces heading-order
 * and link-name issues, so scanning the rendered document matters.
 * This route does NOT render the site-wide search bar (no `includeSearchBar`).
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans } from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/faq';
// PageContainer's client-side notices banner fetch — the only browser request
// this route makes. Mocked to empty for determinism.
const NOTICES_API_GLOB = '**/api/notices*';

// The static h1 rendered by the page whenever content is present.
const PAGE_H1 = 'Frequently Asked Questions';

// --- Shared checks -----------------------------------------------------------

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — also proves the page rendered the intended chrome.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: PAGE_H1 }),
  ).toBeVisible();

  await runAxeScans(page, testInfo, state);
}

// --- Populated ---------------------------------------------------------------

test.describe('a11y: FAQ — populated content', () => {
  test('passes axe with build-time CMS content', async ({ page }, testInfo) => {
    await page.route(NOTICES_API_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // The h1 + rendered markdown body only exist when `getStaticProps` seeded
    // content (the mock Strapi `/api/docs` fixture), so this proves we're
    // scanning the populated document.
    await expect(
      page.getByRole('heading', { level: 1, name: PAGE_H1 }),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'populated');
  });
});
