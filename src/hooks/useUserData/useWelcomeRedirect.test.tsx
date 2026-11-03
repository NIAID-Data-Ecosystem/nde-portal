import { renderHook } from '@testing-library/react';

import {
  useWelcomeRedirect,
  WELCOME_PATH,
  WELCOME_SHOWN_KEY,
} from './useWelcomeRedirect';

const mockReplace = jest.fn();
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

const setup = (onboardingComplete: boolean | null, isAuthenticated = true) => {
  mockUseAuth.mockReturnValue({ isAuthenticated, isLoading: false });
  mockUseUserData.mockReturnValue({ onboardingComplete });
  return renderHook(() => useWelcomeRedirect());
};

describe('useWelcomeRedirect', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockReplace.mockClear();
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
});
