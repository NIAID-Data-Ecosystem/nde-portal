import { getProviderLabel } from 'src/utils/auth/config';
import { AuthState, User } from 'src/utils/auth/types';

export const isDevMockAuthEnabled =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_MOCK_AUTH_USER_INFO === 'true';

export const getMockUser = (providerId?: string): User => ({
  username: process.env.NEXT_PUBLIC_MOCK_AUTH_USERNAME || 'dev-user',
  name: process.env.NEXT_PUBLIC_MOCK_AUTH_NAME || 'Dev User',
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
    return getMockUser();
  },
  loginState: (providerId?: string): AuthState | null => {
    if (!isDevMockAuthEnabled) return null;
    return toLoggedInState(providerId);
  },
  logoutState: (): AuthState | null => {
    if (!isDevMockAuthEnabled) return null;
    return toLoggedOutState();
  },
};
