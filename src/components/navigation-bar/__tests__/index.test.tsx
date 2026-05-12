import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import mockRouter from 'next-router-mock';

const mockBuildNavigationFromConfig = jest.fn();
const mockFilterRoutesByEnv = jest.fn();

jest.mock('configs/site.config.json', () => ({
  navigation: { primary: [] },
  pages: {},
}));

jest.mock('../utils', () => ({
  buildNavigationFromConfig: (...args: unknown[]) =>
    mockBuildNavigationFromConfig(...args),
  filterRoutesByEnv: (...args: unknown[]) => mockFilterRoutesByEnv(...args),
}));

jest.mock('../components/nav-auth-action', () => ({
  DesktopAuthAction: () => <div data-testid='desktop-auth-action' />,
}));

jest.mock('../components/index', () => ({
  Nav: {
    Wrapper: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='wrapper'>{children}</div>
    ),
    Bar: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='bar'>{children}</div>
    ),
    Toggle: ({
      isOpen,
      onToggle,
    }: {
      isOpen: boolean;
      onToggle: () => void;
    }) => <button onClick={onToggle}>{isOpen ? 'Close' : 'Open'}</button>,
    DesktopNavItem: ({
      label,
      isActive,
    }: {
      label: string;
      isActive: boolean;
    }) => <div>{`${label}:${String(isActive)}`}</div>,
    MobileMenu: ({
      isOpen,
      routes,
    }: {
      isOpen: boolean;
      routes: { label: string }[];
    }) => <div>{`mobile:${String(isOpen)}:${routes.length}`}</div>,
  },
}));

import { Navigation } from '../index';

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.setCurrentUrl('/about');
    mockBuildNavigationFromConfig.mockReturnValue([
      { label: 'About', href: '/about' },
      { label: 'Search', href: '/search' },
    ]);
    mockFilterRoutesByEnv.mockReturnValue([
      { label: 'About', href: '/about' },
      { label: 'Search', href: '/search' },
    ]);
    process.env.NEXT_PUBLIC_APP_ENV = 'development';
  });

  it('builds and filters routes, and marks active route', () => {
    render(<Navigation />);

    expect(mockBuildNavigationFromConfig).toHaveBeenCalled();
    expect(mockFilterRoutesByEnv).toHaveBeenCalledWith(
      [
        { label: 'About', href: '/about' },
        { label: 'Search', href: '/search' },
      ],
      'development',
    );
    expect(screen.getByText('About:true')).toBeInTheDocument();
    expect(screen.getByText('Search:false')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-auth-action')).toBeInTheDocument();
  });

  it('toggles mobile menu visibility', () => {
    render(<Navigation />);

    expect(screen.queryByText('mobile:true:2')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('mobile:true:2')).toBeInTheDocument();
  });

  it('uses empty environment string when env var is not set', () => {
    delete process.env.NEXT_PUBLIC_APP_ENV;
    render(<Navigation />);

    expect(mockFilterRoutesByEnv).toHaveBeenCalledWith(
      [
        { label: 'About', href: '/about' },
        { label: 'Search', href: '/search' },
      ],
      '',
    );
  });
});
