---
name: a11y-test
description: >-
  Use when a developer asks to add, create, write, or update accessibility
  tests, a11y specs, or axe scans for a route, page, or feature in this project.
  Covers Playwright + @axe-core/playwright WCAG accessibility specs under
  e2e/accessibility. Triggers on "add a11y tests", "axe scan for <route>",
  "accessibility test for <page>", "write an a11y spec". Not for Jest unit tests
  or non-accessibility e2e.
---

# Writing Playwright + axe accessibility specs

This project's a11y specs live in `e2e/accessibility/*.spec.ts` and use
`@axe-core/playwright` with the shared helpers in `e2e/utils/axe.ts`. Playwright
boots `next dev` itself (see `playwright.config.ts`) — no build step needed.

There are two spec shapes in the suite. The template (and
`e2e/accessibility/about.spec.ts`) put every check in a single
`runSharedChecks(page, testInfo, state)` helper called once per state — **match
this shape for new specs**. `e2e/accessibility/repository-matcher.spec.ts` uses
an older shape (a `run…Tests()` group of separate `test()` blocks with per-state
`beforeEach`); read it for the fixture/route-mock patterns, but follow the
template's single-helper structure.

## Commands

```sh
yarn test:a11y                                          # run all a11y specs
yarn test:a11y e2e/accessibility/<route>.spec.ts        # run one spec
yarn test:a11y:report                                   # open the HTML report
```

## Add a spec

1. **Copy the template** to the new spec:
   `cp .claude/skills/a11y-test/templates/route.spec.template.ts e2e/accessibility/<route-or-feature>.spec.ts`
2. **Read the route first** — its page component and data hooks — so you know
   which endpoint(s) to mock and what UI proves each state.
3. **Replace the `REPLACE_ME` placeholders**: `ROUTE`, the API glob(s), and the
   populated-state fixture.
4. **Wire up the route mock** with `page.route(glob, ...)` per state so the page
   is deterministic and never hits the live network (the canonical spec mocks
   `**/query*` and `**/metadata*`).
5. **Wait for state-specific UI before scanning** — a user-facing `getByRole` /
   `getByText` for loaded/empty/error states; an implementation selector (e.g.
   `.custom-skeleton-loading`) only for loading markers with no accessible
   surface. Scanning too early scans the wrong DOM.
6. **Run axe** via the shared helper: `analyzeA11y(page)` returns results (it
   does not assert), `attachA11yReport(testInfo, state, results.violations)`,
   then assert `blockingViolations(results.violations)` is `[]` using
   `formatViolations` as the expect message. Add the focused color-contrast scan
   the same way. Keep these in one helper called from each state's describe
   block.
7. **Scan interaction states too, not just the page at rest.** For any
   interactive feature, add a `test.describe` block per transient surface a user
   opens — select/combobox menus, predictive/autocomplete dropdowns, drag
   overlays, inline validation errors, modals. These markup trees don't exist on
   first paint, so the resting-state scans never see them, and they're where a11y
   regressions hide. Drive the interaction, wait for the surface's accessible
   proof, then run the same axe scans. See the interaction-states section of
   `references/patterns.md` for the per-surface recipes and gotchas (the
   `<nextjs-portal>` click-interception workaround, react-select, keyboard
   drag-and-drop). `advanced-search.spec.ts` is the canonical example.
8. **Run it**: `yarn test:a11y e2e/accessibility/<route-or-feature>.spec.ts`,
   then check the HTML report.

Interaction scans often surface **real** serious violations the resting states
miss. Don't loosen the scan to go green — fix the app, or `test.fixme` that one
scan with a comment naming the violation and the fix (see the failure-threshold
section of `references/patterns.md`).

Available helpers (from `e2e/utils/axe.ts`, do not invent others):
`analyzeA11y`, `blockingViolations`, `formatViolations`, `attachA11yReport`,
`WCAG_AA_TAGS`. There is no color-contrast wrapper — run that rule inline.

## Detail

See `references/patterns.md` for the full state matrix (loading / empty /
populated / error), interaction states (menus / dropdowns / drag / inline
errors), the per-scan checklist, the serious/critical failure threshold, and
troubleshooting. Don't duplicate that depth here.
