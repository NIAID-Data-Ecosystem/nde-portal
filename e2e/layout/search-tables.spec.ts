/**
 * Layout and behaviour specs for the Search tables (the shared DataTable built
 * by `createSearchTable`, in src/views/search/components/results-list/
 * components/results-table). What jsdom can't show: the page-level server
 * sort round trip (URL, API request, toolbar select), the 70vh cap with a
 * sticky header, pinning, small screens, and preferences across a reload.
 * The DataTable's own layout is covered on its pilot page
 * (repository-matcher.spec.ts).
 *
 * Runs with the a11y suite against the static export (see e2e/README.md), with
 * every endpoint mocked (e2e/fixtures/search-tables.ts).
 */
import { expect, type Page, test } from '@playwright/test';

import { SEARCH_TABLE_TABS } from '../fixtures/search-tables';
import { gotoSearchTable, openColumnCustomizer } from '../utils/search-tables';

const DATASETS = SEARCH_TABLE_TABS[0];

const root = (page: Page) => page.locator('.nde-data-table');
const viewport = (page: Page) => root(page).locator('table').locator('..');
const header = (page: Page, name: string) =>
  root(page).getByRole('columnheader', { name: new RegExp(`^${name}`) });
const headerTitles = (page: Page) =>
  root(page)
    .locator('thead th')
    .evaluateAll(ths => ths.map(th => th.textContent?.trim()));

test.describe('Search tables: server sort', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('a header click asks the API for that sort and returns to page 1', async ({
    page,
  }) => {
    await gotoSearchTable(page, DATASETS);
    // Start from page 2, so the reset to page 1 is visible.
    await page
      .getByRole('navigation', { name: /paginate/i })
      .first()
      .getByRole('button', { name: /^Page 2 of/ })
      .click();
    await expect(page).toHaveURL(/from=2/);

    const request = page.waitForRequest(
      req => req.url().includes('/query') && /sort=-date/.test(req.url()),
    );
    await header(page, 'Date').getByRole('button', { name: 'Date' }).click();
    await request;
    await expect(page).toHaveURL(/sort=-date/);
    await expect(page).toHaveURL(/from=1/);
    // Newest first on the first click, shown on the header.
    await expect(header(page, 'Date')).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  });

  test('the toolbar Sort select and the headers stay in sync', async ({
    page,
  }) => {
    await gotoSearchTable(page, DATASETS);
    const select = page.getByRole('combobox', { name: /sort by/i });

    await header(page, 'Date').getByRole('button', { name: 'Date' }).click();
    await expect(select).toHaveText(/Date: Most recent/);

    // Back to "Best match" from the toolbar: no column shows as sorted.
    await select.click();
    await page.getByRole('option', { name: 'Best match' }).click();
    await expect(page).toHaveURL(/sort=_score/);
    await expect(root(page).locator('th[aria-sort]')).toHaveCount(0);
  });
});

test.describe('Search tables: layout', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('caps the table at 70vh and keeps its header in view as rows scroll', async ({
    page,
  }) => {
    await gotoSearchTable(page, DATASETS);
    const box = await root(page).boundingBox();
    expect(box!.height).toBeLessThanOrEqual(900 * 0.7 + 1);

    const scroll = await viewport(page).evaluate(el => {
      el.scrollTop = 400;
      const th = el.querySelector('th')!.getBoundingClientRect();
      return {
        overflows: el.scrollHeight > el.clientHeight,
        scrolled: el.scrollTop,
        headerOffset: Math.round(th.top - el.getBoundingClientRect().top),
      };
    });
    expect(scroll.overflows).toBe(true);
    expect(scroll.scrolled).toBeGreaterThan(0);
    expect(Math.abs(scroll.headerOffset)).toBeLessThanOrEqual(1);
  });

  test('pins the first column from the customizer', async ({ page }) => {
    await gotoSearchTable(page, DATASETS);
    const dialog = await openColumnCustomizer(page);
    await dialog.getByText('Pin first column').click();
    await page.keyboard.press('Escape');
    await expect(root(page)).toHaveAttribute('data-pinned', '');

    const offset = await viewport(page).evaluate(el => {
      el.scrollLeft = 600;
      const cell = el.querySelector('tbody td')!.getBoundingClientRect();
      return Math.round(cell.left - el.getBoundingClientRect().left);
    });
    expect(Math.abs(offset)).toBeLessThanOrEqual(1);
  });

  test('every tab’s table fits the page width, scrolling sideways itself', async ({
    page,
  }) => {
    for (const tab of SEARCH_TABLE_TABS) {
      await gotoSearchTable(page, tab);
      const widths = await page.evaluate(() => ({
        page: document.documentElement.scrollWidth,
        window: window.innerWidth,
      }));
      expect(widths.page, tab.label).toBeLessThanOrEqual(widths.window);
    }
  });
});

test.describe('Search tables: small screens', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the page never scrolls sideways; the table does', async ({ page }) => {
    await gotoSearchTable(page, DATASETS);
    const widths = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth,
      window: window.innerWidth,
    }));
    expect(widths.page).toBeLessThanOrEqual(widths.window);
    const scrollsSideways = await viewport(page).evaluate(
      el => el.scrollWidth > el.clientWidth,
    );
    expect(scrollsSideways).toBe(true);
  });
});

test.describe('Search tables: preferences', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('column choices survive a reload', async ({ page }) => {
    await gotoSearchTable(page, DATASETS);
    expect(await headerTitles(page)).toContain('Author');

    const dialog = await openColumnCustomizer(page);
    await dialog.getByText('Author', { exact: true }).click();
    await page.keyboard.press('Escape');
    await expect.poll(() => headerTitles(page)).not.toContain('Author');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(root(page).locator('tbody tr td a').first()).toBeVisible();
    expect(await headerTitles(page)).not.toContain('Author');
    const stored = await page.evaluate(() =>
      JSON.parse(
        window.localStorage.getItem('nde:table:search-datasets:v1') ?? '{}',
      ),
    );
    expect(stored.visible).not.toContain('author');
  });
});
