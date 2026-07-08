/**
 * Accessibility tests for the account Settings route (`/settings`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. Every violation is reported in the HTML report but only
 * `serious`/`critical` impacts FAIL the build (see e2e/utils/axe.ts).
 *
 * Auth wiring that shapes the states we can scan (see src/pages/settings.tsx,
 * src/components/auth/withAuth.tsx, src/hooks/useUserData):
 *   - The page is exported as `withAuth(UserSettingsPage)`. While the auth check
 *     is in flight `withAuth` renders only a "Loading..." spinner (no
 *     PageContainer chrome); once resolved it renders the settings UI if
 *     authenticated, or `router.replace('/login')` if not.
 *   - Auth is driven by the API `/user_info` fetch, and the settings toggles are
 *     seeded by the `/user/data` fetch (`getAuthConfig`/`useUserData` strip the
 *     `/v1` suffix, so neither endpoint is under `/api/`). Both are client-side
 *     `fetch`es, so `page.route` fully controls the states. `.env.staging`
 *     (used by `yarn build:a11y`) enables the `ENABLE_AUTH` flag; dev mock auth
 *     needs `NODE_ENV=development` so it is OFF in the production export and the
 *     real fetches run.
 *
 * State coverage note — this route is intentionally NOT the full four-state
 * matrix:
 *   - LOADING: `/user_info` kept pending → `withAuth` shows the "Loading..."
 *     spinner. Scanned below (directly, since no `main`/`h1` chrome renders yet).
 *   - POPULATED (authenticated): `/user_info` → a user and `/user/data` →
 *     preferences → the settings sections and toggles render. Primary state.
 *   - EMPTY: not applicable. `useUserData` starts from `DEFAULT_PREFERENCES`, so
 *     the toggles always have values; there is no data-driven empty variant.
 *   - ERROR: not reachable as distinct UI. An unauthenticated/failed
 *     `/user_info` redirects to `/login` (covered by login.spec.ts), and a
 *     failed `/user/data` leaves the page on its default preferences with no
 *     error surface — there is no error UI on this page to scan.
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans } from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/settings';

// The API auth session check and the user preferences endpoint.
const USER_INFO_GLOB = '**/user_info*';
const USER_DATA_GLOB = '**/user/data*';

// Minimal but representative authenticated user for the `/user_info` check.
const USER_FIXTURE = {
  username: 'a11y-user',
  oauth_provider: 'GitHub',
  name: 'A11y User',
  email: 'a11y.user@example.org',
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
  organization: 'NIAID a11y Fixture',
};

// Representative preferences payload for the `/user/data` GET (a mix of on/off
// so both switch states are exercised in the scan).
const USER_DATA_FIXTURE = {
  ...USER_FIXTURE,
  linked_accounts: [],
  favorite_searches: [],
  favorite_datasets: [],
  ai_toggle_preference: true,
  beta: false,
  contact_preference: true,
  feedback_preference: false,
  created: '2026-03-11T19:36:34+00:00',
  updated: '2026-03-11T20:24:13+00:00',
};

// --- Loading -----------------------------------------------------------------

test.describe('a11y: Settings — loading (auth check in flight)', () => {
  test('passes axe while the auth guard is loading', async ({
    page,
  }, testInfo) => {
    // Keep the auth check pending so `withAuth` stays on its loading spinner.
    await page.route(USER_INFO_GLOB, () => new Promise<void>(() => {}));

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // The withAuth loading UI is a bare spinner + text (no PageContainer chrome,
    // so no main/h1 to assert). "Loading..." appears twice — the Chakra Spinner's
    // visually-hidden label and the withAuth paragraph — so take the first match.
    await expect(page.getByText(/^loading\.\.\.$/i).first()).toBeVisible();

    await runAxeScans(page, testInfo, 'loading');
  });
});

// --- Populated (authenticated) -----------------------------------------------

test.describe('a11y: Settings — authenticated (preferences)', () => {
  test('passes axe with the settings toggles rendered', async ({
    page,
  }, testInfo) => {
    // Authenticated session + seeded preferences.
    await page.route(USER_INFO_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(USER_FIXTURE),
      }),
    );
    await page.route(USER_DATA_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(USER_DATA_FIXTURE),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Structural sanity — the settings UI (PageContainer chrome + heading) only
    // renders once the auth guard resolves to authenticated.
    await expect(page.getByRole('main')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: /^settings$/i }),
    ).toBeVisible();

    // Wait for content that only renders once the settings page mounts.
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: /communication preferences/i,
      }),
    ).toBeVisible();
    await expect(page.getByText(/email updates/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible();

    await runAxeScans(page, testInfo, 'authenticated');
  });
});
