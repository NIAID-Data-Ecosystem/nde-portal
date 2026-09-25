import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { CompactCard } from 'src/views/search/components/results-list/components/carousel-compact-card/compact-card';

// Tests focus on `CompactCard`'s own layout/prop-forwarding logic:
//   - TypeBanner: exposes the props it receives as data-attributes so it can
//     assert that Banner forwards them correctly.
//   - Skeleton: a passthrough that always renders children and surfaces its
//     `isLoaded` value as `data-loaded`, making the loading state
//     deterministic.
jest.mock('src/components/resource-sections/components', () => ({
  TypeBanner: ({ label, type, isNiaidFunded, creativeWorkStatus }: any) => (
    <div
      data-testid='type-banner'
      data-label={label}
      data-type={type}
      data-niaid-funded={String(!!isNiaidFunded)}
      data-creative-work-status={creativeWorkStatus ?? ''}
    />
  ),
}));

jest.mock('src/components/skeleton', () => ({
  Skeleton: ({ isLoaded, children }: any) => (
    <div data-testid='skeleton' data-loaded={String(!!isLoaded)}>
      {children}
    </div>
  ),
}));

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe('CompactCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Base', () => {
    it('renders its children', () => {
      renderWithChakra(
        <CompactCard.Base>
          <span>base content</span>
        </CompactCard.Base>,
      );
      expect(screen.getByText('base content')).toBeInTheDocument();
    });

    it('forwards extra Chakra card props to the underlying Card', () => {
      // `Base` spreads `...cardProps` onto the Chakra Card, so arbitrary props
      // (like data-testid) reach the rendered DOM node.
      renderWithChakra(
        <CompactCard.Base data-testid='base-card'>
          <span>child</span>
        </CompactCard.Base>,
      );
      expect(screen.getByTestId('base-card')).toBeInTheDocument();
    });

    it('renders children regardless of isLoading (Base ignores it)', () => {
      // `isLoading` is part of BaseProps but Base intentionally does not
      //  use it, so children render whether or not it is set.
      renderWithChakra(
        <CompactCard.Base isLoading>
          <span>still visible</span>
        </CompactCard.Base>,
      );
      expect(screen.getByText('still visible')).toBeInTheDocument();
    });
  });

  describe('Banner', () => {
    it('forwards label, type and isNiaidFunded to TypeBanner', () => {
      renderWithChakra(
        <CompactCard.Banner
          label='Dataset'
          type='Dataset'
          isNiaidFunded={true}
        />,
      );
      const banner = screen.getByTestId('type-banner');
      expect(banner).toHaveAttribute('data-label', 'Dataset');
      expect(banner).toHaveAttribute('data-type', 'Dataset');
      expect(banner).toHaveAttribute('data-niaid-funded', 'true');
    });

    it('spreads extra props (e.g. creativeWorkStatus) through to TypeBanner', () => {
      // Banner only names label/type/isNiaidFunded/isLoading explicitly; every
      // other TypeBanner prop rides along via `{...props}`.
      renderWithChakra(
        <CompactCard.Banner
          label='Resource Catalog'
          type='ResourceCatalog'
          creativeWorkStatus='Retired'
        />,
      );
      expect(screen.getByTestId('type-banner')).toHaveAttribute(
        'data-creative-work-status',
        'Retired',
      );
    });

    it('marks its Skeleton as not loaded while loading', () => {
      renderWithChakra(
        <CompactCard.Banner label='Dataset' type='Dataset' isLoading />,
      );
      expect(screen.getByTestId('skeleton')).toHaveAttribute(
        'data-loaded',
        'false',
      );
    });
  });

  describe('Header', () => {
    // Header renders a Chakra CardHeader, which reads style context from an
    // enclosing Card. In real usage Header is always nested inside Base, so
    // it's possible to wrap it in Base here too.
    it('renders children when not loading', () => {
      renderWithChakra(
        <CompactCard.Base>
          <CompactCard.Header>
            <span>header content</span>
          </CompactCard.Header>
        </CompactCard.Base>,
      );
      expect(screen.getByText('header content')).toBeInTheDocument();
    });

    it('does not render children while loading', () => {
      // Header guards its children with `{!isLoading && children}`, so during
      // loading the children are absent from the DOM entirely. This is why
      // loading-state assertions won't find a title.
      renderWithChakra(
        <CompactCard.Base>
          <CompactCard.Header isLoading>
            <span>header content</span>
          </CompactCard.Header>
        </CompactCard.Base>,
      );
      expect(screen.queryByText('header content')).not.toBeInTheDocument();
      expect(screen.getByTestId('skeleton')).toHaveAttribute(
        'data-loaded',
        'false',
      );
    });
  });

  describe('Title', () => {
    it('renders plain text with no link when linkProps is absent', () => {
      renderWithChakra(<CompactCard.Title>A plain title</CompactCard.Title>);
      expect(screen.getByText('A plain title')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('wraps the title in a link when linkProps is provided', () => {
      // The global next/link mock (jest.setup.js) renders an <a>, and for an
      // object `href` it uses `href.pathname` as the anchor's href attribute.
      renderWithChakra(
        <CompactCard.Title
          linkProps={{
            href: { pathname: '/resources/', query: { id: '123' } },
            as: '/resources?id=123',
          }}
        >
          Linked title
        </CompactCard.Title>,
      );
      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('Linked title');
      expect(link).toHaveAttribute('href', '/resources/');
    });
  });

  describe('Body', () => {
    // Body renders a Chakra CardBody, which (like CardHeader) needs an
    // enclosing Card for its style context, so Body is nested inside Base.
    it('renders its children', () => {
      renderWithChakra(
        <CompactCard.Base>
          <CompactCard.Body>
            <span>body content</span>
          </CompactCard.Body>
        </CompactCard.Base>,
      );
      expect(screen.getByText('body content')).toBeInTheDocument();
    });
  });
});
