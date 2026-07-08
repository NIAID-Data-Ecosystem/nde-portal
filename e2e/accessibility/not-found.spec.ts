/**
 * Accessibility tests for the 404 / Not Found route (`/404`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. Every violation is attached to the HTML report, but the build
 * only FAILS on `serious`/`critical` impact so minor/moderate noise doesn't
 * block CI. See e2e/utils/axe.ts and the canonical about.spec.ts.
 *
 * State coverage note — this route is intentionally a SINGLE state, not the
 * four-state (loading/empty/populated/error) matrix. `src/pages/404.tsx` renders
 * only static content (an image, an h1, a paragraph, and a "Back to Home" link)
 * with no data fetching, so it has no loading/empty/populated/error states to
 * scan. The one client-side request the shared PageContainer makes is the
 * `/api/notices` banner fetch, which we mock to empty for determinism.
 *
 * The 404 page is served for every unmatched URL in the static export
 * (`out/404.html`), so it's high-traffic chrome that no other spec covers — a
 * heading/landmark/contrast regression here would ship silently otherwise.
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans } from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/404';
// The only client-side request the page makes (PageContainer notices banner).
const NOTICES_API_GLOB = '**/api/notices*';

// --- Shared checks -----------------------------------------------------------

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — also proves the page rendered the intended chrome.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /the page you.?re looking for isn.?t available/i,
    }),
  ).toBeVisible();

  // Forms: this route renders the site-wide search bar (`includeSearchBar`), so
  // its control must be programmatically labelled.
  const search = page.getByRole('textbox', { name: /search for resources/i });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  // The recovery affordance every 404 needs: a "Back to Home" control with an
  // accessible name (button-name/link-name is also covered by runAxeScans).
  await expect(page.getByRole('link', { name: /back to home/i })).toBeVisible();

  await runAxeScans(page, testInfo, state);
}

// --- Static content ----------------------------------------------------------

test.describe('a11y: 404 — static content', () => {
  test('passes axe on the not-found page', async ({ page }, testInfo) => {
    // Keep the notices banner deterministic (no live CMS dependency).
    await page.route(NOTICES_API_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    await runSharedChecks(page, testInfo, 'not-found');
  });
});
