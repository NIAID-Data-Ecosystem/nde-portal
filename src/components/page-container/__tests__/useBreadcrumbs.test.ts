import { renderHook } from '@testing-library/react';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import * as helpers from '../helpers';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('../helpers', () => {
  const actual = jest.requireActual('../helpers');
  return {
    ...actual,
    getLabelFromRoute: jest.fn(),
    formatSlug: jest.fn(),
  };
});

describe('useBreadcrumbs', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (helpers.getLabelFromRoute as jest.Mock).mockReturnValue(undefined);
    (helpers.formatSlug as jest.Mock).mockImplementation(slug => slug);

    Object.defineProperty(document, 'title', {
      value: 'Mock Title',
      writable: true,
    });
  });

  it('returns segments from pathname', () => {
    (usePathname as jest.Mock).mockReturnValue('/about/team');
    (useRouter as jest.Mock).mockReturnValue({ query: {} });

    const { result } = renderHook(() => useBreadcrumbs());
    expect(result.current).toEqual([
      { name: 'about', route: '/about', isCurrentPage: false },
      { name: 'team', route: '/about/team', isCurrentPage: true },
    ]);
  });

  it('uses pageTitle for last segment if provided', () => {
    (usePathname as jest.Mock).mockReturnValue('/contact');
    (useRouter as jest.Mock).mockReturnValue({ query: {} });

    const { result } = renderHook(() => useBreadcrumbs('Contact Page'));

    expect(result.current).toEqual([
      { name: 'Contact Page', route: '/contact', isCurrentPage: true },
    ]);
  });

  it('uses document.title as fallback if no pageTitle', () => {
    (usePathname as jest.Mock).mockReturnValue('/custom');
    (useRouter as jest.Mock).mockReturnValue({ query: {} });
    // Mock the getLabelFromRoute to return undefined
    (helpers.getLabelFromRoute as jest.Mock).mockReturnValue(undefined);
    // Mock the formatSlug to return undefined
    (helpers.formatSlug as jest.Mock).mockImplementation(slug => undefined);

    const { result } = renderHook(() => useBreadcrumbs(undefined));

    expect(result.current).toEqual([
      { name: 'Mock Title', route: '/custom', isCurrentPage: true },
    ]);
  });

  it('prepends "Search" + links to referrer path if route starts with /resources', () => {
    (usePathname as jest.Mock).mockReturnValue('/resources/datasets');
    (useRouter as jest.Mock).mockReturnValue({
      query: { referrerPath: '/search/advanced' },
    });

    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([
      {
        name: 'Search',
        route: '/search/advanced',
        isCurrentPage: false,
      },
      {
        name: 'resources',
        route: '/resources',
        isCurrentPage: false,
      },
      {
        name: 'datasets',
        route: '/resources/datasets',
        isCurrentPage: true,
      },
    ]);
  });

  it('defaults to /search if referrerPath is not a string or not valid', () => {
    (usePathname as jest.Mock).mockReturnValue('/resources/dataset');
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
    });
    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current[0]).toEqual({
      name: 'Search',
      route: '/search',
      isCurrentPage: false,
    });
  });

  it('uses getLabelFromRoute if available', () => {
    (usePathname as jest.Mock).mockReturnValue('/custom/path');
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
    });

    (helpers.getLabelFromRoute as jest.Mock).mockImplementation(
      (route: string) => {
        if (route === '/custom') return 'Custom Label';
        if (route === '/custom/path') return 'path';
        return undefined;
      },
    );

    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([
      { name: 'Custom Label', route: '/custom', isCurrentPage: false },
      { name: 'path', route: '/custom/path', isCurrentPage: true },
    ]);
  });
});
