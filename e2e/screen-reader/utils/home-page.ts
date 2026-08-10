/**
 * Entry helper for screen reader specs that traverse the Home route (`/`).
 *
 * Lives here rather than inside a spec because more than one spec needs it:
 * `home.spec.ts` tests the route itself, and specs for shared components
 * exercised via this page (the Carousel, the CheckboxList popover) need the
 * same starting position.
 *
 * When another route gets screen reader coverage, add a sibling
 * `search-page.ts` rather than generalising this into a routes registry — the
 * per-route "proof the data rendered" waits are the whole point, and they
 * differ per route.
 */
import { expect, type Page } from '@playwright/test';
import type { VoiceOverPlaywright } from '@guidepup/playwright';
import {
  carouselCardName,
  CATALOG_ROW_NAME,
  manyRowName,
  mockHomeGated,
  mockHomeLoading,
  mockHomePopulated,
  type MockHomeOptions,
  REPO_ROW_NAME,
  ROUTE,
} from '../fixtures/home';

/**
 * Playwright locator for a skeleton cell.
 *
 * The loading table's cells are Chakra `SkeletonText`, which emits no ARIA and
 * no role, so there is no accessible surface to wait on — a `data-testid` is the
 * correct and only handle. `src/views/home/components/TableWithSearch` tags all
 * 50 of them (10 rows x 5 columns), hence `.first()` at every call site.
 */
export const skeletonCell = (page: Page) => page.getByTestId('loading').first();

/**
 * Load the populated home page and park the VoiceOver cursor at the top of web
 * content, ready to traverse.
 *
 * The Playwright waits here are doing ONE job: proving both client queries
 * resolved before VoiceOver starts walking. That's the suite's central rule —
 * Playwright locators wait on state, VoiceOver commands move the cursor. Never
 * use `locator.focus()` to position the reader; the VO cursor and DOM focus are
 * separate, and mixing them desyncs them intermittently. See the README.
 *
 * Pass `{ repoCount }` to render a many-row table instead of the 1-repo
 * baseline — see `metadataFixtureWithCount`, and `{ carouselCardCount }` for a
 * multi-card carousel. The proof-of-render waits adapt to whichever variants
 * are in play.
 */
export async function enterHomePageWebContent(
  page: Page,
  voiceOver: VoiceOverPlaywright,
  options: MockHomeOptions = {},
): Promise<void> {
  await mockHomePopulated(page, options);
  await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

  // Proof the /query hook resolved.
  await expect(
    page.getByRole('link', { name: CATALOG_ROW_NAME }),
  ).toBeVisible();
  // Proof the /metadata hook resolved. With the many-row variant the baseline
  // repo name doesn't exist, so wait on the first generated row instead.
  await expect(
    page.getByRole('link', {
      name: options.repoCount === undefined ? REPO_ROW_NAME : manyRowName(1),
      exact: true,
    }),
  ).toBeVisible();

  // Proof the carousel's CLIENT-SIDE refetch resolved. The page ships three
  // cards baked in by getStaticProps, which the browser then refetches and
  // replaces. Without this wait a spec could walk the baked cards instead of
  // the fixture's and never know — they look identical to a traversal.
  if (options.carouselCardCount !== undefined) {
    await expect(
      page.getByRole('heading', {
        name: carouselCardName(options.carouselCardCount),
      }),
    ).toBeVisible();
  }

  await voiceOver.navigateToWebContent();
}

/**
 * Load the home page with both NDE queries hanging, so the resources table is
 * held in its skeleton state, and park the VoiceOver cursor at the top of web
 * content.
 *
 * A sibling of `enterHomePageWebContent` rather than an option on it: that
 * helper's three proof-of-render waits are exactly what cannot happen here — the
 * table rows never arrive — so they have to be REPLACED, not reused. The waits
 * are the point of a per-route entry helper, so a variant that needs different
 * ones is a different function.
 *
 * Pass a `release` from {@link mockHomeGated} instead of using this when the test
 * needs to observe the transition out of the loading state.
 */
export async function enterHomePageLoadingWebContent(
  page: Page,
  voiceOver: VoiceOverPlaywright,
): Promise<void> {
  await mockHomeLoading(page);
  await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

  // Proof of the loading state, and the only one available.
  await expect(skeletonCell(page)).toBeVisible();

  await voiceOver.navigateToWebContent();
}

/**
 * As {@link enterHomePageLoadingWebContent}, but returns the `release()` that
 * lets the queries resolve, for specs that need to observe the moment data
 * replaces the skeleton rows.
 */
export async function enterHomePageGatedWebContent(
  page: Page,
  voiceOver: VoiceOverPlaywright,
): Promise<() => void> {
  const release = await mockHomeGated(page);
  await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

  await expect(skeletonCell(page)).toBeVisible();

  await voiceOver.navigateToWebContent();
  return release;
}
