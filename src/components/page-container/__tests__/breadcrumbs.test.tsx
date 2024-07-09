import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs, BreadcrumbItem } from '../components/breadcrumbs';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';

// Mock useRouter and any other router-related hooks
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('BreadcrumbItem Component', () => {
  const path = { name: 'Test' };

  it('renders correctly with an icon', () => {
    render(<BreadcrumbItem path={path} isCurrentPage={false} />);
    const textElement = screen.getByText('Test');
    expect(textElement).toBeInTheDocument();
  });

  it('applies correct styles when it is the current page', () => {
    render(<BreadcrumbItem path={path} isCurrentPage={true} />);
    const textElement = screen.getByText('Test');
    expect(textElement).toHaveStyle('opacity: 0.9');
  });
});

describe('Breadcrumbs Component', () => {
  it('renders home and dynamic segments correctly', () => {
    const mockPathname = '/test/path';
    (useRouter as jest.Mock).mockReturnValue({
      pathname: mockPathname,
    });
    (usePathname as jest.Mock).mockReturnValue(mockPathname);
    render(<Breadcrumbs />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Path')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3); // Home, Test, Path
    // but only 2 are links (since the current page is not a link)
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
  it('renders null when there are no path segments', () => {
    const mockPathname = '/';

    (useRouter as jest.Mock).mockReturnValue({
      pathname: mockPathname,
    });
    (usePathname as jest.Mock).mockReturnValue(mockPathname);
    const { container } = render(<Breadcrumbs />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders resource breadcrumbs correctly', () => {
    const mockPathname = '/resources/dde_9142024b72770a67';
    (useRouter as jest.Mock).mockReturnValue({
      pathname: mockPathname,
    });
    (usePathname as jest.Mock).mockReturnValue(mockPathname);
    render(<Breadcrumbs />);
    expect(screen.getByRole('link', { name: 'Search' })).toBeInTheDocument;
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.queryByText(/dde_9142024b72770a67/i)).not.toBeInTheDocument();
  });

  it('links to refferer path when provided', () => {
    const mockPathname = '/resources/dde_9142024b72770a67';
    (useRouter as jest.Mock).mockReturnValue({
      pathname: mockPathname,
      query: {
        referrerPath:
          '/search?from=1&filters=%28%40type%3A%28%22Dataset%22%29%29',
        id: 'dde_9142024b72770a67',
      },
    });
    (usePathname as jest.Mock).mockReturnValue(mockPathname);
    render(<Breadcrumbs />);
    expect(screen.getByRole('link', { name: 'Search' })).toHaveAttribute(
      'href',
      '/search?from=1&filters=%28%40type%3A%28%22Dataset%22%29%29',
    );
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });
});
