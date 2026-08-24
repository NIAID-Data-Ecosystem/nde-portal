# nde-portal

Discovery platform to find NIAID-related datasets and tools.

## Development

To run locally, clone the repo and run:

```sh
yarn install
yarn run dev
```

## Linting & formatting

ESLint (flat config, `eslint.config.mjs`) and Prettier (`.prettierrc`) are both
checked in, so every clone lints identically — no per-machine setup beyond
`yarn install`:

```sh
yarn lint       # report problems
yarn lint:fix   # apply auto-fixes (e.g. simple-import-sort)
```

`yarn install` also runs `prepare` → `husky install`, which wires up the Git
hooks in `.husky/`: `pre-commit` runs `lint-staged` (see `.lintstagedrc.js`) and
`commit-msg` runs commitlint.

In VS Code, install the recommended extensions when prompted (see
`.vscode/extensions.json`) — `dbaeumer.vscode-eslint` and
`esbenp.prettier-vscode`. The committed `.vscode/settings.json` formats with
Prettier on save and applies ESLint fixes, matching the CLI. Without those
extensions those settings do nothing.

## Testing

Unit tests run with Jest:

```sh
yarn test
```

Accessibility end-to-end tests run with Playwright and axe:

```sh
yarn test:a11y
```

See [e2e/README.md](e2e/README.md) for how to run the accessibility tests, add
new route coverage, and use a sample Claude/Codex prompt for creating tests.
