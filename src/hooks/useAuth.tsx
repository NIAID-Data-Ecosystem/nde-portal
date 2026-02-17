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
 * The API uses session cookies set after GitHub OAuth
 */
async function fetchUserInfo(endpoint: string): Promise<User | null> {
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
   * Redirect to API's GitHub login endpoint
   */
  const login = useCallback(() => {
    // Store current path to redirect back after login (optional)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_return_to', window.location.pathname);
    }
    window.location.href = config.loginUrl;
  }, [config.loginUrl]);

  /**
   * Redirect to API's logout endpoint
   */
  const logout = useCallback(() => {
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
      login,
      logout,
      checkAuth,
    }),
    [state, login, logout, checkAuth],
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
