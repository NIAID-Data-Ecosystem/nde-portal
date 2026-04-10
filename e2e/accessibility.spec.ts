import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * WCAG 2.1/2.2 AA accessibility tests for key pages.
 *
 * These tests use axe-core via @axe-core/playwright to scan each page
 * for violations against WCAG 2.0 A, 2.0 AA, 2.1 A, 2.1 AA, and 2.2 AA rules.
 */

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Shared helper that navigates to a page and runs the axe scan. */
async function scanPage(
  page: Awaited<ReturnType<typeof test.info>['fixme']> extends never
    ? import('@playwright/test').Page
    : never,
  path: string,
) {
  // never called – overload below is the real implementation
  throw new Error('unreachable');
}

test.describe('WCAG 2.1/2.2 AA compliance', () => {
  /**
   * Helper: navigate, wait for network idle, then run axe.
   * Returns the full AxeResults so individual tests can add assertions.
   */
  async function auditPage(
    page: import('@playwright/test').Page,
    path: string,
  ) {
    await page.goto(path, { waitUntil: 'networkidle' });

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    return results;
  }

  // ── Home page ──────────────────────────────────────────────

  test('Home page has no WCAG AA violations', async ({ page }) => {
    const results = await auditPage(page, '/');
    expect(results.violations).toEqual([]);
  });

  // ── Search page ────────────────────────────────────────────

  test('Search page has no WCAG AA violations', async ({ page }) => {
    const results = await auditPage(page, '/search');
    expect(results.violations).toEqual([]);
  });

  // ── About page ─────────────────────────────────────────────

  test('About page has no WCAG AA violations', async ({ page }) => {
    const results = await auditPage(page, '/about');
    expect(results.violations).toEqual([]);
  });

  // ── Sources page ───────────────────────────────────────────

  test('Sources page has no WCAG AA violations', async ({ page }) => {
    const results = await auditPage(page, '/sources');
    expect(results.violations).toEqual([]);
  });

  // ── Resources page ─────────────────────────────────────────

  test('Resources page has no WCAG AA violations', async ({ page }) => {
    const results = await auditPage(page, '/resources');
    expect(results.violations).toEqual([]);
  });

  // ── Advanced Search page ───────────────────────────────────

  test('Advanced Search page has no WCAG AA violations', async ({ page }) => {
    const results = await auditPage(page, '/advanced-search');
    expect(results.violations).toEqual([]);
  });

  // ── 404 page ───────────────────────────────────────────────

  test('404 page has no WCAG AA violations', async ({ page }) => {
    const results = await auditPage(page, '/this-page-does-not-exist');
    expect(results.violations).toEqual([]);
  });

  // ── Disclaimer page ────────────────────────────────────────

  test('Disclaimer page has no WCAG AA violations', async ({ page }) => {
    const results = await auditPage(page, '/disclaimer');
    expect(results.violations).toEqual([]);
  });

  // ── Status page ────────────────────────────────────────────

  test('Status page has no WCAG AA violations', async ({ page }) => {
    const results = await auditPage(page, '/status');
    expect(results.violations).toEqual([]);
  });
});

test.describe('WCAG 2.1/2.2 AA - keyboard navigation', () => {
  test('main navigation is keyboard accessible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Tab into the page and verify focus reaches the skip-to-content or nav link
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() =>
      document.activeElement?.tagName.toLowerCase(),
    );
    // The first focusable element should be a link or button
    expect(['a', 'button', 'input']).toContain(focusedTag);
  });

  test('search input is focusable via keyboard', async ({ page }) => {
    await page.goto('/search', { waitUntil: 'networkidle' });

    // Tab through until we reach an input
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() =>
        document.activeElement?.tagName.toLowerCase(),
      );
      if (tag === 'input') break;
    }

    const activeTag = await page.evaluate(() =>
      document.activeElement?.tagName.toLowerCase(),
    );
    expect(activeTag).toBe('input');
  });
});

test.describe('WCAG 2.1/2.2 AA - landmark regions', () => {
  test('pages have proper landmark structure', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Verify key landmark regions exist
    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();

    const main = page.locator('main');
    // main may or may not exist depending on the page layout;
    // at minimum we check for nav
    const mainCount = await main.count();
    if (mainCount > 0) {
      await expect(main.first()).toBeVisible();
    }
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check that all img elements have alt attributes (can be empty for decorative)
    const imagesWithoutAlt = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => !img.hasAttribute('alt')).length;
    });

    expect(imagesWithoutAlt).toBe(0);
  });
});
