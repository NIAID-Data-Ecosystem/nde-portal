import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Layout } from '../nav-layout';

jest.mock('src/components/logos', () => ({
  Logo: ({ href }: { href: string }) => <a href={href}>Logo</a>,
}));

describe('nav layout', () => {
  it('renders wrapper as main navigation container', () => {
    render(
      <Layout.Wrapper data-testid='wrapper'>
        <span>child</span>
      </Layout.Wrapper>,
    );

    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    expect(screen.getByTestId('wrapper')).toHaveAttribute(
      'id',
      'nde-navigation',
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('renders bar with logo and children', () => {
    render(
      <Layout.Bar>
        <span>actions</span>
      </Layout.Bar>,
    );

    expect(screen.getByRole('link', { name: 'Logo' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByText('actions')).toBeInTheDocument();
  });

  it('toggles mobile button labels and callback', () => {
    const onToggle = jest.fn();
    const { rerender } = render(
      <Layout.Toggle isOpen={false} onToggle={onToggle} />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Open navigation menu' }),
    );
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(<Layout.Toggle isOpen={true} onToggle={onToggle} />);
    expect(
      screen.getByRole('button', { name: 'Close navigation menu' }),
    ).toBeInTheDocument();
  });
});
