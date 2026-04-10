---
name: a11y-audit
description:
  'Audit and improve accessibility in the NDE Portal to WCAG 2.1/2.2 AA
  compliance. Use when: adding accessibility tests, fixing a11y violations,
  checking WCAG compliance, writing a11y test files, running axe audits,
  reviewing aria labels, color contrast, keyboard navigation, focus management,
  or screen reader support.'
argument-hint:
  'Component name, folder, or "all" to audit every untested component'
---

# A11y Audit — WCAG 2.1 / 2.2 AA

## When to Use

- Adding `*.a11y.test.tsx` files to a component that doesn't have one
- Chasing down failing axe violations after running `yarn test:a11y`
- Checking a new component meets WCAG before it ships
- Fixing keyboard navigation, focus management, color contrast, or ARIA issues

## Testing Infrastructure

| Utility                         | File                           | Use                                   |
| ------------------------------- | ------------------------------ | ------------------------------------- |
| `checkA11y(ui)`                 | `src/__tests__/a11y-utils.tsx` | Renders with all providers + runs axe |
| `checkContainerA11y(container)` | `src/__tests__/a11y-utils.tsx` | Axe on a pre-rendered container       |
| `yarn test:a11y`                | —                              | Run all `*.a11y.test.*` files         |
| `yarn test:e2e:a11y`            | `e2e/accessibility.spec.ts`    | Full-page Playwright + axe scan       |

Both utilities run axe with tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`,
`wcag22aa`.

## Procedure

### Step 1 — Find Gaps

List all component folders that have no `*.a11y.test.*` file:

```bash
for dir in src/components/*/; do
  name=$(basename "$dir")
  if ! find "$dir" -name "*.a11y.test.*" | grep -q .; then
    echo "MISSING: $name"
  fi
done
```

Prioritise in this order:

1. **Status / visualisation components** — color-only indicators, charts, uptime
   bars (high risk for color contrast + non-text contrast)
2. **Interactive components** — buttons, inputs, selects, modals, dropdowns
3. **Navigation and layout** — nav bar, page container, footer
4. **Content components** — badges, tooltips, metadata displays

### Step 2 — Read the Component

Before writing a test:

- Identify all interactive elements and their states (default, hover, disabled,
  error)
- Check if it has external dependencies to mock (hooks, router, context)
- Note any dynamic content (loading states, conditional rendering)

### Step 3 — Write the Test File

Name: `<component-name>.a11y.test.tsx` inside the component folder.

```tsx
import React from 'react';
import { checkA11y } from 'src/__tests__/a11y-utils';
import { MyComponent } from './index';

// Mock any hooks the component calls
jest.mock('src/hooks/useMyHook', () => ({
  useMyHook: () => ({ data: null, isLoading: false }),
}));

describe('MyComponent accessibility', () => {
  it('has no WCAG AA violations in default state', async () => {
    await checkA11y(<MyComponent />);
  });

  it('has no WCAG AA violations in loading state', async () => {
    await checkA11y(<MyComponent isLoading />);
  });

  it('has no WCAG AA violations in error state', async () => {
    await checkA11y(<MyComponent error='Something went wrong' />);
  });
});
```

Use `checkContainerA11y` when the component needs custom setup before the axe
check (e.g., user interactions with `userEvent`).

### Step 4 — Run and Triage

```bash
yarn test:a11y
# or for one file:
yarn test:a11y --testPathPattern=my-component
```

For each failure, axe reports:

- `id` — rule ID (e.g., `color-contrast`, `label`, `button-name`)
- `impact` — `critical`, `serious`, `moderate`, `minor`
- `nodes` — exact HTML where it failed

Fix `critical` and `serious` first. See
[common-fixes.md](./references/common-fixes.md) for patterns specific to this
codebase.

### Step 5 — Automate WCAG 2.2 Specifics via Playwright

axe does not cover all WCAG 2.2 criteria. Add Playwright tests to
`e2e/accessibility.spec.ts` for the relevant criteria in
[wcag22-criteria.md](./references/wcag22-criteria.md). Each criterion has a
ready-to-use test pattern:

- **Focus not obscured (2.4.11)** — Tab through the page, assert no focused
  element is hidden behind the sticky nav
- **Target size (2.5.8)** — Query small interactive elements and assert bounding
  box ≥ 24×24px
- **Focus appearance (2.4.12)** — Assert focused elements have a visible outline
- **Accessible auth (3.3.8)** — Assert login page has no CAPTCHA without
  alternative

See [wcag22-criteria.md](./references/wcag22-criteria.md) for the full patterns.

### Step 6 — Confirm

```bash
yarn test:a11y                  # all unit a11y tests pass
yarn test:e2e:a11y              # Playwright WCAG 2.2 + full-page axe scans pass
yarn typecheck                  # no TS errors from changes
```

## Key Rules

- **Never suppress axe rules** with `disabledRules` unless you document exactly
  why it's a false positive
- **Color-only status** — `StatusDot` and similar components must pair color
  with text or an `aria-label`
- **Icon buttons** — React Icons (`FiX`, `FiChevronDown`, etc.) render `<svg>`
  with no text; always add `aria-label` to the wrapping button
- **Collapse/Disclosure** — Chakra's `useDisclosure` toggles must link trigger
  to content via `aria-controls` + `aria-expanded`
- **Dynamic content** — regions that update (search results, error messages)
  should use `aria-live`
- **Focus management** — after a modal/drawer opens, focus must move inside it;
  after close, return to the trigger
