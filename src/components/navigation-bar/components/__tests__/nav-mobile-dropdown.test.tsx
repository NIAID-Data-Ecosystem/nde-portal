import React from 'react';
import { render, screen } from '@testing-library/react';
import { MobileNavDropdown } from '../nav-mobile-dropdown';

jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return {
    ...actual,
    Collapse: ({ in: isOpen, children }: any) =>
      isOpen ? <div data-testid='mobile-collapse'>{children}</div> : null,
  };
});

jest.mock('../nav-auth-action', () => ({
  MobileAuthAction: () => <div>mobile-auth-action</div>,
}));

jest.mock('src/components/navigation-bar/components/nav-mobile-item', () => ({
  MobileNavItem: ({ label }: { label: string }) => (
    <div>{`mobile-item:${label}`}</div>
  ),
}));

describe('MobileNavDropdown', () => {
  it('hides collapsed content when closed', () => {
    render(
      <MobileNavDropdown
        isOpen={false}
        routes={[{ label: 'About', href: '/about' }] as any}
      />,
    );

    expect(screen.queryByTestId('mobile-collapse')).not.toBeInTheDocument();
    expect(screen.queryByText('mobile-auth-action')).not.toBeInTheDocument();
  });

  it('renders routes and auth action when open', () => {
    render(
      <MobileNavDropdown
        isOpen={true}
        routes={
          [
            { label: 'About', href: '/about' },
            { label: 'Search', href: '/search' },
          ] as any
        }
      />,
    );

    expect(screen.getByText('mobile-item:About')).toBeInTheDocument();
    expect(screen.getByText('mobile-item:Search')).toBeInTheDocument();
    expect(screen.getByText('mobile-auth-action')).toBeInTheDocument();
  });
});
