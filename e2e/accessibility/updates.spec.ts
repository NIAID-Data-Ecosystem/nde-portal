/**
 * Accessibility tests for the Updates route (`/updates`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. We report every violation in the HTML report but only FAIL the
 * build on `serious` or `critical` impact, so minor/moderate noise doesn't block
 * CI. See e2e/utils/axe.ts and the canonical repository-matcher.spec.ts.
 *
 * Endpoints mocked (client-side): the page fetches news and events in parallel
 * from the Strapi CMS — `**\/api/news-reports*` and `**\/api/events*`. (A third
 * `fetchWebinars` call runs only in `getStaticProps` on the server, so it is not
 * interceptable here and is not used by the rendered Updates view.)
 *
 * State coverage note — this route covers LOADING, EMPTY and POPULATED but
 * intentionally omits a deterministic ERROR state, because of how
 * `src/pages/updates.tsx` is built:
 *   - The page seeds its `useQuery(['news','events'])` from `getStaticProps`
 *     props via `initialData`, then refetches the SAME two endpoints client-side
 *     on mount (default `staleTime: 0`). Only the client-side refetch runs in
 *     the browser, so `page.route` can drive loading/empty/populated; the
 *     getStaticProps fetch happens in the Next dev server and is out of reach.
 *     Each state waits for fixture-specific UI before scanning, so the mock —
 *     not the SSR seed — owns the DOM we scan.
 *   - LOADING is reachable: with `initialData` present the query refetches in the
 *     background (`isRefetching` true), and each Section renders a `SkeletonText`
 *     while `isLoading || isRefetching`. Keeping both requests pending holds it.
 *   - EMPTY and POPULATED are reachable: a successful refetch overwrites the
 *     seeded `response`, so an empty (or representative) payload deterministically
 *     replaces whatever getStaticProps returned.
 *   - ERROR is NOT deterministically reachable from the browser. On a refetch
 *     error, react-query keeps the last successful `data` (here the getStaticProps
 *     seed), so `response` stays truthy and the inline `<Error>` block — gated by
 *     `!response.news.length && error.message` — only renders when the SSR seed
 *     was ALSO empty. Whether the seed is empty depends on the live dev Strapi,
 *     which `page.route` cannot intercept, so the error UI cannot be exercised
 *     reliably across environments. It is documented here rather than dropped
 *     silently.
 */
import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import {
  analyzeA11y,
  attachA11yReport,
  blockingViolations,
  formatViolations,
  WCAG_AA_TAGS,
} from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/updates';

// The two Strapi CMS endpoints the Updates view reads client-side. The view
// fetches them in parallel via `fetchNews` + `fetchEvents` inside the
// `['news','events']` query.
const NEWS_GLOB = '**/api/news-reports*';
const EVENTS_GLOB = '**/api/events*';
const API_GLOBS = [NEWS_GLOB, EVENTS_GLOB];

// Representative news payload. `fetchNews` reads `data.data` and requires each
// item to carry a `slug` (it rewrites the prefix), so the fixture is nested
// under `data`. The description is rendered through ReactMarkdown, exercising a
// link so the link-name check has something to scan.
const NEWS_FIXTURE = {
  data: [
    {
      id: 1,
      name: 'NDE Portal adds new datasets',
      subtitle:
        'Hundreds of new infectious disease datasets are now searchable',
      shortDescription: null,
      description:
        'Read the [release notes](https://example.org/release-notes) for the full list of additions.',
      image: null,
      slug: 'news-report-new-datasets',
      createdAt: '2026-05-01T00:00:00Z',
      publishedAt: '2026-05-01T00:00:00Z',
      updatedAt: '2026-05-01T00:00:00Z',
      categories: [
        {
          id: 2,
          name: 'Announcements',
          createdAt: '2026-05-01T00:00:00Z',
          publishedAt: '2026-05-01T00:00:00Z',
          updatedAt: '2026-05-01T00:00:00Z',
        },
      ],
    },
  ],
};

// Representative events payload. The view splits events into "Upcoming" and
// "Past events" by comparing `eventDate` to now, and only renders cards for
// events that carry an `eventDate`, so the fixture includes one future and one
// past event. (Today is 2026-06-23 for this suite.)
const EVENTS_FIXTURE = {
  data: [
    {
      id: 10,
      name: 'NDE Office Hours',
      subtitle: 'Live Q&A with the data ecosystem team',
      shortDescription: null,
      description:
        'Join our [virtual session](https://example.org/office-hours) to ask questions.',
      image: null,
      slug: 'event-office-hours',
      eventDate: '2027-01-15',
      createdAt: '2026-05-01T00:00:00Z',
      publishedAt: '2026-05-01T00:00:00Z',
      updatedAt: '2026-05-01T00:00:00Z',
      categories: null,
    },
    {
      id: 11,
      name: 'Metadata Workshop Recap',
      subtitle: 'A summary of our recent metadata workshop',
      shortDescription: null,
      description: 'The workshop covered best practices for dataset metadata.',
      image: null,
      slug: 'event-metadata-workshop',
      eventDate: '2024-03-10',
      createdAt: '2024-03-01T00:00:00Z',
      publishedAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-03-01T00:00:00Z',
      categories: null,
    },
  ],
};

