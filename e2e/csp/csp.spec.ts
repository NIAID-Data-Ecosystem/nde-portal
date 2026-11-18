/**
 * Fails on any CSP violation when loading key routes.
 * - Default: injects the staging policy; stubs external hosts and the NDE API.
 * - PLAYWRIGHT_BASE_URL set: no injection or stubs. Uses the deployed site's
 *   CSP header (enforced or report-only) and real third-party traffic.
 */
import { expect, test } from '@playwright/test';

import { installCspGuard } from '../utils/csp';

const LIVE = !!process.env.PLAYWRIGHT_BASE_URL;

const ROUTES = [
  '/',
  '/about',
  '/faq',
  '/disclaimer',
  '/changelog',
  '/search?q=covid',
  '/advanced-search',
  '/ontology-browser',
  '/repository-matcher',
  '/program-collections',
  '/knowledge-center',
  '/login',
  '/this-route-does-not-exist', // 404 page
];

// Aborted in CI (network error, not a CSP violation); used on deployed sites.
const EXTERNAL =
  /(googletagmanager|google-analytics|analytics\.google|doubleclick|dap\.digitalgov|ebi\.ac\.uk|t\.biothings\.io)/;
const NDE_API = /api(-staging)?\.data\.niaid\.nih\.gov/;

for (const route of ROUTES) {
  test(`no CSP violations on ${route}`, async ({ page }) => {
    if (!LIVE) {
      await page.route(EXTERNAL, r => r.abort());
      await page.route(NDE_API, r =>
        r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ total: 0, hits: [], src: {}, stats: {} }),
        }),
      );
    }
    const guard = await installCspGuard(page, !LIVE);

    await page.goto(route);
    await page.waitForLoadState('networkidle').catch(() => {});
    if (LIVE) await page.waitForTimeout(4000); // wait for GTM and DAP

    expect(await guard.read()).toEqual([]);
  });
}

// GTM starts from /gtm-init.js. A failure there stops analytics without a page
// error. Checks the bootstrap request, then gtm.js, with no violations.
// Skip with `--grep-invert GTM` where no container is configured (dev).
test('GTM loads via the same-origin bootstrap', async ({ page }) => {
  if (!LIVE) await page.route(EXTERNAL, r => r.abort());
  const guard = await installCspGuard(page, !LIVE);

  const bootstrap = page.waitForRequest(/\/gtm-init\.js\?id=GTM-[A-Z0-9]+/);
  const gtm = page.waitForRequest(
    /googletagmanager\.com\/gtm\.js\?id=GTM-[A-Z0-9]+/,
  );
  await page.goto('/');
  await bootstrap;
  await gtm;

  expect(await guard.read()).toEqual([]);
});
