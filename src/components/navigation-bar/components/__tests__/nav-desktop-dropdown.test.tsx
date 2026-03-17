import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  NavDropdown,
  NavDropdownMenu,
  NavDropdownTrigger,
} from '../nav-desktop-dropdown';

jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return {
    ...actual,
    Popover: ({ children }: any) =>
      typeof children === 'function' ? children({ isOpen: true }) : children,
    PopoverTrigger: ({ children }: any) => <>{children}</>,
    PopoverContent: ({ children }: any) => <div>{children}</div>,
    PopoverBody: ({ children }: any) => <div>{children}</div>,
    PopoverArrow: () => <span>arrow</span>,
  };
});

const mockNavDropdownItem = jest.fn(({ label }: { label: string }) => (
  <div>{`item:${label}`}</div>
));

jest.mock('../nav-dropdown-item', () => ({
  NavDropdownItem: (props: unknown) => mockNavDropdownItem(props as any),
}));

describe('nav desktop dropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens trigger popover content on click', () => {
    render(
      <NavDropdownTrigger label='Resources'>
        <div>dropdown-content</div>
      </NavDropdownTrigger>,
    );

    expect(
      screen.getByRole('button', { name: /resources/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('dropdown-content')).toBeInTheDocument();
  });

  it('renders explicit NavDropdown container', () => {
    render(
      <NavDropdown>
        <div>inner</div>
      </NavDropdown>,
    );

    expect(screen.getByText('inner')).toBeInTheDocument();
  });

  it('returns null when routes are empty and renders items otherwise', () => {
    const { container, rerender } = render(<NavDropdownMenu routes={[]} />);
    expect(container).toBeEmptyDOMElement();

    const routes = [
      { label: 'A', href: '/a' },
      { label: 'B', href: '/b' },
    ] as any;
    rerender(<NavDropdownMenu routes={routes} />);

    expect(screen.getByText('item:A')).toBeInTheDocument();
    expect(screen.getByText('item:B')).toBeInTheDocument();
    expect(mockNavDropdownItem).toHaveBeenCalledTimes(2);
  });

  it('supports route entries without href (label fallback key path)', () => {
    render(<NavDropdownMenu routes={[{ label: 'NoHref' }] as any} />);
    expect(screen.getByText('item:NoHref')).toBeInTheDocument();
  });
});
