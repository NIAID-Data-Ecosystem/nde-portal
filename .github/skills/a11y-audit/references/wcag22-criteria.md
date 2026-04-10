# WCAG 2.2 AA Criteria — Playwright Test Patterns

Items axe **cannot** fully detect. Add these to `e2e/accessibility.spec.ts`.

All tests use the shared `auditPage` helper already in that file and the
`WCAG_TAGS` constant. Use `page.keyboard.press('Tab')` for keyboard navigation
checks.

```ts
// Shared setup — already in e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
```

## New in WCAG 2.2

### 2.4.11 Focus Not Obscured — AA

Focused element must not be fully hidden behind the sticky `<NavigationBar>`.

```ts
test('2.4.11 focused elements not obscured by sticky nav', async ({ page }) => {
  await page.goto('/search', { waitUntil: 'networkidle' });
  const navBox = await page.locator('nav').first().boundingBox();

  // Tab through the first 20 focusable elements
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    const box = await focused.boundingBox();
    if (!box || !navBox) continue;
    // Focused element must not be completely behind the nav
    expect(box.y + box.height).toBeGreaterThan(navBox.y + navBox.height);
  }
});
```

### 2.4.12 Focus Appearance — AA

Focus indicators must be visible (axe catches some but not all).

```ts
test('2.4.12 focus ring visible on interactive elements', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');

  const focused = page.locator(':focus');
  const outline = await focused.evaluate(el =>
    window.getComputedStyle(el).getPropertyValue('box-shadow'),
  );
  // Chakra renders focus ring as box-shadow; assert it is not 'none'
  expect(outline).not.toBe('none');
});
```

### 2.5.3 Label in Name — AA

Accessible name must contain the visible text label (axe rule
`label-content-name-mismatch`). This is covered by the standard axe scan — no
extra test needed.

### 2.5.8 Target Size (Minimum) — AA

Interactive targets must be at least 24×24 CSS pixels.

```ts
test('2.5.8 icon buttons meet minimum target size', async ({ page }) => {
  await page.goto('/search', { waitUntil: 'networkidle' });

  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const box = await btn.boundingBox();
    if (!box) continue;
    // Skip buttons that are intentionally hidden/zero-size
    if (box.width === 0 && box.height === 0) continue;
    expect(box.width, `button width < 24px`).toBeGreaterThanOrEqual(24);
    expect(box.height, `button height < 24px`).toBeGreaterThanOrEqual(24);
  }
});
```

### 3.3.8 Accessible Authentication — AA

Login flow must not require a CAPTCHA with no accessible alternative.

```ts
test('3.3.8 login page has no inaccessible CAPTCHA', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'networkidle' });
  // If a CAPTCHA iframe exists, an accessible alternative must also be present
  const captcha = page.locator(
    'iframe[src*="captcha"], iframe[src*="recaptcha"]',
  );
  const count = await captcha.count();
  if (count > 0) {
    // An audio challenge or bypass link must exist
    const alternative = page.locator('[aria-label*="audio"], a[href*="audio"]');
    await expect(alternative).toBeVisible();
  }
});
```

---

## WCAG 2.1 AA — Commonly Missed (Playwright Patterns)

### 1.4.10 Reflow — AA

Content must reflow at 320px width without horizontal scrolling.

```ts
test('1.4.10 no horizontal scroll at 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 768 });
  await page.goto('/search', { waitUntil: 'networkidle' });
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  expect(scrollWidth).toBeLessThanOrEqual(320);
});
```

### 1.4.11 Non-text Contrast — AA

StatusDot colors and chart elements must have 3:1 contrast against background.
Axe covers this via the `color-contrast` rule for borders/icons — ensure the axe
scan passes on `/status` and any chart page.

### 1.4.13 Content on Hover/Focus — AA

Tooltip content must be dismissable (Escape), hoverable, and persistent.

```ts
test('1.4.13 tooltip dismissable with Escape', async ({ page }) => {
  await page.goto('/search', { waitUntil: 'networkidle' });
  // Hover a tooltip trigger
  const trigger = page
    .locator('[aria-describedby], [data-has-tooltip]')
    .first();
  await trigger.hover();
  const tooltip = page.locator('[role="tooltip"]').first();
  await expect(tooltip).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(tooltip).not.toBeVisible();
});
```

### 1.3.5 Identify Input Purpose — AA

Input fields for personal data must have `autocomplete`.

```ts
test('1.3.5 personal data inputs have autocomplete', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'networkidle' });
  const emailInputs = await page.locator('input[type="email"]').all();
  for (const input of emailInputs) {
    await expect(input).toHaveAttribute('autocomplete');
  }
});
```
