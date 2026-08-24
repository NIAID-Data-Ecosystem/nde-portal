/**
 * lint-staged runs on staged files via the Husky pre-commit hook
 * (.husky/pre-commit). Committed so every clone gets the same pre-commit
 * behaviour after `yarn install` (the `prepare` script installs the hooks).
 *
 * This is a `.js` config rather than the JSON one it replaces so that it can
 * carry comments — note that a stray `.lintstagedrc` would take precedence
 * over this file, so don't re-add one.
 */
module.exports = {
  '**/*.{ts,tsx,js,jsx}': [
    'prettier --write',

    // TODO: enable once the existing lint backlog is cleared (`yarn lint:fix`
    // clears the auto-fixable import-sort errors; a handful of react/jsx-key
    // and react/jsx-no-undef errors need hand-fixing). Once uncommented, each
    // commit auto-fixes what it can in the staged files and fails the commit
    // on anything left over. `--max-warnings=0` keeps react-hooks/exhaustive-
    // deps warnings from silently accumulating.
    // 'eslint --fix --max-warnings=0',
  ],
};
