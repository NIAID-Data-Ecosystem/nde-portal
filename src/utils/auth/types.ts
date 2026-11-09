/**
 * Auth types for the NDE Portal
 * OAuth flow is managed by the API backend (provider OAuth -> API session cookie)
 */

import { IconType } from 'react-icons';

export interface AuthLoginProvider {
  id: string;
  label: string;
  loginText?: string;
  methodIcons?: string[];
}

export interface KnownProvider {
  /** Display name, e.g. used in "Log In with <label>" */
  label: string;
  /** Brand icon on the login button. Providers without one show no icon. */
  icon?: { as: IconType; color: string };
  /** Login button text. Defaults to "Log In with <label>". */
  loginText?: string;
  /**
   * Ids of other known providers whose icons are shown in a row below the
   * login button text, e.g. the sign-in methods Okta offers. Ids without a
   * known icon are skipped.
   */
  methodIcons?: string[];
  /**
   * Extra `login_error` code -> message pairs for this provider, e.g.
   * `{ okta_access_denied: '...' }`. Overrides a generated message for the
   * same code.
   */
  errorMessages?: Record<string, string>;
}

export interface AuthConfig {
  /** API base URL (without /v1) */
  apiBaseUrl: string;
  /** Available login providers for login page UI */
  loginProviders: AuthLoginProvider[];
  /** Build login URL for a specific provider */
  getLoginUrl: (providerId: string, nextPath?: string) => string;
  /** Logout endpoint */
  logoutUrl: string;
  /** User info endpoint */
  userInfoEndpoint: string;
}

export interface User {
  username: string;
  oauth_provider: string; // e.g. "GitHub", "ORCID", "Google", "Microsoft", "Okta"
  name: string;
  // Primary email address for the user, if available. This is an array to accommodate multiple emails from ORCID and github. Set by the backend API.
  email?: string;
  emails?: { email: string; primary: boolean; verified: boolean }[];

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
