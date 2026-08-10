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

// --- Carousel card variant ---------------------------------------------------

/**
 * Cards to render when `carouselCardCount` is used.
 *
 * Six, not three. `useCarouselState` derives `constraint` from the viewport:
 * at Playwright's 1280px it is 2 (the `xl` breakpoint is exactly 1280 and the
 * `max-width` query is inclusive, so the md-to-xl branch wins), and at 1281px
 * or wider it is 3. Controls only render when `cards > constraint`, so three
 * cards would work at 1280 and silently vanish one pixel wider. Six survives
 * both.
 *
 * Consequence for assertions: the number of dots differs between those two
 * viewports (3 vs 2). Never hard-code the dot total — match
 * `/carousel indicator \d+ of \d+/` and key off the ` (current)` suffix.
 */
export const CAROUSEL_CARD_COUNT = 6;

/**
 * Name of the `ordinal`-th generated card, e.g. `'Update Card 003'`.
 *
 * Deliberately does NOT contain the word "carousel". These cards were first
 * named `Carousel Card 00N`, which made the SR-015 test — "does entering the
 * widget announce that it IS a carousel?" — pass against the card heading
 * rather than any widget announcement. The fixture data was supplying the very
 * token the assertion searched for. Keep this name clear of widget vocabulary.
 */
export function carouselCardName(ordinal: number): string {
  return `Update Card ${String(ordinal).padStart(3, '0')}`;
}

/**
 * A `/api/news-reports` response with `count` cards instead of one.
 *
 * Three details here are load-bearing, each of which fails silently if got
 * wrong:
 *
 *   - **Distinct names.** The page ships three cards baked in by
 *     `getStaticProps`, which are replaced when the client-side refetch
 *     resolves. Reusing the baseline names would make the before and after
 *     states indistinguishable, and a spec could assert against the baked
 *     cards without knowing.
 *   - **Unique ids, offset well past the other fixtures.** `NewsCarousel`
 *     keys on `carouselCard.id + idx` — numeric addition, not concatenation —
 *     so sequential ids across collections collide.
 *   - **A string `slug` on every item.** `NewsCarousel` calls
 *     `.slug.replace(...)` on each; a missing slug throws, the query errors,
 *     and TanStack Query leaves `data` at `initialData` — i.e. the three baked
 *     cards, still on screen, with nothing to signal the fixture was rejected.
 *
 * Descending `publishedAt` so the component's sort is deterministic rather
 * than relying on stable-sort tie-breaking: card 001 is newest and sorts first.
 */
export function newsFixtureWithCount(count: number) {
  return {
    data: Array.from({ length: count }, (_, i) => {
      const ordinal = i + 1;
      const padded = String(ordinal).padStart(3, '0');
      // Descending by ordinal: 001 is the newest, so it sorts to the front.
      const day = String(Math.max(1, 28 - i)).padStart(2, '0');

      return {
        id: 1000 + ordinal,
        name: carouselCardName(ordinal),
        // None of this copy may contain the word "carousel" — it is announced
        // verbatim, and SR-015 searches the transcript for that token. See
        // {@link carouselCardName}.
        slug: `news-report-update-card-${padded}`,
        subtitle: null,
        shortDescription: `Deterministic update card ${padded}.`,
        description: `Full description of update card ${padded}.`,
        image: null,
        publishedAt: `2026-06-${day}T00:00:00.000Z`,
        updatedAt: `2026-06-${day}T00:00:00.000Z`,
        createdAt: `2026-06-${day}T00:00:00.000Z`,
        categories: null,
      };
    }),
  };
}

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
export async function mockStrapiRoutes(page: Page, carouselCardCount?: number) {
  // With a card count, serve N news items and NO events or features, so the
  // carousel holds exactly N cards in a known order. Without one, the baseline
  // three (one per source) that the other specs expect.
  const many = carouselCardCount !== undefined;

  await page.route(
    NEWS_API_GLOB,
    fulfillJson(
      many ? newsFixtureWithCount(carouselCardCount) : STRAPI_NEWS_FIXTURE,
    ),
  );
  await page.route(
    EVENTS_API_GLOB,
    fulfillJson(many ? { data: [] } : STRAPI_EVENTS_FIXTURE),
  );
  await page.route(
    FEATURES_API_GLOB,
    fulfillJson(many ? { data: [] } : STRAPI_FEATURES_FIXTURE),
  );
  await page.route(NOTICES_API_GLOB, fulfillJson({ data: [] }));
}

export interface MockHomeOptions {
  /**
   * Number of repository rows the table should render. Omit for the 1-repo
   * baseline; pass {@link MANY_ROW_COUNT} to force react-window to window.
   */
  repoCount?: number;
  /**
   * Genre for the repository row(s), fed to the table's "Research Domain"
   * filter. Defaults to `'IID'`, which matches the catalog row.
   *
   * Why this exists: with both rows on `'IID'` the Research Domain filter has
   * exactly ONE option, so ticking it filters 2 rows down to 2 — a no-op.
   * "Nothing was announced" after a no-op is unfalsifiable, which is the trap
   * SR-002 nearly shipped with. Pass {@link SECOND_DOMAIN_GENRE} to give the
   * filter two options, so ticking one demonstrably changes the row set.
   *
   * `formatDomainName` (TableWithSearch/helpers.tsx) title-cases the raw value:
   * `'iid'` → `IID`, `'generalist'` → `Generalist`.
   */
  repoGenre?: string;
  /**
   * Number of news carousel cards. Omit for the baseline three (one news, one
   * event, one feature); pass {@link CAROUSEL_CARD_COUNT} to render enough
   * cards that the carousel shows its prev/next controls and keeps some slides
   * off screen. See {@link newsFixtureWithCount}.
   */
  carouselCardCount?: number;
}

