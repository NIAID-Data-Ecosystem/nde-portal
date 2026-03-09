import { getProviderLabel } from 'src/utils/auth/config';
import { AuthState, User } from 'src/utils/auth/types';

export const isDevMockAuthEnabled =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_MOCK_AUTH_USER_INFO === 'true';

const MOCK_AUTH_LOGGED_OUT_KEY = 'mock_auth_logged_out';

const isClient = () => typeof window !== 'undefined';

const getIsMockLoggedOut = () => {
  if (!isClient()) return false;
  return sessionStorage.getItem(MOCK_AUTH_LOGGED_OUT_KEY) === 'true';
};

const setMockLoggedOut = (value: boolean) => {
  if (!isClient()) return;
  if (value) {
    sessionStorage.setItem(MOCK_AUTH_LOGGED_OUT_KEY, 'true');
    return;
  }
  sessionStorage.removeItem(MOCK_AUTH_LOGGED_OUT_KEY);
};

export const getMockUser = (providerId?: string): User => ({
  username: process.env.NEXT_PUBLIC_MOCK_AUTH_USERNAME || 'dev-user',
  name: process.env.NEXT_PUBLIC_MOCK_AUTH_NAME || 'Devon User',
  oauth_provider: getProviderLabel(
    providerId || process.env.NEXT_PUBLIC_MOCK_AUTH_PROVIDER || 'github',
  ),
  email: process.env.NEXT_PUBLIC_MOCK_AUTH_EMAIL || 'dev.user@example.org',
  avatar_url:
    process.env.NEXT_PUBLIC_MOCK_AUTH_AVATAR_URL ||
    'https://avatars.githubusercontent.com/u/1?v=4',
  organization:
    process.env.NEXT_PUBLIC_MOCK_AUTH_ORGANIZATION || 'NIAID Dev Environment',
});

export const toLoggedInState = (providerId?: string): AuthState => ({
  user: getMockUser(providerId),
  isAuthenticated: true,
  isLoading: false,
  error: null,
});

export const toLoggedOutState = (): AuthState => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
});

export const devMockAuth = {
  enabled: isDevMockAuthEnabled,
  resolveUserInfo: async (): Promise<User | null> => {
    if (!isDevMockAuthEnabled) return null;
    if (getIsMockLoggedOut()) return null;
    return getMockUser();
  },
  loginState: (providerId?: string): AuthState | null => {
    if (!isDevMockAuthEnabled) return null;
    setMockLoggedOut(false);
    return toLoggedInState(providerId);
  },
  logoutState: (): AuthState | null => {
    if (!isDevMockAuthEnabled) return null;
    setMockLoggedOut(true);
    return toLoggedOutState();
  },
};
