import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import {
  LoginErrorBanner,
  LOGIN_ERROR_MESSAGES,
} from '../components/login-error-banner';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

const setupRouter = (query: Record<string, any>) => {
  const replace = jest.fn();
  mockUseRouter.mockReturnValue({
    pathname: '/',
    query,
    replace,
  });
  return { replace };
};

describe('LoginErrorBanner', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when there is no login_error param', () => {
    setupRouter({});
    const { container } = render(<LoginErrorBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for an unrecognized login_error code', () => {
    setupRouter({ login_error: 'some_unknown_code' });
    const { container } = render(<LoginErrorBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each(Object.entries(LOGIN_ERROR_MESSAGES))(
    'displays the correct message for "%s"',
    (code, message) => {
      setupRouter({ login_error: code });
      render(<LoginErrorBanner />);
      expect(screen.getByRole('alert')).toHaveTextContent(message);
    },
  );

  it('handles login_error provided as an array (takes the first value)', () => {
    setupRouter({ login_error: ['github_login_failed', 'orcid_unavailable'] });
    render(<LoginErrorBanner />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      LOGIN_ERROR_MESSAGES.github_login_failed,
    );
  });

  it('strips only the login_error param when dismissed, preserving others', async () => {
    const { replace } = setupRouter({
      login_error: 'github_login_failed',
      q: 'malaria',
    });
    render(<LoginErrorBanner />);

    await userEvent.click(
      screen.getByRole('button', { name: /dismiss login error/i }),
    );

    expect(replace).toHaveBeenCalledWith(
      { pathname: '/', query: { q: 'malaria' } },
      undefined,
      { shallow: true },
    );
  });
});
