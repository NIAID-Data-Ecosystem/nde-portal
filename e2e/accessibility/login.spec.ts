/**
 * Accessibility tests for the Login route (`/login`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. Every violation is reported in the HTML report but only
 * `serious`/`critical` impacts FAIL the build (see e2e/utils/axe.ts).
 *
 * Auth wiring that shapes the states we can scan (see src/pages/login.tsx and
 * src/hooks/useAuth):
 *   - On mount `AuthProvider.checkAuth()` fetches the API `/user_info` endpoint
 *     (client-side `fetch`), so `page.route('**\/user_info*')` fully controls
 *     the state. `.env.staging` (used by `yarn build:a11y`) sets
 *     `NEXT_PUBLIC_APP_ENV=staging`, so the `ENABLE_AUTH` feature flag is on and
 *     the login page actually renders instead of redirecting home. Dev mock auth
 *     requires `NODE_ENV=development`, so it is OFF in the production export and
 *     the real `/user_info` fetch runs.
 *
 * State coverage note — this route is intentionally NOT the full four-state
 * matrix:
 *   - LOADING: `/user_info` kept pending → `isLoading` stays true → the card
 *     shows the "Checking authentication status..." spinner. Scanned below.
 *   - POPULATED (logged-out): `/user_info` → 401 → `isAuthenticated=false`, the
 *     login provider buttons render. This is the primary interactive state.
 *   - EMPTY: not applicable. The provider buttons come from static auth config
 *     (`NEXT_PUBLIC_AUTH_PROVIDERS`, default `github,orcid`), so there is no
 *     data-driven empty variant of this page.
 *   - ERROR: not reachable as distinct UI. `fetchUserInfo` swallows network/CORS
 *     failures and returns `null` (treated as logged-out), and a non-2xx
 *     `/user_info` is also treated as logged-out — both render the same
 *     logged-out card scanned below. There is no error surface on this page.
 *   - AUTHENTICATED: not a scannable state — a resolved user triggers a
 *     `router.replace()` redirect away from `/login`.
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans } from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/login';

// The API auth session check. `getAuthConfig` strips the `/v1` suffix, so the
// endpoint is `<apiBase>/user_info` (not under `/api/`).
const USER_INFO_GLOB = '**/user_info*';

// --- Shared checks run in every state ---------------------------------------

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — the PageContainer chrome and the page heading render in
  // every state (the heading sits outside the loading conditional).
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: /log in to your account/i }),
  ).toBeVisible();

  await runAxeScans(page, testInfo, state);
}

// --- Loading -----------------------------------------------------------------

test.describe('a11y: Login — loading (auth check in flight)', () => {
  test('passes axe while checking authentication', async ({
    page,
  }, testInfo) => {
    // Keep the auth check pending so the login card stays in its loading state.
    await page.route(USER_INFO_GLOB, () => new Promise<void>(() => {}));

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the spinner's accompanying text — the login card's loading proof.
    await expect(
      page.getByText(/checking authentication status/i),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Populated (logged out) --------------------------------------------------

test.describe('a11y: Login — logged out (provider buttons)', () => {
  test('passes axe with the login provider options', async ({
    page,
  }, testInfo) => {
    // A 401 is how the API reports an unauthenticated session; the app treats it
    // as logged-out and renders the provider buttons.
    await page.route(USER_INFO_GLOB, route =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not authenticated' }),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the provider buttons that only render once the auth check
    // resolves to logged-out (default providers are github + orcid).
    await expect(
      page.getByRole('button', { name: /log in with github/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /log in with orcid/i }),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'logged-out');
  });
});
