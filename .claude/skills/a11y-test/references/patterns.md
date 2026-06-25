# Accessibility spec patterns

Detailed reference for writing Playwright + axe accessibility specs. The
SKILL.md body should stay short and point here for the depth. Keep this file in
sync with `e2e/README.md` and `e2e/utils/axe.ts` if conventions change.

## The shared helpers (e2e/utils/axe)

- `analyzeA11y(page, { include? })` — runs an axe scan with `WCAG_AA_TAGS`
  (wcag2a/aa, wcag21a/aa, plus `best-practice`) and **returns the results**. It
  does not assert; the spec decides what fails. Before scanning it calls
  `waitForAnimationsSettled` so the scan sees final, opaque colors (see below).
- `waitForAnimationsSettled(page, timeout?)` — waits for in-flight CSS
  transitions and **finite** animations to finish; infinite ones (skeleton
  shimmer, spinners) are treated as settled so loading states don't hang. It is
  bounded and best-effort (scans anyway on timeout). `analyzeA11y` already calls
  it, so you rarely call it directly — only when you scan _without_ going
  through `analyzeA11y`.
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

## When a state can't be reached (SSR / getStaticProps routes)

This is a Pages Router static-export app, so some routes render data before the
browser runs and a given state is genuinely unreachable from a spec. Two rules:

- **Only client-side requests are interceptable.** `page.route` runs in the
  browser, so it can mock the client-side TanStack Query refetch but **not** a
  `getStaticProps` / `getServerSideProps` fetch — that happens in the Next dev
  server, out of reach. Always wait for text that only your mocked fixture
  renders, so you know you're scanning the mocked DOM and not the SSR seed.
- **Seeded content suppresses loading and error UI.** When a page seeds its
  state from `getStaticProps` props on first paint (e.g. `src/pages/about.tsx`),
  no skeleton renders while the client query is in flight, and an error block
  guarded by `error && !content` never shows because `content` is already
  truthy. Those states are unreachable, not skipped.

When you omit a state for these reasons, **document why in a comment at the top
of the spec** (see the state-coverage note in `about.spec.ts`) rather than
dropping it silently — a reviewer must be able to tell "unreachable" from
"forgotten".

## Favor mocked data over live data

A scan is only as trustworthy as the DOM it runs against. **Never let a state's
DOM come from the live API.** Live data is non-deterministic: the scan result
changes with whatever the API returns, the test fails when the network is down
or in CI, and — worst — it can go **green while rendering the wrong DOM**,
hiding the very content the scan was meant to cover.

Rules, in priority order:

1. **Mock every request each state depends on** with `page.route` and a fixed
   fixture. This is the default and covers most routes (client-side TanStack
   Query hooks hitting `**/query*`, `**/metadata*`, `**/api/*`).
2. **If the only data path is a server-side
   `getStaticProps`/`getServerSideProps` fetch** that `page.route` can't
   intercept, don't settle for scanning live. Prefer making the data
   client-fetchable — e.g. add a client-side `useQuery` seeded from the props
   (`placeholderData: () => props.data`) — so the refetch becomes interceptable
   and the populated/error states become deterministic and mockable.
   `program-collections.tsx` does exactly this; `about.tsx` and
   `knowledge-center` are the seed-from-props + client-refetch pattern to copy.
3. **Only if neither is possible**, scan live as a last resort and **document
   the live-data dependency** in the spec's header comment so a reviewer knows
   the scan is non-deterministic by necessity, not by oversight.

Two traps this guards against, both seen in real specs:

- **`placeholderData` false positives.** When a client query is seeded from
  `getStaticProps` props, the live seed renders on first paint and can satisfy
  your `getByRole`/`getByText` waits _before_ the mock resolves — the test goes
  green, but the screenshot shows the mock's (possibly broken) DOM, or vice
  versa. Always wait for a value that **only the mocked fixture** produces (a
  distinctive count like `"3 results."`, a fixture-only name) so you know the
  mock — not the seed — owns the scanned DOM. Attach and **eyeball the
  screenshot**: a passing test with the wrong content on screen means the wait
  matched the seed, not the mock.
- **axios encodes spaces as `+`, not `%20`.** When a mock handler matches on the
  request URL (e.g. branching the NDE `/query` endpoint on its `q` param),
  axios's default serializer turns spaces into `+`, and `decodeURIComponent`
  leaves `+` untouched. Normalize before matching:
  `decodeURIComponent(url).replace(/\+/g, ' ')`. Otherwise the match silently
  fails, the handler returns empty, and the page renders a degraded fallback
  that you then scan by mistake.

## Interaction states (menus, dropdowns, drag, inline errors)

The loading/empty/populated/error matrix scans the page **at rest**. But a11y
regressions hide most often in the transient surfaces a user _opens_ while using
a feature — combobox/select menus, predictive/autocomplete dropdowns, drag
overlays, inline validation errors, modals, popovers, expanded accordions. These
markup trees don't exist on first paint, so a resting-state scan never sees
them. For any interactive feature, add **interaction scans** on top of the
resting states. `e2e/accessibility/advanced-search.spec.ts` is the canonical
example (field-select menu, predictive dropdown, validation error, keyboard
drag-and-drop).

Rules for interaction scans:

- **One `test.describe` block per surface**, named for the interaction
  (`— field select menu`, `— predictive suggestions`, `— validation error`,
  `— drag and drop`), so the HTML report names the failing surface.
- **Reuse the same axe scans, drop the resting-layout asserts.** Extract a
  `runAxeScans(page, testInfo, state)` helper (full WCAG scan + focused
  color-contrast + button/link-name + screenshot) and have `runSharedChecks`
  call it after its `main`/`h1`/form-control assertions. Interaction scans call
  `runAxeScans` directly — an open portal can cover the page chrome and flake
  the `toBeVisible` structure/form checks, but the axe scan still covers the
  whole DOM including the open surface.
