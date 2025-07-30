import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    render(
      <Breadcrumbs
        segments={[
          {
            name: 'Diseases',
            route: '/diseases',
            isCurrentPage: false,
          },
          {
            name: 'HIV/AIDS',
            route: '/diseases/HIV-AIDS',
            isCurrentPage: true,
          },
        ]}
      />,
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Diseases')).toBeInTheDocument();
    expect(screen.getByText('HIV/AIDS')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3); // Home, Diseases, HIV/AIDS
    // but only 2 are links (since the current page is not a link)
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
  it('renders null when there are no path segments', () => {
    const { container } = render(<Breadcrumbs segments={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
