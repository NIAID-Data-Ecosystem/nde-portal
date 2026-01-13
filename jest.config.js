const nextJest = require('next/jest');

const esModules = [
  'bail',
  'character-entities',
  'ccount',
  'comma-separated-tokens',
  'decode-named-character-reference',
  'escape-string-regexp',
  'hast-util-from-parse5',
  'hast-util-parse-selector',
  'hast-util-raw',
  'hast-util-to-parse5',
  'hast-util-whitespace',
  'html-void-elements',
  'hastscript',
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
  'unist-util-is',
  'unist-util-position',
  'unist-util-visit',
  'unist-util-visit-parents',
  'vfile',
  'vfile-location',
  'web-namespaces',
  'zwitch',
].join('|');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage',
    '<rootDir>/dist',
    '<rootDir>/src/__tests__/mocks/',
    '<rootDir>/src/__tests__/validate-links.test.js',
  ],
  moduleNameMapper: {
    'react-markdown':
      '<rootDir>/node_modules/react-markdown/react-markdown.min.js',
    'parse5/lib/parser/index.js':
      '<rootDir>/node_modules/hast-util-raw/node_modules/parse5/lib/parser/index.js',
  },
  transformIgnorePatterns: ['node_modules/(?!react-markdown/)'],
  globals: {
    window: {},
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// module.exports = createJestConfig(customJestConfig)
module.exports = async () => ({
  ...(await createJestConfig(customJestConfig)()),
  transformIgnorePatterns: [`node_modules/(?!(${esModules})/)`],
});
