/**
 * Accessibility tests at a MOBILE viewport (375×812).
 *
 * Why a dedicated mobile spec: every other spec runs at the `Desktop Chrome`
 * viewport (playwright.config.ts defines only that project), so the responsive
 * surfaces that only exist below the `md` breakpoint are never scanned —
 * chiefly the hamburger navigation menu (the desktop nav is `display:none` on
 * mobile and vice-versa) and the reflowed page/table layouts. axe recomputes
 * color-contrast and evaluates structure against the actually-rendered mobile
 * DOM, so these are genuinely different scans, not duplicates of the desktop
 * ones.
 *
 * `test.use({ viewport })` applies the phone viewport to every test in this
 * file. Each block mirrors the mocking of its desktop counterpart
 * (home.spec.ts, search.spec.ts, about.spec.ts) so the mobile DOM is equally
 * deterministic; see those specs for the per-route data-model notes.
 *
 * Every violation is attached to the HTML report; the build only FAILS on
 * `serious`/`critical` impact. See e2e/utils/axe.ts.
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans } from '../utils/axe';

test.use({ viewport: { width: 375, height: 812 } });

// --- Fixtures (mirrors home.spec.ts / about.spec.ts) -------------------------

// Home: one resource-catalog row (NDE /query) + one repository row (/metadata).
const HOME_QUERY_FIXTURE = {
  total: 1,
  hits: [
    {
      _id: 'rc-fixture-001',
      '@type': 'ResourceCatalog',
      name: 'Fixture Resource Catalog',
      abstract: 'A deterministic resource catalog fixture for a11y scanning.',
      conditionsOfAccess: 'Open',
      genre: ['IID'],
      url: 'https://example.org/catalog',
    },
  ],
};

const HOME_METADATA_FIXTURE = {
  src: {
    fixtureRepo: {
      sourceInfo: {
        _id: 'repo-fixture-001',
        identifier: 'fixture-repo',
        name: 'Fixture Dataset Repository',
        abstract: 'A deterministic repository fixture for a11y scanning.',
        type: 'Dataset Repository',
        conditionsOfAccess: 'Open',
        genre: ['IID'],
        url: 'https://example.org/repo',
      },
    },
  },
};

// About: Strapi CMS payload (client-side useQuery refetch). fetchContent()
// returns `data.data`, so the fixture is nested under `data`.
const ABOUT_FIXTURE = {
  data: {
    name: 'About the NDE Portal Fixture',
    subtitle: 'A deterministic About-page fixture for accessibility scanning.',
    description: [
      '## Our mission',
      '',
      'The NDE Portal helps researchers discover biomedical datasets across',
      'many repositories.',
      '',
      'Read the [data submission guidelines](https://example.org/guidelines)',
      'to learn more.',
    ].join('\n'),
    createdAt: '2026-06-17T00:00:00Z',
    updatedAt: '2026-06-17T00:00:00Z',
    publishedAt: '2026-06-17T00:00:00Z',
  },
};

const HERO_H1 = 'Discovery Portal';

// --- Helpers -----------------------------------------------------------------

function fulfillJson(body: unknown) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  };
}

/** Mock the Strapi CMS endpoints the home page refetches client-side, plus the
 * PageContainer notices banner, so the mobile home DOM is deterministic. */
async function mockHomeStrapiRoutes(page: Page) {
  await page.route('**/api/news-reports*', route =>
    route.fulfill(fulfillJson({ data: [] })),
  );
  await page.route('**/api/events*', route =>
    route.fulfill(fulfillJson({ data: [] })),
  );
  await page.route('**/api/features*', route =>
    route.fulfill(fulfillJson({ data: [] })),
  );
  await page.route('**/api/notices*', route =>
    route.fulfill(fulfillJson({ data: [] })),
  );
}

/** Put the home page into its populated state at the current (mobile) viewport. */
async function gotoHomePopulated(page: Page) {
  await mockHomeStrapiRoutes(page);
  await page.route('**/query*', route =>
    route.fulfill(fulfillJson(HOME_QUERY_FIXTURE)),
  );
  await page.route('**/metadata*', route =>
    route.fulfill(fulfillJson(HOME_METADATA_FIXTURE)),
  );
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { level: 1, name: HERO_H1 }),
  ).toBeVisible();
}

