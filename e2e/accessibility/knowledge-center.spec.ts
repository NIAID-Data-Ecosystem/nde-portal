/**
 * Accessibility tests for the Knowledge Center route
 * (`src/pages/knowledge-center/[[...slug]].tsx`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. We report every violation in the HTML report but only FAIL the
 * build on `serious` or `critical` impact, so minor/moderate noise doesn't block
 * CI. See e2e/utils/axe.ts and the canonical repository-matcher.spec.ts.
 *
 * This single spec covers both shapes the catch-all route renders:
 *
 *   - The NO-SLUG INDEX (`/knowledge-center`) — the category grid and the
 *     page-level empty state. `getStaticProps` returns `{ slug: '', data: {} }`
 *     for the index WITHOUT any server fetch, so the index is driven entirely by
 *     the client-side `['docs']` query (`fetchCategories` → `**\/api/categories*`),
 *     which `page.route` can mock deterministically.
 *
 *   - A DOC PAGE (`/knowledge-center/<slug>`) — loading, and a populated body
 *     rendered from a deliberately MDX-RICH fixture so the markdown renderer's
 *     full component set (`src/components/mdx/components`) is scanned: anchored
 *     headings (`HeadingWithLink` h2/h3) and the deeper h4/h5/h6 headings, a hard
 *     line break (`br`), links, inline code, ordered/unordered lists, the three
 *     themed blockquote callouts (info / 🚧 warning / 🚨 error — the
 *     color-contrast-sensitive ones), an image with alt text, a `<figure>` with a
 *     `<figcaption>`, a `/uploads` video (`img` → `<video>` with an aria-label),
 *     the `right-image` layout (`section` branch), a horizontal rule, and the
 *     `<details>`/`<summary>` disclosure (`Details`). The doc body is
 *     gated on `props.data?.id` from `getStaticProps` (server-side, out of reach
 *     of `page.route`), so — as in about.spec.ts — we navigate a REAL slug so the
 *     dev server seeds an id, then mock the client-side `**\/api/docs*` refetch
 *     with our fixture and wait for the fixture's own heading before scanning, so
 *     the mock (not the SSR seed) owns the DOM we scan.
 *
 * Endpoints mocked (client-side, both Strapi CMS, both interceptable):
 *   - `**\/api/categories*` — sidebar nav + index category grid (`fetchCategories`,
 *     the `['docs']` query). A failure here renders the page-level `<Error>`.
 *   - `**\/api/docs*` — the doc page body (`fetchDocumentation` inside
 *     MainContent; also the unused docs search box).
 *
 * State coverage notes:
 *   - LOADING is scanned on the DOC route only: keeping both requests pending
 *     holds the sidebar's Chakra `SkeletonText` loaders on screen. The no-slug
 *     index renders no sidebar and no skeleton (the category `SimpleGrid` maps an
 *     `undefined` list to nothing until the query resolves), so its "loading"
 *     frame is just static hero + search chrome — no distinct accessible surface
 *     to wait on. It is documented here rather than dropped silently.
 *   - ERROR is scanned once: a 5xx on `**\/api/categories*` makes the `['docs']`
 *     query throw a truthy `err.response`, so the page swaps its whole content
 *     area for the shared `<Error>` block. That path is route-agnostic (it
 *     replaces both the index grid and a slug route's MainContent), so a single
 *     error scan covers both shapes.
 *   - The index has no reachable EMPTY-via-MainContent state, and a slug route
 *     never shows the index's empty grid; each shape is scanned in the state it
 *     can actually reach.
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans } from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const INDEX_ROUTE = '/knowledge-center';

// A real, published doc slug. `getStaticProps` fetches it server-side so
// `props.data.id` is truthy and MainContent renders; the client-side refetch is
// then mocked below, so the rendered body is our fixture, not the live record.
// (`metadata-completeness-score` is avoided — the page redirects away from it.)
const DOC_SLUG = 'frequently-asked-questions';
const DOC_ROUTE = `/knowledge-center/${DOC_SLUG}`;

const CATEGORIES_GLOB = '**/api/categories*'; // sidebar nav + index category grid
const DOCS_GLOB = '**/api/docs*'; // doc page body (and the unused search box)
const API_GLOBS = [CATEGORIES_GLOB, DOCS_GLOB];

