# nde-portal

Discovery platform to find NIAID-related datasets and tools.

## Development

To run locally, clone the repo and run:

```sh
yarn install
yarn run dev
```

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
