// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { setupServer } from 'msw/node';
import { handlers } from 'src/__tests__/mocks/utils';
// needed for next/router mock
jest.mock('next/router', () => require('next-router-mock'));

export const server = setupServer(...handlers);

// Establish API mocking before all tests.
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
  process.env.NEXT_PUBLIC_API_URL = 'https://api.data.niaid.nih.gov/v1';
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());

// Load styles from chakra-ui
// See: https://github.com/chakra-ui/chakra-ui/issues/7201
if (window && window.Element) {
  const { getComputedStyle } = window;
  window.getComputedStyle = elt => getComputedStyle(elt);
  window.Element.prototype.scrollTo = () => {};
  window.scrollTo = () => {};

  if (typeof window.matchMedia !== 'function') {
    Object.defineProperty(window, 'matchMedia', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  }

  // Workaround https://github.com/jsdom/jsdom/issues/2524#issuecomment-897707183
  global.TextEncoder = require('util').TextEncoder;

  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
}