// --- Home (populated) --------------------------------------------------------

test.describe('a11y: Mobile — Home populated', () => {
  test('passes axe on the home page at a phone viewport', async ({
    page,
  }, testInfo) => {
    await gotoHomePopulated(page);

    // Wait for rows that only the mocked fixtures render so we scan the
    // populated, reflowed table — not the loading/empty state.
    await expect(
      page.getByRole('link', { name: 'Fixture Resource Catalog' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Fixture Dataset Repository' }),
    ).toBeVisible();

    await runAxeScans(page, testInfo, 'mobile-home');
  });
});

// --- Global mobile navigation menu (hamburger) -------------------------------

test.describe('a11y: Mobile — navigation menu open', () => {
  test('passes axe with the hamburger nav menu expanded', async ({
    page,
  }, testInfo) => {
    await gotoHomePopulated(page);

    // The hamburger toggle (src/components/navigation-bar/components/nav-layout
    // `Toggle`) only renders below `md`. Opening it mounts the mobile nav items,
    // which the desktop scans never see.
    await page.getByRole('button', { name: /open navigation menu/i }).click();

    // Proof the menu opened: the toggle's label flips, and the top-level mobile
    // nav items (config `navigation.primary`) render inside the nav landmark.
    await expect(
      page.getByRole('button', { name: /close navigation menu/i }),
    ).toBeVisible();
    // A top-level mobile dropdown toggle (config `navigation.primary`) proves
    // the mobile nav items mounted, not just the close button.
    await expect(
      page.getByRole('button', { name: /open Resources dropdown/i }),
    ).toBeVisible();

    await runAxeScans(page, testInfo, 'mobile-nav-menu');
  });
});

// --- Search (empty) ----------------------------------------------------------

test.describe('a11y: Mobile — Search', () => {
  test('passes axe on the search results layout at a phone viewport', async ({
    page,
  }, testInfo) => {
    // Empty results keep the mobile layout (search bar, filters affordance,
    // results header) deterministic without needing rich card fixtures.
    await page.route('**/query*', route =>
      route.fulfill(
        fulfillJson({
          total: 0,
          hits: [],
          facets: {},
        }),
      ),
    );
    await page.route('**/metadata*', route =>
      route.fulfill(
        fulfillJson({ build_date: '2026-06-17T00:00:00Z', src: {} }),
      ),
    );
    await page.route('**/api/diseases*', route =>
      route.fulfill(fulfillJson({ data: [] })),
    );
    await page.route('**/api/notices*', route =>
      route.fulfill(fulfillJson({ data: [] })),
    );

    await page.goto('/search', { waitUntil: 'domcontentloaded' });

    // The header h1 renders in every state; wait for the empty message so we
    // scan the settled (not loading) mobile layout.
    await expect(
      page.getByRole('heading', { level: 1, name: /showing all results/i }),
    ).toBeVisible();
    await expect(
      page.getByText('No results found. Please try again.').last(),
    ).toBeVisible();
    await expect(page.locator('.custom-skeleton-loading')).toHaveCount(0);

    await runAxeScans(page, testInfo, 'mobile-search');
  });
});

// --- Content page (About, populated) -----------------------------------------

test.describe('a11y: Mobile — About content', () => {
  test('passes axe on a content page at a phone viewport', async ({
    page,
  }, testInfo) => {
    await page.route('**/api/about-page*', route =>
      route.fulfill(fulfillJson(ABOUT_FIXTURE)),
    );
    await page.route('**/api/notices*', route =>
      route.fulfill(fulfillJson({ data: [] })),
    );

    await page.goto('/about', { waitUntil: 'domcontentloaded' });

    // Wait for content only the mocked fixture renders.
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: ABOUT_FIXTURE.data.name,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Our mission' }),
    ).toBeVisible();

    await runAxeScans(page, testInfo, 'mobile-about');
  });
});
