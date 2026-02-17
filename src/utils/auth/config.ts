/**
 * OAuth configuration for NDE Portal
 * The API handles OAuth flow with GitHub - we just redirect to the API's login endpoint
 */

export interface AuthConfig {
  /** API base URL (without /v1) */
  apiBaseUrl: string;
  /** Login endpoint - redirects to GitHub OAuth */
  loginUrl: string;
  /** Logout endpoint */
  logoutUrl: string;
  /** User info endpoint */
  userInfoEndpoint: string;
}

/**
 * Get auth configuration
 * The OAuth flow is managed by the API backend, not the client
 */
export function getAuthConfig(): AuthConfig {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://api-staging.data.niaid.nih.gov/v1';

  // Remove /v1 suffix for auth endpoints
  const apiBaseUrl = apiUrl.replace(/\/v1$/, '');

  // Get the frontend URL for redirect after login
  const frontendUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL ||
        'https://data-staging.niaid.nih.gov';

  return {
    apiBaseUrl,
    loginUrl: `${apiBaseUrl}/login/github?next=${encodeURIComponent(
      frontendUrl + '/',
    )}`,
    logoutUrl: `${apiBaseUrl}/logout?next=${encodeURIComponent(
      frontendUrl + '/',
    )}`,
    userInfoEndpoint: `${apiBaseUrl}/user_info`,
  };
}
