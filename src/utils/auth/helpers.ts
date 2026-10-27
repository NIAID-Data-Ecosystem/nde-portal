import { KNOWN_PROVIDERS } from './config';
import { AuthConfig, KnownProvider } from './types';

/**
 * Builds the `login_error` code -> message map: generated `<id>_unavailable`
 * and `<id>_login_failed` messages for each provider, followed by the
 * provider's own `errorMessages` (which win on a shared code).
 */
export const buildLoginErrorMessages = (
  providers: Record<string, KnownProvider>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(providers).flatMap(([id, { label, errorMessages }]) => [
      [
        `${id}_unavailable`,
        `${label} is temporarily unavailable. Please try again in a moment.`,
      ],
      [
        `${id}_login_failed`,
        `Signing in with ${label} could not be completed. Please try signing in again.`,
      ],
      ...Object.entries(errorMessages ?? {}),
    ]),
  );

/**
 * Login error codes appended by the auth API as a `login_error` query param
 * when an OAuth login fails. The user is redirected back to their previous
 * page with one of these codes so we can surface a friendly message.
 */
export const LOGIN_ERROR_MESSAGES = buildLoginErrorMessages(KNOWN_PROVIDERS);

/** Message for a `login_error` code, or undefined if the code is unknown. */
export const getLoginErrorMessage = (code: string): string | undefined =>
  // Own-property check so codes like "constructor" don't resolve to
  // Object.prototype members.
  Object.prototype.hasOwnProperty.call(LOGIN_ERROR_MESSAGES, code)
    ? LOGIN_ERROR_MESSAGES[code]
    : undefined;

const toProviderLabel = (providerId: string) =>
  providerId
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const getProviderLabel = (providerId: string) =>
  KNOWN_PROVIDERS[providerId]?.label || toProviderLabel(providerId);

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
  // No fallback: a missing API URL should fail the build rather than send
  // logins to the wrong API.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }

  // Remove /v1 suffix for auth endpoints
  const apiBaseUrl = apiUrl.replace(/\/v1$/, '');

  // Get the frontend URL for redirect after login
  const frontendUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || '';

  // No providers (and so no login buttons) when unset.
  const configuredProviders = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS || '')
    .split(',')
    .map(provider => provider.trim().toLowerCase())
    .filter(Boolean);

  const loginProviders = configuredProviders.map(providerId => ({
    id: providerId,
    label: getProviderLabel(providerId),
  }));

  const getLoginUrl = (providerId: string, nextPath = '/') => {
    const nextUrl = `${frontendUrl}${normalizeNextPath(nextPath)}`;
    return `${apiBaseUrl}/login/${providerId}?next=${encodeURIComponent(
      nextUrl,
    )}`;
  };

  return {
    apiBaseUrl,
    loginProviders,
    getLoginUrl,
    logoutUrl: `${apiBaseUrl}/logout?next=${encodeURIComponent(
      frontendUrl + '/',
    )}`,
    userInfoEndpoint: `${apiBaseUrl}/user_info`,
  };
}
