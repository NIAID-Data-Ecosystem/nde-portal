import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

const mockUseAuth = jest.fn();
let mockEnableAuth = true;

jest.mock('src/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('src/utils/feature-flags', () => ({
  get ENABLE_AUTH() {
    return mockEnableAuth;
  },
}));

jest.mock('../nav-desktop-dropdown', () => ({
  NavDropdown: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='desktop-dropdown'>{children}</div>
  ),
  NavDropdownTrigger: ({
    label,
    children,
    isDisabled,
    isLoading,
  }: {
    label: string;
    children: React.ReactNode;
    isDisabled?: boolean;
    isLoading?: boolean;
  }) => (
    <div>
      <button disabled={isDisabled} data-loading={isLoading ? '' : undefined}>
        {label}
      </button>
      {children}
    </div>
  ),
}));

jest.mock('../nav-dropdown-item', () => ({
  NavDropdownItem: ({ label }: { label: string }) => <div>{label}</div>,
}));

jest.mock('../nav-mobile-item', () => ({
  MobileNavItem: ({ label }: { label: string }) => <div>{label}</div>,
}));

import { DesktopAuthAction, MobileAuthAction } from '../nav-auth-action';

describe('nav auth action', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockEnableAuth = true;
  });

  it('returns null when auth feature is disabled', () => {
    mockEnableAuth = false;
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    const { container, rerender } = render(<DesktopAuthAction />);
    expect(container).toBeEmptyDOMElement();

    rerender(<MobileAuthAction />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders desktop login action when unauthenticated', () => {
    const login = jest.fn();
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login,
      logout: jest.fn(),
    });

    render(<DesktopAuthAction />);

    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));
    expect(login).toHaveBeenCalled();
  });

  it('renders desktop account action with fallback display name and logout', () => {
    const logout = jest.fn();
    mockUseAuth.mockReturnValue({
      user: { name: '  ', username: 'user-name' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout,
    });

    render(<DesktopAuthAction />);

    expect(
      screen.getByRole('button', { name: 'user-name' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Log Out' }));
    expect(logout).toHaveBeenCalled();
  });

  it('renders desktop loading placeholder while auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<DesktopAuthAction />);

    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
  });

  it('falls back to default account label when user name is unavailable', () => {
    mockUseAuth.mockReturnValue({
      user: { name: '', username: '' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<DesktopAuthAction />);
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument();
  });

  it('renders mobile loading, login, and account states', () => {
    const login = jest.fn();
    const logout = jest.fn();

    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login,
      logout,
    });
    const { rerender } = render(<MobileAuthAction />);
    expect(screen.getByRole('button')).toHaveAttribute('data-loading');

    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login,
      logout,
    });
    rerender(<MobileAuthAction />);
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));
    expect(login).toHaveBeenCalled();

    mockUseAuth.mockReturnValue({
      user: { name: 'Jane Doe', username: 'jane' },
      isAuthenticated: true,
      isLoading: false,
      login,
      logout,
    });
    rerender(<MobileAuthAction />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Log Out' }));
    expect(logout).toHaveBeenCalled();
  });
});
