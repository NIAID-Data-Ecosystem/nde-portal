/**
 * Layout and interaction specs for the shared DataTable, on its pilot page
 * (`/repository-matcher`). jsdom can't lay pages out, so the behaviour that
 * only exists in a real browser is checked here: sticky header, pinned
 * column, adaptive widths, scrollbar reachability, small-screen scrolling,
 * keyboard and touch. Assertions are about behaviour (positions relative to
 * each other, ±1px), not pixels.
 *
 * Runs with the a11y suite against the static export (see e2e/README.md).
 */
import { expect, type Locator, type Page, test } from '@playwright/test';

import {
  METADATA_RESPONSE,
  QUERY_RESPONSE,
  ROW_COUNT,
} from './fixtures/repository-matcher';

const ROUTE = '/repository-matcher';
const TABLE_NAME = /repositories and resource catalogs/i;

async function gotoPopulated(page: Page) {
  await page.route('**/query*', route =>
    route.fulfill({ json: QUERY_RESPONSE }),
  );
  await page.route('**/metadata*', route =>
    route.fulfill({ json: METADATA_RESPONSE }),
  );
  await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(`${ROW_COUNT} results`)).toBeVisible();
  await expect(
    page.getByRole('table', { name: TABLE_NAME }).locator('tbody a').first(),
  ).toBeVisible();
}

const root = (page: Page) => page.locator('.nde-data-table');
const viewport = (page: Page) => root(page).locator('table').locator('..');

/**
 * Scroll the table down until `target` is mounted. The pilot table is
 * virtualized, so rows outside its window aren't in the DOM; in a plain table
 * this returns straight away.
 */
async function scrollUntilMounted(page: Page, target: Locator) {
  for (let step = 0; step < 60 && (await target.count()) === 0; step++) {
    await viewport(page).evaluate(el => el.scrollBy(0, el.clientHeight / 2));
    await page.waitForTimeout(50);
  }
  await expect(target).toBeAttached();
}

/** Scroll the page so the table's top edge is at the top of the window. */
const scrollTableToTop = (page: Page) =>
  root(page).evaluate(el => window.scrollBy(0, el.getBoundingClientRect().top));

async function openCustomizer(page: Page) {
  await page.getByRole('button', { name: /customize columns/i }).click();
  return page.getByRole('dialog', { name: 'Customize Columns' });
}

/** Header widths, keyed by visible label. */
const headerWidths = (page: Page) =>
  root(page).evaluate(el =>
    Object.fromEntries(
      [...el.querySelectorAll('thead th')].map(th => [
        th.querySelector('.nde-header-label')?.textContent ?? '',
        (th as HTMLElement).offsetWidth,
      ]),
    ),
  );

