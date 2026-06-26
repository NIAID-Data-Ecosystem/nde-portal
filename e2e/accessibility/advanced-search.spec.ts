/**
 * Accessibility tests for the Advanced Search route (`/advanced-search`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. We report every violation in the HTML report but only FAIL the
 * build on `serious` or `critical` impact, so minor/moderate noise doesn't block
 * CI. See e2e/utils/axe.ts and the canonical repository-matcher.spec.ts.
 *
 * What this route is — unlike /search, this page is a *query builder form*, not a
 * results list. The field options come from a static config
 * (`configs/schema-definitions.json`), so the form itself renders with no
 * network. The ONLY data dependency is `ResultsCount`, which fetches the NDE
 * `/query` API to show the live result count — and only once the builder has at
 * least one term (`enabled: !!queryString`). The predictive-text input also hits
 * `**\/query*`, but only while the user is typing, which these specs never do.
 *
 * State coverage — the "data" on this page is the result count, so the four
 * states are driven by the count request, which we reach by clicking a sample
 * query to populate the builder:
 *   - loading   — count request kept pending → ResultsCount spinner
 *   - empty     — the default page on first paint: empty builder, no count fetch
 *   - populated — count request resolved → result-count heading renders
 *   - error     — count request fails. NOTE: `ResultsCount` renders nothing on
 *                 error (`if ((!isLoading && !data) || error) return <></>`), so
 *                 there is no distinct error UI. We still scan this state to
 *                 prove the builder stays accessible when the count fetch fails.
 *
 * Beyond the four resting states, four "interaction" scans cover the transient,
 * interaction-only surfaces a user opens while building a query — the field
 * combobox menu, the predictive-suggestions dropdown, the inline validation
 * error, and a keyboard drag-and-drop pickup.
 * Endpoints mocked (all client-side):
 *   - `**\/query*`  the NDE /query API (result count + predictive suggestions)
 */
import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import {
  analyzeA11y,
  attachA11yReport,
  attachScreenshot,
  blockingViolations,
  formatViolations,
  WCAG_AA_TAGS,
} from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const ROUTE = '/advanced-search';

// The only endpoint this route reads. The NDE /query API is NOT under `/api/`.
const API_GLOBS = ['**/query*'];

// The first sample query (configs/sample-queries.json). Clicking its button
// populates the query builder, which in turn enables the ResultsCount fetch.
const SAMPLE_QUERY = /West Siberian subtype/i;

// Minimal /query response for the populated count. fetchSearchResults reads
// `total`; ResultsCount renders "<total> results".
const TOTAL = 42;
const POPULATED_FIXTURE = { total: TOTAL, hits: [], facets: {} };

// --- Shared checks run in every state ---------------------------------------

