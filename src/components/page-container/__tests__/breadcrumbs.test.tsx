import React from 'react';
import { render, screen, within } from 'src/__tests__/utils/render';

import { Breadcrumbs } from '../components/breadcrumbs';
import { BreadcrumbSegment } from '../hooks/useBreadcrumbs';

/*
`Breadcrumbs` is purely presentational — it reads nothing from the router, so
these tests only cover how a given `segments` array maps to markup. The logic
that derives those segments from the URL lives in `useBreadcrumbs` and is
covered by `useBreadcrumbs.test.ts`.

Note on roles: Chakra renders the current crumb as a `<span role="link">`, so
it *is* matched by `getByRole('link')`. What distinguishes it is
`aria-current="page"` and the absence of an `href`, which is what these tests
assert on. Separators are `aria-hidden` list items and therefore excluded from
`getAllByRole('listitem')`.
*/

const segments: BreadcrumbSegment[] = [
  { name: 'Diseases', route: '/diseases', isCurrentPage: false },
  { name: 'HIV/AIDS', route: '/diseases/HIV-AIDS', isCurrentPage: true },
];

describe('Breadcrumbs', () => {
  it('renders nothing when there are no segments', () => {
    const { container } = render(<Breadcrumbs segments={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('exposes a labelled navigation landmark containing a list', () => {
    render(<Breadcrumbs segments={segments} />);
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(within(nav).getByRole('list')).toBeInTheDocument();
  });

  it('always prepends a Home crumb linking to the site root', () => {
    render(<Breadcrumbs segments={segments} />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('renders Home plus one crumb per segment, in order', () => {
    render(<Breadcrumbs segments={segments} />);
    expect(
      screen.getAllByRole('listitem').map(item => item.textContent),
    ).toEqual(['Home', 'Diseases', 'HIV/AIDS']);
  });

  it('links non-current segments to their route', () => {
    render(<Breadcrumbs segments={segments} />);
    const link = screen.getByRole('link', { name: 'Diseases' });
    expect(link).toHaveAttribute('href', '/diseases');
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('marks the current segment with aria-current and no href', () => {
    render(<Breadcrumbs segments={segments} />);
    const current = screen.getByRole('link', { name: 'HIV/AIDS' });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).not.toHaveAttribute('href');
  });

  it('honours the isCurrentPage flag rather than segment position', () => {
    render(
      <Breadcrumbs
        segments={[
          { name: 'Diseases', route: '/diseases', isCurrentPage: true },
          {
            name: 'HIV/AIDS',
            route: '/diseases/HIV-AIDS',
            isCurrentPage: false,
          },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Diseases' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'HIV/AIDS' })).toHaveAttribute(
      'href',
      '/diseases/HIV-AIDS',
    );
  });
  it('does not render links for routes outside the site', () => {
    render(
      <Breadcrumbs
        segments={[
          {
            name: 'Search',
            route: 'javascript:alert(document.domain)//search',
            isCurrentPage: false,
          },
          {
            name: 'Elsewhere',
            route: 'https://example.com/search',
            isCurrentPage: false,
          },
          { name: 'Resources', route: '/resources', isCurrentPage: true },
        ]}
      />,
    );
    expect(screen.queryByText('Search')).not.toBeInTheDocument();
    expect(screen.queryByText('Elsewhere')).not.toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    // Only the home link remains, since the current page is not a link.
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
  it('renders null when there are no path segments', () => {
    const { container } = render(<Breadcrumbs segments={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
