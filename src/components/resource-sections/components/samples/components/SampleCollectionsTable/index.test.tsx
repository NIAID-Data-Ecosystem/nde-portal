import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { SampleCollectionItemsTable } from '.';
import { useSampleCollectionItems } from '../../hooks/useSampleCollectionItems';

jest.mock('../../hooks/useSampleCollectionItems', () => ({
  useSampleCollectionItems: jest.fn(),
}));

// SampleTable is mocked to a simple prop-dump so tests can assert on exactly
// what the component passed to it (label/caption/columns/data/getCells)
// without depending on SampleTable's own internal rendering.
const mockSampleTable = jest.fn((props: any) => (
  <div data-testid='sample-table'>
    <div data-testid='label'>{props.label}</div>
    <div data-testid='caption'>{props.caption}</div>
    <div data-testid='columns-count'>
      {props.tableProps?.columns?.length ?? 0}
    </div>
    <div data-testid='data-count'>{props.tableProps?.data?.length ?? 0}</div>
    <div data-testid='has-pagination'>
      {String(props.tableProps?.hasPagination)}
    </div>
  </div>
));

jest.mock('../SampleTable', () => ({
  SampleTable: (props: any) => mockSampleTable(props),
}));

const mockRenderCellData = jest.fn((_arg: any) => 'RENDERED_CELL');
jest.mock('../SampleTable/Cells', () => ({
  Cell: {
    renderCellData: (arg: any) => mockRenderCellData(arg),
  },
}));

const mockGetColumns = jest.fn((_arg: any) => [
  { property: 'identifier', title: 'Sample ID' },
]);
const mockGetRows = jest.fn((_arg: any) => [
  { identifier: { identifier: 'FALLBACK1', url: '' } },
]);

// This config backs the "fallback" rendering path, used when the live
// fetch has no data yet but a fallbackSampleCollection was passed in.
jest.mock('../../config', () => ({
  SAMPLE_COLLECTION_TABLE_CONFIG: {
    label: 'Fallback Label',
    caption: 'Fallback Caption',
    getColumns: (arg: any) => mockGetColumns(arg),
    getRows: (arg: any) => mockGetRows(arg),
    tableProps: { hasPagination: true },
  },
}));

const mockGetSampleCollectionItemsColumns = jest.fn((_arg: any) => [
  { title: 'Sample ID', property: '_identifierSort', isSortable: true },
  { title: 'Species', property: 'species', isSortable: false },
]);
const mockGetSampleCollectionItemsRows = jest.fn((_arg: any) => [
  {
    identifier: { identifier: 'S1', url: '' },
    _identifierSort: 'S1',
    species: 'human',
  },
]);

