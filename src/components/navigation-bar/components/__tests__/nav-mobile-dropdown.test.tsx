import React from 'react';
import { render, screen } from 'src/__tests__/utils/render';

import { MobileNavDropdown } from '../nav-mobile-dropdown';

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
    // Collapsible keeps closed content mounted but hidden.
    render(
      <MobileNavDropdown
        isOpen={false}
        routes={[{ label: 'About', href: '/about' }] as any}
      />,
    );

    expect(screen.getByText('mobile-item:About')).not.toBeVisible();
    expect(screen.getByText('mobile-auth-action')).not.toBeVisible();
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

    expect(screen.getByText('mobile-item:About')).toBeVisible();
    expect(screen.getByText('mobile-item:Search')).toBeVisible();
    expect(screen.getByText('mobile-auth-action')).toBeVisible();
  });
});
