/**
 * Accessibility tests for the Ontology Browser route (`/ontology-browser`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. Every violation is attached to the HTML report, but only
 * `serious`/`critical` impacts FAIL the build, so minor/moderate noise doesn't
 * block CI. See e2e/utils/axe.ts and the canonical advanced-search.spec.ts.
 *
 * What this route is — a taxonomy explorer. On load it centers on a taxon
 * (`?id=`, default `1`/root) and renders that node's lineage as a tree with
 * per-term dataset counts. It depends on TWO external APIs, both client-side:
 *   - BioThings (`https://t.biothings.io/v1/taxon…`) for the lineage structure:
 *       GET  /taxon/<id>?include_children → `{ lineage: [taxonId, …] }`
 *       POST /taxon                        → detailed records for those ids
 *   - the NDE `/query` API (`**\/query*`) for each node's portal counts
 *       (`fetchPortalCounts` → facets.lineage.{totalRecords,totalLineageRecords})
 * The search bar's predictive lookup also hits BioThings, but at
 * `…/v1/query` — distinguished from the NDE `/query` by host below.
 *
 * State coverage — the "data" is the lineage tree, driven by the BioThings
 * lineage request:
 *   - loading   — lineage request kept pending → tree Spinner
 *   - populated — lineage + counts resolve → tree rows with term names + counts
 *   - error     — lineage request fails → `role="alert"` error Alert
 *   - empty     — OMITTED. There is no designed "no data" state: the browser
 *                 always renders the lineage for a valid taxon, and an empty
 *                 lineage payload crashes the Tree (it renders `treeNodes[0]`,
 *                 which is `undefined`), so there is no accessible empty surface
 *                 to scan. The closest analog — a search yielding no matches — is
 *                 covered by the "search — no results" interaction scan below.
 *
 * Beyond the resting states, the interaction scans cover the transient surfaces
 * a user opens — the predictive-search dropdown, the no-results alert, the
 * "Configure View" settings popover, and the selected-terms sidebar — markup
 * that doesn't exist on first paint and is where a11y regressions hide.
 *
 * Endpoints mocked (all client-side):
 *   - `**\/taxon**`  BioThings lineage (GET ids list + POST detailed records)
 *   - `**\/query*`   NDE portal counts; also BioThings predictive search,
 *                    branched on the `t.biothings.io` host
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans } from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/ontology-browser';
// A representative populated route — a real taxon (eukaryota) so the lineage
// resolves to a multi-node tree (root → cellular organisms → eukaryota).
const POPULATED_ROUTE = '/ontology-browser?id=2759&ontology=ncbitaxon';

const TAXON_GLOB = '**/taxon**';
const QUERY_GLOB = '**/query*';

// BioThings GET /taxon/<id> returns the ancestor→self id list. POST /taxon
// returns the detailed records for those ids. fetchLineageFromBioThingsAPI
// maps then reverses, so this specific→root order yields a root-first lineage.
const LINEAGE_IDS = [2759, 131567, 1];
const DETAILED_LINEAGE = [
  {
    taxid: 2759,
    parent_taxid: 131567,
    scientific_name: 'Eukaryota',
    genbank_common_name: 'eucaryotes',
    rank: 'superkingdom',
    children: [33090, 33154],
  },
  {
    taxid: 131567,
    parent_taxid: 1,
    scientific_name: 'cellular organisms',
    common_name: '',
    rank: 'no rank',
    children: [2759],
  },
  {
    taxid: 1,
    parent_taxid: 1, // root: parent === self → parentTaxonId null
    scientific_name: 'root',
    common_name: '',
    rank: 'no rank',
    children: [131567],
  },
];

// NDE /query response read by fetchPortalCounts. Non-zero counts so no node is
// filtered by the default "hide terms with 0 datasets" setting.
const NDE_COUNTS_FIXTURE = {
  total: 580332,
  hits: [],
  facets: {
    lineage: {
      totalRecords: 33,
      totalLineageRecords: 580332,
      children: { childTaxonCounts: [] },
    },
  },
};
// The "580,332" sub-term count proves counts merged (and the count spinners
// resolved) before we scan the populated tree.
const COUNT_TEXT = /580,332/;

// BioThings predictive-search hits (fetchBioThingsSearchAPI reads `hits`).
const SEARCH_HITS = [
  { _id: '9606', scientific_name: 'Homo sapiens', rank: 'species' },
  { _id: '9605', scientific_name: 'Homo', rank: 'genus' },
];
const SUGGESTION = 'Homo sapiens';

