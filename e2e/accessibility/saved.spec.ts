/**
 * Accessibility tests for the Saved route (`/saved`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. Every violation is reported in the HTML report but only
 * `serious`/`critical` impacts FAIL the build (see e2e/utils/axe.ts).
 *
 * Auth + data wiring that shapes the states we can scan (see src/pages/saved.tsx,
 * src/components/auth/withAuth.tsx, src/hooks/useAuth, src/hooks/useUserData and
 * src/views/saved/hooks/useBatchResourcesData):
 *   - The page is exported as `withAuth(SavedPage)`. While the auth check is in
 *     flight `withAuth` renders only a "Loading..." spinner (no PageContainer
 *     chrome); once resolved it renders the saved UI if authenticated, or
 *     `router.replace('/login')` if not.
 *   - Auth is driven by the API `/user_info` fetch (`useAuth`). The saved tables
 *     are seeded by the `/user/data` GET (`useUserData`), and each saved resource
 *     is hydrated with type/source/dateModified via a bulk POST to `/query`
 *     (`useBatchResourcesData`, only when there is at least one saved dataset).
 *     All three are client-side requests, so `page.route` fully controls the
 *     states. `getAuthConfig`/`useUserData` strip the `/v1` suffix, so
 *     `/user_info` and `/user/data` are not under `/api/`. `.env.staging` (used by
 *     `yarn build:a11y`) enables the `ENABLE_AUTH` flag; dev mock auth/data needs
 *     `NODE_ENV=development`, so it is OFF in the production export and the real
 *     fetches run.
 *
 * State coverage note — this route is intentionally NOT the full four-state
 * matrix:
 *   - LOADING: `/user_info` kept pending → `withAuth` shows the "Loading..."
 *     spinner. Scanned below (directly, since no `main`/`h1` chrome renders yet).
 *   - POPULATED (authenticated with saved items): `/user_info` → a user,
 *     `/user/data` → saved searches + datasets, `/query` → resource metadata →
 *     both saved tables render with rows. Primary state.
 *   - EMPTY: authenticated user whose `/user/data` returns no saved searches or
 *     datasets → both tables render their "No matches" empty state (`/query`
 *     never fires because there are no dataset ids). Scanned below.
 *   - ERROR: not reachable as distinct UI. An unauthenticated/failed `/user_info`
 *     redirects to `/login` (covered by login.spec.ts). A failed `/user/data`
 *     leaves `savedQueries`/`savedDatasets` empty with no error surface — it
 *     renders identically to the empty state, so there is no separate error UI
 *     on this page to scan.
 *
 * Interaction state — the tables expose per-section search inputs. Filtering to a
 * term that matches nothing swaps the populated table for its "No matches" empty
 * state and reveals the input's clear button; that transient DOM is scanned in
 * its own block.
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans } from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/saved';

// The API auth session check, the saved-data endpoint, and the bulk resource
// metadata query used to hydrate saved datasets.
const USER_INFO_GLOB = '**/user_info*';
const USER_DATA_GLOB = '**/user/data*';
const QUERY_GLOB = '**/query*';

// Minimal but representative authenticated user for the `/user_info` check.
const USER_FIXTURE = {
  username: 'a11y-user',
  oauth_provider: 'GitHub',
  name: 'A11y User',
  email: 'a11y.user@example.org',
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
  organization: 'NIAID a11y Fixture',
};

// Two saved searches and two saved datasets for the populated state. Names are
// distinctive so the waits below key off content only this fixture produces.
const SAVED_QUERIES_FIXTURE = [
  {
    total: 42,
    name: 'A11y Asthma cohort',
    query: 'a11y asthma cohort',
    filters: {},
    saved_at: '2026-06-09T16:21:22+00:00',
  },
  {
    total: 108,
    name: 'A11y Influenza cohort',
    query: 'a11y influenza cohort',
    filters: {},
    saved_at: '2026-06-09T16:21:37+00:00',
  },
];

const SAVED_DATASETS_FIXTURE = [
  {
    dataset_id: 'a11y_dataset_1',
    name: 'A11y Fixture Dataset One',
    saved_at: '2026-05-28T20:52:16.015Z',
  },
  {
    dataset_id: 'a11y_dataset_2',
    name: 'A11y Fixture Dataset Two',
    saved_at: '2026-05-27T20:52:16.714Z',
  },
];

