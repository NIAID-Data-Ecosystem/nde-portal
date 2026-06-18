# Accessibility spec patterns

Detailed reference for writing Playwright + axe accessibility specs. The
SKILL.md body should stay short and point here for the depth. Keep this file in
sync with `e2e/README.md` and `e2e/utils/axe.ts` if conventions change.

## The shared helpers (e2e/utils/axe)

- `analyzeA11y(page, { include? })` — runs an axe scan with `WCAG_AA_TAGS`
  (wcag2a/aa, wcag21a/aa, plus `best-practice`) and **returns the results**. It
  does not assert; the spec decides what fails.
- `blockingViolations(violations)` — filters to serious/critical
  (`BLOCKING_IMPACTS`). Minor/moderate are reported but do not fail the build.
- `formatViolations(violations)` — readable summary; pass it as the second arg
  to `expect()` so failures print actionable context.
- `attachA11yReport(testInfo, name, violations)` — attaches JSON + text reports
  to the HTML report. Call it for every scan, passing or failing.

Because `WCAG_AA_TAGS` already includes color-contrast and the landmark /
heading-order best-practice rules, a single `analyzeA11y` scan is the backbone
of every check. The separate focused contrast scan is for clearer triage, not
because the main scan misses contrast.

## The state matrix

Accessibility regressions usually hide in states other than first paint. Cover
each applicable state in its own `test.describe` block so the HTML report names
the failing state clearly. Use `page.route` to make each state deterministic.

| State     | How to set it up                                                   | Wait for                                       |
| --------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| Loading   | Register the route handler and never fulfill it                    | A loading marker (skeleton, spinner)           |
| Empty     | Fulfill with a resolved empty payload                              | The user-facing empty-state message            |
| Populated | Fulfill with representative fixture data                           | A user-facing element that only renders w/data |
| Error     | Abort the request, or fulfill the same status the app gets in prod | The error UI (`alert` role, retry control)     |

Drop a state only when it genuinely cannot occur for the route. Be especially
reluctant to skip the error state.

## Waiting for the right state

Always wait for visible proof that the page is in the intended state _before_
running axe. Scanning too early scans the wrong DOM and produces misleading
passes or failures.

Prefer user-facing locators in this order: `getByRole`, `getByLabel`,
`getByText`. Reach for implementation selectors (`getByTestId`, CSS) only for
state markers with no accessible surface — a skeleton loader is the canonical
example.

## What every scan must do

1. Run `analyzeA11y(page)` and capture the results.
2. `attachA11yReport(testInfo, state, results.violations)`.
3. Assert `blockingViolations(results.violations)` is empty, using
   `formatViolations` as the expect message.
4. Run a focused color-contrast scan and assert the same way. There is no
   helper for this; run the single rule inline exactly as the canonical spec
   does:
   `new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).options({ runOnly: { type: 'rule', values: ['color-contrast'] } })`.
5. Structural sanity: a `main` landmark and a single `h1` are a reasonable
   baseline — adjust per route. (axe best-practice rules also evaluate these.)
6. Attach a full-page screenshot per state.

Put steps 1–6 in one helper function inside the spec (see the template) so each
state calls the identical checks.

## Failure threshold

Fail only on `serious` and `critical` via `blockingViolations`. Minor/moderate
violations are attached to the report but do not fail the build by design. Do
**not** widen `BLOCKING_IMPACTS` or skip a violation to make a spec pass without
a recorded product decision — a real violation that is hard to fix is still a
real violation.

## Screenshots

Attach a full-page screenshot per state with `testInfo.attach`. Name it after
the state (`loading-screenshot`, `empty-screenshot`, ...) so the HTML report is
reviewable and proves the scan ran against the intended state.

## Running and inspecting

- All specs: `yarn test:a11y`
- One spec: `yarn test:a11y e2e/accessibility/<spec>.spec.ts`
- HTML report: `yarn test:a11y:report`

No build step is needed; Playwright starts `next dev` from
`playwright.config.ts` and reuses an already-running local server outside CI.

## Troubleshooting

- **"web server exited early"** — rerun the same command. If the port can't
  bind, run in an environment that allows local dev servers.
- **Screenshot shows the wrong state** — tighten the wait. Usually the fix is
  waiting for a state-specific accessible element, or adjusting the mocked
  response so the app can actually leave loading.
- **Flaky populated state** — make sure the fixture is fully resolved JSON and
  that the wait targets an element that only exists once data renders, not a
  container that mounts immediately.
