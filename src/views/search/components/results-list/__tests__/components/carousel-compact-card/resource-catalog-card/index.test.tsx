import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';
import { ResourceCatalogCard } from 'src/views/search/components/results-list/components/carousel-compact-card/resource-catalog-card';

// The card is rendered with the real CompactCard, but its many leaf UI
// dependencies are stubbed so each test can assert on the card's own logic
// rather than the internals of badges, scroll containers, etc.
jest.mock('src/components/resource-sections/components', () => ({
  // TypeBanner receives the computed label/type and the NIAID-funded flag.
  TypeBanner: ({ label, type, isNiaidFunded }: any) => (
    <div
      data-testid='type-banner'
      data-label={label}
      data-type={type}
      data-niaid-funded={String(!!isNiaidFunded)}
    />
  ),
}));

jest.mock('src/components/skeleton', () => ({
  Skeleton: ({ children }: any) => <div data-testid='skeleton'>{children}</div>,
}));

jest.mock('src/components/badges', () => ({
  ConditionsOfAccess: () => <div data-testid='conditions-of-access' />,
  CreativeWorkStatus: ({ creativeWorkStatus }: any) => (
    <div data-testid='creative-work-status' data-status={creativeWorkStatus} />
  ),
}));

jest.mock('src/components/badges/components/HasAPI', () => ({
  HasAPI: () => <div data-testid='has-api' />,
}));

jest.mock('src/components/metadata', () => ({
  MetadataLabel: ({ label }: any) => (
    <div data-testid='metadata-label'>{label}</div>
  ),
}));

jest.mock('src/components/scroll-container', () => ({
  ScrollContainer: ({ children }: any) => <div>{children}</div>,
}));

// Interactive SearchableItems stub. The real component decides internally when
// to expand/collapse. The buttons that call `onToggle` are explicitly exposed
// so the description toggle interaction can be driven deterministically. The
// computed `generateButtonLabel` text and each item's name are also rendered.
jest.mock('src/components/searchable-items', () => ({
  SearchableItems: ({
    items,
    itemLimit,
    onToggle,
    generateButtonLabel,
  }: any) => (
    <div data-testid='searchable-items'>
      <button onClick={() => onToggle(true)}>expand-types</button>
      <button onClick={() => onToggle(false)}>collapse-types</button>
      <span data-testid='toggle-label'>
        {generateButtonLabel(itemLimit, items.length)}
      </span>
      {items.map((item: any) => (
        <span key={item.value}>{item.name}</span>
      ))}
    </div>
  ),
}));

// Mock the NIAID-funded helper so that the flag can be controlled
// independently of the real implementation.
jest.mock('src/utils/helpers/sources', () => ({
  isSourceFundedByNiaid: jest.fn(() => false),
}));

