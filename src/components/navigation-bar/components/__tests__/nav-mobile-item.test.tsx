import React from 'react';
import { fireEvent, render, screen, waitFor } from 'src/__tests__/utils/render';

import { MobileNavItem } from '../nav-mobile-item';

const mockNavDropdownItem = jest.fn((props: any) => {
  if (props.onClick) {
    return <button onClick={props.onClick}>{props.label}</button>;
  }
  return <span>{`link:${props.label}`}</span>;
});

jest.mock('../nav-dropdown-item', () => ({
  NavDropdownItem: (props: any) => mockNavDropdownItem(props),
}));

describe('MobileNavItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders plain link mode when no child routes are present', () => {
    render(<MobileNavItem label='Search' href='/search' isExternal={false} />);

    expect(screen.getByText('link:Search')).toBeInTheDocument();
    expect(mockNavDropdownItem).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Search',
        href: '/search',
        isExternal: false,
      }),
    );
  });

  it('renders collapsible nested routes and toggles them open', async () => {
    render(
      <MobileNavItem
        label='Resources'
        routes={[
          { label: 'Datasets', href: '/datasets' },
          { label: 'Tools', href: '/tools' },
        ]}
      />,
    );

    // Collapsible keeps closed content mounted but hidden.
    expect(screen.getByText('link:Datasets')).not.toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Resources' }));
    await waitFor(() =>
      expect(screen.getByText('link:Datasets')).toBeVisible(),
    );
    expect(screen.getByText('link:Tools')).toBeVisible();
  });

  it('does not render nested collapse for empty routes array', () => {
    const { container } = render(
      <MobileNavItem label='EmptyGroup' routes={[]} />,
    );

    expect(
      screen.getByRole('button', { name: 'EmptyGroup' }),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-scope="collapsible"]'),
    ).not.toBeInTheDocument();
  });
});
