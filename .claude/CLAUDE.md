# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The NIAID Data Ecosystem (NDE) Portal — a discovery platform to find NIAID-related datasets and tools. It is a Next.js **Pages Router** app that builds to a **static export** (`output: 'export'` in `next.config.js`), so there is no Node server at runtime: all data comes from client-side calls to the NDE API and a Strapi CMS.

## Commands

```sh
yarn dev                                   # dev server on 0.0.0.0:3000
yarn build                                 # prod build (uses .env.production via env-cmd)
yarn build:staging | build:dev            # build against other env files
yarn lint                                  # next lint
yarn typecheck                             # tsc --noEmit
yarn test                                  # Jest unit tests (jsdom)
yarn test path/to/file.test.tsx            # single Jest test file
yarn test -t "name of test"                # single Jest test by name
yarn test:a11y                             # Playwright + axe accessibility e2e
yarn test:a11y e2e/accessibility/x.spec.ts # single a11y spec
yarn test:a11y:ui                          # Playwright UI mode
yarn test:a11y:report                      # open last Playwright HTML report
```

`yarn build` is **not** just `next build`. `build:core` first runs `generate-footer-content` and `generate-metadata-completeness-fields`, which fetch live data (GitHub branch info, API metadata) and write into `configs/`. A plain `next build` can produce stale/missing footer and metadata config.

Other generators in `scripts/` are run manually, not as part of build: `generate-schema-definitions`, `generate-dataset-sitemaps`.

## Environment

Env is managed with `env-cmd` and multiple files (`.env.local`, `.env.dev`, `.env.staging`, `.env.production`). See `.env.example` for the full list. Key vars: `NEXT_PUBLIC_API_URL` (NDE API), `NEXT_PUBLIC_STRAPI_API_URL` (CMS), `NEXT_PUBLIC_APP_ENV`, `BASE_URL`, `GH_API_KEY` (needed in dev for the sources page). Mock auth in dev is controlled by `NEXT_PUBLIC_MOCK_AUTH_*` vars.

## Architecture

**`src/pages/`** — thin Next.js Pages Router route entries. Each page wires up providers/SEO via `PageContainer` and delegates almost all logic to a matching feature module in `src/views/`.

**`src/views/`** — page-level feature modules (`search`, `repository-matcher`, `ontology-browser`, `diseases`, `sources`, etc.). A view owns everything specific to that feature and is the place most feature work happens. The canonical example, `src/views/search/`, is structured as:
- `components/` — feature-only UI (filters, results lists, summary viz, tabs)
- `config/` — static config (`defaultQuery.ts`, `tabs.ts`, `fields.ts`)
- `context/` — React context providers (pagination, tabs, fetch state)
- `hooks/` — feature data hooks built on TanStack Query
- `utils/`, `types.tsx`

**`src/components/`** — cross-feature reusable components (navigation bar, footer, table, badges, search bar, visualizations, etc.). If something is used by more than one view, it belongs here, not in a view.

**Data fetching.** `src/utils/api/` holds the typed API client (axios) for the NDE `/query` API — `index.ts` (fetch functions + `Params`), `types.ts` (`FormattedResource`, response types), `helpers.ts` (response formatting). React data hooks live in `src/hooks/api/` (app-wide) and in each view's `hooks/` (feature-specific), all wrapping `@tanstack/react-query`. A single `QueryClient` is created in `src/pages/_app.tsx`.

**Theming.** Chakra UI v2 + Emotion. The theme lives in `src/theme/` (`foundations/`, `components/`, `styles.ts`). Providers (`ChakraProvider`, `QueryClientProvider`, `AuthProvider`) are all set up in `_app.tsx`.

**Auth.** `AuthProvider` from `src/hooks/useAuth`; auth utilities in `src/utils/auth/`. Login is gated behind feature flags and supports a dev-only mock mode (see env vars above).

**Feature flags.** `src/utils/feature-flags/index.ts` gates unreleased features, mostly via `isProd = NEXT_PUBLIC_APP_ENV === 'production'` (e.g. `SHOW_SAMPLES_TAB`, `ENABLE_AUTH`, `SHOULD_HIDE_SAMPLE_FIELDS`). When adding an unfinished feature, gate it here rather than commenting code out.

**Content.** `configs/*.json` holds site/page config (some generated at build time — see above). MDX/markdown content is supported via `@next/mdx` and `raw-loader` (`.md` files import as raw strings).

## Path aliases

Import from `src` as an absolute root: `import { fetchSearchResults } from 'src/utils/api'`. Configured by `tsconfig.json` `paths` and Jest `moduleDirectories`.

## Testing notes

- **Jest** (`jest.config.js`) runs unit/component tests in jsdom. It explicitly ignores `e2e/`. MSW (`msw`) and `next-router-mock` are available for mocking. Tests live next to source (`*.test.ts(x)`) or under `src/__tests__/`. The `transformIgnorePatterns` allowlist exists because several ESM markdown deps (`react-markdown`, `remark-*`, `micromark`, etc.) must be transformed — add to that list if a new ESM dep breaks Jest.
- **Playwright + axe** (`playwright.config.ts`, `e2e/`) runs accessibility scans against rendered routes; it boots `next dev` itself (no manual server needed). Shared helpers are in `e2e/utils/axe.ts` (`analyzeA11y`, `blockingViolations`). Only `serious`/`critical` impacts fail the build. **Read `e2e/README.md` before adding a11y specs** — it documents the required loading/empty/populated/error state pattern with `page.route` mocks. There is also an `a11y-test` skill for this.

## Commits & releases

Conventional Commits are enforced by commitlint (`commitlint.config.js`); subject-case restrictions apply. Husky runs `lint-staged` (Prettier) on pre-commit and validates the message on commit-msg. Releases use `standard-version` (`yarn release[:patch|:minor|:major]`), which updates `CHANGELOG.md` from commit types per `.versionrc`.
