/**
 * Shared route mocks and fixtures for the Home / index route (`/`).
 *
 * Extracted so the two suites that exercise this route stay in lockstep:
 *   - `e2e/accessibility/home.spec.ts`  — axe scans (fast, headless, in CI)
 *   - `e2e/screen-reader/home.spec.ts`  — real VoiceOver (slow, headed, local)
 *
 * If these fixtures lived in one spec and were copied into the other, the two
 * would drift and the suites would silently start scanning different DOMs.
 *
 * ⚠️  EDITING THIS FILE CAN BREAK THE CI MERGE GATE. The axe suite runs on every
 * PR against these exact values. If a screen reader test needs different data,
 * export a VARIANT alongside the base rather than changing the base — e.g. the
 * carousel only renders its prev/next controls when `childrenLength >
 * constraint`, so a spec exercising them needs a fixture with more cards. Then
 * re-run `yarn test:a11y:nobuild e2e/accessibility/home.spec.ts` before pushing.
 *
 * This is a plain module, not a spec: Playwright's default `testMatch` only
 * collects `*.spec.ts`, so nothing here is picked up as a test.
 *
 * Data model for this route (src/pages/index.tsx):
 *   - The "Explore All Included Resources" table is fed by two CLIENT-SIDE
 *     TanStack Query hooks, both interceptable with `page.route`:
 *       * useResourceCatalogs -> NDE `/query`    (QUERY_GLOB)
 *       * useRepoData         -> NDE `/metadata` (METADATA_GLOB)
 *     The table's `isLoading` is the OR of both hooks.
 *   - News/events/features come from `getStaticProps` (server-side), served by
 *     the mock Strapi server (e2e/mock-strapi-server.js) via the
 *     NEXT_PUBLIC_STRAPI_API_URL override baked into `out/`. The NewsCarousel
 *     ALSO refetches those endpoints client-side via useQuery; `mockStrapiRoutes`
 *     covers that browser-side half.
 */
import type { Page } from '@playwright/test';

// --- Route globs -------------------------------------------------------------

export const ROUTE = '/';
export const QUERY_GLOB = '**/query*'; // useResourceCatalogs (NDE /query)
export const METADATA_GLOB = '**/metadata*'; // useRepoData (NDE /metadata)
export const NEWS_API_GLOB = '**/api/news-reports*'; // NewsCarousel client refetch
export const EVENTS_API_GLOB = '**/api/events*'; // NewsCarousel client refetch
export const FEATURES_API_GLOB = '**/api/features*'; // NewsCarousel client refetch
export const NOTICES_API_GLOB = '**/api/notices*'; // PageContainer client fetch

// The hero <h1> text (configs/homepage.json -> sections.hero.heading).
export const HERO_H1 = 'Discovery Portal';

// The hero search bar's accessible name (= its placeholder). Note it is a
// <Textarea>, not an <input> — see src/components/search-bar/index.tsx.
export const HERO_SEARCH_LABEL = 'Search for resources';

// --- Fixtures ----------------------------------------------------------------

/**
 * Raw `/query` response (fetchSearchResults reads `data.hits`). One resource
 * catalog row for the table's populated state.
 */
export const QUERY_FIXTURE = {
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

/**
 * Raw `/metadata` response (fetchMetadata reads `data.src`; useRepoData keeps
 * sources whose `sourceInfo.identifier` is truthy). One repository row.
 */
export const METADATA_FIXTURE = {
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

// Names of the two table rows the fixtures above render. Waiting on BOTH is
// how a spec proves the two client queries resolved and the table is populated.
export const CATALOG_ROW_NAME = 'Fixture Resource Catalog';
export const REPO_ROW_NAME = 'Fixture Dataset Repository';

export const STRAPI_NEWS_FIXTURE = {
  data: [
    {
      id: 1,
      name: 'Mock News Report',
      slug: 'news-report-mock-a11y-fixture',
      subtitle: null,
      shortDescription:
        'A deterministic news fixture for accessibility testing.',
      description:
        'Full description of the mock news report used in a11y scans.',
      image: null,
      publishedAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
      createdAt: '2026-06-01T00:00:00.000Z',
      categories: null,
    },
  ],
};

export const STRAPI_EVENTS_FIXTURE = {
  data: [
    {
      id: 1,
      name: 'Mock Upcoming Event',
      slug: 'mock-upcoming-event',
      subtitle: null,
      shortDescription:
        'A deterministic event fixture for accessibility testing.',
      description: 'Full description of the mock event used in a11y scans.',
      image: null,
      eventDate: '2027-12-01',
      publishedAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
      createdAt: '2026-06-01T00:00:00.000Z',
      categories: null,
    },
  ],
};

export const STRAPI_FEATURES_FIXTURE = {
  data: [
    {
      id: 1,
      title: 'Mock Feature Page',
      abstract: 'A deterministic feature fixture for accessibility testing.',
      content: 'Full content of the mock feature page used in a11y scans.',
      subtitle: 'Mock subtitle',
      slug: 'mock-feature-a11y',
      thumbnail: null,
      banner: null,
      publishedAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
      createdAt: '2026-06-01T00:00:00.000Z',
      categories: null,
    },
  ],
};

// --- Route mocks -------------------------------------------------------------

function fulfillJson(body: unknown) {
  return (route: Parameters<Parameters<Page['route']>[1]>[0]) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
}

/**
 * Intercept the Strapi CMS endpoints the page fetches from the BROWSER: the
 * three NewsCarousel `useQuery` refetches plus the global PageContainer
 * `/api/notices` call. The server-side `getStaticProps` half of the same data
 * is baked into `out/` by the mock Strapi server at build time.
 */
export async function mockStrapiRoutes(page: Page) {
  await page.route(NEWS_API_GLOB, fulfillJson(STRAPI_NEWS_FIXTURE));
  await page.route(EVENTS_API_GLOB, fulfillJson(STRAPI_EVENTS_FIXTURE));
  await page.route(FEATURES_API_GLOB, fulfillJson(STRAPI_FEATURES_FIXTURE));
  await page.route(NOTICES_API_GLOB, fulfillJson({ data: [] }));
}

/**
 * Mock every request the populated home page makes: the two NDE endpoints that
 * feed the resources table, plus the Strapi routes above.
 *
 * Call this BEFORE `page.goto(ROUTE)`. Afterwards, wait on `CATALOG_ROW_NAME`
 * and `REPO_ROW_NAME` to prove both queries resolved.
 */
export async function mockHomePopulated(page: Page) {
  await mockStrapiRoutes(page);
  await page.route(QUERY_GLOB, fulfillJson(QUERY_FIXTURE));
  await page.route(METADATA_GLOB, fulfillJson(METADATA_FIXTURE));
}
