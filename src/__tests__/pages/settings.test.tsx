import mockRouter from 'next-router-mock';
import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from 'src/__tests__/utils/render';
import {
  ROUTE_CHANGE_CANCELLED,
  UNSAVED_CHANGES_MESSAGE,
} from 'src/hooks/useUnsavedChangesWarning';
import { UserDataProvider } from 'src/hooks/useUserData';
import SettingsPage from 'src/pages/settings';

const mockLogout = jest.fn();
// The session user from `/user_info`.
let mockUser: Record<string, unknown> | null = null;

jest.mock('src/hooks/useAuth', () => ({
  useAuth: () => ({ logout: mockLogout, user: mockUser }),
}));

jest.mock('src/components/auth/withAuth', () => ({
  withAuth: (Component: React.ComponentType) => Component,
}));

jest.mock('src/utils/feature-flags', () => ({
  ENABLE_AUTH: true,
}));

jest.mock('src/components/page-container', () => ({
  getPageSeoConfig: () => ({}),
  PageContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

/**
 * Uses the real UserDataProvider against an in-memory `/user/data` server
 * (NODE_ENV is "test", so the provider takes the real fetch path).
 */
const createServer = (
  profile: Record<string, unknown> = {},
  { failGet = false } = {},
) => {
  let stored: Record<string, unknown> = {
    email: 'user@example.com',
    oauth_provider: 'GitHub',
    ai_toggle_preference: false,
    beta: false,
    contact_preference: true,
    feedback_preference: true,
    onboarding_complete: true,
    ...profile,
  };
  const putBodies: Record<string, unknown>[] = [];
  const fetchMock = jest.fn((url: string, init?: RequestInit) => {
    const path = url.replace(/^https?:\/\/[^/]+/, '');
    const method = init?.method ?? 'GET';
    let status = 404;
    let body: unknown = { error: 'not found' };
    if (path === '/user/data' && method === 'GET') {
      status = failGet ? 500 : 200;
      body = failGet ? { error: 'Internal Server Error' } : stored;
    } else if (path === '/user/data' && method === 'PUT') {
      const parsed = JSON.parse(String(init?.body));
      putBodies.push(parsed);
      stored = { ...stored, ...parsed };
      status = 200;
      body = stored;
    }
    return Promise.resolve({
      status,
      ok: status === 200,
      text: async () => JSON.stringify(body),
    } as Response);
  });
  return { fetchMock, putBodies };
};

// Let any request a toggle might have started (writes first await an XSRF
// token fetch) reach the fake server before asserting nothing was sent.
const flushRequests = () =>
  act(() => new Promise<void>(resolve => setTimeout(resolve, 0)));

const toggle = (label: string) =>
  screen.getByRole('checkbox', { name: label }) as HTMLInputElement;

// zag applies a switch change in a microtask, so click inside an async act to
// let it (and the form's state update) land before asserting.
const clickToggle = (label: string) =>
  act(async () => {
    fireEvent.click(toggle(label));
  });

const renderPage = async () => {
  render(
    <UserDataProvider>
      <SettingsPage />
    </UserDataProvider>,
  );
  await waitFor(() =>
    expect(toggle('Feedback and testing').checked).toBe(true),
  );
};

// Account details as label -> value, e.g. { Email: 'user@example.com' }.
const accountDetails = () =>
  Object.fromEntries(
    screen
      .queryAllByRole('term')
      .map(term => [term.textContent, term.nextElementSibling?.textContent]),
  );

const renderAndWaitForAccountDetails = async () => {
  render(
    <UserDataProvider>
      <SettingsPage />
    </UserDataProvider>,
  );
  // The list is marked busy until the profile request settles.
  await waitFor(() =>
    expect(document.querySelector('dl')).toHaveAttribute('aria-busy', 'false'),
  );
};

describe('SettingsPage', () => {
  const originalFetch = global.fetch;

  let confirmSpy: jest.SpyInstance<boolean, [message?: string]>;

  beforeEach(() => {
    mockLogout.mockReset();
    mockUser = null;
    // jest.setup.js maps next/router to next-router-mock.
    mockRouter.setCurrentUrl('/settings');
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    // Silence the provider's [favorites test] console grouping.
    jest.spyOn(console, 'group').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('only saves preferences when Save Settings is pressed', async () => {
    const server = createServer();
    global.fetch = server.fetchMock as unknown as typeof fetch;
    await renderPage();

    expect(
      screen.getByRole('heading', { name: 'Communication preferences' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Search preferences' }),
    ).toBeInTheDocument();

    await clickToggle('Email updates');
    await clickToggle('AI-assisted search');
    await flushRequests();
    expect(server.putBodies).toHaveLength(0);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
    });

    // One request with every setting on the page, and settings never touch
    // onboarding.
    expect(server.putBodies).toEqual([
      {
        ai_toggle_preference: true,
        beta: false,
        contact_preference: false,
        feedback_preference: true,
      },
    ]);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Your settings have been saved.',
    );
  });

  it('warns before leaving with unsaved changes, until they are saved', async () => {
    const server = createServer();
    global.fetch = server.fetchMock as unknown as typeof fetch;
    await renderPage();

    // Nothing changed yet: leaving doesn't ask.
    await act(() => mockRouter.push('/search'));
    expect(confirmSpy).not.toHaveBeenCalled();
    await act(() => mockRouter.push('/settings'));

    await clickToggle('Beta features');
    await act(async () => {
      await expect(mockRouter.push('/search')).rejects.toBe(
        ROUTE_CHANGE_CANCELLED,
      );
    });
    expect(confirmSpy).toHaveBeenCalledWith(UNSAVED_CHANGES_MESSAGE);
    expect(mockRouter.asPath).toBe('/settings');
    expect(toggle('Beta features').checked).toBe(true);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
    });
    confirmSpy.mockClear();
    await act(() => mockRouter.push('/search'));
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(mockRouter.asPath).toBe('/search');
  });

  it('logs the user out', async () => {
    const server = createServer();
    global.fetch = server.fetchMock as unknown as typeof fetch;
    await renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Log Out' }));
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('asks before logging out with unsaved changes', async () => {
    const server = createServer();
    global.fetch = server.fetchMock as unknown as typeof fetch;
    await renderPage();

    await clickToggle('Beta features');

    fireEvent.click(screen.getByRole('button', { name: 'Log Out' }));
    expect(confirmSpy).toHaveBeenCalledWith(UNSAVED_CHANGES_MESSAGE);
    expect(mockLogout).not.toHaveBeenCalled();

    confirmSpy.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Log Out' }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
  describe('account details', () => {
    it('shows the email and sign-in method above the preferences', async () => {
      const server = createServer();
      global.fetch = server.fetchMock as unknown as typeof fetch;
      await renderPage();

      const headings = screen
        .getAllByRole('heading', { level: 2 })
        .map(heading => heading.textContent);
      expect(headings[0]).toBe('Account details');
      expect(accountDetails()).toEqual({
        Email: 'user@example.com',
        'Sign-in method': 'GitHub',
      });
    });

    it('says there is no email on record when the account has none', async () => {
      const server = createServer({ email: '' });
      global.fetch = server.fetchMock as unknown as typeof fetch;
      // The session's email isn't the one the email settings check, so it
      // isn't shown in place of the profile's.
      mockUser = { oauth_provider: 'GitHub', email: 'session@example.com' };
      await renderAndWaitForAccountDetails();

      expect(accountDetails()).toEqual({
        Email: 'No email on record',
        'Sign-in method': 'GitHub',
      });
    });

    it("shows an NIH Login user's sign-in method once the profile loads", async () => {
      let releaseProfile = () => {};
      global.fetch = jest.fn(
        () =>
          new Promise<Response>(resolve => {
            releaseProfile = () =>
              resolve({
                status: 200,
                ok: true,
                text: async () =>
                  JSON.stringify({
                    email: 'user@example.com',
                    oauth_provider: 'Okta',
                    idp: 'google',
                  }),
              } as Response);
          }),
      ) as unknown as typeof fetch;
      mockUser = { oauth_provider: 'Okta' };
      render(
        <UserDataProvider>
          <SettingsPage />
        </UserDataProvider>,
      );

      // Placeholders, not "Okta", until the sign-in method (idp) arrives.
      expect(accountDetails()).toEqual({ Email: '', 'Sign-in method': '' });
      expect(screen.queryByText('Okta')).not.toBeInTheDocument();

      await act(async () => releaseProfile());

      expect(accountDetails()).toEqual({
        Email: 'user@example.com',
        'Sign-in method': 'Google',
      });
    });

    it("falls back to the session's email if the profile fails to load", async () => {
      const server = createServer({}, { failGet: true });
      global.fetch = server.fetchMock as unknown as typeof fetch;
      mockUser = { oauth_provider: 'ORCID', email: 'session@example.com' };
      await renderAndWaitForAccountDetails();

      expect(accountDetails()).toEqual({
        Email: 'session@example.com',
        'Sign-in method': 'ORCID',
      });
    });
  });
});
