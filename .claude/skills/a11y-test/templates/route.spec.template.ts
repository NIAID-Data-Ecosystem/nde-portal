/**
 * Accessibility spec template.
 *
 * Copy to e2e/accessibility/<route-or-feature>.spec.ts, fix the import path to
 * `../utils/axe`, and replace every REPLACE_ME. The scan itself is done by the
 * shared `runAxeScans` helper: it runs ONE axe traversal and internally
 * attaches + asserts the full WCAG scan, the focused color-contrast section,
 * the button/link-name section, and a screenshot (serious/critical block; see
 * blockingViolations). You only write the structural/form assertions and the
 * per-state setup.
 *
 * The four describe blocks map to the four states every data-driven route
 * should cover. Delete a state only if it genuinely cannot occur — and think
 * twice before dropping the error state.
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans } from '../../../../e2e/utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/REPLACE_ME'; // route under test

// External API(s) this route depends on. Most data routes hit the NDE API,
// whose endpoints are NOT under `/api/` — the query endpoint is `**/query*`
// and metadata is `**/metadata*` (the canonical repository-matcher spec mocks
// both). Only the Strapi CMS lives under `/api/` (e.g. `**/api/about-page*`).
// Mock every endpoint the route reads so the page never hits the live network.
const API_GLOBS = ['**/query*', '**/metadata*']; // REPLACE_ME with this route's endpoints

// Minimal but representative payload for the populated state.
const POPULATED_FIXTURE = {
  // REPLACE_ME
};

// --- Shared checks run in every state ---------------------------------------

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — also proves the page rendered the intended chrome.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Forms: assert the route's primary form control is programmatically
  // labelled. Most routes render the site-wide search bar; replace the name or
  // delete this block if the route has no form control. (See about.spec.ts and
  // repository-matcher.spec.ts.)
  const search = page.getByRole('textbox', { name: /REPLACE_ME search/i });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  // One axe traversal → full WCAG A/AA scan + focused color-contrast section +
  // button/link-name section + screenshot, each attached to the HTML report,
  // asserting only serious/critical impacts. Pass { include }/{ exclude } to
  // scope the scan (e.g. exclude a third-party widget's markup).
  await runAxeScans(page, testInfo, state);
}

// --- Loading -----------------------------------------------------------------

test.describe('a11y: <route or feature> — loading', () => {
  test('passes axe while loading', async ({ page }, testInfo) => {
    // Keep every request pending so the loading UI stays on screen.
    for (const glob of API_GLOBS) {
      await page.route(glob, () => new Promise<void>(() => {}));
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for proof of the loading state. This project's skeletons render
    // through src/components/skeleton with the `.custom-skeleton-loading`
    // class — a CSS selector is acceptable here only because skeletons have no
    // accessible surface to target.
    await expect(
      page.locator('.custom-skeleton-loading').first(),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Empty -------------------------------------------------------------------

test.describe('a11y: <route or feature> — empty', () => {
  test('passes axe with no data', async ({ page }, testInfo) => {
    for (const glob of API_GLOBS) {
      await page.route(glob, route =>
        route.fulfill({
          json: {
            /* resolved empty payload, REPLACE_ME */
          },
        }),
      );
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the user-facing empty-state message.
    await expect(page.getByText(/REPLACE_ME empty message/i)).toBeVisible();

    await runSharedChecks(page, testInfo, 'empty');
  });
});

// --- Populated ---------------------------------------------------------------

test.describe('a11y: <route or feature> — populated', () => {
  test('passes axe with representative data', async ({ page }, testInfo) => {
    for (const glob of API_GLOBS) {
      await page.route(glob, route =>
        route.fulfill({ json: POPULATED_FIXTURE }),
      );
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for a user-facing element that only appears once data renders.
    await expect(page.getByRole('REPLACE_ME')).toBeVisible();

    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Error / permission ------------------------------------------------------

test.describe('a11y: <route or feature> — error', () => {
  test('passes axe in the error state', async ({ page }, testInfo) => {
    // Match how the app handles production failures: abort, or fulfill a 5xx.
    for (const glob of API_GLOBS) {
      await page.route(glob, route => route.abort());
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the error UI (alert role, retry button, etc.).
    await expect(page.getByRole('alert')).toBeVisible();

    await runSharedChecks(page, testInfo, 'error');
  });
});

// --- Interaction states ------------------------------------------------------
//
// The four states above scan the page AT REST. If this feature has interactive
// surfaces a user opens — select/combobox menus, predictive/autocomplete
// dropdowns, drag overlays, inline validation errors, modals — add a describe
// block per surface here too: that markup doesn't exist on first paint, so the
// resting scans never see it, and it's where a11y regressions hide. Drive the
// interaction, wait for the surface's own accessible proof (an open `option`, a
// suggestion item, the error text, a drag live-region announcement), then call
// the shared `runAxeScans(page, testInfo, state)` DIRECTLY (not runSharedChecks)
// — an open portal covering the page chrome would flake the resting-layout
// `toBeVisible` asserts, but the axe scan still covers the whole DOM.
//
