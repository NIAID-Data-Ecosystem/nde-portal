import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MobileNavItem } from '../nav-mobile-item';

jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return {
    ...actual,
    Collapse: ({ in: isOpen, children }: any) =>
      isOpen ? <div data-testid='collapse'>{children}</div> : null,
  };
});

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

  it('renders collapsible nested routes and toggles them open', () => {
    render(
      <MobileNavItem
        label='Resources'
        routes={[
          { label: 'Datasets', href: '/datasets' },
          { label: 'Tools', href: '/tools' },
        ]}
      />,
    );

    expect(screen.queryByText('link:Datasets')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resources' }));
    expect(screen.getByText('link:Datasets')).toBeInTheDocument();
    expect(screen.getByText('link:Tools')).toBeInTheDocument();
  });

  it('does not render nested collapse for empty routes array', () => {
    render(<MobileNavItem label='EmptyGroup' routes={[]} />);

    expect(
      screen.getByRole('button', { name: 'EmptyGroup' }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('collapse')).not.toBeInTheDocument();
  });
});
