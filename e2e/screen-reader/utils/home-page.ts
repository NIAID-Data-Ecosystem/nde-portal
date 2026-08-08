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
  CATALOG_ROW_NAME,
  manyRowName,
  mockHomePopulated,
  type MockHomeOptions,
  REPO_ROW_NAME,
  ROUTE,
} from '../fixtures/home';

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
 * baseline — see `metadataFixtureWithCount`. The proof-of-render wait adapts to
 * whichever variant is in play.
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

  await voiceOver.navigateToWebContent();
}