// Resolved empty payloads for the empty state — a successful response with no
// records. Both endpoints read `data.data`.
const EMPTY_FIXTURE = { data: [] };

// --- Shared checks run in every state ---------------------------------------

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Full-page WCAG A/AA scan. The helper's tag set (WCAG_AA_TAGS) already
  // includes color-contrast and the landmark/heading-order best-practice
  // rules, so this single scan is the backbone of the check.
  const results = await analyzeA11y(page);
  await attachA11yReport(testInfo, state, results.violations);

  const blocking = blockingViolations(results.violations);
  expect(
    blocking,
    `Serious/critical accessibility violations found:\n${formatViolations(
      blocking,
    )}`,
  ).toEqual([]);

  // Focused color-contrast scan, reported separately so contrast regressions
  // are easy to triage in the HTML report. There is no helper for this — run
  // the single color-contrast rule inline, matching the canonical spec.
  const contrast = await new AxeBuilder({ page })
    .withTags(WCAG_AA_TAGS)
    .options({ runOnly: { type: 'rule', values: ['color-contrast'] } })
    .analyze();
  await attachA11yReport(testInfo, `${state} — contrast`, contrast.violations);

  const blockingContrast = blockingViolations(contrast.violations);
  expect(
    blockingContrast,
    `Color-contrast violations found:\n${formatViolations(blockingContrast)}`,
  ).toEqual([]);

  // Structural sanity — also proves the page rendered the intended chrome. The
  // hero renders the visible page h1 ("Updates"); a second, VisuallyHidden h1
  // ("Updates and Events") is also present, so match the hero exactly to avoid a
  // strict-mode multiple-match.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Updates', exact: true }),
  ).toBeVisible();

  // This route does not render the site-wide search bar (PageContainer's
  // `includeSearchBar` defaults to false and Updates does not opt in), so there
  // is no primary form control to assert here.

  // Buttons/links: every button/link must expose an accessible name. axe's
  // `button-name` / `link-name` rules handle aria-label, aria-labelledby, text
  // content and titled icons, so we delegate the authoritative check to axe.
  const names = await new AxeBuilder({ page })
    .withTags(WCAG_AA_TAGS)
    .options({
      runOnly: { type: 'rule', values: ['button-name', 'link-name'] },
    })
    .analyze();
  await attachA11yReport(
    testInfo,
    `${state} — button-link-name`,
    names.violations,
  );

  const blockingNames = blockingViolations(names.violations);
  expect(
    blockingNames,
    `Button/link name violations found:\n${formatViolations(blockingNames)}`,
  ).toEqual([]);

  // Screenshot into the HTML report so reviewers can see the scanned state.
  await testInfo.attach(`${state}-screenshot`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
}

// --- Loading -----------------------------------------------------------------

test.describe('a11y: Updates — loading', () => {
  test('passes axe while loading', async ({ page }, testInfo) => {
    // Keep both requests pending so the background refetch never resolves and the
    // `SkeletonText` loaders stay on screen.
    for (const glob of API_GLOBS) {
      await page.route(glob, () => new Promise<void>(() => {}));
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Each Section renders Chakra `SkeletonText` (`.chakra-skeleton`) while
    // refetching — a CSS selector is acceptable here only because skeletons have
    // no accessible surface to target.
    await expect(page.locator('.chakra-skeleton').first()).toBeVisible();

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Empty -------------------------------------------------------------------

test.describe('a11y: Updates — empty', () => {
  test('passes axe with no data', async ({ page }, testInfo) => {
    for (const glob of API_GLOBS) {
      await page.route(glob, route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(EMPTY_FIXTURE),
        }),
      );
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // A successful empty refetch overwrites the seeded data, so both sections
    // render their empty-state messages.
    await expect(page.getByText(/no updates to display/i)).toBeVisible();
    await expect(page.getByText(/no events to display/i)).toBeVisible();

    await runSharedChecks(page, testInfo, 'empty');
  });
});

// --- Populated ---------------------------------------------------------------

test.describe('a11y: Updates — populated', () => {
  test('passes axe with representative data', async ({ page }, testInfo) => {
    await page.route(NEWS_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(NEWS_FIXTURE),
      }),
    );
    await page.route(EVENTS_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(EVENTS_FIXTURE),
      }),
    );
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for content only the fixtures render — a news card heading and both an
    // upcoming and a past event card — so we know the refetch resolved and we're
    // scanning the populated DOM, not the loading skeletons or the SSR seed.
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: NEWS_FIXTURE.data[0].name,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: EVENTS_FIXTURE.data[0].name,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: EVENTS_FIXTURE.data[1].name,
      }),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Interaction states ------------------------------------------------------
//
// Assessed and intentionally none added. The Updates page has no mounted-on-open
// distinct markup (no menus, popovers, modals, dropdowns, or drag surfaces). Its
// only interaction is the per-section "Show More" button
// (src/views/news/components/Section.tsx), which simply renders more of the same
// SectionCard markup already covered by the populated scan above — "more of the
// same", so a separate axe pass would add no coverage.
