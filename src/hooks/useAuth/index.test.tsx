import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { AuthProvider, useAuth, useIsAuthenticated } from './index';

const mockResolveUserInfo = jest.fn();
const mockLoginState = jest.fn();
const mockLogoutState = jest.fn();
let mockEnableAuth = true;
const mockGetLoginUrl = jest.fn(
  (provider: string, nextPath: string) =>
    `https://api.example.org/login/${provider}?next=${encodeURIComponent(
      nextPath,
    )}`,
);

jest.mock('src/utils/feature-flags', () => ({
  get ENABLE_AUTH() {
    return mockEnableAuth;
  },
}));

jest.mock('src/utils/auth/config', () => ({
  getAuthConfig: () => ({
    loginProviders: [
      { id: 'github', label: 'GitHub' },
      { id: 'orcid', label: 'ORCID' },
    ],
    getLoginUrl: (providerId: string, nextPath: string) =>
      mockGetLoginUrl(providerId, nextPath),
    logoutUrl: 'https://api.example.org/logout?next=https%3A%2F%2Fportal%2F',
    userInfoEndpoint: 'https://api.example.org/user_info',
  }),
}));

jest.mock('./mock', () => ({
  devMockAuth: {
    resolveUserInfo: () => mockResolveUserInfo(),
    loginState: (providerId?: string) => mockLoginState(providerId),
    logoutState: () => mockLogoutState(),
  },
}));

describe('useAuth hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnableAuth = true;
    sessionStorage.clear();
    (global as any).fetch = jest.fn();
    window.history.replaceState({}, '', '/current?x=1#hash');
  });

  it('throws when useAuth is called outside AuthProvider', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const Consumer = () => {
      useAuth();
      return null;
    };

    expect(() => render(<Consumer />)).toThrow(
      'useAuth must be used within an AuthProvider',
    );

    consoleErrorSpy.mockRestore();
  });

  it('keeps auth disabled when feature flag is off', async () => {
    mockEnableAuth = false;

    const Consumer = () => {
      const auth = useAuth();
      return <span>auth:{String(auth.isAuthenticated)}</span>;
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('auth:false')).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('authenticates user when user_info fetch succeeds', async () => {
    mockResolveUserInfo.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        username: 'alice',
        oauth_provider: 'GitHub',
        name: 'Alice',
      }),
    });

    const Consumer = () => {
      const auth = useAuth();
      return (
        <div>
          <span>loading:{String(auth.isLoading)}</span>
          <span>authenticated:{String(auth.isAuthenticated)}</span>
          <span>name:{auth.user?.name ?? 'none'}</span>
        </div>
      );
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('authenticated:true')).toBeInTheDocument();
    });
    expect(screen.getByText('name:Alice')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.org/user_info',
      { credentials: 'include' },
    );
  });

  it('treats 401 response as logged out', async () => {
    mockResolveUserInfo.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    const Consumer = () => {
      const auth = useAuth();
      return <span>authenticated:{String(auth.isAuthenticated)}</span>;
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('authenticated:false')).toBeInTheDocument();
    });
  });

  it('handles non-401 fetch errors and warns in development', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    mockResolveUserInfo.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    });

    const Consumer = () => {
      const auth = useAuth();
      return <span>authenticated:{String(auth.isAuthenticated)}</span>;
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('authenticated:false')).toBeInTheDocument();
    });
    expect(warnSpy).toHaveBeenCalled();

    process.env.NODE_ENV = originalNodeEnv;
    warnSpy.mockRestore();
  });

  it('sets error state when mock resolver throws unexpectedly', async () => {
    mockResolveUserInfo.mockRejectedValue(new Error('resolver failed'));

    const Consumer = () => {
      const auth = useAuth();
      return <span>error:{auth.error ?? 'none'}</span>;
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('error:resolver failed')).toBeInTheDocument();
    });
  });

  it('uses dev mock user when resolveUserInfo returns a user', async () => {
    mockResolveUserInfo.mockResolvedValue({
      username: 'dev',
      oauth_provider: 'GitHub',
      name: 'Dev User',
    });

    const Consumer = () => {
      const auth = useAuth();
      return <span>name:{auth.user?.name ?? 'none'}</span>;
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('name:Dev User')).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('exposes configured login providers through context', async () => {
    mockResolveUserInfo.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    const Consumer = () => {
      const auth = useAuth();
      return (
        <span>providers:{auth.loginProviders.map(p => p.id).join(',')}</span>
      );
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('providers:github,orcid')).toBeInTheDocument();
    });
  });

  it('uses dev mock login/logout state when available', async () => {
    mockResolveUserInfo.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    mockLoginState.mockReturnValue({
      user: { username: 'dev', oauth_provider: 'GitHub', name: 'Dev User' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
    mockLogoutState.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    const Consumer = () => {
      const auth = useAuth();
      return (
        <div>
          <span>auth:{String(auth.isAuthenticated)}</span>
          <button onClick={() => auth.login('github')}>mock-login</button>
          <button onClick={() => auth.logout()}>mock-logout</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('auth:false')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('mock-login'));
    });
    expect(mockLoginState).toHaveBeenCalledWith('github');
    await waitFor(() => {
      expect(screen.getByText('auth:true')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('mock-logout'));
    });
    expect(mockLogoutState).toHaveBeenCalled();
    expect(screen.getByText('auth:false')).toBeInTheDocument();
  });

  it('does not overwrite auth_return_to when already on /login', async () => {
    window.history.replaceState({}, '', '/login?from=home');
    sessionStorage.setItem('auth_return_to', '/existing');

    mockResolveUserInfo.mockResolvedValue({
      username: 'dev',
      oauth_provider: 'GitHub',
      name: 'Dev User',
    });
    mockLoginState.mockReturnValue({
      user: { username: 'dev', oauth_provider: 'GitHub', name: 'Dev User' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    const Consumer = () => {
      const auth = useAuth();
      return <button onClick={() => auth.login('github')}>login</button>;
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText('login'));
    });

    expect(sessionStorage.getItem('auth_return_to')).toBe('/existing');
  });

  it('executes non-mock provider login and non-mock logout paths', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    mockResolveUserInfo.mockResolvedValue({
      username: 'dev',
      oauth_provider: 'GitHub',
      name: 'Dev User',
    });
    mockLoginState.mockReturnValue(null);
    mockLogoutState.mockReturnValue(null);

    const Consumer = () => {
      const auth = useAuth();
      return (
        <div>
          <button onClick={() => auth.login()}>login-no-provider</button>
          <button onClick={() => auth.login('github')}>login-provider</button>
          <button onClick={() => auth.logout()}>logout-non-mock</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText('login-no-provider'));
    });
    expect(sessionStorage.getItem('auth_return_to')).toBe('/current?x=1#hash');

    await act(async () => {
      fireEvent.click(screen.getByText('login-provider'));
    });
    expect(mockGetLoginUrl).toHaveBeenCalledWith('github', '/current?x=1#hash');

    await act(async () => {
      fireEvent.click(screen.getByText('logout-non-mock'));
    });

    consoleErrorSpy.mockRestore();
  });

  it('derives auth status with useIsAuthenticated', async () => {
    mockResolveUserInfo.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        username: 'alice',
        oauth_provider: 'GitHub',
        name: 'Alice',
      }),
    });

    const Consumer = () => {
      const value = useIsAuthenticated();
      return <span>derived:{String(value)}</span>;
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('derived:true')).toBeInTheDocument();
    });
  });
});
