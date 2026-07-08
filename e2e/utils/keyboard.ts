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
 */
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Assert a trigger can be operated by keyboard to reveal a surface: focus the
 * trigger, confirm it takes focus (so it's in the tab order), activate it with
 * `key`, and confirm the surface becomes visible.
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
}

/**
 * Assert Escape dismisses an open surface and returns focus to its trigger —
 * WCAG 2.4.3 (Focus Order) / 2.1.2 (No Keyboard Trap). Losing focus to
 * `<body>` on close is the classic dismissible-overlay failure that strands
 * keyboard and screen-reader users.
 */
export async function expectEscapeReturnsFocus(
  page: Page,
  trigger: Locator,
  surface: Locator,
) {
  await page.keyboard.press('Escape');
  await expect(surface, 'Escape should dismiss the open surface').toBeHidden();
  await expect(
    trigger,
    'focus should return to the trigger after the surface closes',
  ).toBeFocused();
}