// --- Route fixtures ----------------------------------------------------------

const fulfillJson = (route: import('@playwright/test').Route, body: unknown) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

// BioThings lineage: GET → id list, POST → detailed records.
const routeLineage = (route: import('@playwright/test').Route) =>
  route.request().method() === 'POST'
    ? fulfillJson(route, DETAILED_LINEAGE)
    : fulfillJson(route, { lineage: LINEAGE_IDS });

// `**/query*` matches BOTH the NDE counts API and the BioThings predictive
// search (`t.biothings.io/v1/query`). Branch on host so each gets its shape.
const routeQuery =
  (searchHits: typeof SEARCH_HITS = []) =>
  (route: import('@playwright/test').Route) =>
    route.request().url().includes('t.biothings.io')
      ? fulfillJson(route, { hits: searchHits })
      : fulfillJson(route, NDE_COUNTS_FIXTURE);

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — also proves the page rendered the intended chrome. The
  // page renders a single h1 ("Ontology Browser") in every state.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: /ontology browser/i }),
  ).toBeVisible();

  // Forms: the predictive search bar is the page's primary form control. It is
  // labelled "Search taxonomy browser" via an associated <label> + aria-label.
  const search = page.getByRole('textbox', {
    name: /search taxonomy browser/i,
  });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  await runAxeScans(page, testInfo, state);
}

// --- Loading -----------------------------------------------------------------

