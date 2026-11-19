const nextJest = require('next/jest');

const esModules = [
  'bail',
  'character-entities',
  'ccount',
  'comma-separated-tokens',
  'd3-array',
  'decode-named-character-reference',
  'escape-string-regexp',
  'hast-util-from-parse5',
  'hast-util-parse-selector',
  'hast-util-raw',
  'hast-util-to-parse5',
  'hast-util-whitespace',
  'html-void-elements',
  'hastscript',
  'internmap',
  'is-plain-obj',
  'markdown-table',
  'mdast-util-.+',
  'micromark',
  'micromark-.+',
  'parse-entities',
  'property-information',
  'react-markdown',
  'rehype-raw',
  'remark-.+',
  'space-separated-tokens',
  'trim-lines',
  'trough',
  'unified',
  'unist-.+',
  'vfile',
  'vfile-location',
  'web-namespaces',
  'zwitch',
].join('|');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // One worker per core grows to ~6 GB of jsdom workers, which pushes a dev box
  // into swap; stalled workers then time out even trivial tests. Half the cores,
  // with workers recycled once bloated, peaks under ~3 GB for ~20% more time.
  maxWorkers: '50%',
  workerIdleMemoryLimit: '512MB',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: [
    '<rootDir>/e2e/',
    '<rootDir>/coverage',
    '<rootDir>/dist',
    '<rootDir>/src/__tests__/mocks/',
    '<rootDir>/src/__tests__/utils/',
    '<rootDir>/src/__tests__/validate-links.test.js',
  ],
  moduleNameMapper: {
    '^react-markdown$':
      '<rootDir>/node_modules/react-markdown/react-markdown.min.js',
    '^parse5/lib/parser/index\\.js$': require.resolve(
      'parse5/lib/parser/index.js',
    ),
  },
};

// Override transformIgnorePatterns after next/jest generates its config so its
// default node_modules exclusion does not prevent transforming the ESM allowlist.
module.exports = async () => ({
  ...(await createJestConfig(customJestConfig)()),
  transformIgnorePatterns: [`node_modules/(?!(${esModules})/)`],
});
