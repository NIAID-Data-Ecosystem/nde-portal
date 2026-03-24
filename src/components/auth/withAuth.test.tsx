import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { withAuth } from './withAuth';

const mockReplace = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/private?tab=1',
    replace: mockReplace,
  }),
}));

jest.mock('src/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = jest.requireMock('src/hooks/useAuth')
  .useAuth as jest.Mock;

describe('withAuth', () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
    mockReplace.mockReset();
    sessionStorage.clear();
  });

  it('renders default loading UI while auth status is loading', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const Wrapped = withAuth(() => <div>Protected</div>);
    render(<Wrapped />);

    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('renders custom loading component when provided', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const Wrapped = withAuth(() => <div>Protected</div>, {
      LoadingComponent: () => <div>Custom Loading</div>,
    });

    render(<Wrapped />);
    expect(screen.getByText('Custom Loading')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders wrapped component when authenticated', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    const Wrapped = withAuth(() => <div>Protected</div>);
    render(<Wrapped />);

    expect(screen.getByText('Protected')).toBeInTheDocument();
  });

  it('stores return path and redirects when unauthenticated', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    const Wrapped = withAuth(() => <div>Protected</div>, {
      redirectTo: '/login',
    });

    const { container } = render(<Wrapped />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
    expect(sessionStorage.getItem('auth_return_to')).toBe('/private?tab=1');
    expect(container).toBeEmptyDOMElement();
  });

  it('does not redirect when redirectTo is disabled', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    const Wrapped = withAuth(() => <div>Protected</div>, {
      redirectTo: undefined,
    });

    render(<Wrapped />);

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it('sets a useful displayName', () => {
    const MyComponent = () => <div />;
    const Wrapped = withAuth(MyComponent);

    expect(Wrapped.displayName).toBe('withAuth(MyComponent)');
  });
});
