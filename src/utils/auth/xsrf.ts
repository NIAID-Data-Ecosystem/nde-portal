/**
 * XSRF token for cookie-authenticated writes to the NDE API.
 *
 * The API rejects PUT/POST/DELETE requests unless they echo the token from
 * `/xsrf_token` in an `X-XSRFToken` header. The token is paired with an
 * HttpOnly cookie the API sets on that same response, so it has to be fetched
 * with credentials rather than read from `document.cookie`.
 */

type FetchInit = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// One shared request, so concurrent writes can't race to set different cookies.
let tokenRequest: Promise<string | null> | null = null;

const requestToken = async (apiBaseUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(`${apiBaseUrl}/xsrf_token`, {
      credentials: 'include',
    });
    if (!response.ok) return null;
    const { xsrf_token } = JSON.parse(await response.text());
    return typeof xsrf_token === 'string' ? xsrf_token : null;
  } catch {
    // Older API deployments don't serve a JSON token; writes go out without it.
    return null;
  }
};

const getXsrfToken = (apiBaseUrl: string, refresh = false) => {
  if (!tokenRequest || refresh) {
    const request = requestToken(apiBaseUrl);
    tokenRequest = request;
    // Don't cache a failure; the next write tries again.
    request.then(token => {
      if (!token && tokenRequest === request) tokenRequest = null;
    });
  }
  return tokenRequest;
};

/**
 * fetch() for the API's cookie-authenticated endpoints. Sends credentials,
 * adds the XSRF token to writes, and retries a rejected write once with a
 * fresh token (e.g. after the browser dropped the XSRF cookie).
 */
export const fetchWithXsrf = async (
  apiBaseUrl: string,
  url: string,
  init: FetchInit = {},
): Promise<Response> => {
  const method = (init.method ?? 'GET').toUpperCase();
  if (SAFE_METHODS.includes(method)) {
    return fetch(url, { ...init, credentials: 'include' });
  }

  const send = async (refreshToken: boolean) => {
    const token = await getXsrfToken(apiBaseUrl, refreshToken);
    return fetch(url, {
      ...init,
      credentials: 'include',
      headers: token ? { ...init.headers, 'X-XSRFToken': token } : init.headers,
    });
  };

  const response = await send(false);
  return response.status === 403 ? send(true) : response;
};
