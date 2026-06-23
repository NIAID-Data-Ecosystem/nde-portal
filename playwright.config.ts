import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for accessibility (a11y) end-to-end tests.
 *
 * These tests boot the Next.js dev server and run @axe-core/playwright scans
 * against rendered routes. They live in `./e2e` so Jest (unit tests) and
 * Playwright (e2e/a11y) never pick up each other's files.
 *
 * @see https://playwright.dev/docs/test-configuration
 */

const PORT = Number(process.env.PLAYWRIGHT_PORT) || 3000;
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  // Fail the build on CI if a `test.only` was committed by accident.
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  // a11y scans are independent — run them in parallel.
  fullyParallel: true,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['html', { open: 'never' }], ['list']],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Boot `next dev` for the tests unless a server is already running locally.
  webServer: {
    command: `yarn dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
