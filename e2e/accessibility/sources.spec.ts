/**
 * Accessibility tests for the Sources route (`/sources`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. We report every violation in the HTML report but only FAIL the
 * build on `serious` or `critical` impact, so minor/moderate noise doesn't block
 * CI. See e2e/utils/axe.ts and the canonical repository-matcher.spec.ts.
 *
 * What this route is — `src/pages/sources.tsx` lists every NDE data source. It
 * seeds its source data from `getStaticProps` (server-side: live `/metadata` +
 * per-source GitHub commit dates) and then refetches the SAME NDE `/metadata`
 * endpoint client-side via `useQuery(['metadata'])`, with the getStaticProps
 * result as `placeholderData`. The view renders a left `nav` sidebar of source
 * names and a main column of source cards (`src/views/sources`).
 *
 * State coverage — only the client-side `/metadata` request is interceptable
 * (`page.route` runs in the browser; the getStaticProps fetch happens in the
 * Next dev server, out of reach — same limitation documented in about.spec.ts).
 * The client query always runs on mount, so we drive all four states through it:
 *   - loading   — `/metadata` kept pending → skeleton cards/text (`isFetching`)
 *   - empty     — `/metadata` resolved with no sources → "0 results."
 *   - populated — `/metadata` resolved with fixture sources → source cards
 *   - error     — `/metadata` aborted → the page's Error block (Retry button)
 *
 * The loading/empty/populated states (and the schema-table interaction) assume
 * getStaticProps itself succeeded server-side, so the `error` prop is null and
 * the view — not the server-rendered Error block — owns the DOM. getStaticProps
 * fetches the live `/metadata` from the Node dev server, which is NOT
 * interceptable. When that server has no outbound network (some sandboxes),
 * the page hard-renders its Error block from the `error` prop and the
 * data-driven states are genuinely unreachable. Those tests therefore call
 * `skipIfServerRenderedError`, which runtime-`test.skip`s them (with a reason in
 * the report) when the SSR Error block is present, rather than failing on an
 * environment limitation — the harness/network-limit case in e2e/README. Where
 * the server can fetch (CI, networked dev) the guard is a no-op and the full
 * scan runs. The error-state scan always runs: both the server `error` prop and
 * the client `metadataError` converge on the same Error UI.
 *
 * Beyond the resting states, one interaction scan covers the per-source schema
 * "property transformation" table — a transient surface a user expands, with a
 * dark background and light text, exactly the kind of place contrast/structure
 * regressions hide and which the resting scans never see.
 *
 * Endpoints mocked (client-side): `**\/metadata*` — the NDE metadata API.
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

const ROUTE = '/sources';

// The only endpoint the route reads client-side. The NDE metadata API is NOT
// under `/api/` — it is `<NEXT_PUBLIC_API_URL>/metadata`.
const API_GLOBS = ['**/metadata*'];

// Card title used as the populated-state proof. It is NOT in live data, so once
// it renders we know the mocked fixture — not the SSR seed — owns the DOM.
const FIXTURE_SOURCE_NAME = 'Fixture Source Alpha';

// Minimal but representative `Metadata` payload (see src/hooks/api/types.ts).
// fetchMetadata returns this object directly; the page's `select` turns
// `src` into the rendered source list. Two sources: one NIAID-funded (renders
// the NIAID badge) and one with a `schema` (renders the expandable property
// table scanned in the interaction state below).
const POPULATED_FIXTURE = {
  biothing_type: 'source',
  build_date: '2026-06-01T00:00:00Z',
  build_version: '2026-06-01',
  src: {
    fixturealpha: {
      version: '2026-05-20T00:00:00Z',
      stats: { fixturealpha: 1234 },
      sourceInfo: {
        identifier: 'fixture_alpha',
        name: FIXTURE_SOURCE_NAME,
        description: 'A deterministic data source fixture for a11y scanning.',
        url: 'https://example.org/fixture-alpha',
        schema: {
          fixtureProperty: 'name',
          anotherProperty: 'description',
        },
      },
    },
    immport: {
      version: '2026-04-10T00:00:00Z',
      stats: { immport: 56789 },
      sourceInfo: {
        identifier: 'immport',
        // Exact name match drives getFundedByNIAID → the NIAID badge.
        name: 'ImmPort',
        description: 'A NIAID-funded source fixture, to exercise the badge.',
        url: 'https://example.org/immport',
        schema: null,
      },
    },
  },
};

// Resolved payload with no sources, for the empty state.
const EMPTY_FIXTURE = {
  biothing_type: 'source',
  build_date: '2026-06-01T00:00:00Z',
  build_version: '2026-06-01',
  src: {},
};

// --- Shared checks run in every state ---------------------------------------

/**
 * The axe scans every state runs: a full WCAG A/AA scan, a focused
 * color-contrast scan, and a focused button/link-name scan, each reported
 * separately, plus a screenshot. Split out from runSharedChecks so the
 * interaction state (the expanded schema table) can run the same scans without
 * the resting-layout structure assertions.
 */
async function runAxeScans(page: Page, testInfo: TestInfo, state: string) {
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

/**
 * Resting-state checks: the view renders the same chrome (the "Data Sources"
 * h1 and the "Search for a source" input) in loading, empty, and populated.
 * The error state has neither, so it asserts its own chrome and calls
 * runAxeScans directly.
 */
async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — also proves the page rendered the intended chrome. The
  // PageContainer wraps content in a single `main` landmark; the SectionHeader
  // renders the page's only h1 ("Data Sources").
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: /data sources/i }),
  ).toBeVisible();

  // Forms: the source filter input is the page's primary form control. It is an
  // <input> labelled "Search for a source" via a visually-hidden <label> (see
  // SearchInput), so it must expose that accessible name and be editable.
  const search = page.getByRole('textbox', { name: /search for a source/i });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  await runAxeScans(page, testInfo, state);
}

