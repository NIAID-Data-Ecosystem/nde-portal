import {
  buildLoginErrorMessages,
  getAuthConfig,
  getLoginErrorMessage,
  getProviderLabel,
  LOGIN_ERROR_MESSAGES,
} from './helpers';

describe('auth config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('builds labels with overrides and title case fallback', () => {
    expect(getProviderLabel('github')).toBe('GitHub');
    expect(getProviderLabel('orcid')).toBe('ORCID');
    expect(getProviderLabel('google')).toBe('Google');
    expect(getProviderLabel('microsoft')).toBe('Microsoft');
    expect(getProviderLabel('nih-login_provider')).toBe('Nih Login Provider');
    expect(getProviderLabel('okta')).toBe('NIH Login');
  });

  it('builds login error messages for each known provider', () => {
    expect(LOGIN_ERROR_MESSAGES.github_unavailable).toBe(
      'GitHub is temporarily unavailable. Please try again in a moment.',
    );
    expect(LOGIN_ERROR_MESSAGES.microsoft_login_failed).toBe(
      'Signing in with Microsoft could not be completed. Please try signing in again.',
    );
    expect(LOGIN_ERROR_MESSAGES.okta_unavailable).toBe(
      'NIH Login is temporarily unavailable. Please try again in a moment.',
    );
    expect(Object.keys(LOGIN_ERROR_MESSAGES)).toEqual(
      expect.arrayContaining([
        'orcid_unavailable',
        'orcid_login_failed',
        'google_unavailable',
        'google_login_failed',
        'okta_login_failed',
      ]),
    );
  });

  it("adds a provider's errorMessages, overriding generated ones", () => {
    expect(
      buildLoginErrorMessages({
        okta: {
          label: 'NIH Login',
          errorMessages: {
            okta_access_denied: 'No access.',
            okta_unavailable: 'Custom unavailable.',
          },
        },
      }),
    ).toEqual({
      okta_unavailable: 'Custom unavailable.',
      okta_login_failed:
        'Signing in with NIH Login could not be completed. Please try signing in again.',
      okta_access_denied: 'No access.',
    });
  });

  it('looks up messages by login_error code', () => {
    expect(getLoginErrorMessage('orcid_login_failed')).toBe(
      LOGIN_ERROR_MESSAGES.orcid_login_failed,
    );
    expect(getLoginErrorMessage('github_access_denied')).toBeUndefined();
    expect(getLoginErrorMessage('constructor')).toBeUndefined();
  });

  it('throws when NEXT_PUBLIC_API_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    expect(() => getAuthConfig()).toThrow('NEXT_PUBLIC_API_URL is not set');
  });

  it('has no login providers when NEXT_PUBLIC_AUTH_PROVIDERS is missing', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.org/v1';
    delete process.env.NEXT_PUBLIC_AUTH_PROVIDERS;

    expect(getAuthConfig().loginProviders).toEqual([]);
  });

  it('normalizes configured providers and builds urls from custom env', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.org/v1';
    process.env.NEXT_PUBLIC_BASE_URL = 'https://portal.example.org';
    process.env.NEXT_PUBLIC_AUTH_PROVIDERS = ' github, , ORCID , custom-id ';

    const config = getAuthConfig();

    expect(config.apiBaseUrl).toBe('https://api.example.org');
    expect(config.loginProviders).toEqual([
      { id: 'github', label: 'GitHub' },
      { id: 'orcid', label: 'ORCID' },
      { id: 'custom-id', label: 'Custom Id' },
    ]);
    expect(config.logoutUrl).toBe(
      'https://api.example.org/logout?next=http%3A%2F%2Flocalhost%2F',
    );
  });

  it('normalizes unsafe or relative next paths using browser origin', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.org/v1';

    const config = getAuthConfig();

    expect(config.getLoginUrl('github', 'dashboard')).toBe(
      'https://api.example.org/login/github?next=http%3A%2F%2Flocalhost%2Fdashboard',
    );
    expect(config.getLoginUrl('github', '/search?q=abc')).toBe(
      'https://api.example.org/login/github?next=http%3A%2F%2Flocalhost%2Fsearch%3Fq%3Dabc',
    );
    expect(config.getLoginUrl('github', 'https://evil.example/pwn')).toBe(
      'https://api.example.org/login/github?next=http%3A%2F%2Flocalhost%2F',
    );
  });

  it('has no login providers when the list is empty after normalization', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.org/v1';
    process.env.NEXT_PUBLIC_AUTH_PROVIDERS = ',  ,';

    expect(getAuthConfig().loginProviders).toEqual([]);
  });
});
