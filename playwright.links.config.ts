import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the broken-link check in `e2e/links`, run with
 * `yarn test:links`. It's kept apart from playwright.config.ts because the a11y
 * run builds against mock Strapi and must not depend on third-party sites.
 *
 * What it checks, in order of precedence:
 * - PLAYWRIGHT_BASE_URL: a deployed site, e.g. https://data-staging.niaid.nih.gov
 * - a server already listening on PLAYWRIGHT_PORT (default 3000), e.g. `yarn dev`
 * - otherwise it serves `out/`. Build that with real CMS content (`yarn build`
 *   or `yarn build:staging`), not `yarn build:a11y`, whose pages hold mock
 *   Strapi content.
 */

const PORT = Number(process.env.PLAYWRIGHT_PORT) || 3000;
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e/links',
  forbidOnly: !!process.env.CI,
  // One test crawls every page and paces its own requests per host.
  workers: 1,
  timeout: 30 * 60_000,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report/links' }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    // `next dev` compiles each route on first hit.
    navigationTimeout: 60_000,
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `npx serve out --listen ${PORT} --no-clipboard --no-port-switching`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 30_000,
      },
});
