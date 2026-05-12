/**
 * OAuth configuration for NDE Portal
 * The API handles OAuth flow - we just redirect to provider-specific login endpoints
 */

export interface LoginProviderConfig {
  id: string;
  label: string;
}

export interface AuthConfig {
  /** API base URL (without /v1) */
  apiBaseUrl: string;
  /** Default login endpoint (first configured provider) */
  loginUrl: string;
  /** Available login providers for login page UI */
  loginProviders: LoginProviderConfig[];
  /** Build login URL for a specific provider */
  getLoginUrl: (providerId: string, nextPath?: string) => string;
  /** Logout endpoint */
  logoutUrl: string;
  /** User info endpoint */
  userInfoEndpoint: string;
}

const toProviderLabel = (providerId: string) =>
  providerId
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const providerLabelOverrides: Record<string, string> = {
  github: 'GitHub',
  orcid: 'ORCID',
};

export const getProviderLabel = (providerId: string) =>
  providerLabelOverrides[providerId] || toProviderLabel(providerId);

const normalizeNextPath = (nextPath: string) => {
  if (!nextPath) return '/';
  if (nextPath.startsWith('http://') || nextPath.startsWith('https://')) {
    return '/';
  }
  return nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
};

/**
 * Get auth configuration
 * The OAuth flow is managed by the API backend, not the client
 */
export function getAuthConfig(): AuthConfig {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://api.data.niaid.nih.gov/v1';

  // Remove /v1 suffix for auth endpoints
  const apiBaseUrl = apiUrl.replace(/\/v1$/, '');

  // Get the frontend URL for redirect after login
  const frontendUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || 'https://data.niaid.nih.gov';

  const configuredProvidersRaw =
    process.env.NEXT_PUBLIC_AUTH_PROVIDERS || 'github,orcid';

  const configuredProviders = configuredProvidersRaw
    .split(',')
    .map(provider => provider.trim().toLowerCase())
    .filter(Boolean);

  const loginProviders = configuredProviders.map(providerId => ({
    id: providerId,
    label: getProviderLabel(providerId),
  }));

  const fallbackProvider = loginProviders[0]?.id || 'github';

  const getLoginUrl = (providerId: string, nextPath = '/') => {
    const nextUrl = `${frontendUrl}${normalizeNextPath(nextPath)}`;
    return `${apiBaseUrl}/login/${providerId}?next=${encodeURIComponent(
      nextUrl,
    )}`;
  };

  return {
    apiBaseUrl,
    loginUrl: getLoginUrl(fallbackProvider),
    loginProviders,
    getLoginUrl,
    logoutUrl: `${apiBaseUrl}/logout?next=${encodeURIComponent(
      frontendUrl + '/',
    )}`,
    userInfoEndpoint: `${apiBaseUrl}/user_info`,
  };
}
