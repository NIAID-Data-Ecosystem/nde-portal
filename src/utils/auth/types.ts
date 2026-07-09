/**
 * Auth types for the NDE Portal
 * OAuth flow is managed by the API backend (provider OAuth -> API session cookie)
 */

export interface AuthLoginProvider {
  id: string;
  label: string;
}

export interface User {
  username: string;
  oauth_provider: string; // "GitHub" or "ORCID"
  name: string;
  // Primary email address for the user, if available. This is an array to accommodate multiple emails from ORCID and github. Set by the backend API.
  email?: string;
  avatar_url?: string;
  organization?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  loginProviders: AuthLoginProvider[];
  login: (providerId?: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}
