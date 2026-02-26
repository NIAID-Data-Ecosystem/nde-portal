import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { SAMPLE_TABLE_CONFIG } from './config';
import { SamplesDisplay } from '.';

const mockSampleTable = jest.fn((props: any) => {
  return <div data-testid='sample-table'>{props.label}</div>;
});

jest.mock('./components/SampleTable', () => ({
  SampleTable: (props: any) => mockSampleTable(props),
}));

jest.mock('./components/SampleCollectionsTable', () => ({
  SampleCollectionItemsTable: ({
    parentIdentifier,
  }: {
    parentIdentifier: string;
  }) => (
    <div data-testid='sample-collection-items-table'>
      {`Collection items for: ${parentIdentifier}`}
    </div>
  ),
}));

const mockRenderCellData = jest.fn((arg: any) => 'CELL_RENDERED');
jest.mock('./components/SampleTable/Cells', () => ({
  Cell: {
    renderCellData: (arg: any) => mockRenderCellData(arg),
  },
}));

// Mock configs
const sampleColumns = [{ property: 'p1' }];
const sampleRows = [{ p1: 'sample-val', other: 123 }];

jest.mock('./config', () => ({
  SAMPLE_TABLE_CONFIG: {
    label: 'Sample Table Label',
    caption: 'Sample Table Caption',
    getColumns: jest.fn(() => [{ property: 'p1' }]),
    getRows: jest.fn(() => [{ p1: 'sample-val', other: 123 }]),
    tableProps: { hasPagination: true }, // example passthrough
  },
  SAMPLE_COLLECTION_TABLE_CONFIG: {
    label: 'Collection Table Label',
    caption: 'Collection Table Caption',
    getColumns: jest.fn(() => [{ property: 'c1' }]),
    getRows: jest.fn(() => [{ c1: 'coll-val' }]),
  },
}));

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe('SamplesDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([null, undefined])('renders null when sample is empty', value => {
    renderWithChakra(<SamplesDisplay sample={value as any} />);
    expect(screen.queryByTestId('sample-table')).not.toBeInTheDocument();
    expect(mockSampleTable).not.toHaveBeenCalled();
  });

  it('renders null when sample type is missing', () => {
    const sample = { '@type': null } as any;

    renderWithChakra(<SamplesDisplay sample={sample} />);
    expect(screen.queryByTestId('sample-table')).not.toBeInTheDocument();
  });

  it('uses SAMPLE_TABLE_CONFIG when @type is Sample', () => {
    const sample = { '@type': 'Sample' } as any;

    renderWithChakra(<SamplesDisplay sample={sample} />);

    // correct label rendered.
    expect(screen.getByTestId('sample-table')).toHaveTextContent(
      'Sample Table Label',
    );

    // called config fns with sample
    expect((SAMPLE_TABLE_CONFIG as any).getColumns).toHaveBeenCalledWith(
      sample,
    );
    expect((SAMPLE_TABLE_CONFIG as any).getRows).toHaveBeenCalledWith(sample);

    // SampleTable received expected props
    const passedProps = mockSampleTable.mock.calls[0][0];
    expect(passedProps.caption).toBe('Sample Table Caption');
    expect(passedProps.tableProps.columns).toEqual(sampleColumns);
    expect(passedProps.tableProps.data).toEqual(sampleRows);
    expect(passedProps.tableProps.hasPagination).toBe(true);
  });

  it('renders SampleCollectionItemsTable when @type is SampleCollection', () => {
    const collection = {
      '@type': 'SampleCollection',
      identifier: 'collection-123',
    } as any;

    renderWithChakra(<SamplesDisplay sample={collection} />);

    expect(
      screen.getByTestId('sample-collection-items-table'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('sample-table')).not.toBeInTheDocument();
    expect(mockSampleTable).not.toHaveBeenCalled();
  });

  it('passes identifier from sample to SampleCollectionItemsTable', () => {
    const collection = {
      '@type': 'SampleCollection',
      identifier: 'my-collection-id',
    } as any;

    renderWithChakra(<SamplesDisplay sample={collection} />);

    expect(
      screen.getByTestId('sample-collection-items-table'),
    ).toHaveTextContent('Collection items for: my-collection-id');
  });

  it('falls back to resourceIdentifier when sample has no identifier', () => {
    const collection = { '@type': 'SampleCollection' } as any;

    renderWithChakra(
      <SamplesDisplay sample={collection} resourceIdentifier='fallback-id' />,
    );

    expect(
      screen.getByTestId('sample-collection-items-table'),
    ).toHaveTextContent('Collection items for: fallback-id');
  });

  it('getCells picks data by column.property and calls Cell.renderCellData with mapped data', () => {
    const sample = { '@type': 'Sample' } as any;

    renderWithChakra(<SamplesDisplay sample={sample} />);

    const passedProps = mockSampleTable.mock.calls[0][0];

    // calls the getCells function the component created.
    const result = passedProps.tableProps.getCells({
      column: { property: 'p1' },
      data: { p1: 'VALUE_FROM_ROW', ignored: 'x' },
    });

    expect(result).toBe('CELL_RENDERED');

    expect(mockRenderCellData).toHaveBeenCalledWith(
      expect.objectContaining({
        column: { property: 'p1' },
        data: 'VALUE_FROM_ROW',
      }),
    );
  });
});
