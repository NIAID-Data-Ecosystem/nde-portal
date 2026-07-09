import { getAuthConfig, getProviderLabel } from './config';

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
    expect(getProviderLabel('nih-login_provider')).toBe('Nih Login Provider');
  });

  it('uses defaults when env vars are missing', () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_BASE_URL;
    delete process.env.NEXT_PUBLIC_AUTH_PROVIDERS;

    const config = getAuthConfig();

    expect(config.apiBaseUrl).toBe('https://api.data.niaid.nih.gov');
    expect(config.loginProviders).toEqual([
      { id: 'github', label: 'GitHub' },
      { id: 'orcid', label: 'ORCID' },
    ]);
    expect(config.loginUrl).toContain('/login/github?next=');
    expect(config.userInfoEndpoint).toBe(
      'https://api.data.niaid.nih.gov/user_info',
    );
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

  it('falls back to github when provider list is empty after normalization', () => {
    process.env.NEXT_PUBLIC_AUTH_PROVIDERS = ',  ,';
    process.env.NEXT_PUBLIC_BASE_URL = 'https://portal.example.org';

    const config = getAuthConfig();

    expect(config.loginProviders).toEqual([]);
    expect(config.loginUrl).toContain('/login/github?next=');
  });
});
