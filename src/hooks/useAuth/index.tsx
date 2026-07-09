/**
 * Auth Context and Provider for NDE Portal
 * OAuth flow is managed by the API backend - we just handle redirects and session checks
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { AuthState, AuthContextValue, User } from 'src/utils/auth/types';
import { getAuthConfig } from 'src/utils/auth/config';
import { devMockAuth } from './mock';
import { ENABLE_AUTH } from 'src/utils/feature-flags';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Fetch user info from the API
 * The API uses session cookies set after OAuth login
 */
async function fetchUserInfo(endpoint: string): Promise<User | null> {
  const mockUser = await devMockAuth.resolveUserInfo();
  if (mockUser) {
    return mockUser;
  }

  try {
    const response = await fetch(endpoint, {
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Not authenticated - this is expected for logged-out users
        return null;
      }
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    // Network/CORS error - expected in dev when API doesn't allow localhost
    // Fail silently and treat as not authenticated
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'Auth check failed (CORS in dev is expected):',
        error instanceof Error ? error.message : error,
      );
    }
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);
  const config = useMemo(() => getAuthConfig(), []);

  /**
   * Check authentication status by calling /user_info
   */
  const checkAuth = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!ENABLE_AUTH) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      const user = await fetchUserInfo(config.userInfoEndpoint);

      if (user) {
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Auth check failed',
      });
    }
  }, [config.userInfoEndpoint]);

  /**
   * Initialize auth state on mount (client-side only)
   */
  useEffect(() => {
    // Only check auth on client side
    if (typeof window === 'undefined') {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }
    checkAuth();
  }, [checkAuth]);

  /**
   * Login entrypoint:
   * - no provider: redirect to local login page
   * - provider selected: redirect to API provider login endpoint
   */
  const login = useCallback(
    (providerId?: string) => {
      if (typeof window === 'undefined') return;

      const currentPath =
        window.location.pathname +
        window.location.search +
        window.location.hash;

      // Preserve where the user started login from.
      if (window.location.pathname !== '/login') {
        sessionStorage.setItem('auth_return_to', currentPath || '/');
      }

      if (!providerId) {
        window.location.href = '/login';
        return;
      }

      // Mock auth only when provider is explicitly selected
      const mockState = devMockAuth.loginState(providerId);
      if (mockState) {
        setState(mockState);
        return;
      }

      const returnTo = sessionStorage.getItem('auth_return_to') || '/';
      window.location.href = config.getLoginUrl(providerId, returnTo);
    },
    [config],
  );

  /**
   * Redirect to API's logout endpoint
   */
  const logout = useCallback(() => {
    const mockState = devMockAuth.logoutState();
    if (mockState) {
      setState(mockState);
      return;
    }

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    window.location.href = config.logoutUrl;
  }, [config.logoutUrl]);

  const contextValue: AuthContextValue = useMemo(
    () => ({
      ...state,
      loginProviders: config.loginProviders,
      login,
      logout,
      checkAuth,
    }),
    [state, config.loginProviders, login, logout, checkAuth],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to check if user is authenticated (convenience hook)
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated, isLoading } = useAuth();
  return !isLoading && isAuthenticated;
}