test.describe('DataTable layout: desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the table fills the window below the toolbar, with its header stuck', async ({
    page,
  }) => {
    await gotoPopulated(page);
    // Scroll the results area (toolbar + table) to the top of the window.
    await root(page).evaluate(el =>
      window.scrollBy(0, el.parentElement!.getBoundingClientRect().top),
    );
    const fit = await root(page).evaluate(el => {
      const view = el.querySelector('table')!.parentElement!;
      const search = document
        .querySelector('input[placeholder^="Search repositories"]')!
        .getBoundingClientRect();
      return {
        bottomGap: window.innerHeight - el.getBoundingClientRect().bottom,
        searchOnScreen: search.top >= 0 && search.bottom <= window.innerHeight,
        innerScroll: view.scrollHeight > view.clientHeight + 1,
      };
    });
    expect(Math.abs(fit.bottomGap)).toBeLessThanOrEqual(1);
    expect(fit.searchOnScreen).toBe(true);
    expect(fit.innerScroll).toBe(true);

    // The header sticks while the rows scroll.
    await viewport(page).evaluate(el => (el.scrollTop = 800));
    const headerOffset = await root(page).evaluate(el => {
      const view = el.querySelector('table')!.parentElement!;
      return (
        el.querySelector('thead th')!.getBoundingClientRect().top -
        view.getBoundingClientRect().top
      );
    });
    expect(Math.abs(headerOffset)).toBeLessThanOrEqual(1);

    // The filter sidebar scrolls with the page: no second scroll area.
    const sidebarSticky = await page
      .getByText('Filters', { exact: true })
      .first()
      .evaluate(el => {
        let node: Element | null = el;
        while (node && node !== document.body) {
          if (getComputedStyle(node).position === 'sticky') return true;
          node = node.parentElement;
        }
        return false;
      });
    expect(sidebarSticky).toBe(false);
  });

  test('fewer rows take only the space they need', async ({ page }) => {
    await gotoPopulated(page);
    await page
      .getByRole('textbox', { name: /search repositories/i })
      .fill('bv-brc 13');
    await expect(page.getByText('1 results')).toBeVisible();
    const size = await viewport(page).evaluate(el => ({
      innerScroll: el.scrollHeight - el.clientHeight,
      height: el.parentElement!.getBoundingClientRect().height,
    }));
    expect(size.innerScroll).toBeLessThanOrEqual(1);
    expect(size.height).toBeLessThan(400);
  });

  test("maxHeight='none' lets the table grow with its rows", async ({
    page,
  }) => {
    await gotoPopulated(page);
    // What `maxHeight='none'` renders, in a parent that doesn't cap it.
    await root(page).evaluate(el => {
      el.style.maxHeight = 'none';
      el.parentElement!.style.maxHeight = 'none';
    });
    const state = await viewport(page).evaluate(el => ({
      innerScroll: el.scrollHeight - el.clientHeight,
      height: el.getBoundingClientRect().height,
    }));
    expect(state.innerScroll).toBeLessThanOrEqual(1);
    expect(state.height).toBeGreaterThan(900);
  });

  test('the scroll viewport is opaque, so Chrome can scroll it on the compositor', async ({
    page,
  }) => {
    // Without its own opaque background, Chrome (at 1x pixel density) repaints
    // the visible table on the main thread at every scroll step. The perf
    // harness (e2e/perf) measures the effect; this guards the cause.
    await gotoPopulated(page);
    const background = await viewport(page).evaluate(
      el => getComputedStyle(el).backgroundColor,
    );
    expect(background).toBe('rgb(255, 255, 255)');
  });

  test('a top scrollbar and the scrollbar marker keep their size in a bounded table', async ({
    page,
  }) => {
    // The bounded root is a flex column, which shrinks its children in
    // proportion to their size: next to a 20,000px viewport, the 12px top
    // scrollbar shrank to under a pixel. The pilot page doesn't use
    // `topScrollbar`, so this adds what it renders: the scrollbar slot (cloned
    // from the floating bar, which shares it) as the root's first child.
    await gotoPopulated(page);
    const sizes = await root(page).evaluate(el => {
      const top = el
        .querySelector('.nde-floating-scrollbar')!
        .cloneNode(true) as HTMLElement;
      top.classList.remove('nde-floating-scrollbar');
      top.removeAttribute('style');
      el.prepend(top);
      const view = el.querySelector('table')!.parentElement!;
      return {
        bounded: view.scrollHeight > view.clientHeight + 1,
        topBar: top.getBoundingClientRect().height,
        // The 1px marker below the viewport that the floating scrollbar
        // watches.
        marker: view.nextElementSibling!.getBoundingClientRect().height,
      };
    });
    expect(sizes.bounded).toBe(true);
    expect(sizes.topBar).toBe(12);
    expect(sizes.marker).toBe(1);
  });

  test('a pinned first column stays put while the rest scroll sideways', async ({
    page,
  }) => {
    await gotoPopulated(page);
    const dialog = await openCustomizer(page);
    await dialog.getByText('Pin first column').click();
    await page.keyboard.press('Escape');
    await expect(root(page)).toHaveAttribute('data-pinned', '');

    const positions = () =>
      root(page).evaluate(el => {
        const view = el.querySelector('table')!.parentElement!;
        const row = el.querySelector('tbody tr')!;
        const [first, second] = [...row.children] as HTMLElement[];
        return {
          viewLeft: view.getBoundingClientRect().left,
          first: first.getBoundingClientRect().left,
          second: second.getBoundingClientRect().left,
          shadow: getComputedStyle(first).boxShadow,
        };
      });

    const before = await positions();
    expect(before.shadow).toBe('none');
    await viewport(page).evaluate(el => (el.scrollLeft = 400));
    // The shadow marks that content is scrolled under the pinned column. It
    // follows the scroll event, so wait for it.
    await expect.poll(async () => (await positions()).shadow).not.toBe('none');
    const after = await positions();

    expect(Math.abs(after.first - after.viewLeft)).toBeLessThanOrEqual(1);
    expect(before.second - after.second).toBeGreaterThan(300);
  });

  test('columns overflow with every column shown, each at least its minimum', async ({
    page,
  }) => {
    await gotoPopulated(page);
    await expect(root(page)).toHaveAttribute('data-overflow-x', '');
    const belowMinimum = await root(page).evaluate(
      el =>
        [...el.querySelectorAll('thead th')].filter(th => {
          const inner = th.firstElementChild as HTMLElement;
          const min = parseFloat(inner.style.minWidth || '0');
          return inner.getBoundingClientRect().width + 0.5 < min;
        }).length,
    );
    expect(belowMinimum).toBe(0);
  });

  test('a few columns fill the available width instead of staying narrow', async ({
    page,
  }) => {
    await gotoPopulated(page);
    const widthsWithAll = await headerWidths(page);
    const dialog = await openCustomizer(page);
    await dialog.getByRole('button', { name: /clear all/i }).click();
    await dialog.getByText('Description', { exact: true }).click();
    await dialog.getByText('Research Domain', { exact: true }).click();
    await page.keyboard.press('Escape');

    await expect(root(page)).not.toHaveAttribute('data-overflow-x', '');
    const fill = await root(page).evaluate(el => {
      const table = el.querySelector('table')!;
      return table.offsetWidth - table.parentElement!.clientWidth;
    });
    expect(Math.abs(fill)).toBeLessThanOrEqual(1);

    const widths = await headerWidths(page);
    expect(Object.keys(widths)).toEqual([
      'Name',
      'Description',
      'Research Domain',
    ]);
    // The wrapping columns take the spare width; a column whose content
    // already fits (short research-domain tags) has no reason to grow, but
    // none gets narrower.
    expect(widths['Name']).toBeGreaterThan(widthsWithAll['Name']);
    expect(widths['Description']).toBeGreaterThan(widthsWithAll['Description']);
    for (const label of Object.keys(widths)) {
      expect(widths[label]).toBeGreaterThanOrEqual(widthsWithAll[label]);
    }
  });

  test('long tags are clamped instead of widening their column', async ({
    page,
  }) => {
    await gotoPopulated(page);
    const tag = root(page)
      .locator('.nde-tag', {
        hasText: 'Escherichia coli (strain B / BL21-DE3)',
      })
      .first();
    await scrollUntilMounted(page, tag);
    const fit = await tag.evaluate(el => ({
      clipped:
        el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth,
      column: el.closest('td')!.offsetWidth,
    }));
    // The column keeps its minimum; the tag is cut to a line, not the column
    // stretched to the tag's full length.
    expect(fit.clipped).toBe(true);
    expect(fit.column).toBeLessThan(260);
  });

  test('long URLs wrap instead of stretching their column', async ({
    page,
  }) => {
    await gotoPopulated(page);
    const widths = await headerWidths(page);
    // The fixture URL alone is ~700px wide on one line.
    expect(widths['License']).toBeLessThan(400);
  });

  test('expanding a description grows its row and keeps focus on the toggle', async ({
    page,
  }) => {
    await gotoPopulated(page);
    // Pin the row by index: a locator filtered on "Show More" would move on
    // to the next collapsed row once this one expands.
    const index = await page
      .locator('tbody tr')
      .evaluateAll(rows =>
        rows.findIndex(row =>
          /show more\s+description/i.test(row.textContent ?? ''),
        ),
      );
    const row = page.locator('tbody tr').nth(index);
    const toggle = row.getByRole('button', {
      name: /^show more description$/i,
    });
    const before = (await row.boundingBox())!.height;
    await toggle.focus();
    await page.keyboard.press('Enter');
    const expanded = row.getByRole('button', {
      name: /^show less description$/i,
    });
    await expect(expanded).toHaveAttribute('aria-expanded', 'true');
    await expect(expanded).toBeFocused();
    expect((await row.boundingBox())!.height).toBeGreaterThan(before);
  });

  test('sorting and scrolling work from the keyboard', async ({ page }) => {
    await gotoPopulated(page);
    const nameHeader = page.getByRole('columnheader', { name: /^name/i });
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    await nameHeader.getByRole('button').focus();
    await page.keyboard.press('Enter');
    await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');

    // The scrolling viewport is a named, focusable region.
    const region = page.getByRole('region', { name: TABLE_NAME });
    await region.focus();
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => viewport(page).evaluate(el => el.scrollLeft))
      .toBeGreaterThan(0);
  });
});

