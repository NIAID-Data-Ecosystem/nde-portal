import { screenReaderConfig } from '@guidepup/playwright';
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for SCREEN READER end-to-end tests.
 *
 * This is a separate suite from the axe scans in `playwright.config.ts`, and it
 * is deliberately NOT run in CI. Read `e2e/screen-reader/README.md` before
 * touching it — it documents the one-time macOS setup these tests require.
 *
 * Why separate:
 *   - Real VoiceOver is a singleton. `screenReaderConfig` (from
 *     @guidepup/playwright) forces `workers: 1`, `fullyParallel: false` and
 *     `headless: false` — the exact opposite of the axe suite, which runs 4
 *     headless workers in parallel.
 *   - A VoiceOver traversal is measured in minutes, not seconds.
 *   - VoiceOver takes over the machine's keyboard and audio while running, so
 *     these tests are run on demand by a human, not on a schedule.
 *
 * CI isolation is enforced from BOTH sides: this config's `testDir` points only
 * at `e2e/screen-reader`, and `playwright.config.ts` sets
 * `testIgnore: '**​/screen-reader/**'` so the CI command (`yarn
 * test:a11y:nobuild`) can never collect these specs.
 *
 * Like the axe suite, this runs against the PRODUCTION STATIC EXPORT (`out/`)
 * produced by `yarn build:a11y`, served as plain files, with the mock Strapi
 * server up. See playwright.config.ts for why.
 *
 * BROWSER NOTE — this uses Chromium, not WebKit. WebKit/Safari is the more
 * realistic VoiceOver pairing and is what guidepup's own examples use, but
 * Playwright builds WebKit per macOS version and no longer ships one for
 * macOS 12 (`npx playwright install webkit` → "Playwright does not support
 * webkit on mac12"). On a Ventura-or-newer machine, switch the project to
 * `{ name: 'webkit', use: { ...devices['Desktop Safari'], headless: false } }`
 * — guidepup maps both browsers already (see its `applicationNameMap`).
 *
 * @see https://www.guidepup.dev/docs/guides/playwright
 */

const PORT = Number(process.env.PLAYWRIGHT_PORT) || 3000;
const MOCK_STRAPI_PORT = Number(process.env.MOCK_STRAPI_PORT) || 1337;
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  // workers: 1, fullyParallel: false, use.headless: false — VoiceOver is a
  // singleton and screen readers can't attach to a headless browser.
  ...screenReaderConfig,
  testDir: './e2e/screen-reader',
  // A single VoiceOver traversal of the home page takes minutes: every command
  // is an AppleScript round-trip with a settle delay.
  timeout: 5 * 60 * 1000,
  expect: { timeout: 30_000 },
  // Local-only suite: a retry doubles an already very slow run, and a flaky
  // VoiceOver result is something to investigate, not to paper over.
  retries: 0,
  // Every test here is "slow" by design; the warning is pure noise.
  reportSlowTests: null,
  // Its own report folder so it never overwrites the axe suite's report.
  reporter: [
    ['html', { outputFolder: 'playwright-report-sr', open: 'never' }],
    ['list'],
  ],
  outputDir: 'test-results-sr',
  use: {
    ...screenReaderConfig.use,
    baseURL,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: 'chromium',
      // `headless: false` MUST come after the devices spread — `devices` sets
      // its own `headless`, and a screen reader can't read a headless browser.
      use: { ...devices['Desktop Chrome'], headless: false },
    },
  ],
  // Same two servers as the axe suite: the static export plus the mock Strapi
  // that `out/` was built against (NEXT_PUBLIC_STRAPI_API_URL is inlined at
  // build time, so un-mocked client-side Strapi calls still resolve locally).
  webServer: [
    {
      command: 'node e2e/mock-strapi-server.js',
      port: MOCK_STRAPI_PORT,
      reuseExistingServer: true,
      timeout: 10_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: `npx serve out --listen ${PORT} --no-clipboard --no-port-switching`,
      url: baseURL,
      reuseExistingServer: true,
      timeout: 30_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