// The hero h1 ("Knowledge Center") is static page chrome, present in every
// state. The MDX doc page renders a SECOND h1 (the doc name), so structural
// checks match the hero by exact name to avoid a strict-mode multiple-match.
const HERO_HEADING = 'Knowledge Center';

// Category payload. `fetchCategories` reads `data.data`; the page maps each
// category's `docs` into nav items and drops categories with no docs. Rendered
// as an h2 per category and a link per doc on the index, and as the sidebar nav
// on a slug route.
const CATEGORIES_FIXTURE = {
  data: [
    {
      id: 1,
      name: 'Getting Started',
      docs: [
        {
          id: 101,
          name: 'Discovery Portal quick start guide',
          slug: 'getting-started',
          description: 'A quick start guide for the Discovery Portal.',
        },
        {
          id: 102,
          name: 'Searching for resources',
          slug: 'searching-for-datasets',
          description: 'How to search the portal.',
        },
      ],
    },
    {
      id: 2,
      name: 'Contributing Data',
      docs: [
        {
          id: 201,
          name: 'Adding individual datasets',
          slug: 'adding-individual-datasets-to-the-discovery-portal',
          description: 'How to add datasets to the portal.',
        },
      ],
    },
  ],
};

// A successful response carrying no categories — drives the page-level empty
// state ("No documentation currently available.").
const EMPTY_CATEGORIES_FIXTURE = { data: [] };

// MDX-rich doc-body payload. `fetchDocumentation` reads `data.data` and
// `useDocumentation` selects `[0]`. The `name` is deliberately distinct from the
// live record's name so waiting for it proves the client mock — not the
// getStaticProps seed — owns the DOM. The `description` exercises the full MDX
// component set so the markdown renderer is scanned end-to-end.
const MDX_DOC_NAME = 'Knowledge Center component showcase';
const DOC_FIXTURE = {
  data: [
    {
      id: 999,
      name: MDX_DOC_NAME,
      subtitle: 'A fixture page that renders every Knowledge Center MDX block.',
      description: [
        '## Overview',
        '',
        'This page exercises the Knowledge Center **markdown components**. It',
        'links to the [search guide](/knowledge-center/searching-for-datasets)',
        'and to the [WCAG standard](https://www.w3.org/WAI/standards-guidelines/wcag/).',
        'Inline configuration such as `NEXT_PUBLIC_API_URL` renders as code.',
        '',
        '---',
        '',
        '### Steps to get started',
        '',
        '1. Open the Discovery Portal.',
        '2. Search for a dataset.',
        '3. Review the metadata.',
        '',
        'Key concepts:',
        '',
        '- Datasets and computational tools',
        '- Repositories and data sources',
        '',
        // Deeper heading levels (h4/h5/h6) plus a hard line break (`br`) — these
        // MDX components are not exercised by any other fixture. Kept in
        // ascending order (h3 above → h4 → h5 → h6) so heading-order stays valid.
        '#### Field reference',
        '',
        'Field names render as level-four headings.  ',
        'A hard line break separates this sentence from the previous one.',
        '',
        '##### Data types',
        '',
        'A level-five subheading groups related fields.',
        '',
        '###### Notes',
        '',
        'A level-six heading carries fine-print notes.',
        '',
        // A <figure>/<figcaption> (the `figcaption` MDX component) via raw HTML,
        // exercised by rehypeRaw.
        '<figure>',
        '  <img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="Schematic of a dataset record." />',
        '  <figcaption>Figure 1. A schematic of a dataset record.</figcaption>',
        '</figure>',
        '',
        // A video upload — the `img` component routes `/uploads` `.mp4`/`.webm`
        // sources to a <video> with an aria-label from the alt text.
        '![Walkthrough of the NIAID Data Ecosystem.](https://example.org/uploads/walkthrough.mp4)',
        '',
        // The right-image layout (the `section` component branch keyed on the
        // `right-image` class) via raw HTML wrapping markdown content.
        '<section class="right-image">',
        '',
        'Text content sits beside the image in the right-image layout.',
        '',
        '![Right-aligned schematic.](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)',
        '',
        '</section>',
        '',
        '> ℹ️ Informational callout: this tip helps new users get oriented.',
        '',
        '> 🚧 Under construction: this section is still being written.',
        '',
        '> 🚨 Important: review the access requirements before downloading.',
        '',
        '![Diagram of the NIAID Data Ecosystem architecture.](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)',
        '',
        '<details>',
        '<summary>What is the NIAID Data Ecosystem?</summary>',
        '',
        'It is a discovery platform for finding NIAID-related datasets and tools.',
        '',
        '</details>',
      ].join('\n'),
      slug: DOC_SLUG,
      createdAt: '2026-06-17T00:00:00Z',
      publishedAt: '2026-06-17T00:00:00Z',
      updatedAt: '2026-06-17T00:00:00Z',
    },
  ],
};