/*
The bottom scrollbar must be reachable wherever the table sits: either the
viewport's own scrollbar is on-screen, or the floating one is pinned to the
bottom of the window, lined up with the table. Checked at several window sizes
and at three positions: page top (table below the fold), table top at the
window top, and scrolled to the table's end.
*/
for (const size of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
]) {
  test.describe(`DataTable scrollbar reachability: ${size.width}×${size.height}`, () => {
    test.use({ viewport: size });

    test('a horizontal scrollbar is always on-screen while the table is', async ({
      page,
    }) => {
      await gotoPopulated(page);
      const positions: Record<string, () => Promise<unknown>> = {
        'page top': () => page.evaluate(() => window.scrollTo(0, 0)),
        'table at the top of the window': () => scrollTableToTop(page),
        'scrolled to the end of the table': () =>
          root(page).evaluate(el =>
            window.scrollBy(
              0,
              el.getBoundingClientRect().bottom - window.innerHeight + 40,
            ),
          ),
      };

      for (const [name, scroll] of Object.entries(positions)) {
        await scroll();
        // Let the IntersectionObserver deliver.
        await page.waitForTimeout(150);
        const state = await root(page).evaluate(el => {
          const view = el
            .querySelector('table')!
            .parentElement!.getBoundingClientRect();
          const bar = el.querySelector('.nde-floating-scrollbar')!;
          const barBox = bar.getBoundingClientRect();
          return {
            nativeOnScreen:
              view.bottom <= window.innerHeight + 1 && view.bottom > 0,
            floatingShown: getComputedStyle(bar).visibility === 'visible',
            barBottom: barBox.bottom,
            barLeft: barBox.left,
            barWidth: barBox.width,
            viewLeft: view.left,
            viewWidth: view.width,
            innerHeight: window.innerHeight,
          };
        });

        expect(state.nativeOnScreen || state.floatingShown, name).toBe(true);
        // Never both at once.
        expect(state.nativeOnScreen && state.floatingShown, name).toBe(false);
        if (state.floatingShown) {
          expect(
            Math.abs(state.barBottom - state.innerHeight),
            name,
          ).toBeLessThanOrEqual(1);
          expect(
            Math.abs(state.barLeft - state.viewLeft),
            name,
          ).toBeLessThanOrEqual(1);
          expect(
            Math.abs(state.barWidth - state.viewWidth),
            name,
          ).toBeLessThanOrEqual(1);
        }
      }
    });

    test('the floating scrollbar scrolls the table', async ({ page }) => {
      await gotoPopulated(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(root(page)).toHaveAttribute('data-floating', '');
      await root(page)
        .locator('.nde-floating-scrollbar')
        .evaluate(el => (el.scrollLeft = 300));
      await expect
        .poll(() => viewport(page).evaluate(el => el.scrollLeft))
        .toBe(300);
    });
  });
}

test.describe('DataTable layout: small screens', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the toolbar stays above the bounded table, so the page can still be swiped', async ({
    page,
  }) => {
    await gotoPopulated(page);
    await root(page).evaluate(el =>
      window.scrollBy(0, el.parentElement!.getBoundingClientRect().top),
    );
    const state = await root(page).evaluate(el => {
      const view = el.querySelector('table')!.parentElement!;
      return {
        bottomGap: window.innerHeight - el.getBoundingClientRect().bottom,
        // Page content above the table, still on screen: somewhere to swipe
        // the page rather than the table.
        toolbarAbove: el.getBoundingClientRect().top,
        innerScroll: view.scrollHeight > view.clientHeight + 1,
      };
    });
    expect(Math.abs(state.bottomGap)).toBeLessThanOrEqual(1);
    expect(state.toolbarAbove).toBeGreaterThan(80);
    expect(state.innerScroll).toBe(true);
    // Still scrolls sideways.
    await expect(root(page)).toHaveAttribute('data-overflow-x', '');
  });

  test('a saved pin is ignored, and its switch hidden', async ({ page }) => {
    await page.addInitScript(() =>
      window.localStorage.setItem(
        'nde:table:repository-matcher:v1',
        JSON.stringify({ v: 1, pinned: true }),
      ),
    );
    await gotoPopulated(page);
    await expect(root(page)).toHaveAttribute('data-pinned', '');
    const position = await root(page)
      .locator('tbody td')
      .first()
      .evaluate(el => getComputedStyle(el).position);
    expect(position).toBe('static');
    const dialog = await openCustomizer(page);
    await expect(dialog.getByText('Pin first column')).toBeHidden();
  });
});

