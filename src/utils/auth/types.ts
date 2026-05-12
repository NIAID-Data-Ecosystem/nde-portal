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
