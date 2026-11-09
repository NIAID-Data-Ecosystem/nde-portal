type XsrfModule = typeof import('./xsrf');

const API = 'https://api.example.org';

// Load a fresh module per test so the cached token doesn't leak between tests.
const loadXsrf = (): XsrfModule => {
  let xsrf: XsrfModule | undefined;
  jest.isolateModules(() => {
    xsrf = require('./xsrf');
  });
  return xsrf as XsrfModule;
};

const respond = (status: number, body: unknown = {}) =>
  Promise.resolve({
    status,
    ok: status >= 200 && status < 300,
    text: async () => JSON.stringify(body),
  } as Response);

describe('fetchWithXsrf', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn((url: string) =>
      url === `${API}/xsrf_token`
        ? respond(200, { xsrf_token: 'token-1' })
        : respond(200),
    );
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('sends reads with credentials and without a token', async () => {
    const { fetchWithXsrf } = loadXsrf();

    await fetchWithXsrf(API, `${API}/user/data`);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(`${API}/user/data`, {
      credentials: 'include',
    });
  });

  it('adds the token to writes and shares one token request', async () => {
    const { fetchWithXsrf } = loadXsrf();
    const init = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    };

    await Promise.all([
      fetchWithXsrf(API, `${API}/user/data`, init),
      fetchWithXsrf(API, `${API}/user/data`, init),
    ]);

    const tokenCalls = fetchMock.mock.calls.filter(
      ([url]) => url === `${API}/xsrf_token`,
    );
    expect(tokenCalls).toEqual([
      [`${API}/xsrf_token`, { credentials: 'include' }],
    ]);
    expect(fetchMock).toHaveBeenCalledWith(`${API}/user/data`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRFToken': 'token-1',
      },
    });
  });

  it('retries a rejected write once with a fresh token', async () => {
    const tokens = ['stale-token', 'fresh-token'];
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (url === `${API}/xsrf_token`) {
        return respond(200, { xsrf_token: tokens.shift() });
      }
      const headers = init?.headers as Record<string, string>;
      return respond(headers['X-XSRFToken'] === 'fresh-token' ? 204 : 403);
    });
    const { fetchWithXsrf } = loadXsrf();

    const response = await fetchWithXsrf(API, `${API}/logout`, {
      method: 'POST',
    });

    expect(response.status).toBe(204);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('sends writes without a token when the API has none to give', async () => {
    fetchMock.mockImplementation((url: string) =>
      respond(url === `${API}/xsrf_token` ? 404 : 200),
    );
    const { fetchWithXsrf } = loadXsrf();

    await fetchWithXsrf(API, `${API}/user/data`, { method: 'PUT' });

    expect(fetchMock).toHaveBeenLastCalledWith(`${API}/user/data`, {
      method: 'PUT',
      credentials: 'include',
    });
  });
});
