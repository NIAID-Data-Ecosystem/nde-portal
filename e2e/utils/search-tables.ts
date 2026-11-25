import { expect, type Locator, type Page } from '@playwright/test';

import {
  METADATA_RESPONSE,
  SEARCH_TABLE_TABS,
  SEARCH_TABLES_RESPONSE,
} from '../fixtures/search-tables';

export type SearchTableTab = (typeof SEARCH_TABLE_TABS)[number];

/**
 * Open /search on a tab's table, with every endpoint mocked (see
 * e2e/fixtures/search-tables.ts), and wait until its rows have rendered.
 * Returns the table.
 */
export async function gotoSearchTable(
  page: Page,
  { id, tab, viewMode, label }: SearchTableTab,
): Promise<Locator> {
  // The card/table choice persists per tab in localStorage; set it before the
  // app reads it.
  if (viewMode) {
    await page.addInitScript(tabId => {
      window.localStorage.setItem(`search-view-mode-${tabId}`, 'table');
    }, id);
  }
  await page.route('**/query*', route =>
    route.fulfill({ json: SEARCH_TABLES_RESPONSE }),
  );
  await page.route('**/metadata*', route =>
    route.fulfill({ json: METADATA_RESPONSE }),
  );
  await page.route('**/api/diseases*', route =>
    route.fulfill({ json: { data: [] } }),
  );
  await page.goto('/search', { waitUntil: 'domcontentloaded' });

  // The page settles on its default tab once results arrive, so a click made
  // before that can be undone: click until this tab stays selected.
  const trigger = page.getByRole('tab', { name: tab });
  await expect(async () => {
    if ((await trigger.getAttribute('aria-selected')) !== 'true') {
      await trigger.click();
    }
    await expect(trigger).toHaveAttribute('aria-selected', 'true', {
      timeout: 2_000,
    });
  }).toPass({ timeout: 30_000 });

  const table = page.getByRole('table', { name: label });
  await expect(table.locator('tbody tr td a').first()).toBeVisible();
  await expect(table).not.toHaveAttribute('aria-busy', 'true');
  return table;
}

export async function openColumnCustomizer(page: Page) {
  await page.getByRole('button', { name: /customize columns/i }).click();
  const dialog = page.getByRole('dialog', { name: 'Customize Columns' });
  await expect(dialog.getByRole('checkbox').first()).toBeVisible();
  return dialog;
}
