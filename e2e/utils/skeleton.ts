/**
 * Loading-skeleton markers for a11y specs.
 *
 * Skeletons have no accessible surface, so an implementation selector is the
 * only way to tell a loading DOM from a loaded one. Chakra v3's Skeleton
 * renders the same `.chakra-skeleton` element in both states, though: the
 * recipe's `loading` variant only swaps styles and sets no attribute to select
 * on. What does differ is the animation. A loaded skeleton always plays
 * `fade-in` (the recipe marks it `!important`, so no call site can override
 * it), while a loading one plays its variant's animation (`pulse` by default).
 */
import { expect, type Page } from '@playwright/test';

const SKELETON = '.chakra-skeleton';

/** Count skeletons still in their loading state, optionally only visible ones. */
export async function countLoadingSkeletons(
  page: Page,
  { visibleOnly = false } = {},
): Promise<number> {
  return page
    .locator(SKELETON)
    .evaluateAll(
      (elements, visibleOnly) =>
        elements.filter(
          el =>
            getComputedStyle(el).animationName !== 'fade-in' &&
            (!visibleOnly || el.checkVisibility()),
        ).length,
      visibleOnly,
    );
}

/** Wait until at least one loading skeleton is visible. */
export async function expectSkeletonsLoading(page: Page) {
  await expect
    .poll(() => countLoadingSkeletons(page, { visibleOnly: true }))
    .toBeGreaterThan(0);
}

/** Wait until no skeleton is still loading. */
export async function expectNoSkeletonsLoading(page: Page) {
  await expect.poll(() => countLoadingSkeletons(page)).toBe(0);
}