// These helpers back the "main" rendering path, used once samples have
// actually been fetched from the API.
jest.mock('../../helpers', () => ({
  getSampleCollectionItemsColumns: (arg: any) =>
    mockGetSampleCollectionItemsColumns(arg),
  getSampleCollectionItemsRows: (arg: any) =>
    mockGetSampleCollectionItemsRows(arg),
}));

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe('SampleCollectionItemsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Loading: the very first thing the component checks. Nothing else
  // (fallback or fetched data) matters until isLoading is false.
  describe('while the fetch is loading', () => {
    it('renders skeleton placeholders and does not render a table', () => {
      (useSampleCollectionItems as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      const { container } = renderWithChakra(
        <SampleCollectionItemsTable parentIdentifier='parent-1' />,
      );

      // Asserts loading UI is shown.
      const skeletons = container.querySelectorAll('.chakra-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      expect(mockSampleTable).not.toHaveBeenCalled();
    });
  });

  // 2. Once loading is done: if there's no fetched data and no fallback
  // to fall back on, the component should render nothing at all.
  describe('once loading finishes with no data and no fallback', () => {
    it('returns null when samples is an empty array', () => {
      (useSampleCollectionItems as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithChakra(
        <SampleCollectionItemsTable parentIdentifier='parent-1' />,
      );

      expect(screen.queryByTestId('sample-table')).not.toBeInTheDocument();
      expect(mockSampleTable).not.toHaveBeenCalled();
    });

    it('returns null when samples is undefined', () => {
      (useSampleCollectionItems as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      renderWithChakra(
        <SampleCollectionItemsTable parentIdentifier='parent-1' />,
      );

      expect(screen.queryByTestId('sample-table')).not.toBeInTheDocument();
    });

    it('returns null when a fallback is provided but its itemListElement is empty', () => {
      (useSampleCollectionItems as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithChakra(
        <SampleCollectionItemsTable
          parentIdentifier='parent-1'
          fallbackSampleCollection={
            { '@type': 'SampleCollection', itemListElement: [] } as any
          }
        />,
      );

      expect(screen.queryByTestId('sample-table')).not.toBeInTheDocument();
    });
  });

  // 3. Still no fetched data, but this time a usable fallback collection is
  // supplied. This exercises the "fallback" branch, which sources its
  // label/caption/columns/rows from SAMPLE_COLLECTION_TABLE_CONFIG instead
  // of the helpers used for freshly-fetched samples.
  describe('once loading finishes with no data but a usable fallback', () => {
    const fallback = {
      '@type': 'SampleCollection',
      itemListElement: [{ identifier: 'F1' }],
    } as any;

    it('renders SampleTable using SAMPLE_COLLECTION_TABLE_CONFIG', () => {
      (useSampleCollectionItems as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithChakra(
        <SampleCollectionItemsTable
          parentIdentifier='parent-1'
          fallbackSampleCollection={fallback}
        />,
      );

      expect(screen.getByTestId('label')).toHaveTextContent('Fallback Label');
      expect(screen.getByTestId('caption')).toHaveTextContent(
        'Fallback Caption',
      );
      expect(mockGetColumns).toHaveBeenCalledWith(fallback);
      expect(mockGetRows).toHaveBeenCalledWith(fallback);
      expect(screen.getByTestId('columns-count')).toHaveTextContent('1');
      expect(screen.getByTestId('data-count')).toHaveTextContent('1');
      expect(screen.getByTestId('has-pagination')).toHaveTextContent('true');
    });

    it('also takes this path when samples data is undefined (not just an empty array)', () => {
      (useSampleCollectionItems as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      renderWithChakra(
        <SampleCollectionItemsTable
          parentIdentifier='parent-1'
          fallbackSampleCollection={fallback}
        />,
      );

      expect(screen.getByTestId('label')).toHaveTextContent('Fallback Label');
    });

    // In the fallback path, getCells is simpler than in the main path: it
    // reads the value straight off the row using column.property, with no
    // special-casing (unlike the _identifierSort remap used below).
    it('wires getCells to read data directly by column.property', () => {
      (useSampleCollectionItems as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithChakra(
        <SampleCollectionItemsTable
          parentIdentifier='parent-1'
          fallbackSampleCollection={fallback}
        />,
      );

      const props = mockSampleTable.mock.calls[0][0];
      const result = props.tableProps.getCells({
        column: { property: 'identifier' },
        data: { identifier: 'VAL', other: 'x' },
      });

      expect(result).toBe('RENDERED_CELL');
      expect(mockRenderCellData).toHaveBeenCalledWith(
        expect.objectContaining({
          column: { property: 'identifier' },
          data: 'VAL',
        }),
      );
    });
  });

  // 4. The main path: samples were actually fetched.
  describe('once samples have been fetched', () => {
    it('renders the table using the computed columns/rows from the helpers', () => {
      const samples = [{ identifier: 'S1' }, { identifier: 'S2' }];
      (useSampleCollectionItems as jest.Mock).mockReturnValue({
        data: samples,
        isLoading: false,
      });

      renderWithChakra(
        <SampleCollectionItemsTable parentIdentifier='parent-1' />,
      );

      expect(mockGetSampleCollectionItemsColumns).toHaveBeenCalledWith(samples);
      expect(mockGetSampleCollectionItemsRows).toHaveBeenCalledWith(samples);

      expect(screen.getByTestId('label')).toHaveTextContent(
        'Sample Collection Items Table',
      );
      expect(screen.getByTestId('columns-count')).toHaveTextContent('2');
      expect(screen.getByTestId('data-count')).toHaveTextContent('1');
      expect(screen.getByTestId('has-pagination')).toHaveTextContent('true');
    });

    // The caption text is built inline as `${count} sample${count !== 1 ?
    // 's' : ''} in this collection`. These three cases cover the singular
    // boundary (1) plus both sides of the plural branch (2 and 3+).
    describe('caption pluralization', () => {
      it('uses singular "sample" wording for exactly one sample', () => {
        (useSampleCollectionItems as jest.Mock).mockReturnValue({
          data: [{ identifier: 'S1' }],
          isLoading: false,
        });

        renderWithChakra(
          <SampleCollectionItemsTable parentIdentifier='parent-1' />,
        );

        expect(screen.getByTestId('caption')).toHaveTextContent(
          '1 sample in this collection',
        );
      });

      it('uses plural "samples" wording for two samples', () => {
        (useSampleCollectionItems as jest.Mock).mockReturnValue({
          data: [{ identifier: 'S1' }, { identifier: 'S2' }],
          isLoading: false,
        });

        renderWithChakra(
          <SampleCollectionItemsTable parentIdentifier='parent-1' />,
        );

        expect(screen.getByTestId('caption')).toHaveTextContent(
          '2 samples in this collection',
        );
      });

      it('uses plural "samples" wording for more than two samples', () => {
        (useSampleCollectionItems as jest.Mock).mockReturnValue({
          data: [
            { identifier: 'S1' },
            { identifier: 'S2' },
            { identifier: 'S3' },
          ],
          isLoading: false,
        });

        renderWithChakra(
          <SampleCollectionItemsTable parentIdentifier='parent-1' />,
        );

        expect(screen.getByTestId('caption')).toHaveTextContent(
          '3 samples in this collection',
        );
      });
    });

    // getCells here has a special case: the Sample ID column's `property`
    // is '_identifierSort' (a plain string used so useTableSort can compare
    // strings), but the cell must actually render the `identifier` field
    // (an { identifier, url } object) for the link cell to display
    // correctly. Every other column reads its own property directly.
    describe('getCells column-property remapping', () => {
      it('remaps the _identifierSort column to read the identifier field', () => {
        (useSampleCollectionItems as jest.Mock).mockReturnValue({
          data: [{ identifier: 'S1' }],
          isLoading: false,
        });

        renderWithChakra(
          <SampleCollectionItemsTable parentIdentifier='parent-1' />,
        );

        const props = mockSampleTable.mock.calls[0][0];
        const row = {
          identifier: { identifier: 'S1', url: '' },
          _identifierSort: 'S1',
          species: 'human',
        };

        const result = props.tableProps.getCells({
          column: { property: '_identifierSort' },
          data: row,
        });

        expect(result).toBe('RENDERED_CELL');
        expect(mockRenderCellData).toHaveBeenCalledWith(
          expect.objectContaining({
            column: { property: '_identifierSort' },
            data: { identifier: 'S1', url: '' },
          }),
        );
      });

      it('reads other columns (e.g. species) directly, with no remapping', () => {
        (useSampleCollectionItems as jest.Mock).mockReturnValue({
          data: [{ identifier: 'S1' }],
          isLoading: false,
        });

        renderWithChakra(
          <SampleCollectionItemsTable parentIdentifier='parent-1' />,
        );

        const props = mockSampleTable.mock.calls[0][0];
        const result = props.tableProps.getCells({
          column: { property: 'species' },
          data: { species: 'human' },
        });

        expect(result).toBe('RENDERED_CELL');
        expect(mockRenderCellData).toHaveBeenCalledWith(
          expect.objectContaining({
            column: { property: 'species' },
            data: 'human',
          }),
        );
      });
    });
  });

  // 5. A lower-level check that the hook is wired up with the right
  // arguments, independent of which rendering branch is taken.
  describe('data fetching', () => {
    it('calls useSampleCollectionItems with the given parentIdentifier and enabled=true', () => {
      (useSampleCollectionItems as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithChakra(
        <SampleCollectionItemsTable parentIdentifier='parent-xyz' />,
      );

      expect(useSampleCollectionItems).toHaveBeenCalledWith('parent-xyz', true);
    });
  });
});
