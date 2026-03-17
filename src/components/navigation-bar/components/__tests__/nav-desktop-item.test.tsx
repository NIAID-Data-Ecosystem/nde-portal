import React from 'react';
import { render, screen } from '@testing-library/react';
import { NavBarItem } from '../nav-desktop-item';

const mockNavTopLevelLink = jest.fn(() => <div data-testid='top-level-link' />);
const mockNavDropdownTrigger = jest.fn(
  ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dropdown-trigger'>{children}</div>
  ),
);
const mockNavDropdownMenu = jest.fn(() => <div data-testid='dropdown-menu' />);

jest.mock('../nav-desktop-top-level-link', () => ({
  NavTopLevelLink: (props: unknown) => mockNavTopLevelLink(props),
}));

jest.mock('../nav-desktop-dropdown', () => ({
  NavDropdownTrigger: (props: unknown) => mockNavDropdownTrigger(props),
  NavDropdownMenu: (props: unknown) => mockNavDropdownMenu(props),
}));

describe('NavBarItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders top-level link when routes are absent', () => {
    render(
      <NavBarItem
        label='About'
        href='/about'
        isExternal={false}
        isActive={true}
      />,
    );

    expect(screen.getByTestId('top-level-link')).toBeInTheDocument();
    expect(mockNavTopLevelLink).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'About',
        href: '/about',
        isExternal: false,
        isActive: true,
      }),
    );
  });

  it('renders dropdown trigger and menu when routes exist', () => {
    const routes = [{ label: 'Child', href: '/child' }];

    render(<NavBarItem label='Resources' routes={routes} />);

    expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(mockNavDropdownTrigger).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Resources' }),
    );
    expect(mockNavDropdownMenu).toHaveBeenCalledWith(
      expect.objectContaining({ routes }),
    );
  });
});
