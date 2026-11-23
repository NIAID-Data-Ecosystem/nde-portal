# End-to-end and accessibility tests

This directory contains Playwright tests. The current suite focuses on
accessibility checks powered by `@axe-core/playwright`, plus a regression check
for our Content Security Policy (see [CSP check](#csp-check)) and a broken-link
check (see [Link check](#link-check)).

## Running tests

Run all Playwright accessibility tests:

```sh
yarn test:a11y
```

Run one spec:

```sh
yarn test:a11y:nobuild e2e/accessibility/repository-matcher.spec.ts
```

Open the Playwright HTML report after a run:

```sh
yarn test:a11y:report
```

These tests run against a **production static export** (`out/`) served as plain
files — not `next dev`. A prebuilt export is far faster: `next dev`
cold-compiles each route on first hit and re-runs `getStaticProps` on every
request, while the export serves instantly with no server-side work at runtime.
All meaningful states are still driven client-side via `page.route`, which is
unaffected by how the HTML was produced.

- `yarn test:a11y` first runs `yarn build:a11y` (builds `out/` with the mock
  Strapi server up), then `playwright test`. This is what CI runs.
- `yarn test:a11y:nobuild` skips the build and reuses the existing `out/` — use
  it for fast local iteration after you've built once. Rebuild with
  `yarn build:a11y` whenever you change app source.

Playwright serves `out/` with `serve` and boots the mock Strapi server, per
`playwright.config.ts`. Outside CI it reuses a server already on the port.

> **Dynamic routes must exist in `out/`.** Because the app is a static export
> with `fallback: false`, only routes generated at build time exist. A spec that
> navigates to `/diseases/<slug>` or `/knowledge-center/<slug>` requires that
> slug to be produced by `getStaticPaths` — which is fed by the mock Strapi
> fixtures. If you add a spec for a new dynamic route, add its slug to
> `e2e/mock-strapi-server.js` or the build won't emit the page and the nav 404s.

## Accessibility test pattern

Accessibility specs should test meaningful page states, not only the first
paint. For data-driven routes, use Playwright route mocks to make states
deterministic:

- loading state: keep the relevant API request pending
- empty state: fulfill the API request with a resolved empty payload
- populated state: fulfill the API request with representative fixture data
- error state: fulfill or abort the API request in the same way the app handles
  production failures

Each state should wait for visible UI that proves the page is in the intended
state before running axe. Prefer user-facing locators such as roles, labels, and
text. Use implementation selectors only for state markers that have no
accessible surface, such as skeleton loading elements (use the helpers in
`e2e/utils/skeleton.ts`; Chakra v3 skeletons carry no loading class).

For shared checks, put common axe and structural assertions in a helper function
inside the spec. Keep state setup in separate `test.describe` blocks so the HTML
report clearly names the state that failed.

## What to check

At minimum, accessibility coverage should include:

- a full-page WCAG A/AA scan with `analyzeA11y`
- a focused color-contrast scan
- landmark and heading sanity checks
- important form controls with accessible names
- button and link accessible-name checks

Attach screenshots for each state with `testInfo.attach`. These make the HTML
report much easier to review when a test fails or when validating that a scan
ran against the intended state.

## When a scan fails

A failing scan means axe found a `serious`/`critical` violation. **The default
is to fix the app, not the test** — the scan is reporting something real users
hit.

1. Open the HTML report (`yarn test:a11y:report`). Each failure names the rule
   id, a `helpUrl` explaining the fix, and the exact DOM node(s).
2. Fix the source. Most common cases:
   - **color-contrast** — bump the token/shade until it meets 4.5:1 (3:1 for
     large text).
   - **button-name / link-name** — add visible text, `aria-label`, or a `title`
     on icon-only controls.
   - **heading-order / landmark** — fix the heading level jump or wrap content
     in the right landmark.
3. Rebuild (`yarn build:a11y`) and re-run the spec.

**Do not make a scan pass by loosening it.** Never delete an assertion, raise
the impact threshold, or broaden an `exclude` to hide a real issue.

Legitimate escape hatches, in order of preference:

- **Third-party markup you don't own** (embedded widget, external iframe): scope
  it out with `analyzeA11y(page, { exclude: '<selector>' })` and leave a comment
  saying why.
- **Real issue you can't fix right now**: defer it explicitly with `test.fixme`
  (see below) — never silently skip or loosen.

If the failure is a **false positive from a mid-animation frame** (e.g. contrast
measured while a panel fades in), that's already handled by
`waitForAnimationsSettled` in `analyzeA11y` — check you're scanning through the
shared helpers before treating it as flaky.

### Deferring a violation with `test.fixme`

When you (or the `a11y-test` skill) hit a real serious/critical violation that's
out of scope to fix now, you can **choose to defer it**. This is a deliberate
decision, not a default.

To defer, mark that one scan (not the whole file) with `test.fixme`, naming the
violation and linking a follow-up issue:

```ts
// FIXME(a11y): color-contrast on the filter chips — see NDE-1234
test.fixme(true, 'a11y: filter-chip contrast below 4.5:1 — see NDE-1234');
```

This keeps the suite green while the finding stays visible as
skipped-with-reason in the HTML report, instead of being hidden by deleting the
assertion. Prefer `test.fixme` over commenting the test out — a commented test
disappears; a `fixme` stays as tracked debt.

**Closing the loop is required.** A `fixme` scan does not run, so it protects
nothing until you remove it. When the underlying issue is fixed:

1. Delete the `test.fixme(...)` line (and its `FIXME(a11y)` comment).
2. Rebuild (`yarn build:a11y`) and re-run the spec to confirm it now passes.
3. Close the linked issue.

Grep for `test.fixme` / `FIXME(a11y)` before finishing a11y work so no deferred
scan is left disabled by accident.

## Creating a new accessibility spec

1. Add the spec under `e2e/accessibility/<route-or-feature>.spec.ts`.
2. Import the shared axe helpers from `e2e/utils/axe`.
3. Mock external API calls with `page.route` so tests do not depend on live
   services.
4. Navigate with `page.goto(route, { waitUntil: 'domcontentloaded' })`.
5. Wait for the specific state you intend to scan.
6. Run axe and fail only on serious or critical violations unless the test has a
   narrower purpose.
7. Run the spec locally and inspect the HTML report when adding or changing
   screenshots.

## Sample Claude/Codex prompt

Use this prompt when asking an AI coding assistant to add a new accessibility
spec:

```text
Add Playwright + axe accessibility tests for <route or feature>.

Please follow the existing e2e/accessibility patterns:
- read the route and its data hooks first
- mock external API calls with deterministic Playwright route fixtures
- test loading, empty, populated, and any important error/permission states
- wait for visible proof of each state before running axe
- reuse e2e/utils/axe helpers
- attach a screenshot for each state in the HTML report
- include role/label assertions for key forms, buttons, links, headings, and landmarks
- run the new spec with yarn test:a11y:nobuild <spec path> (after yarn build:a11y)

Do not rely on live network data, and do not loosen axe failures unless there is
a documented product decision.
```

## Mock Strapi server

Some routes fetch data from Strapi CMS in `getStaticProps`/`getStaticPaths`
(server-side), which `page.route` cannot intercept. A lightweight mock Strapi
server (`e2e/mock-strapi-server.js`) serves deterministic fixture responses for
those endpoints.

Because the app is a static export, `getStaticProps`/`getStaticPaths` run **at
build time**. `yarn build:a11y` (scripts/build-a11y.mjs) starts the mock server,
runs `next build` with `NEXT_PUBLIC_STRAPI_API_URL` pointed at it, then stops
it. `NEXT_PUBLIC_*` is inlined at build time, so that URL is baked into `out/`;
the mock server is therefore also started by Playwright's `webServer` at test
time so any client-side Strapi call a spec does not `page.route` still resolves.

The mock server listens on port 1337 by default (configurable via
`MOCK_STRAPI_PORT`); set `MOCK_STRAPI_DEBUG=1` to log each request. Specs that
test routes with client-side Strapi refetches should still add `page.route`
interceptions to cover the browser-side `useQuery` calls, and dynamic-route
specs depend on the fixture slugs (see the note under "Running tests").

## CSP check

`e2e/csp/csp.spec.ts` loads key routes under the staging policy from
`configs/csp.json` and fails on any `securitypolicyviolation`. It also checks
that GTM loads through `public/gtm-init.js`.

```sh
yarn build:a11y
yarn test:a11y:nobuild e2e/csp/csp.spec.ts
```

- CloudFront applies the policy. `configs/csp.json` holds the text;
  `yarn csp:print <production|staging|dev>` prints the header value.
- A failure lists `directive` and `blockedURI`. Fix the code, or add the exact
  source to `configs/csp.json` and state why in the PR.
- The inline script in `_document` is allowed by hash. After editing
  `WELCOME_PENDING_SCRIPT`, `welcome-pending.test.ts` prints the new hash.
- Deployed site (uses its real header, including report-only):
  `PLAYWRIGHT_BASE_URL=https://data-staging.niaid.nih.gov npx playwright test e2e/csp/csp.spec.ts --workers=1`.
  Add `--grep-invert GTM` where no GTM container is configured (dev).

## Link check

`e2e/links/broken-links.spec.ts` loads the main routes and every knowledge
center, features and diseases page they link to, then requests each unique link
once. It has its own config (`playwright.links.config.ts`) and isn't part of
`yarn test:a11y`, because it needs real CMS content and live third-party sites.

```sh
# Deployed site (most realistic; about 6 minutes):
PLAYWRIGHT_BASE_URL=https://data-staging.niaid.nih.gov yarn test:links

# A server already on :3000 (e.g. `yarn dev`), or else `out/` is served:
yarn test:links
yarn test:links:report
```

- Don't serve an `out/` built by `yarn build:a11y`: its pages hold mock Strapi
  content, so real CMS pages 404. Use `yarn build` or `yarn build:staging`.
- **Broken** links fail the test: internal links that return 400 or above, and
  external links that return 404/410 or whose host doesn't resolve.
- **Unverified** links are listed but don't fail: other 4xx/5xx, timeouts and
  TLS errors. These are usually bot protection, not dead links. For example,
  `www.niaid.nih.gov` answers 405 even to a real browser. Check them by hand.
- Every result is in `test-results/broken-links-no-broken-links/links.json`.
- Set `SLACK_WEBHOOK_URL` to post broken links to Slack.
- GitHub commit links (the changelog has hundreds) aren't checked.
- In CI, `.github/workflows/link_check.yml` checks production every Monday and
  posts broken links to Slack. It doesn't run on deploys, so it never blocks
  one. To run it by hand, open the Actions tab and choose **Run workflow**
  (`base_url` picks another site, such as staging). The report is saved as the
  run's `link-check-report` artifact.

## Troubleshooting

If Playwright says the web server exited early, try running the same command
again. If port binding is blocked by your environment, run the test in an
environment that allows local dev servers.

If the screenshot shows the wrong state, add or tighten the setup wait. The fix
is usually to wait for a state-specific accessible element or to adjust the
mocked response so the app can leave loading.