test.describe('a11y: Ontology Browser — loading', () => {
  test('passes axe while the lineage is loading', async ({
    page,
  }, testInfo) => {
    // Keep the lineage (and counts) requests pending so the tree Spinner stays
    // on screen.
    await page.route(TAXON_GLOB, () => new Promise<void>(() => {}));
    await page.route(QUERY_GLOB, () => new Promise<void>(() => {}));
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // The Chakra Spinner is a loading marker with no meaningful accessible
    // surface, so `.chakra-spinner` is acceptable here.
    await expect(page.locator('.chakra-spinner').first()).toBeVisible();

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Populated ---------------------------------------------------------------
//
// Previously this scan found a SERIOUS `nested-interactive` violation: each tree
// row was a `<Flex as="button">` (the open/close toggle) WRAPPING the term's
// `<a>` link. That was fixed by demoting the row container to a plain Flex and
// making the chevron IconButton the dedicated toggle (see TreeNode in
// src/views/ontology-browser/components/tree/components/tree-node.tsx), so the
// link is no longer nested in a button.

test.describe('a11y: Ontology Browser — populated', () => {
  test('passes axe once the lineage and counts resolve', async ({
    page,
  }, testInfo) => {
    await page.route(TAXON_GLOB, routeLineage);
    await page.route(QUERY_GLOB, routeQuery());
    await page.goto(POPULATED_ROUTE, { waitUntil: 'domcontentloaded' });

    // A tree node label only renders once the lineage structure loads, and the
    // sub-term count only once portal counts merge (spinners gone) — both prove
    // we're scanning the populated DOM.
    await expect(page.getByText(/cellular organisms/i)).toBeVisible();
    await expect(page.getByText(COUNT_TEXT).first()).toBeVisible();
    await expect(page.locator('.chakra-spinner')).toHaveCount(0);

    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Error -------------------------------------------------------------------

test.describe('a11y: Ontology Browser — error', () => {
  test('passes axe in the lineage error state', async ({ page }, testInfo) => {
    // Abort the lineage request so the query rejects (after its retries),
    // matching a production network failure → the error Alert renders.
    await page.route(TAXON_GLOB, route => route.abort());
    await page.route(QUERY_GLOB, routeQuery());
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // The error UI is an Alert with role="alert".
    await expect(page.getByRole('alert')).toBeVisible();

    await runSharedChecks(page, testInfo, 'error');
  });
});

// --- Interaction states ------------------------------------------------------
//
// The states above scan the page at rest. These scan the transient surfaces a
// user opens. Each runs the same axe scans via runAxeScans; we skip
// runSharedChecks' resting-layout assertions because an open portal can cover
// the page chrome.
//
// The search and settings surfaces don't depend on the lineage, so these scans
// keep the lineage request PENDING (tree = Spinner only). That keeps each scan
// focused on the surface under test and deterministic regardless of the tree.

// --- Predictive search suggestions (open dropdown) ---------------------------
//
// Previously this scan found a SERIOUS `color-contrast` violation: the dropdown
// highlighted the matched substring with `color: primary.400` (#109797, bold)
// on the near-white list background (#f5fbfb), a 3.4:1 ratio. It was fixed by
// darkening the highlight to primary.600 (see DropdownListItem in
// src/views/ontology-browser/components/search/dropdown-list-item.tsx).

test.describe('a11y: Ontology Browser — search suggestions', () => {
  test('passes axe with the predictive dropdown open', async ({
    page,
  }, testInfo) => {
    // Lineage pending so only the dropdown is scanned (no tree). The BioThings
    // predictive search is independent of the lineage.
    await page.route(TAXON_GLOB, () => new Promise<void>(() => {}));
    await page.route(QUERY_GLOB, routeQuery(SEARCH_HITS));
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Typing fires the debounced BioThings search; the matching suggestion
    // proves the dropdown is open before scanning it.
    await page
      .getByRole('textbox', { name: /search taxonomy browser/i })
      .fill('homo');
    await expect(page.getByText(SUGGESTION).first()).toBeVisible();

    await runAxeScans(page, testInfo, 'search-suggestions');
  });
});

// --- Search with no results (info alert) -------------------------------------

test.describe('a11y: Ontology Browser — search no results', () => {
  test('passes axe with the no-results alert shown', async ({
    page,
  }, testInfo) => {
    // Lineage pending so only the search surface is scanned. BioThings search
    // returns no hits → the "No Results Found" info alert.
    await page.route(TAXON_GLOB, () => new Promise<void>(() => {}));
    await page.route(QUERY_GLOB, routeQuery([]));
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    await page
      .getByRole('textbox', { name: /search taxonomy browser/i })
      .fill('zzzznotaxon');
    // The alert title; `exact` avoids matching the "No results found for…"
    // description that also contains the phrase.
    await expect(
      page.getByText('No Results Found', { exact: true }),
    ).toBeVisible();

    await runAxeScans(page, testInfo, 'search-no-results');
  });
});

// --- Configure View settings popover -----------------------------------------

test.describe('a11y: Ontology Browser — settings popover', () => {
  test('passes axe with the settings popover open', async ({
    page,
  }, testInfo) => {
    // The "Configure View" trigger renders outside the tree's loading box, so
    // we keep the lineage pending to scan the popover without the tree.
    await page.route(TAXON_GLOB, () => new Promise<void>(() => {}));
    await page.route(QUERY_GLOB, routeQuery());
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Open the Chakra Popover. dispatchEvent fires the trigger's React onClick
    // directly, bypassing the Next.js dev overlay (`<nextjs-portal>`) that can
    // intercept real clicks while the route is still compiling.
    await page
      .getByRole('button', { name: /configure view/i })
      .dispatchEvent('click');
    // A switch label inside the popover proves its portal content rendered.
    await expect(page.getByText(/enable condensed view\?/i)).toBeVisible();

    await runAxeScans(page, testInfo, 'settings-popover');
  });
});

// --- Selected-terms sidebar (populated) --------------------------------------
//
// The sidebar can only be populated by clicking the "+" control on a tree node,
// so this scan necessarily renders the tree. It now passes because the tree's
// `nested-interactive` violation is fixed (see the populated block); the scan
// additionally covers the sidebar's radio group, remove buttons, and
// "Search resources" link.

test.describe('a11y: Ontology Browser — selected terms sidebar', () => {
  test('passes axe with the selected-terms sidebar open', async ({
    page,
  }, testInfo) => {
    await page.route(TAXON_GLOB, routeLineage);
    await page.route(QUERY_GLOB, routeQuery());
    await page.goto(POPULATED_ROUTE, { waitUntil: 'domcontentloaded' });

    await expect(page.getByText(/cellular organisms/i)).toBeVisible();

    // Add a tree node to the search list; the sidebar (returns null when empty)
    // mounts with its radio group, remove buttons, and "Search resources" link.
    // dispatchEvent bypasses the dev overlay that can intercept real clicks.
    await page
      .getByRole('button', {
        name: /search portal for resources related to/i,
      })
      .first()
      .dispatchEvent('click');
    await expect(
      page.getByText(/list of selected search terms/i),
    ).toBeVisible();

    await runAxeScans(page, testInfo, 'selected-terms-sidebar');
  });
});
