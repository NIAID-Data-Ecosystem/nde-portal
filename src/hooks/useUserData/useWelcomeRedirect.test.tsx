import { renderHook, waitFor } from '@testing-library/react';
import {
  AUTH_LOGIN_PENDING_KEY,
  AUTH_PENDING_ATTR,
} from 'src/utils/auth/welcome-pending';
import {
  WELCOME_PATH,
  WELCOME_SHOWN_KEY,
  useWelcomeRedirect,
} from './useWelcomeRedirect';

const mockReplace = jest.fn((_path: string) => Promise.resolve(true));
const mockRouter = { pathname: '/search', asPath: '/search?q=malaria' };
const mockUseAuth = jest.fn();
const mockUseUserData = jest.fn();
let mockShowWelcomePage = true;

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => ({ ...mockRouter, replace: mockReplace }),
}));

jest.mock('src/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('./index', () => ({
  useUserData: () => mockUseUserData(),
}));

jest.mock('src/utils/feature-flags', () => ({
  ENABLE_AUTH: true,
  get SHOW_WELCOME_PAGE() {
    return mockShowWelcomePage;
  },
}));

const setup = (
  onboardingComplete: boolean | null,
  isAuthenticated = true,
  { hasLoadedProfile = onboardingComplete !== null, isLoading = false } = {},
) => {
  mockUseAuth.mockReturnValue({ isAuthenticated, isLoading });
  mockUseUserData.mockReturnValue({ onboardingComplete, hasLoadedProfile });
  return renderHook(() => useWelcomeRedirect());
};

// Simulate returning from an OAuth login started with the welcome page on.
const startPendingLogin = () =>
  sessionStorage.setItem(AUTH_LOGIN_PENDING_KEY, 'true');

const isPageHidden = () =>
  document.documentElement.hasAttribute(AUTH_PENDING_ATTR);

describe('useWelcomeRedirect', () => {
  beforeEach(() => {
    sessionStorage.clear();
    document.documentElement.removeAttribute(AUTH_PENDING_ATTR);
    mockReplace.mockClear();
    mockRouter.pathname = '/search';
    mockShowWelcomePage = true;
  });

  it('redirects to the welcome page when onboarding is incomplete', () => {
    setup(false);
    expect(mockReplace).toHaveBeenCalledWith(WELCOME_PATH);
    expect(sessionStorage.getItem('auth_return_to')).toBe('/search?q=malaria');
    expect(sessionStorage.getItem(WELCOME_SHOWN_KEY)).toBe('true');
  });

  it('only redirects once per session', () => {
    setup(false).unmount();
    setup(false);
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['onboarding is complete', true, true],
    ['the profile has not loaded', null, true],
    ['the user is signed out', false, false],
  ])('does not redirect when %s', (_, onboardingComplete, isAuthenticated) => {
    setup(onboardingComplete, isAuthenticated);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not redirect when SHOW_WELCOME_PAGE is off', () => {
    mockShowWelcomePage = false;
    setup(false);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(WELCOME_SHOWN_KEY)).toBeNull();
  });

  describe('post-login loader', () => {
    it.each([
      ['auth is still loading', null, true, { isLoading: true }],
      ['the profile is still loading', null, true, {}],
    ])(
      'keeps the page hidden while %s',
      (_, onboardingComplete, isAuthenticated, opts) => {
        startPendingLogin();
        setup(onboardingComplete, isAuthenticated, opts);
        expect(isPageHidden()).toBe(true);
        expect(sessionStorage.getItem(AUTH_LOGIN_PENDING_KEY)).toBe('true');
      },
    );

    it('reveals the page only after the welcome redirect completes', async () => {
      let finishNavigation: (value: boolean) => void = () => undefined;
      mockReplace.mockImplementationOnce(
        () => new Promise<boolean>(resolve => (finishNavigation = resolve)),
      );
      startPendingLogin();
      setup(false);

      expect(mockReplace).toHaveBeenCalledWith(WELCOME_PATH);
      expect(isPageHidden()).toBe(true);

      finishNavigation(true);
      await waitFor(() => expect(isPageHidden()).toBe(false));
      expect(sessionStorage.getItem(AUTH_LOGIN_PENDING_KEY)).toBeNull();
    });

    it.each([
      ['onboarding is complete', true, true, {}],
      ['the user is signed out', null, false, {}],
      ['the profile failed to load', null, true, { hasLoadedProfile: true }],
    ])(
      'reveals the page without redirecting when %s',
      (_, onboardingComplete, isAuthenticated, opts) => {
        startPendingLogin();
        setup(onboardingComplete, isAuthenticated, opts);
        expect(mockReplace).not.toHaveBeenCalled();
        expect(isPageHidden()).toBe(false);
        expect(sessionStorage.getItem(AUTH_LOGIN_PENDING_KEY)).toBeNull();
      },
    );

    it('reveals the page when the welcome page was already shown', () => {
      sessionStorage.setItem(WELCOME_SHOWN_KEY, 'true');
      startPendingLogin();
      setup(false);
      expect(mockReplace).not.toHaveBeenCalled();
      expect(isPageHidden()).toBe(false);
    });

    it('reveals the page when already on the welcome page', () => {
      mockRouter.pathname = WELCOME_PATH;
      startPendingLogin();
      setup(false);
      expect(mockReplace).not.toHaveBeenCalled();
      expect(isPageHidden()).toBe(false);
      expect(sessionStorage.getItem(WELCOME_SHOWN_KEY)).toBe('true');
    });

    it('clears any pending state when SHOW_WELCOME_PAGE is off', () => {
      mockShowWelcomePage = false;
      startPendingLogin();
      document.documentElement.setAttribute(AUTH_PENDING_ATTR, '');
      setup(null, true, { isLoading: true });
      expect(isPageHidden()).toBe(false);
      expect(sessionStorage.getItem(AUTH_LOGIN_PENDING_KEY)).toBeNull();
    });

    it('does not hide the page when no login is pending', () => {
      setup(null, true, { isLoading: true });
      expect(isPageHidden()).toBe(false);
    });
  });
});