const fulfillJson = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

// --- Shared checks run in every state ---------------------------------------

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — also proves the page rendered the intended chrome. The
  // hero h1 ("Knowledge Center") is present in every state; match it by exact
  // name so it does not collide with MainContent's doc-name h1 on the MDX page.
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

  await runAxeScans(page, testInfo, state);
}

// --- Index: populated --------------------------------------------------------

test.describe('a11y: Knowledge Center index — populated', () => {
  test('passes axe with a populated category grid', async ({
    page,
  }, testInfo) => {
    await page.route(CATEGORIES_GLOB, route =>
      route.fulfill(fulfillJson(CATEGORIES_FIXTURE)),
    );
    await page.goto(INDEX_ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for content only the fixture renders — a category h2 and a doc link —
    // so we know the `['docs']` query resolved and we're scanning the populated
    // grid, not an empty loading frame.
    await expect(
      page.getByRole('heading', { level: 2, name: 'Getting Started' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Discovery Portal quick start guide' }),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'index-populated');
  });
});

// --- Index: empty ------------------------------------------------------------

test.describe('a11y: Knowledge Center index — empty', () => {
  test('passes axe with no documentation available', async ({
    page,
  }, testInfo) => {
    await page.route(CATEGORIES_GLOB, route =>
      route.fulfill(fulfillJson(EMPTY_CATEGORIES_FIXTURE)),
    );
    await page.goto(INDEX_ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the user-facing empty-state message rendered by <Empty>.
    await expect(
      page.getByText(/no documentation currently available/i),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'index-empty');
  });
});

// --- Doc page: loading -------------------------------------------------------

test.describe('a11y: Knowledge Center doc page — loading', () => {
  test('passes axe while the sidebar loads', async ({ page }, testInfo) => {
    // Keep both requests pending so the sidebar's skeleton loaders stay on
    // screen and the body never resolves to fixture content.
    for (const glob of API_GLOBS) {
      await page.route(glob, () => new Promise<void>(() => {}));
    }
    await page.goto(DOC_ROUTE, { waitUntil: 'domcontentloaded' });

    // The SidebarDesktop renders Chakra `SkeletonText` (`.chakra-skeleton`)
    // while `isLoading` — a CSS selector is acceptable here only because
    // skeletons have no accessible surface to target.
    await expect(page.locator('.chakra-skeleton').first()).toBeVisible();

    await runSharedChecks(page, testInfo, 'doc-loading');
  });
});

// --- Doc page: populated (rich MDX) ------------------------------------------

test.describe('a11y: Knowledge Center doc page — populated', () => {
  test('passes axe with a fixture exercising every MDX block', async ({
    page,
  }, testInfo) => {
    await page.route(CATEGORIES_GLOB, route =>
      route.fulfill(fulfillJson(CATEGORIES_FIXTURE)),
    );
    await page.route(DOCS_GLOB, route =>
      route.fulfill(fulfillJson(DOC_FIXTURE)),
    );
    await page.goto(DOC_ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for content only the fixture renders — the doc-name h1, the first MDX
    // heading (anchored via HeadingWithLink, so matched as a substring), an MDX
    // link, and the <details> summary — so we know the client `['doc']` query
    // resolved and we're scanning the mocked MDX DOM, not the SSR seed.
    await expect(
      page.getByRole('heading', { level: 1, name: MDX_DOC_NAME }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Overview' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'WCAG standard' }),
    ).toBeVisible();
    // Proof the deeper-heading / figure blocks rendered, so the scan sees the
    // newly-exercised MDX components (h4–h6, figcaption) and not the SSR seed.
    await expect(
      page.getByRole('heading', { level: 4, name: 'Field reference' }),
    ).toBeVisible();
    await expect(page.getByText(/^Figure 1\./)).toBeVisible();
    await expect(
      page.getByText(/what is the niaid data ecosystem\?/i),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'doc-populated');
  });
});

// --- Error (shared page-level <Error>, route-agnostic) -----------------------

test.describe('a11y: Knowledge Center — error', () => {
  test('passes axe in the error state', async ({ page }, testInfo) => {
    // A 5xx makes the `['docs']` query throw a truthy `err.response`, so the page
    // swaps its content area for the shared <Error> block. (A bare abort would
    // throw `undefined`, which react-query does not register as an error.) This
    // path replaces both the index grid and a slug route's MainContent; we scan
    // it on the doc route so the replacement of MainContent is exercised too.
    for (const glob of API_GLOBS) {
      await page.route(glob, route =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        }),
      );
    }
    await page.goto(DOC_ROUTE, { waitUntil: 'domcontentloaded' });

    // The shared <Error> renders an h2 "Something went wrong." plus the route's
    // "API Request:" detail text.
    await expect(
      page.getByRole('heading', { name: /something went wrong/i }),
    ).toBeVisible();
    await expect(page.getByText(/API Request:/i)).toBeVisible();

    await runSharedChecks(page, testInfo, 'error');
  });
});

// --- Interaction states ------------------------------------------------------
//
// The states above scan the page at rest. On a doc route below Chakra's `sm`
// breakpoint the desktop sidebar is replaced by a Chakra `Menu` (SidebarMobile),
// whose MenuList — category groups + doc-link menuitems — is a portal mounted
// only on open, so a resting scan never sees it (axe skips hidden nodes).
//
// NOT separately scanned: the docs search-bar dropdown (the same
// src/components/input-with-dropdown predictive component already scanned in
// advanced-search.spec.ts) and the desktop sidebar collapse toggle (it hides the
// already-scanned nav — "more of the same", no new markup).

// --- Mobile navigation menu (Chakra Menu) ------------------------------------

test.describe('a11y: Knowledge Center doc page — mobile menu', () => {
  test('passes axe with the mobile nav menu open', async ({
    page,
  }, testInfo) => {
    // Below `sm` (30em) the page renders SidebarMobile instead of the desktop
    // sidebar. Set a phone viewport before navigating so the mobile menu mounts.
    await page.setViewportSize({ width: 375, height: 800 });
    await page.route(CATEGORIES_GLOB, route =>
      route.fulfill(fulfillJson(CATEGORIES_FIXTURE)),
    );
    await page.route(DOCS_GLOB, route =>
      route.fulfill(fulfillJson(DOC_FIXTURE)),
    );
    await page.goto(DOC_ROUTE, { waitUntil: 'domcontentloaded' });

    // The menu button shows "Documentation Menu" (the FAQ slug isn't in the
    // category fixture, so `menuTitle` is empty and the fallback label renders).
    await page.getByRole('button', { name: /documentation menu/i }).click();
    // The MenuList's doc-link menuitems only exist once the menu is open.
    await expect(
      page.getByRole('menuitem', {
        name: /discovery portal quick start guide/i,
      }),
    ).toBeVisible();

    await runAxeScans(page, testInfo, 'mobile-menu');
  });
});
