/**
 * Auth types for the NDE Portal
 * OAuth flow is managed by the API backend (GitHub OAuth → API session cookie)
 */

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
  login: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}
