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

/**
 * Browser projects. A plain `playwright test` (so `yarn test:a11y`) runs
 * Chromium only. Choose others with PLAYWRIGHT_BROWSERS, a comma-separated list
 * of project names or `all`:
 *
 *   PLAYWRIGHT_BROWSERS=firefox,webkit yarn test:a11y:nobuild
 *
 * `--project`, UI mode and the VS Code extension (`test-server`) choose
 * projects themselves, so they see every project. CI runs each project in its
 * own job and picks which projects run from the event
 * (.github/workflows/accessibility.yml, "In CI" in e2e/README.md).
 *
 * Test tags (see "Test tags" in e2e/README.md):
 * - untagged: device-independent accessibility tests (default), every project
 * - `@desktop`: desktop-specific interfaces and interactions, desktop projects
 * - `@mobile`: mobile-specific interfaces and interactions, phone projects
 */
const DESKTOP = { grepInvert: /@mobile\b/ };
const PHONE = { grepInvert: /@desktop\b/ };

const BROWSER_PROJECTS = [
  // Keep Chromium first: UI mode and the VS Code extension select the first
  // project by default.
  { name: 'chromium', ...DESKTOP, use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', ...DESKTOP, use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', ...DESKTOP, use: { ...devices['Desktop Safari'] } },
  { name: 'mobile-chrome', ...PHONE, use: { ...devices['Pixel 7'] } },
  { name: 'mobile-safari', ...PHONE, use: { ...devices['iPhone 15'] } },
];

const choosesOwnProjects = process.argv.some(
  arg =>
    arg === 'test-server' ||
    arg.startsWith('--ui') ||
    arg === '--project' ||
    arg.startsWith('--project='),
);
// Workers reload this file without the CLI args and must see the same
// projects, so pass the choice on through the environment they inherit.
if (choosesOwnProjects && !process.env.PLAYWRIGHT_BROWSERS) {
  process.env.PLAYWRIGHT_BROWSERS = 'all';
}

function selectProjects(value: string) {
  const names = value
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);
  if (names.includes('all')) return BROWSER_PROJECTS;
  const known = BROWSER_PROJECTS.map(project => project.name);
  const unknown = names.filter(name => !known.includes(name));
  if (unknown.length) {
    throw new Error(
      `PLAYWRIGHT_BROWSERS: unknown project "${unknown.join('", "')}". ` +
        `Use ${known.join(', ')} or all.`,
    );
  }
  return BROWSER_PROJECTS.filter(project => names.includes(project.name));
}

export default defineConfig({
  testDir: './e2e',
  // The broken-link check needs live sites; it has its own config
  // (playwright.links.config.ts, `yarn test:links`).
  testIgnore: '**/e2e/links/**',
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
  projects: selectProjects(process.env.PLAYWRIGHT_BROWSERS || 'chromium'),
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