/**
 * The axe scans every state runs: a full WCAG A/AA scan, a focused
 * color-contrast scan, and a focused button/link-name scan, each reported
 * separately, plus a screenshot. Split out from runSharedChecks so the
 * interaction states (open menus/dropdowns/drag overlays) can run the same
 * scans without the resting-layout form/structure assertions, which can flake
 * when a portal is covering the page.
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
  await attachScreenshot(page, testInfo, state);
}

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — also proves the page rendered the intended chrome. The
  // page renders a single h1 ("Advanced Search") in every state.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: /advanced search/i }),
  ).toBeVisible();

  // Forms: the query-term input is the page's primary form control. It is a
  // textarea labelled "Add" via a visually-hidden <label> (see DropdownInput),
  // so it must expose that accessible name and be editable.
  const queryInput = page.getByRole('textbox', { name: /add/i });
  await expect(queryInput).toBeVisible();
  await expect(queryInput).toBeEditable();

  await runAxeScans(page, testInfo, state);
}

// --- Loading -----------------------------------------------------------------

test.describe('a11y: Advanced Search — loading', () => {
  test('passes axe while the result count is loading', async ({
    page,
  }, testInfo) => {
    // Keep the count request pending so the ResultsCount spinner stays on screen.
    for (const glob of API_GLOBS) {
      await page.route(glob, () => new Promise<void>(() => {}));
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Populate the builder so the count fetch fires, then wait for the spinner.
    // dispatchEvent fires the button's React onClick directly, bypassing the
    // Next.js dev overlay (`<nextjs-portal>`) that can intercept real clicks
    // while the route is still compiling. The Chakra Spinner is a loading
    // marker with no meaningful accessible surface, so `.chakra-spinner` is
    // acceptable here.
    await page
      .getByRole('button', { name: SAMPLE_QUERY })
      .dispatchEvent('click');
    await expect(page.locator('.chakra-spinner').first()).toBeVisible();

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Empty -------------------------------------------------------------------

test.describe('a11y: Advanced Search — empty', () => {
  test('passes axe on the default empty builder', async ({
    page,
  }, testInfo) => {
    // Mock the endpoint for safety, though the default page fires no request:
    // with an empty builder the count query is disabled and nothing is typed.
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

    // Proof of the default empty state: the form chrome rendered (the sample
    // query buttons), and no result-count heading exists because no term was
    // added.
    await expect(
      page.getByRole('button', { name: SAMPLE_QUERY }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(0);

    await runSharedChecks(page, testInfo, 'empty');
  });
});

// --- Populated ---------------------------------------------------------------

test.describe('a11y: Advanced Search — populated', () => {
  test('passes axe once the result count resolves', async ({
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

    // Populate the builder, then wait for the ResultsCount heading. It only
    // renders once the count query resolves, so this proves we're scanning the
    // populated DOM and not the loading or empty state. dispatchEvent bypasses
    // the Next.js dev overlay that can intercept real clicks during compile.
    await page
      .getByRole('button', { name: SAMPLE_QUERY })
      .dispatchEvent('click');
    await expect(
      page.getByRole('heading', { level: 3, name: /42\s*results?/i }),
    ).toBeVisible();
    await expect(page.locator('.chakra-spinner')).toHaveCount(0);

    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Error -------------------------------------------------------------------

test.describe('a11y: Advanced Search — error', () => {
  test('passes axe when the count fetch fails', async ({ page }, testInfo) => {
    // Abort the count request so the query rejects (after its single retry),
    // matching a production network failure. ResultsCount renders nothing on
    // error, so the builder must remain accessible without a count.
    for (const glob of API_GLOBS) {
      await page.route(glob, route => route.abort());
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Populate the builder; the term text rendered by the query-builder tree
    // proves the items populated even though the count never appears.
    // dispatchEvent bypasses the Next.js dev overlay that can intercept clicks.
    await page
      .getByRole('button', { name: SAMPLE_QUERY })
      .dispatchEvent('click');
    await expect(page.getByText(/West Siberian virus/i).first()).toBeVisible();
    await expect(page.locator('.chakra-spinner')).toHaveCount(0);

    await runSharedChecks(page, testInfo, 'error');
  });
});

// --- Interaction states ------------------------------------------------------
//
// The states above scan the page at rest. These scan the transient,
// interaction-only surfaces a user opens while building a query — the kind of
// widget (combobox menus, predictive dropdowns, drag overlays, inline error
// banners) where a11y regressions most often hide. Each runs the same axe
// scans via runAxeScans; we skip runSharedChecks' resting-layout assertions
// because an open portal can cover the form chrome.

// A keyword field with no `enum`, so SearchInput renders the predictive
// TextInput (not an enum/number/date control). Selecting it routes the
// predictive query through the keyword/facets branch of usePredictiveSearch,
// which is the simplest shape to mock deterministically.
const PREDICTIVE_FIELD = {
  label: /citation journal name/i,
  dotfield: 'citation.journalName',
};
const SUGGESTION = 'Nature Fixture Journal';

// --- Field-select menu (open combobox) ---------------------------------------

test.describe('a11y: Advanced Search — field select menu', () => {
  test('passes axe with the field combobox menu open', async ({
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

    // Open the react-select field combobox and type to narrow the (large)
    // option list to a handful, then wait for an option to prove the listbox
    // is open before scanning it.
    const fieldSelect = page.getByRole('combobox', { name: /select field/i });
    await fieldSelect.click();
    await fieldSelect.pressSequentially('citation journal');
    await expect(
      page.getByRole('option', { name: PREDICTIVE_FIELD.label }).first(),
    ).toBeVisible();

    await runAxeScans(page, testInfo, 'field-select-menu');
  });
});

// --- Predictive-text suggestions dropdown ------------------------------------

test.describe('a11y: Advanced Search — predictive suggestions', () => {
  test('passes axe with the predictive dropdown open', async ({
    page,
  }, testInfo) => {
    // Mock the predictive query (keyword branch reads facets[<field>].terms).
    await page.route('**/query*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total: 0,
          facets: {
            [PREDICTIVE_FIELD.dotfield]: {
              _type: 'terms',
              terms: [
                { term: SUGGESTION, count: 12 },
                { term: 'Cell Fixture Journal', count: 8 },
              ],
              total: 2,
              other: 0,
              missing: 0,
            },
          },
        }),
      }),
    );
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Select the keyword field so the predictive query is enabled (it requires
    // a field), then type a term to open the suggestions dropdown.
    const fieldSelect = page.getByRole('combobox', { name: /select field/i });
    await fieldSelect.click();
    await fieldSelect.pressSequentially('citation journal');
    await page
      .getByRole('option', { name: PREDICTIVE_FIELD.label })
      .first()
      .click();

    await page.getByRole('textbox', { name: /add/i }).fill('journal');

    // Wait for a mocked suggestion to render so we scan the open dropdown.
    await expect(page.getByText(SUGGESTION).first()).toBeVisible();

    await runAxeScans(page, testInfo, 'predictive-suggestions');
  });
});

// --- Inline validation error -------------------------------------------------

test.describe('a11y: Advanced Search — validation error', () => {
  test('passes axe when an invalid term is submitted', async ({
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

    // Submit an unbalanced query term. With the default "All Fields" the input
    // is the predictive TextInput; on Enter it validates and renders the
    // FormControl's error message ("Unbalanced punctuation") via checkBalanced-
    // Punctuation, without firing any request.
    const queryInput = page.getByRole('textbox', { name: /add/i });
    await queryInput.fill('malaria)');
    await queryInput.press('Enter');
    await expect(page.getByText(/unbalanced punctuation/i)).toBeVisible();

    await runAxeScans(page, testInfo, 'validation-error');
  });
});