const mockedIsSourceFundedByNiaid =
  isSourceFundedByNiaid as jest.MockedFunction<typeof isSourceFundedByNiaid>;

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe('ResourceCatalogCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('title and link', () => {
    it('renders the name as a link built from the id', () => {
      // With an id present the Title gets linkProps; next/link mock renders the
      // object href's pathname ('/resources/') as the anchor href.
      renderWithChakra(
        <ResourceCatalogCard
          data={
            { '@type': 'ResourceCatalog', id: 'abc', name: 'My Catalog' } as any
          }
        />,
      );
      const link = screen.getByRole('link', { name: /my catalog/i });
      expect(link).toHaveAttribute('href', '/resources/');
    });

    it('falls back to alternateName when name is missing', () => {
      renderWithChakra(
        <ResourceCatalogCard
          data={
            {
              '@type': 'ResourceCatalog',
              id: 'abc',
              alternateName: 'Alt Name',
            } as any
          }
        />,
      );
      expect(screen.getByText('Alt Name')).toBeInTheDocument();
    });

    it('renders the title without a link when there is no id', () => {
      renderWithChakra(
        <ResourceCatalogCard
          data={{ '@type': 'ResourceCatalog', name: 'No Link Catalog' } as any}
        />,
      );
      expect(screen.getByText('No Link Catalog')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('banner', () => {
    it('defaults label and type to ResourceCatalog when @type is missing', () => {
      // `type || 'ResourceCatalog'`: an entry with no @type still renders a
      // sensible banner.
      renderWithChakra(
        <ResourceCatalogCard data={{ name: 'Untyped' } as any} />,
      );
      expect(screen.getByTestId('type-banner')).toHaveAttribute(
        'data-type',
        'ResourceCatalog',
      );
    });

    it('passes includedInDataCatalog to isSourceFundedByNiaid and forwards the result', () => {
      mockedIsSourceFundedByNiaid.mockReturnValue(true);
      const includedInDataCatalog = { name: 'NIAID' } as any;

      renderWithChakra(
        <ResourceCatalogCard
          data={
            {
              '@type': 'ResourceCatalog',
              name: 'Funded',
              includedInDataCatalog,
            } as any
          }
        />,
      );

      expect(mockedIsSourceFundedByNiaid).toHaveBeenCalledWith(
        includedInDataCatalog,
      );
      expect(screen.getByTestId('type-banner')).toHaveAttribute(
        'data-niaid-funded',
        'true',
      );
    });
  });

  describe('date and badges', () => {
    it('does not render the date block when there is no date', () => {
      renderWithChakra(
        <ResourceCatalogCard
          data={{ '@type': 'ResourceCatalog', name: 'No Date' } as any}
        />,
      );
      expect(screen.queryByText('2024-01-01')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('conditions-of-access'),
      ).not.toBeInTheDocument();
    });

    it('renders the date and the badge row when badges are present', () => {
      // The badge Flex renders when conditionsOfAccess || hasAPI ||
      // creativeWorkStatus === 'Retired'. Here conditionsOfAccess triggers it,
      // and HasAPI appears because hasAPI is truthy.
      renderWithChakra(
        <ResourceCatalogCard
          data={
            {
              '@type': 'ResourceCatalog',
              name: 'Dated',
              date: '2024-01-01',
              conditionsOfAccess: 'Open',
              hasAPI: true,
            } as any
          }
        />,
      );
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();
      expect(screen.getByTestId('conditions-of-access')).toBeInTheDocument();
      expect(screen.getByTestId('has-api')).toBeInTheDocument();
    });

    it('omits HasAPI when hasAPI is falsy', () => {
      renderWithChakra(
        <ResourceCatalogCard
          data={
            {
              '@type': 'ResourceCatalog',
              name: 'Dated',
              date: '2024-01-01',
              conditionsOfAccess: 'Open',
            } as any
          }
        />,
      );
      expect(screen.queryByTestId('has-api')).not.toBeInTheDocument();
    });

    it('renders the badge row for a Retired resource even without other badges', () => {
      // `creativeWorkStatus === 'Retired'` alone satisfies the badge-row
      // condition.
      renderWithChakra(
        <ResourceCatalogCard
          data={
            {
              '@type': 'ResourceCatalog',
              name: 'Retired Catalog',
              date: '2024-01-01',
              creativeWorkStatus: 'Retired',
            } as any
          }
        />,
      );
      expect(screen.getByTestId('creative-work-status')).toHaveAttribute(
        'data-status',
        'Retired',
      );
    });
  });

  describe('content types', () => {
    it('does not render the content-types block when about is empty', () => {
      renderWithChakra(
        <ResourceCatalogCard
          data={{ '@type': 'ResourceCatalog', name: 'No About' } as any}
        />,
      );
      expect(screen.queryByTestId('metadata-label')).not.toBeInTheDocument();
    });

    it('renders content types and a "show more" label when about exceeds the limit', () => {
      // itemLimit is 2 and there are 3 items, so generateButtonLabel produces
      // "Show more types (1 more)" (length - limit = 1).
      renderWithChakra(
        <ResourceCatalogCard
          data={
            {
              '@type': 'ResourceCatalog',
              name: 'With About',
              about: [
                { displayName: 'Genomics' },
                { displayName: 'Proteomics' },
                { displayName: 'Imaging' },
              ],
            } as any
          }
        />,
      );
      expect(screen.getByTestId('metadata-label')).toHaveTextContent(
        'Content Types',
      );
      expect(screen.getByText('Genomics')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-label')).toHaveTextContent(
        'Show more types (1 more)',
      );
    });

    it('produces a "Show fewer types" label when the limit equals the item count', () => {
      renderWithChakra(
        <ResourceCatalogCard
          data={
            {
              '@type': 'ResourceCatalog',
              name: 'With About',
              about: [
                { displayName: 'Genomics' },
                { displayName: 'Proteomics' },
              ],
            } as any
          }
        />,
      );
      expect(screen.getByTestId('toggle-label')).toHaveTextContent(
        'Show fewer types',
      );
    });
  });

  describe('description toggle', () => {
    const dataWithDescriptionAndAbout = {
      '@type': 'ResourceCatalog',
      name: 'Toggle Catalog',
      description: '   A trimmed description.   ',
      about: [
        { displayName: 'Genomics' },
        { displayName: 'Proteomics' },
        { displayName: 'Imaging' },
      ],
    } as any;

    it('shows the trimmed description by default', () => {
      renderWithChakra(
        <ResourceCatalogCard data={dataWithDescriptionAndAbout} />,
      );
      // The component calls description.trim(), so surrounding whitespace
      // is gone.
      expect(screen.getByText('A trimmed description.')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /see description/i }),
      ).not.toBeInTheDocument();
    });

    it('swaps the description for a "See description" button when types are expanded, and restores it on click', () => {
      // `showAllTypes` state controls this: expanding the type list
      // (onToggle(true)) hides the description and shows the "See description"
      // button; clicking that button (handleShowDescription)
      // resets showAllTypes to false, bringing the description back.
      renderWithChakra(
        <ResourceCatalogCard data={dataWithDescriptionAndAbout} />,
      );

      // Expand the content types: description is replaced by the button.
      fireEvent.click(screen.getByText('expand-types'));
      expect(
        screen.queryByText('A trimmed description.'),
      ).not.toBeInTheDocument();
      const seeDescription = screen.getByRole('button', {
        name: /see description/i,
      });
      expect(seeDescription).toBeInTheDocument();

      // Click "See description": description comes back.
      fireEvent.click(seeDescription);
      expect(screen.getByText('A trimmed description.')).toBeInTheDocument();
    });

    it('does not render the description block when there is no description', () => {
      renderWithChakra(
        <ResourceCatalogCard
          data={{ '@type': 'ResourceCatalog', name: 'No Desc' } as any}
        />,
      );
      expect(
        screen.queryByRole('button', { name: /see description/i }),
      ).not.toBeInTheDocument();
    });
  });
});
