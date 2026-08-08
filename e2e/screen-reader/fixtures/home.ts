/**
 * Route mocks and fixtures for the Home / index route (`/`), owned by the
 * SCREEN READER suite.
 *
 * ## Why this is a deliberate duplicate
 *
 * `e2e/accessibility/home.spec.ts` defines equivalent fixtures inline. Sharing
 * one module between the two suites would keep them in lockstep — but the axe
 * suite gates merges to `main`, and this suite is an exploration that may not
 * be kept. Coupling them would mean every edit made while developing a screen
 * reader test carries merge-gate risk on behalf of an experiment, and dropping
 * the experiment would mean unpicking a refactor out of a spec CI depends on.
 *
 * So this suite owns its own copy. Deleting `e2e/screen-reader/` and
 * `playwright.screen-reader.config.ts` removes it entirely, with no edit to
 * anything the axe suite reads.
 *
 * **The cost, stated plainly:** these fixtures can drift from the axe suite's.
 * If the NDE API's response shape changes — say `fetchSearchResults` stops
 * reading `data.hits` — BOTH copies need updating, and nothing will tell you.
 * A stale copy here fails loudly the next time this suite runs; a stale copy
 * that still happens to render will quietly test the wrong DOM. If this suite
 * is ever made permanent, revisit the decision and share one module.
 *
 * Because nothing in CI reads this file, it can be changed freely — including
 * adding fixture variants (e.g. more carousel cards, which the Carousel needs
 * before it renders its prev/next controls at all).
 *
 * ## Data model for this route (src/pages/index.tsx)
 *
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
// <Textarea>, not an <input> — see src/components/search-bar/index.tsx — but
// VoiceOver announces it as "edit text" regardless.
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

/**
 * A `/metadata` response with `count` repository rows instead of one.
 *
 * Why this variant exists: the table renders rows through react-window's
 * `VariableSizeList`, so only a WINDOW of rows is ever in the DOM while the
 * root advertises `aria-rowcount={rows.length}` — the full count. With the
 * 2-row baseline nothing is windowed and that discrepancy can't show up. Enough
 * rows to force recycling is the only way to observe whether VoiceOver reports
 * row position correctly, and whether it stays correct across a scroll.
 *
 * Row names are 1-indexed and zero-padded (`Fixture Repository 007`) so a
 * spoken transcript can be read against an expected ordinal at a glance.
 *
 * Added alongside `METADATA_FIXTURE` rather than replacing it: `home.spec.ts`'s
 * passing assertions depend on the 2-row baseline.
 */
export function metadataFixtureWithCount(count: number) {
  const base = METADATA_FIXTURE.src.fixtureRepo.sourceInfo;
  const src: Record<string, { sourceInfo: typeof base }> = {};

  for (let i = 1; i <= count; i++) {
    const ordinal = String(i).padStart(3, '0');
    src[`fixtureRepo${ordinal}`] = {
      sourceInfo: {
        ...base,
        _id: `repo-fixture-${ordinal}`,
        identifier: `fixture-repo-${ordinal}`,
        name: manyRowName(i),
      },
    };
  }

  return { src };
}

/** Row-name prefix used by {@link metadataFixtureWithCount}. */
export const MANY_ROW_NAME_PREFIX = 'Fixture Repository';

/** Row count used by the table spec. Comfortably past any render window. */
export const MANY_ROW_COUNT = 40;

/**
 * The name {@link metadataFixtureWithCount} gives its `ordinal`-th row
 * (1-indexed), e.g. `manyRowName(7)` → `'Fixture Repository 007'`.
 */
export function manyRowName(ordinal: number): string {
  return `${MANY_ROW_NAME_PREFIX} ${String(ordinal).padStart(3, '0')}`;
}

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

export interface MockHomeOptions {
  /**
   * Number of repository rows the table should render. Omit for the 1-repo
   * baseline; pass {@link MANY_ROW_COUNT} to force react-window to window.
   */
  repoCount?: number;
}

/**
 * Mock every request the populated home page makes: the two NDE endpoints that
 * feed the resources table, plus the Strapi routes above.
 *
 * Prefer `enterHomePageWebContent` from `../utils/home-page` over calling this
 * directly — it also navigates and parks the VoiceOver cursor.
 */
export async function mockHomePopulated(
  page: Page,
  { repoCount }: MockHomeOptions = {},
) {
  await mockStrapiRoutes(page);
  await page.route(QUERY_GLOB, fulfillJson(QUERY_FIXTURE));
  await page.route(
    METADATA_GLOB,
    fulfillJson(
      repoCount === undefined
        ? METADATA_FIXTURE
        : metadataFixtureWithCount(repoCount),
    ),
  );
}
