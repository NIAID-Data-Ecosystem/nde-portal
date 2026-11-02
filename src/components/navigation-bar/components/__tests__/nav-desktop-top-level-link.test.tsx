import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { system } from 'src/theme';
import { NavTopLevelLink } from '../nav-desktop-top-level-link';

describe('NavTopLevelLink', () => {
  const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider value={system}>{ui}</ChakraProvider>);
  };

  it('renders external link attributes and active indicator', () => {
    renderWithChakra(
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
    expect(link).toHaveAttribute('data-active');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('renders default internal fallback href', () => {
    renderWithChakra(<NavTopLevelLink label='Home' />);

    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('target', '_self');
    expect(link).toHaveAttribute('href', '#');
    expect(link).not.toHaveAttribute('rel');
    expect(link).not.toHaveAttribute('data-active');
    expect(link).not.toHaveAttribute('aria-current');
  });
});