// Authenticated `/user/data` GET payload for the populated state.
const USER_DATA_POPULATED = {
  ...USER_FIXTURE,
  linked_accounts: [],
  favorite_searches: SAVED_QUERIES_FIXTURE,
  favorite_datasets: SAVED_DATASETS_FIXTURE,
  ai_toggle_preference: false,
  beta: false,
  contact_preference: false,
  feedback_preference: false,
  created: '2026-03-11T19:36:34+00:00',
  updated: '2026-03-11T20:24:13+00:00',
};

// Authenticated `/user/data` GET payload with nothing saved (empty state).
const USER_DATA_EMPTY = {
  ...USER_DATA_POPULATED,
  favorite_searches: [],
  favorite_datasets: [],
};

// The bulk `/query` response hydrating each saved dataset with type/source/date.
const QUERY_FIXTURE = [
  {
    _id: 'a11y_dataset_1',
    '@type': 'Dataset',
    includedInDataCatalog: { name: 'A11y Source Catalog' },
    dateModified: '2026-01-15',
  },
  {
    _id: 'a11y_dataset_2',
    '@type': 'ComputationalTool',
    includedInDataCatalog: { name: 'A11y Source Catalog' },
    dateModified: '2026-02-20',
  },
];

// --- Shared checks run in the rendered (authenticated) states ---------------

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — the saved UI (PageContainer chrome + heading) only
  // renders once the auth guard resolves to authenticated.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: /^saved$/i }),
  ).toBeVisible();

  // Each saved section renders a labelled search input; assert the first one is
  // programmatically labelled and editable.
  const search = page.getByRole('textbox', { name: /search saved queries/i });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  await runAxeScans(page, testInfo, state);
}

// --- Loading -----------------------------------------------------------------

test.describe('a11y: Saved — loading (auth check in flight)', () => {
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

// --- Populated (authenticated with saved items) ------------------------------

test.describe('a11y: Saved — authenticated with saved items', () => {
  test('passes axe with saved queries and resources rendered', async ({
    page,
  }, testInfo) => {
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
        body: JSON.stringify(USER_DATA_POPULATED),
      }),
    );
    await page.route(QUERY_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(QUERY_FIXTURE),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Fixture rows in both tables prove the sections populated — a saved query
    // name link and a saved resource name link, each unique to this fixture.
    await expect(
      page.getByRole('link', { name: /a11y asthma cohort/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /a11y fixture dataset one/i }),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Empty (authenticated, nothing saved) ------------------------------------

test.describe('a11y: Saved — authenticated with nothing saved', () => {
  test('passes axe with the empty tables', async ({ page }, testInfo) => {
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
        body: JSON.stringify(USER_DATA_EMPTY),
      }),
    );
    // No saved datasets → useBatchResourcesData is disabled and never fires; mock
    // defensively anyway so a stray call can't hit the live network.
    await page.route(QUERY_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // With no saved items each table renders its "No matches" empty state.
    await expect(page.getByText(/nothing saved yet/i).first()).toBeVisible();

    await runSharedChecks(page, testInfo, 'empty');
  });
});

// --- Interaction: search filter with no matches ------------------------------

test.describe('a11y: Saved — search filter (no matches)', () => {
  test('passes axe after filtering the queries table to no matches', async ({
    page,
  }, testInfo) => {
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
        body: JSON.stringify(USER_DATA_POPULATED),
      }),
    );
    await page.route(QUERY_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(QUERY_FIXTURE),
      }),
    );

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the populated table before driving the search.
    await expect(
      page.getByRole('link', { name: /a11y asthma cohort/i }),
    ).toBeVisible();

    // Type a term that matches no saved query → the queries table swaps to its
    // empty state and the input's clear button appears.
    const search = page.getByRole('textbox', { name: /search saved queries/i });
    await search.pressSequentially('zzz-no-such-query');

    await expect(page.getByText(/no matches/i).first()).toBeVisible();
    await expect(page.getByText(/try broadening your search/i)).toBeVisible();

    // Scan the transient DOM directly — the resting-layout asserts in
    // runSharedChecks aren't the target here.
    await runAxeScans(page, testInfo, 'search-no-matches');
  });
});
