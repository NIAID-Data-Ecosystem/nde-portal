/**
 * Viewport-aware helpers, so a spec runs under every Playwright project,
 * including the phone-sized `mobile-chrome` and `mobile-safari`.
 *
 * Some UI is only shown above a breakpoint (desktop sidebars), and some is
 * collapsed on phones (SearchInput's toggle). Use these helpers instead of
 * asserting the desktop layout unconditionally.
 */
import { expect, type Locator, type Page } from '@playwright/test';

import { breakpoints } from '../../src/theme/tokens/breakpoints';

type Breakpoint = Exclude<keyof typeof breakpoints, 'base'>;

/**
 * Whether the page is at least as wide as a theme breakpoint, i.e. whether a
 * Chakra `{ [breakpoint]: … }` style applies. Use it to assert UI the app
 * hides below that width only where it is shown.
 */
export async function isAtLeast(
  page: Page,
  breakpoint: Breakpoint,
): Promise<boolean> {
  return page.evaluate(
    query => window.matchMedia(query).matches,
    `(min-width: ${breakpoints[breakpoint]})`,
  );
}

/**
 * Return a SearchInput's textbox once it is visible. Below `sm`, SearchInput
 * hides the input behind an "Open search input" toggle, so tap it first, as a
 * phone user would.
 *
 * The tap is retried because the static export renders the toggle before React
 * hydrates, and a tap before then does nothing.
 */
export async function openSearchInput(
  page: Page,
  name: string | RegExp,
): Promise<Locator> {
  const textbox = page.getByRole('textbox', { name, includeHidden: true });
  const toggle = page
    .locator('form', { has: textbox })
    .getByRole('button', { name: 'Open search input' });

  await expect(async () => {
    if (!(await textbox.isVisible())) await toggle.click({ timeout: 2_000 });
    await expect(textbox).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });

  return textbox;
}
