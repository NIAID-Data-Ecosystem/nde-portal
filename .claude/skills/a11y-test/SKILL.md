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
`@axe-core/playwright` with the shared helpers in `e2e/utils/axe.ts`. The suite
runs against a **production static export** (`out/`) served as plain files, not
`next dev` — it's far faster (no per-route cold compile, no per-request
`getStaticProps`). `yarn test:a11y` builds the export first via `yarn build:a11y`
(which runs `next build` with the mock Strapi server up), then runs Playwright.
Use `yarn test:a11y:nobuild` to reuse an existing `out/` for fast iteration.
See `playwright.config.ts` and `e2e/README.md`.

There are two spec shapes in the suite. The template (and
`e2e/accessibility/about.spec.ts`) put every check in a single
`runSharedChecks(page, testInfo, state)` helper called once per state — **match
this shape for new specs**. `e2e/accessibility/repository-matcher.spec.ts` uses
an older shape (a `run…Tests()` group of separate `test()` blocks with per-state
`beforeEach`); read it for the fixture/route-mock patterns, but follow the
template's single-helper structure.

## Commands

```sh
yarn build:a11y                                         # build the static export (out/) once
yarn test:a11y                                          # build + run all a11y specs
yarn test:a11y:nobuild e2e/accessibility/<route>.spec.ts # run one spec against existing out/
yarn test:a11y:report                                   # open the HTML report
```

Rebuild with `yarn build:a11y` whenever you change app source (the specs run
against the built `out/`, not live source). When you only edit a spec file,
`yarn test:a11y:nobuild <spec>` is enough.

## Add a spec

1. **Copy the template** to the new spec:
   `cp .claude/skills/a11y-test/templates/route.spec.template.ts e2e/accessibility/<route-or-feature>.spec.ts`
2. **Read the route first** — its page component and data hooks — so you know
   which endpoint(s) to mock and what UI proves each state.
3. **Replace the `REPLACE_ME` placeholders**: `ROUTE`, the API glob(s), and the
   populated-state fixture.
4. **Wire up the route mock** with `page.route(glob, ...)` per state so the page
   is deterministic and never hits the live network (the canonical spec mocks
   `**/query*` and `**/metadata*`). **Always favor mocked fixtures over live
   data** — a scan against the live API is non-deterministic and produces false
   passes/failures (it can even go green while rendering the wrong DOM). For
   server-side Strapi data fetched in `getStaticProps`/`getStaticPaths` (which
   `page.route` can't intercept), the **mock Strapi server**
   (`e2e/mock-strapi-server.js`) provides deterministic fixtures at build time —
   add fixtures there if the route needs new Strapi endpoints. **New dynamic
   routes** (`/diseases/<slug>`, `/knowledge-center/<slug>`, `/features/<slug>`)
   only exist in the static `out/` if their slug is produced by `getStaticPaths`,
   so the mock fixture MUST include that slug or the nav 404s. See the "Favor
   mocked data over live data" and SSR sections of `references/patterns.md`.
5. **Wait for state-specific UI before scanning** — a user-facing `getByRole` /
   `getByText` for loaded/empty/error states; an implementation selector (e.g.
   `.custom-skeleton-loading`) only for loading markers with no accessible
   surface. Scanning too early scans the wrong DOM.
6. **Run axe** via the shared `runAxeScans(page, testInfo, state, options?)`
   helper. It does ONE axe traversal (`analyzeA11y`) and internally attaches +
   asserts the full WCAG scan plus the focused color-contrast and
   button/link-name report sections (derived by filtering that one result — no
   extra traversals) and a screenshot. Call it from each state's `describe`
   block, after your structural/form `toBeVisible` assertions. Pass
   `{ exclude }`/`{ include }` to scope the scan (e.g. `resources.spec.ts`
   excludes the third-party JSON viewer).
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
8. **Run it**: `yarn build:a11y` once, then
   `yarn test:a11y:nobuild e2e/accessibility/<route-or-feature>.spec.ts`, and
   check the HTML report. (Rebuild only when you change app source.)

Interaction scans often surface **real** serious violations the resting states
miss. Don't loosen the scan to go green — fix the app, or `test.fixme` that one
scan with a comment naming the violation and the fix (see the failure-threshold
section of `references/patterns.md`).

Available helpers (from `e2e/utils/axe.ts`, do not invent others):
`runAxeScans` (the canonical per-state scan — full WCAG + contrast +
button/link-name + screenshot, from one traversal), `analyzeA11y` (single scan,
returns results without asserting — used internally by `runAxeScans`; reach for
it directly only for a bespoke scan), `blockingViolations`, `formatViolations`,
`attachA11yReport`, `attachScreenshot`, `waitForAnimationsSettled`,
`WCAG_AA_TAGS`. Don't hand-roll separate `AxeBuilder` contrast/button-name scans
anymore — `runAxeScans` derives those sections from the single traversal.

## Detail

See `references/patterns.md` for the full state matrix (loading / empty /
populated / error), interaction states (menus / dropdowns / drag / inline
errors), the per-scan checklist, the serious/critical failure threshold, and
troubleshooting. Don't duplicate that depth here.
