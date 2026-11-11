import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import SettingsPage from 'src/pages/settings';
import { UserDataProvider } from 'src/hooks/useUserData';
import {
  ROUTE_CHANGE_CANCELLED,
  UNSAVED_CHANGES_MESSAGE,
} from 'src/hooks/useUnsavedChangesWarning';

const mockLogout = jest.fn();

jest.mock('src/hooks/useAuth', () => ({
  useAuth: () => ({ logout: mockLogout }),
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
const createServer = () => {
  let stored: Record<string, unknown> = {
    email: 'user@example.com',
    oauth_provider: 'GitHub',
    ai_toggle_preference: false,
    beta: false,
    contact_preference: true,
    feedback_preference: true,
    onboarding_complete: true,
  };
  const putBodies: Record<string, unknown>[] = [];
  const fetchMock = jest.fn((url: string, init?: RequestInit) => {
    const path = url.replace(/^https?:\/\/[^/]+/, '');
    const method = init?.method ?? 'GET';
    let status = 404;
    let body: unknown = { error: 'not found' };
    if (path === '/user/data' && method === 'GET') {
      status = 200;
      body = stored;
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

describe('SettingsPage', () => {
  const originalFetch = global.fetch;

  let confirmSpy: jest.SpyInstance<boolean, [message?: string]>;

  beforeEach(() => {
    mockLogout.mockReset();
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

    fireEvent.click(toggle('Email updates'));
    fireEvent.click(toggle('AI-assisted search'));
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

    fireEvent.click(toggle('Beta features'));
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

    fireEvent.click(toggle('Beta features'));

    fireEvent.click(screen.getByRole('button', { name: 'Log Out' }));
    expect(confirmSpy).toHaveBeenCalledWith(UNSAVED_CHANGES_MESSAGE);
    expect(mockLogout).not.toHaveBeenCalled();

    confirmSpy.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Log Out' }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