- **Drive the interaction deterministically, then wait for the surface's own
  accessible proof before scanning:** an open `option`/`listbox`, a rendered
  suggestion item, the error text, or the drag live-region announcement. Same
  rule as every state — scan the intended DOM, not the moment before it renders.
- **Mock any endpoint the interaction fires.** Predictive/autocomplete inputs
  hit the API on their own (often the same `**/query*` glob) — fulfill it with
  deterministic suggestions and wait for one to appear. A select whose options
  come from a static config fires nothing; mock defensively anyway.

Interaction-specific gotchas:

- **The Next.js dev overlay (`<nextjs-portal>`) intercepts real pointer clicks**
  while a route is still compiling, so `locator.click()` can time out
  ("`<nextjs-portal> intercepts pointer events`"). Fire the React handler
  directly with `locator.dispatchEvent('click')`, or use the keyboard, for
  clicks that only need to trigger an `onClick`.
- **react-select**: open with `getByRole('combobox', { name })` + `.click()`,
  narrow the list with `.pressSequentially('…')`, choose with
  `getByRole('option', { name })`. Its menu/options are a portal.
- **Drag-and-drop**: prefer the **keyboard** flow over pointer drags (which are
  flaky). For dnd-kit: focus the drag handle (give it an `aria-label`), press
  `Space` to pick up, then scan the "picked up" state — the `DragOverlay` clone
  plus the live-region announcement (`getByText(/picked up/i)`) are the
  screen-reader surface worth scanning. Press `Escape` to cancel afterwards.
- **Validation errors**: trigger the real validation path (submit an invalid
  value, e.g. unbalanced punctuation) and wait for the error text, rather than
  forcing error state through internals.

Interaction scans frequently surface **real** serious violations that the
resting states miss (the advanced-search interaction scans found four). When
they do, treat them like any other real violation — see the failure-threshold
section below: fix the app, or skip-and-document. Do not exclude the surface or
loosen the scan to go green.

## Waiting for the right state

Always wait for visible proof that the page is in the intended state _before_
running axe. Scanning too early scans the wrong DOM and produces misleading
passes or failures.

Prefer user-facing locators in this order: `getByRole`, `getByLabel`,
`getByText`. Reach for implementation selectors (`getByTestId`, CSS) only for
state markers with no accessible surface — a skeleton loader is the canonical
example.

You do **not** need a per-test wait for fade/transition animations. Chakra fades
many surfaces in by animating opacity 0→1 (`<Skeleton>` reveals, `<Collapse>`
expansions, mount fades), and axe computes color-contrast against the rendered,
alpha-blended colors — so a scan mid-fade composites foreground through a
still-transparent ancestor and reports a false contrast failure. `analyzeA11y`
calls `waitForAnimationsSettled` first, so this is handled centrally; don't
reintroduce ad-hoc `waitForFunction(... opacity < 1 ...)` blocks in new specs.
Still wait for a state's content proof (above) — settling animations is not the
same as waiting for the right DOM to exist.

## What every scan must do

1. Run `analyzeA11y(page)` and capture the results.
2. `attachA11yReport(testInfo, state, results.violations)`.
3. Assert `blockingViolations(results.violations)` is empty, using
   `formatViolations` as the expect message.
4. Run a focused color-contrast scan and assert the same way. There is no helper
   for this; run the single rule inline exactly as the canonical spec does:
   `new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).options({ runOnly: { type: 'rule', values: ['color-contrast'] } })`.
5. Structural sanity: a `main` landmark and a single `h1` are a reasonable
   baseline — adjust per route. (axe best-practice rules also evaluate these.)
6. Attach a full-page screenshot per state.

Put steps 1–6 in one helper function inside the spec (see the template) so each
state calls the identical checks. When the spec also has interaction states,
split the axe-only steps (1, 2, 4, 6 — full scan, contrast, button/link-name,
screenshot) into a `runAxeScans` helper and have `runSharedChecks` call it after
the resting-layout asserts (3, 5), so interaction scans can reuse the scans
without the structure/form `toBeVisible` checks. See the interaction-states
section above.

## Failure threshold

Fail only on `serious` and `critical` via `blockingViolations`. Minor/moderate
violations are attached to the report but do not fail the build by design. Do
**not** widen `BLOCKING_IMPACTS`, exclude the offending element, or skip a
violation to make a spec pass without a recorded product decision — a real
violation that is hard to fix is still a real violation.

When a scan finds a real serious/critical violation, surface it — don't bury it.
The choices, in order of preference:

1. **Fix the app** so the scan passes legitimately (best).
2. **Skip-and-document** when the fix is out of scope or needs a separate
   decision: mark that one scan `test.fixme(...)` with a comment naming the
   violation, the offending element/component, and the fix. This keeps the suite
   green while the finding stays recorded in the spec for a follow-up, instead
   of being hidden by loosening the scan.

Either way, when a decision is made to defer, **state it** — to the developer
and in the spec. A silently excluded element reads as "covered and clean" when
it is neither.

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
- **Intermittent `color-contrast` failure on an element that looks fine** —
  almost always a scan landing mid-fade: the element (or an ancestor) is still
  animating opacity 0→1, so axe sees an alpha-blended, lower-contrast color. The
  console clue is that the element's resting `getComputedStyle` color differs
  from the color axe reports. `analyzeA11y` calls `waitForAnimationsSettled` to
  prevent this, so if you still see it, you're likely scanning _without_ going
  through `analyzeA11y` (e.g. a raw `AxeBuilder`) — route that scan through the
  helper, or call `waitForAnimationsSettled(page)` first.
