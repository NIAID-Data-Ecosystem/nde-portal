import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { FaCircleUser } from 'react-icons/fa6';
import { NavDropdownItem } from '../nav-dropdown-item';

describe('NavDropdownItem', () => {
  it('renders toggle mode and calls onClick', () => {
    const onClick = jest.fn();
    const { rerender } = render(
      <NavDropdownItem
        label='Tools'
        description='Developer tools'
        onClick={onClick}
        isOpen={false}
      />,
    );

    const openButton = screen.getByRole('button', {
      name: 'Open Tools dropdown',
    });
    fireEvent.click(openButton);
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByText('Developer tools')).toBeInTheDocument();

    rerender(
      <NavDropdownItem
        label='Tools'
        description='Developer tools'
        onClick={onClick}
        isOpen={true}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Close Tools dropdown' }),
    ).toBeInTheDocument();
  });

  it('renders link mode including external attributes and icon labels', () => {
    render(
      <NavDropdownItem
        label='Docs'
        href='https://example.org/docs'
        isExternal={true}
        description='Read docs'
        icon={FaCircleUser}
      />,
    );

    const link = screen.getByRole('link', { name: /docs/i });
    expect(link).toHaveAttribute('href', 'https://example.org/docs');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByLabelText('Opens in new tab')).toBeInTheDocument();
    expect(screen.getByText('Read docs')).toBeInTheDocument();
  });

  it('renders internal link mode without external attributes', () => {
    render(<NavDropdownItem label='About' href='/about' isExternal={false} />);

    const link = screen.getByRole('link', { name: /about/i });
    expect(link).toHaveAttribute('href', '/about');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });
});
