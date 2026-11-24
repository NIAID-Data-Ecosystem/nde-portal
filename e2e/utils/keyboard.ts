/**
 * Keyboard-operability and focus-management assertions for a11y specs.
 *
 * Why this exists: axe-core is a STATIC analyzer. It can tell you a control has
 * an accessible name and sufficient contrast, but it cannot tell you the control
 * is reachable and operable by keyboard, that opening a menu/popover moves focus
 * into it, or that closing it returns focus to the trigger. Those are the
 * WCAG 2.1.1 (Keyboard), 2.4.3 (Focus Order) and 2.1.2 (No Keyboard Trap)
 * requirements — the ones keyboard and screen-reader users actually feel, and
 * exactly the ones a resting axe scan is blind to.
 *
 * These helpers drive the real keyboard path (focus the trigger, activate it,
 * Escape to dismiss) and assert the focus outcome, so they complement — not
 * replace — the axe scan each interaction block already runs. Use them inside
 * the interaction-state `test.describe` blocks alongside `runAxeScans`.
 *
 * Keyboard tests aren't desktop-only. Tag one only when the interface it tests
 * is device-specific (see "Test tags" in e2e/README.md).
 */
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Assert a trigger can be operated by keyboard to reveal a surface: focus the
 * trigger, confirm it takes focus (so it's in the tab order), activate it with
 * `key`, and confirm the surface becomes visible and takes focus. For menus and
 * popovers, not comboboxes, whose focus stays in the input.
 *
 * Chakra buttons open menus/popovers on both Enter and Space; `Enter` is the
 * default here. Pass the exact trigger and the surface's own accessible proof
 * (an open `option`/`menuitem`/`checkbox`, the panel heading, etc.).
 */
export async function expectKeyboardOpens(
  trigger: Locator,
  surface: Locator,
  key: 'Enter' | ' ' = 'Enter',
) {
  // Some triggers stay disabled until their data loads, and `focus()` (unlike
  // `click()`) doesn't wait, so on a slower browser it can focus nothing.
  await expect(trigger, 'trigger should become enabled').toBeEnabled();
  await trigger.focus();
  await expect(
    trigger,
    'trigger should be focusable (reachable by keyboard)',
  ).toBeFocused();

  await trigger.press(key);
  await expect(
    surface,
    'activating the trigger by keyboard should reveal its surface',
  ).toBeVisible();
  // Wait until the menu or popover has focus and handles Escape. WebKit shows
  // it a few hundred ms before either, and an Escape sent earlier is lost.
  // zag, behind Chakra's overlays, starts handling Escape an animation frame
  // after opening and marks the layer with `--layer-index` when it does.
  await expect
    .poll(
      () =>
        surface.evaluate(el => {
          const layer = el.closest<HTMLElement>(
            '[role="dialog"], [role="menu"]',
          );
          return (
            !!layer &&
            layer.contains(document.activeElement) &&
            layer.style.getPropertyValue('--layer-index') !== ''
          );
        }),
      { message: 'the opened surface should take focus and handle keys' },
    )
    .toBe(true);
}

/**
 * Assert Escape dismisses an open surface and returns focus to its trigger —
 * WCAG 2.4.3 (Focus Order) / 2.1.2 (No Keyboard Trap). Losing focus to
 * `<body>` on close is the classic dismissible-overlay failure that strands
 * keyboard and screen-reader users.
 *
 * The close is checked through the trigger's `aria-expanded`, which is what
 * assistive tech reports, not through the surface. zag keeps a closed surface
 * mounted until its exit animation ends, and on a busy machine (WebKit with
 * several workers) it can miss that end, leaving the surface in the DOM at
 * opacity 0, which Playwright doesn't count as hidden.
 */
export async function expectEscapeReturnsFocus(page: Page, trigger: Locator) {
  await page.keyboard.press('Escape');
  await expect(
    trigger,
    'Escape should dismiss the open surface',
  ).toHaveAttribute('aria-expanded', 'false');
  await expect(
    trigger,
    'focus should return to the trigger after the surface closes',
  ).toBeFocused();
}
