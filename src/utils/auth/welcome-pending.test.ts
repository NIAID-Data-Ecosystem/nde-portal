import { createHash } from 'node:crypto';
import csp from '../../../configs/csp.json';
import {
  AUTH_LOGIN_PENDING_KEY,
  AUTH_PENDING_ATTR,
  WELCOME_PENDING_SCRIPT,
  clearWelcomePending,
  isWelcomePending,
  setWelcomePending,
} from './welcome-pending';

let mockShowWelcomePage = true;
let mockEnableAuth = true;

jest.mock('src/utils/feature-flags', () => ({
  get ENABLE_AUTH() {
    return mockEnableAuth;
  },
  get SHOW_WELCOME_PAGE() {
    return mockShowWelcomePage;
  },
}));

const isPageHidden = () =>
  document.documentElement.hasAttribute(AUTH_PENDING_ATTR);

describe('welcome-pending', () => {
  beforeEach(() => {
    jest.useRealTimers();
    sessionStorage.clear();
    document.documentElement.removeAttribute(AUTH_PENDING_ATTR);
    mockShowWelcomePage = true;
    mockEnableAuth = true;
  });

  it('marks a login as pending and hides the page', () => {
    setWelcomePending();
    expect(isWelcomePending()).toBe(true);
    expect(isPageHidden()).toBe(true);
  });

  it.each([
    ['SHOW_WELCOME_PAGE', () => (mockShowWelcomePage = false)],
    ['ENABLE_AUTH', () => (mockEnableAuth = false)],
  ])('is a no-op when %s is off', (_, disable) => {
    disable();
    setWelcomePending();
    expect(isWelcomePending()).toBe(false);
    expect(isPageHidden()).toBe(false);
  });

  it('clears the marker and reveals the page', () => {
    setWelcomePending();
    clearWelcomePending();
    expect(isWelcomePending()).toBe(false);
    expect(isPageHidden()).toBe(false);
  });

  describe('pre-hydration script', () => {
    // eslint-disable-next-line no-new-func
    const runScript = () => new Function(WELCOME_PENDING_SCRIPT)();

    it('does nothing when no login is pending', () => {
      runScript();
      expect(isPageHidden()).toBe(false);
    });

    // `_document` inlines this script and the CSP allows it by hash.
    // On failure, replace the sha256 in configs/csp.json with "Expected value".
    it.each(Object.keys(csp))(
      'is allowed by the script-src hash in the %s CSP (configs/csp.json)',
      env => {
        const hash = `'sha256-${createHash('sha256')
          .update(WELCOME_PENDING_SCRIPT, 'utf8')
          .digest('base64')}'`;
        const directives: string[] = csp[env as keyof typeof csp];
        const scriptSrc = directives.find(d => d.startsWith('script-src '));
        expect(scriptSrc?.split(' ')).toContain(hash);
      },
    );

    it('hides the page when a login is pending, then gives up after 10s', () => {
      jest.useFakeTimers();
      sessionStorage.setItem(AUTH_LOGIN_PENDING_KEY, 'true');
      runScript();
      expect(isPageHidden()).toBe(true);

      jest.advanceTimersByTime(10000);
      expect(isPageHidden()).toBe(false);
      expect(sessionStorage.getItem(AUTH_LOGIN_PENDING_KEY)).toBeNull();
    });
  });
});
