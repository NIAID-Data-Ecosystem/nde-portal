const nextJest = require('next/jest');

const esModules = [
  'bail',
  'ccount',
  'comma-separated-tokens',
  'd3-array',
  'decode-named-character-reference',
  'escape-string-regexp',
  'hast-util-.+',
  'hastscript',
  'html-void-elements',
  'internmap',
  'is-plain-obj',
  'markdown-table',
  'mdast-util-.+',
  'micromark(-.+)?',
  'property-information',
  'react-markdown',
  'rehype-raw',
  'remark-.+',
  'space-separated-tokens',
  'trim-lines',
  'trough',
  'unified',
  'unist-.+',
  'vfile(-.+)?',
  'web-namespaces',
  'zwitch',
].join('|');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  // One worker per core grows to ~6 GB of jsdom workers, which pushes a dev box
  // into swap; stalled workers then time out even trivial tests. Half the cores,
  // with workers recycled once bloated, peaks under ~3 GB for ~20% more time.
  maxWorkers: '50%',
  workerIdleMemoryLimit: '512MB',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testMatch: ['**/?(*.)+(spec|test).?([mc])[jt]s?(x)'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// module.exports = createJestConfig(customJestConfig)
module.exports = async () => ({
  ...(await createJestConfig(customJestConfig)()),
  transformIgnorePatterns: [`/node_modules/(?!(${esModules})/)`],
});
