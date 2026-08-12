import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for accessibility (a11y) end-to-end tests.
 *
 * These tests run @axe-core/playwright scans against a PRODUCTION STATIC EXPORT
 * (`out/`) served as plain files, not against `next dev`. A prebuilt export is
 * dramatically faster: `next dev` cold-compiles each route on first hit and
 * re-runs `getStaticProps` on every request, whereas the export is served
 * instantly and has no server-side work at runtime. All meaningful test states
 * are still driven client-side via `page.route`, which is unaffected.
 *
 * The build is produced by `yarn build:a11y` (scripts/build-a11y.mjs), which
 * `yarn test:a11y` runs before `playwright test`. Use `yarn test:a11y:nobuild`
 * to skip the build and reuse an existing `out/` for fast local iteration.
 * They live in `./e2e` so Jest (unit tests) and Playwright never pick up each
 * other's files.
 *
 * @see https://playwright.dev/docs/test-configuration
 */

const PORT = Number(process.env.PLAYWRIGHT_PORT) || 3000;
const MOCK_STRAPI_PORT = Number(process.env.MOCK_STRAPI_PORT) || 1337;
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  // Fail the build on CI if a `test.only` was committed by accident.
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  // a11y scans are independent — run them in parallel.
  fullyParallel: true,
  // Serving a prebuilt static export removes the cold-compile crashes that
  // forced a 2-worker cap under `next dev`, so we can parallelize more. CI keeps
  // a modest count for its smaller runners; locally default to 4 (override with
  // PLAYWRIGHT_WORKERS).
  workers: isCI ? 2 : Number(process.env.PLAYWRIGHT_WORKERS) || 4,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['html', { open: 'never' }], ['list']],
  // Static files serve instantly, so navigation is no longer the long pole —
  // the remaining budget is for axe scanning large DOMs. 60s is ample.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Serve the prebuilt static export (`out/`, produced by `yarn build:a11y`)
  // plus the mock Strapi server. The mock stays up at RUNTIME too: `out/` bakes
  // NEXT_PUBLIC_STRAPI_API_URL=localhost:1337 at build time, so any client-side
  // Strapi call a spec does not `page.route` (e.g. the global PageContainer
  // `/api/notices` fetch) still resolves here instead of hitting a real CMS.
  // `serve`'s default clean-URLs map `/about`→`out/about.html` and
  // `/diseases/asthma`→`out/diseases/asthma.html` (next export uses
  // trailingSlash:false); `out/404.html` covers misses.
  webServer: [
    {
      command: 'node e2e/mock-strapi-server.js',
      port: MOCK_STRAPI_PORT,
      reuseExistingServer: !isCI,
      timeout: 10_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: `npx serve out --listen ${PORT} --no-clipboard --no-port-switching`,
      url: baseURL,
      reuseExistingServer: !isCI,
      timeout: 30_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