test.describe('DataTable headers', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the whole header cell is the sort target, with matching hover and focus', async ({
    page,
  }) => {
    await gotoPopulated(page);
    const access = page.getByRole('columnheader', { name: /^access/i });
    await access.scrollIntoViewIfNeeded();
    await expect(access).not.toHaveAttribute('aria-sort');

    // Hover and click an empty corner of the cell, away from the title.
    const box = (await access.boundingBox())!;
    const corner = { x: box.x + box.width - 6, y: box.y + box.height - 4 };
    const restingBg = await access.evaluate(
      el => getComputedStyle(el).backgroundColor,
    );
    await page.mouse.move(corner.x, corner.y);
    await expect
      .poll(() => access.evaluate(el => getComputedStyle(el).backgroundColor))
      .not.toBe(restingBg);
    await page.mouse.click(corner.x, corner.y);
    await expect(access).toHaveAttribute('aria-sort', 'ascending');

    // Keyboard focus outlines the whole cell.
    await access.getByRole('button', { name: /^access$/i }).focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const ring = await access
      .getByRole('button', { name: /^access$/i })
      .evaluate(el => {
        const after = getComputedStyle(el, '::after');
        const rect = el.closest('th')!.getBoundingClientRect();
        return {
          style: after.outlineStyle,
          color: after.outlineColor,
          width: parseFloat(after.width),
          cellWidth: rect.width,
        };
      });
    expect(ring.style).toBe('solid');
    expect(ring.color).not.toMatch(/^(transparent|rgba\(0, 0, 0, 0\))$/);
    expect(Math.abs(ring.width - ring.cellWidth)).toBeLessThanOrEqual(2);
  });

  test('title and info icon sit at the start, sort arrows at the end', async ({
    page,
  }) => {
    await gotoPopulated(page);
    const layout = await page
      .getByRole('columnheader', { name: /^access/i })
      .evaluate(th => {
        const box = (el: Element) => el.getBoundingClientRect();
        const cell = box(th);
        const padding = parseFloat(getComputedStyle(th).paddingLeft);
        return {
          labelFromStart:
            box(th.querySelector('.nde-header-label')!).left - cell.left,
          infoGap:
            box(th.querySelector('.nde-header-info .tooltip-icon')!).left -
            box(th.querySelector('.nde-header-label')!).right,
          arrowsFromEnd:
            cell.right - box(th.querySelector('.nde-sort-icon')!).right,
          padding,
        };
      });
    expect(
      Math.abs(layout.labelFromStart - layout.padding),
    ).toBeLessThanOrEqual(1);
    expect(layout.infoGap).toBeGreaterThanOrEqual(0);
    expect(layout.infoGap).toBeLessThanOrEqual(8);
    expect(Math.abs(layout.arrowsFromEnd - layout.padding)).toBeLessThanOrEqual(
      1,
    );
  });

  test('the info icon shows its description on hover and keyboard focus', async ({
    page,
  }) => {
    await gotoPopulated(page);
    const access = page.getByRole('columnheader', { name: /^access/i });
    const info = access.getByRole('button', { name: 'About Access' });
    await info.scrollIntoViewIfNeeded();
    const tooltip = page
      .getByRole('tooltip')
      .filter({ hasText: /access-level definitions/i });

    await info.hover();
    await expect(tooltip).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(tooltip).toBeHidden();

    await access.getByRole('button', { name: /^access$/i }).focus();
    await page.keyboard.press('Tab');
    await expect(info).toBeFocused();
    await expect(tooltip).toBeVisible();
    await expect(access).not.toHaveAttribute('aria-sort');
  });

  test('rows highlight on hover', async ({ page }) => {
    await gotoPopulated(page);
    const cell = root(page).locator('tbody tr').nth(1).locator('td').nth(1);
    await cell.scrollIntoViewIfNeeded();
    const resting = await cell.evaluate(
      el => getComputedStyle(el).backgroundColor,
    );
    await page.waitForTimeout(300);
    await cell.hover();
    await expect
      .poll(() => cell.evaluate(el => getComputedStyle(el).backgroundColor))
      .not.toBe(resting);
  });

  test('truncated tags show their full name on hover', async ({ page }) => {
    await gotoPopulated(page);
    const full = 'Escherichia coli (strain B / BL21-DE3)';
    const tag = root(page).locator('.nde-tag', { hasText: full }).first();
    await scrollUntilMounted(page, tag);
    await tag.scrollIntoViewIfNeeded();
    // Hovers during a scroll are ignored; let it settle.
    await page.waitForTimeout(300);
    await tag.hover();
    await expect(
      page.getByRole('tooltip').filter({ hasText: full }),
    ).toBeVisible();
  });

  test('titles wrap to at most two lines and every header is vertically centred', async ({
    page,
  }) => {
    await gotoPopulated(page);
    const headers = await root(page).evaluate(el =>
      [...el.querySelectorAll('thead th')].map(th => {
        const label = th.querySelector('.nde-header-label') as HTMLElement;
        const lineHeight = parseFloat(getComputedStyle(label).lineHeight);
        const cell = th.getBoundingClientRect();
        const text = label.getBoundingClientRect();
        return {
          label: label.textContent,
          lines: Math.round(text.height / lineHeight),
          offCentre: Math.abs(
            text.top + text.height / 2 - (cell.top + cell.height / 2),
          ),
        };
      }),
    );
    expect(headers.some(h => h.lines === 2)).toBe(true);
    for (const h of headers) {
      expect(h.lines, h.label!).toBeLessThanOrEqual(2);
      expect(h.offCentre, h.label!).toBeLessThanOrEqual(1.5);
    }
  });
});

