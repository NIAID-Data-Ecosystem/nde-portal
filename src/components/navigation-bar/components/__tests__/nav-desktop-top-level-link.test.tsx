import React from 'react';
import { render, screen } from '@testing-library/react';
import { NavTopLevelLink } from '../nav-desktop-top-level-link';

describe('NavTopLevelLink', () => {
  it('renders external link attributes and active indicator', () => {
    const { container } = render(
      <NavTopLevelLink
        label='Docs'
        href='https://example.org'
        isExternal={true}
        isActive={true}
      />,
    );

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('href', 'https://example.org');
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('renders default internal fallback href', () => {
    render(<NavTopLevelLink label='Home' />);

    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('target', '_self');
    expect(link).toHaveAttribute('href', '#');
    expect(link).not.toHaveAttribute('rel');
  });
});