/**
 * getStaticProps fetches `/metadata` server-side and gates the whole view on
 * the resulting `error` prop, which `page.route` cannot intercept. When the
 * Node dev server has no outbound network, the page renders its Error block on
 * first paint and the data-driven states below cannot be reached. Detect that
 * (the server-rendered Retry button is in the initial HTML, before any client
 * query resolves) and skip with a reason, rather than failing on an environment
 * limitation. No-op where the server can fetch (CI, networked dev).
 */
async function skipIfServerRenderedError(page: Page) {
  // The Error block (and its Retry button) is in the initial server HTML when
  // getStaticProps failed. Wait a bounded moment for it rather than a one-shot
  // isVisible() check, which races hydration/paint. In a healthy environment
  // the button never appears and this just times out, then proceeds.
  const serverErrored = await page
    .getByRole('button', { name: /retry/i })
    .waitFor({ state: 'visible', timeout: 2000 })
    .then(() => true)
    .catch(() => false);
  test.skip(
    serverErrored,
    'getStaticProps could not reach the NDE /metadata API server-side, so the ' +
      'page hard-rendered its Error block and the data state is unreachable in ' +
      'this environment.',
  );
}

// --- Loading -----------------------------------------------------------------

test.describe('a11y: Sources — loading', () => {
  test('passes axe while metadata is loading', async ({ page }, testInfo) => {
    // Keep the metadata request pending so the skeleton UI stays on screen.
    for (const glob of API_GLOBS) {
      await page.route(glob, () => new Promise<void>(() => {}));
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
    await skipIfServerRenderedError(page);

    // Proof of the loading state. The view's SkeletonText/Skeleton render
    // through Chakra with the `chakra-skeleton` class while `isFetching` is
    // true — a CSS selector is acceptable here only because skeletons have no
    // accessible surface to target.
    await expect(page.locator('.chakra-skeleton').first()).toBeVisible();

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Empty -------------------------------------------------------------------

test.describe('a11y: Sources — empty', () => {
  test('passes axe with no sources', async ({ page }, testInfo) => {
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
    await skipIfServerRenderedError(page);

    // The SectionSearch result counter reads the filtered source list. With no
    // sources it renders "0 results." — proof the client query resolved empty
    // (not the placeholder/SSR seed, which would show a non-zero count).
    await expect(page.getByText(/0 results\./i)).toBeVisible();

    await runSharedChecks(page, testInfo, 'empty');
  });
});

// --- Populated ---------------------------------------------------------------

test.describe('a11y: Sources — populated', () => {
  test('passes axe with representative sources', async ({ page }, testInfo) => {
    for (const glob of API_GLOBS) {
      await page.route(glob, route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(POPULATED_FIXTURE),
        }),
      );
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
    await skipIfServerRenderedError(page);

    // Wait for a fixture source name (rendered as a card title and a sidebar
    // heading) that only appears once the mocked query resolves, so we scan the
    // populated DOM and not the loading or SSR-seed state.
    await expect(page.getByText(FIXTURE_SOURCE_NAME).first()).toBeVisible();
    // Also wait for the per-source CTA, which only renders with resolved data.
    await expect(
      page.getByRole('link', {
        name: new RegExp(`Search for ${FIXTURE_SOURCE_NAME} resources`, 'i'),
      }),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Error -------------------------------------------------------------------

test.describe('a11y: Sources — error', () => {
  test('passes axe when the metadata fetch fails', async ({
    page,
  }, testInfo) => {
    // Abort the metadata request so the query rejects (after its retries),
    // matching a production network failure. The page then renders its Error
    // block with a Retry button instead of the source list.
    for (const glob of API_GLOBS) {
      await page.route(glob, route => route.abort());
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the error UI. The Error component has no `alert` role, so we
    // wait for its heading and the Retry control that prove the error path.
    await expect(
      page.getByRole('heading', { name: /something went wrong/i }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();

    // The error state has no h1 or source-search input, so assert only the
    // landmark here and run the axe scans directly.
    await expect(page.getByRole('main')).toBeVisible();

    await runAxeScans(page, testInfo, 'error');
  });
});

// --- Interaction state -------------------------------------------------------
//
// The states above scan the page at rest. A source card with a `schema` renders
// a collapsed "property transformation" table the user expands by clicking the
// "Visualization of … properties" toggle. That table is a transient surface
// with a dark background and light text — never present on first paint and a
// likely home for contrast/structure regressions — so we open it and run the
// same axe scans.

test.describe('a11y: Sources — schema property table', () => {
  test('passes axe with a source schema table expanded', async ({
    page,
  }, testInfo) => {
    for (const glob of API_GLOBS) {
      await page.route(glob, route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(POPULATED_FIXTURE),
        }),
      );
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
    await skipIfServerRenderedError(page);

    // Wait for the populated card, then expand its schema table. dispatchEvent
    // fires the toggle's React onClick directly, bypassing the Next.js dev
    // overlay (`<nextjs-portal>`) that can intercept real clicks while the route
    // is still compiling.
    await expect(page.getByText(FIXTURE_SOURCE_NAME).first()).toBeVisible();
    await page
      .getByRole('button', {
        name: new RegExp(
          `Visualization of ${FIXTURE_SOURCE_NAME} properties`,
          'i',
        ),
      })
      .dispatchEvent('click');

    // Wait for the expanded table's header cell so we scan the open surface.
    await expect(
      page.getByText(`${FIXTURE_SOURCE_NAME} Property`),
    ).toBeVisible();

    await runAxeScans(page, testInfo, 'schema-table');
  });
});