test.describe('DataTable header descriptions on touch', () => {
  test.use({ viewport: { width: 1024, height: 768 }, hasTouch: true });

  test('tapping the info icon toggles its description, without sorting', async ({
    page,
  }) => {
    await gotoPopulated(page);
    const access = page.getByRole('columnheader', { name: /^access/i });
    const info = access.getByRole('button', { name: 'About Access' });
    await info.scrollIntoViewIfNeeded();
    const tooltip = page
      .getByRole('tooltip')
      .filter({ hasText: /access-level definitions/i });

    await info.tap();
    await expect(tooltip).toBeVisible();
    await expect(access).not.toHaveAttribute('aria-sort');
    // A tap elsewhere closes it.
    await page.getByRole('heading', { level: 1 }).tap();
    await expect(tooltip).toBeHidden();
  });
});

test.describe('DataTable virtualization (the pilot table)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  /** Body rows that hold data (not the spacers). */
  const dataRows = (page: Page) =>
    root(page).locator('tbody tr[aria-rowindex]');

  test('mounts a window of rows and announces the total', async ({ page }) => {
    await gotoPopulated(page);
    const mounted = await dataRows(page).count();
    expect(mounted).toBeGreaterThan(3);
    expect(mounted).toBeLessThan(ROW_COUNT);
    await expect(root(page).locator('table')).toHaveAttribute(
      'aria-rowcount',
      String(ROW_COUNT + 1),
    );
    // Scrolled to the end, the last row is mounted.
    await viewport(page).evaluate(el => (el.scrollTop = el.scrollHeight));
    await expect(dataRows(page).last()).toHaveAttribute(
      'aria-rowindex',
      String(ROW_COUNT + 1),
    );
  });

  test('scrolling never shows a blank viewport, and the header stays stuck', async ({
    page,
  }) => {
    await gotoPopulated(page);
    await scrollTableToTop(page);
    const result = await viewport(page).evaluate(async view => {
      const frame = () => new Promise(r => requestAnimationFrame(() => r(0)));
      const box = view.getBoundingClientRect();
      // The middle of the part of the viewport inside the window.
      const y = (box.top + Math.min(box.bottom, window.innerHeight)) / 2;
      const th = view.querySelector('thead th')!;
      let blank = 0;
      let headerOffset = 0;
      let steps = 0;
      while (view.scrollTop + view.clientHeight < view.scrollHeight - 1) {
        view.scrollTop += view.clientHeight / 2;
        steps++;
        await frame();
        await frame();
        const row = document.elementFromPoint(box.left + 100, y)?.closest('tr');
        if (!row?.hasAttribute('aria-rowindex')) blank++;
        headerOffset = Math.max(
          headerOffset,
          Math.abs(th.getBoundingClientRect().top - box.top),
        );
      }
      return { blank, headerOffset, steps };
    });
    expect(result.steps).toBeGreaterThan(5);
    expect(result.blank).toBe(0);
    expect(result.headerOffset).toBeLessThanOrEqual(1);
  });

  test('zebra stripes follow each row wherever the window starts', async ({
    page,
  }) => {
    await gotoPopulated(page);
    await page.mouse.move(0, 0); // no row hover
    for (const fraction of [0.3, 0.32, 0.5, 0.55]) {
      await viewport(page).evaluate(
        (el, f) => (el.scrollTop = (el.scrollHeight - el.clientHeight) * f),
        fraction,
      );
      await page.waitForTimeout(100);
      // In the full table, rows with an odd aria-rowindex are striped.
      const colours = await dataRows(page).evaluateAll(rows =>
        rows.map(row => ({
          odd: Number(row.getAttribute('aria-rowindex')) % 2 === 1,
          bg: getComputedStyle(row.querySelector('td')!).backgroundColor,
        })),
      );
      const odd = new Set(colours.filter(c => c.odd).map(c => c.bg));
      const even = new Set(colours.filter(c => !c.odd).map(c => c.bg));
      expect(odd.size).toBe(1);
      expect(even.size).toBe(1);
      expect([...odd][0]).not.toBe([...even][0]);
    }
  });

  test('columns barely move as rows mount and unmount', async ({ page }) => {
    await gotoPopulated(page);
    const shift = await viewport(page).evaluate(async view => {
      const frame = () => new Promise(r => requestAnimationFrame(() => r(0)));
      const cells = () => [...view.querySelectorAll('thead th')];
      const first = cells().map(th => (th as HTMLElement).offsetWidth);
      let max = 0;
      while (view.scrollTop + view.clientHeight < view.scrollHeight - 1) {
        view.scrollTop += view.clientHeight / 2;
        await frame();
        await frame();
        cells().forEach((th, i) => {
          max = Math.max(
            max,
            Math.abs((th as HTMLElement).offsetWidth - first[i]),
          );
        });
      }
      return max;
    });
    // Native widths come from the mounted rows, bounded by each column's
    // min/max. 0 px on this fixture; up to 21 px (License) on production data.
    expect(shift).toBeLessThanOrEqual(8);
  });
});
