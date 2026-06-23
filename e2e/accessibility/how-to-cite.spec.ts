/**
 * Accessibility tests for the "How to Cite" Knowledge Center route
 * (`/knowledge-center/how-to-cite-the-niaid-data-ecosystem`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. We report every violation in the HTML report but only FAIL the
 * build on `serious` or `critical` impact, so minor/moderate noise doesn't block
 * CI. See e2e/utils/axe.ts and the canonical repository-matcher.spec.ts.
 *
 * The route is `src/pages/knowledge-center/[[...slug]].tsx`. It reads two Strapi
 * CMS endpoints client-side, both interceptable with `page.route`:
 *   - `**\/api/categories*` — the sidebar navigation (`fetchCategories`, the
 *     `['docs']` query). A failure here renders the page-level `<Error>`.
 *   - `**\/api/docs*` — the page body (`fetchDocumentation`, the `['doc', {slug}]`
 *     query inside MainContent), seeded from `getStaticProps` via `initialData`.
 * Each state waits for fixture-specific UI before scanning, so the mock — not the
 * SSR seed — owns the DOM we scan.
 *
 * State coverage note — this route covers LOADING, POPULATED and ERROR but
 * intentionally omits a deterministic EMPTY state:
 *   - The MainContent body is gated on `props.data?.id` from `getStaticProps`
 *     (server-side, out of reach of `page.route`), so this spec depends on the
 *     dev server reaching Strapi for the slug at build time, exactly as
 *     about.spec.ts depends on its getStaticProps fetch. We wait for the client
 *     fixture's own heading before scanning so the client mock owns the DOM.
 *   - LOADING is reachable: keeping `**\/api/categories*` pending holds the
 *     sidebar's Chakra `SkeletonText` loaders on screen.
 *   - ERROR is reachable: a 5xx on `**\/api/categories*` makes the `['docs']`
 *     query throw a truthy `err.response`, so the page swaps its whole content
 *     area for the `<Error>` block.
 *   - EMPTY is NOT reachable for this slug route. The page-level empty state
 *     ("No documentation currently available.") only renders on the no-slug
 *     index, and MainContent's own empty ("No documentation for this page
 *     exists.") never shows because `useDocumentation`'s `select` falls back to
 *     the `getStaticProps`-seeded `initialData` (which carries an `id`) whenever
 *     the client response is empty. It is documented here rather than dropped
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

const SLUG = 'how-to-cite-the-niaid-data-ecosystem';
const ROUTE = `/knowledge-center/${SLUG}`;

// The two Strapi CMS endpoints the route reads client-side.
const CATEGORIES_GLOB = '**/api/categories*'; // sidebar navigation
const DOCS_GLOB = '**/api/docs*'; // page body (and the search box, unused here)
const API_GLOBS = [CATEGORIES_GLOB, DOCS_GLOB];

// The hero h1 is static page chrome ("Knowledge Center"), present in every
// state. MainContent renders a SECOND h1 from the doc name, so structural checks
// target headings by name to avoid a strict-mode multiple-match.
const HERO_HEADING = 'Knowledge Center';

// Representative sidebar payload. `fetchCategories` reads `data.data`; the page
// maps each category's `docs` into nav items and drops categories with no docs,
// so the fixture nests one doc under one category.
const CATEGORIES_FIXTURE = {
  data: [
    {
      id: 1,
      name: 'Getting Started',
      docs: [
        {
          id: 101,
          name: 'How to Cite the NIAID Data Ecosystem',
          slug: SLUG,
          description: 'How to cite the portal and its resources.',
        },
      ],
    },
  ],
};

// Representative page-body payload. `fetchDocumentation` reads `data.data` and
// `useDocumentation` selects `[0]`. The description is rendered through
// ReactMarkdown, so it exercises a sub-heading and a link for the heading and
// link-name checks.
const DOC_FIXTURE = {
  data: [
    {
      id: 101,
      name: 'How to Cite the NIAID Data Ecosystem',
      subtitle: 'Citation guidance for the portal and its resources.',
      description: [
        '## Citing the portal',
        '',
        'When referencing the NIAID Data Ecosystem Discovery Portal, use the',
        'recommended citation format below.',
        '',
        'See the [citation guidelines](https://example.org/cite) for details.',
      ].join('\n'),
      slug: SLUG,
      createdAt: '2026-06-17T00:00:00Z',
      publishedAt: '2026-06-17T00:00:00Z',
      updatedAt: '2026-06-17T00:00:00Z',
    },
  ],
};

// Resolved empty payload — a successful response with no records.
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
  // hero h1 ("Knowledge Center") is present in every state; match it by name to
  // avoid colliding with MainContent's doc-name h1 in the populated state.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: HERO_HEADING, exact: true }),
  ).toBeVisible();

  // Forms: the Knowledge Center search bar renders on this route and its control
  // must be programmatically labelled (the input carries aria-label
  // "Search Knowledge Center").
  const search = page.getByRole('textbox', {
    name: /search knowledge center/i,
  });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

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

test.describe('a11y: How to Cite — loading', () => {
  test('passes axe while the sidebar loads', async ({ page }, testInfo) => {
    // Keep both requests pending so the sidebar's skeleton loaders stay on
    // screen and the body never resolves to fixture content.
    for (const glob of API_GLOBS) {
      await page.route(glob, () => new Promise<void>(() => {}));
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // The SidebarDesktop renders Chakra `SkeletonText` (`.chakra-skeleton`)
    // while `isLoading` — a CSS selector is acceptable here only because
    // skeletons have no accessible surface to target.
    await expect(page.locator('.chakra-skeleton').first()).toBeVisible();

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Populated ---------------------------------------------------------------

test.describe('a11y: How to Cite — populated', () => {
  test('passes axe with representative content', async ({ page }, testInfo) => {
    await page.route(CATEGORIES_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(CATEGORIES_FIXTURE),
      }),
    );
    await page.route(DOCS_GLOB, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(DOC_FIXTURE),
      }),
    );
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for content only the fixtures render — the doc-name h1, the markdown
    // sub-heading and link from the body, and the sidebar nav link — so we know
    // both client queries resolved and we're scanning the mocked DOM, not the
    // SSR seed or the loading skeletons.
    await expect(
      page.getByRole('heading', { level: 1, name: DOC_FIXTURE.data[0].name }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Citing the portal' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'citation guidelines' }),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Error -------------------------------------------------------------------

test.describe('a11y: How to Cite — error', () => {
  test('passes axe in the error state', async ({ page }, testInfo) => {
    // A 5xx makes the `['docs']` query throw a truthy `err.response`, so the
    // page renders its `<Error>` block in place of the content. (A bare abort
    // would throw `undefined`, which react-query does not register as an error.)
    for (const glob of API_GLOBS) {
      await page.route(glob, route =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        }),
      );
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the error UI. The shared <Error> renders an h2 "Something went
    // wrong." plus the route's "API Request:" detail text.
    await expect(
      page.getByRole('heading', { name: /something went wrong/i }),
    ).toBeVisible();
    await expect(page.getByText(/API Request:/i)).toBeVisible();

    await runSharedChecks(page, testInfo, 'error');
  });
});