/**
 * Raw genre that renders as a `Generalist` option in the Research Domain
 * filter, distinct from the catalog row's `IID`. See {@link MockHomeOptions}.
 */
export const SECOND_DOMAIN_GENRE = 'generalist';

/** The name the Research Domain filter gives {@link SECOND_DOMAIN_GENRE}. */
export const SECOND_DOMAIN_NAME = 'Generalist';

/**
 * Override the genre on every repository row. Returns the fixture untouched
 * when no genre is given, so the default row set is bit-for-bit what it was
 * before this option existed.
 */
function withRepoGenre(
  metadata: { src: Record<string, { sourceInfo: { genre: string[] } }> },
  repoGenre: string | undefined,
) {
  if (repoGenre === undefined) {
    return metadata;
  }

  return {
    src: Object.fromEntries(
      Object.entries(metadata.src).map(([key, entry]) => [
        key,
        { ...entry, sourceInfo: { ...entry.sourceInfo, genre: [repoGenre] } },
      ]),
    ),
  };
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
  { repoCount, repoGenre, carouselCardCount }: MockHomeOptions = {},
) {
  await mockStrapiRoutes(page, carouselCardCount);
  await page.route(QUERY_GLOB, fulfillJson(QUERY_FIXTURE));

  const metadata =
    repoCount === undefined
      ? METADATA_FIXTURE
      : metadataFixtureWithCount(repoCount);

  await page.route(
    METADATA_GLOB,
    fulfillJson(withRepoGenre(metadata, repoGenre)),
  );
}

// --- Loading state -----------------------------------------------------------

/**
 * Hold the resources table in its skeleton state for the life of the page.
 *
 * The technique is the axe suite's, verbatim: a route handler returning a
 * promise that can NEVER settle, so the request stays in flight forever. No
 * timers and no race, which matters when a VoiceOver traversal takes minutes.
 *
 * Two things not to change here, both verified against this app:
 *
 *   - **Never `route.abort()` and never fulfil with an error.** The QueryClient
 *     takes the library default `retry: 3` and `fetchMetadata` has its own
 *     `MAX_RETRIES = 3` loop on top (src/hooks/api/helpers.ts), so a failure
 *     eventually resolves to an error — and `src/pages/index.tsx:178` then
 *     unmounts the whole `PageContent`, three `<h2>` sections and the table
 *     included. There would be nothing left to walk.
 *   - **Both NDE globs must hang.** `isLoading` is the OR of the two hooks
 *     (`src/pages/index.tsx:268`), so hanging one still yields skeleton rows —
 *     but `tableData` is derived from both independently, so the resolved half
 *     makes the three filter buttons render and the counter read `1 results`
 *     instead of `0 results`. Only hanging both is the real loading state.
 *
 * A separate function rather than a `MockHomeOptions` flag: `mockHomePopulated`
 * fulfils `QUERY_GLOB` unconditionally and the first registered `page.route`
 * wins, so a flag would have to short-circuit the whole function anyway. This
 * keeps that function bit-for-bit unchanged.
 *
 * Prefer `enterHomePageLoadingWebContent` from `../utils/home-page` over calling
 * this directly — it also navigates and parks the VoiceOver cursor.
 */
export async function mockHomeLoading(page: Page) {
  await mockStrapiRoutes(page);
  await page.route(QUERY_GLOB, () => new Promise<void>(() => {}));
  await page.route(METADATA_GLOB, () => new Promise<void>(() => {}));
}

/**
 * Like {@link mockHomeLoading}, but the caller decides when the data lands.
 *
 * Returns a `release()` function. Until it is called both NDE requests hang and
 * the table shows skeleton rows; calling it fulfils them with the standard
 * populated fixtures.
 *
 * Why a gate rather than a delayed fulfil: a `setTimeout`-based delay races
 * against a traversal whose duration depends on how fast VoiceOver is speaking.
 * A gate makes the transition happen at exactly the point in the test that wants
 * it, which is the only way to park the cursor on the table BEFORE the content
 * under it is replaced.
 */
export async function mockHomeGated(page: Page): Promise<() => void> {
  let release!: () => void;
  const gate = new Promise<void>(resolve => {
    release = resolve;
  });

  await mockStrapiRoutes(page);
  await page.route(QUERY_GLOB, async route => {
    await gate;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(QUERY_FIXTURE),
    });
  });
  await page.route(METADATA_GLOB, async route => {
    await gate;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(METADATA_FIXTURE),
    });
  });

  return release;
}
