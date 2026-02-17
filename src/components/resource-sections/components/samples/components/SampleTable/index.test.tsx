import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { SampleTable } from '.';

const mockTable = jest.fn((props: any) => {
  return (
    <div data-testid='mock-table'>
      <div data-testid='ariaLabel'>{props.ariaLabel}</div>
      <div data-testid='caption'>{props.caption}</div>
      <div data-testid='columns-count'>{props.columns?.length ?? 0}</div>
      <div data-testid='data-count'>{props.data?.length ?? 0}</div>
    </div>
  );
});

jest.mock('src/components/table', () => ({
  Table: (props: any) => mockTable(props),
}));

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe('SampleTable', () => {
  beforeEach(() => {
    mockTable.mockClear();
  });

  it('renders header title and optional description', () => {
    renderWithChakra(
      <SampleTable
        label='My label'
        caption='My caption'
        header={{
          title: 'Header Title',
          description: 'This is my descriptive text.',
        }}
      />,
    );

    expect(screen.getByText('Header Title')).toBeInTheDocument();
    expect(
      screen.getByText('This is my descriptive text.'),
    ).toBeInTheDocument();
  });

  it('does not render a header when header is missing', () => {
    renderWithChakra(<SampleTable label='My label' caption='My caption' />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('passes label/caption to Table as ariaLabel/caption', () => {
    renderWithChakra(
      <SampleTable label='Accessible label' caption='Table caption' />,
    );

    expect(mockTable).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('ariaLabel')).toHaveTextContent(
      'Accessible label',
    );
    expect(screen.getByTestId('caption')).toHaveTextContent('Table caption');
  });

  it('passes default table container props and alternating row bg function', () => {
    renderWithChakra(<SampleTable label='Label' caption='Caption' />);

    const props = mockTable.mock.calls[0][0];

    expect(props.tableContainerProps).toEqual(
      expect.objectContaining({
        overflowY: 'auto',
        maxHeight: '400px',
      }),
    );

    expect(typeof props.getTableRowProps).toBe('function');
    expect(props.getTableRowProps(null, 0)).toEqual(
      expect.objectContaining({ bg: 'white' }),
    );
    expect(props.getTableRowProps(null, 1)).toEqual(
      expect.objectContaining({ bg: 'page.alt' }),
    );
    expect(props.getTableRowProps(null, 2)).toEqual(
      expect.objectContaining({ bg: 'white' }),
    );
  });

  it('defaults columns/data to empty arrays when tableProps not provided', () => {
    renderWithChakra(<SampleTable label='Label' caption='Caption' />);

    expect(screen.getByTestId('columns-count')).toHaveTextContent('0');
    expect(screen.getByTestId('data-count')).toHaveTextContent('0');
  });

  it('uses tableProps columns/data when provided', () => {
    renderWithChakra(
      <SampleTable
        label='Label'
        caption='Caption'
        tableProps={{
          columns: [{ property: 'a', title: 'A' }] as any,
          data: [{ a: 1 }, { a: 2 }],
        }}
      />,
    );

    expect(screen.getByTestId('columns-count')).toHaveTextContent('1');
    expect(screen.getByTestId('data-count')).toHaveTextContent('2');
  });

  it('getCells prefers tableProps.getCells over column.renderCell', () => {
    const tablePropsGetCells = jest.fn(() => 'FROM_TABLEPROPS');

    renderWithChakra(
      <SampleTable
        label='Label'
        caption='Caption'
        tableProps={{
          getCells: tablePropsGetCells,
        }}
      />,
    );

    const props = mockTable.mock.calls[0][0];

    const columnRenderCell = jest.fn(() => 'FROM_COLUMN');
    const result = props.getCells({
      column: { renderCell: columnRenderCell },
      data: { some: 'row' },
    });

    expect(result).toBe('FROM_TABLEPROPS');
    expect(tablePropsGetCells).toHaveBeenCalledTimes(1);
    expect(columnRenderCell).not.toHaveBeenCalled();
  });

  it('getCells falls back to column.renderCell when tableProps.getCells is not provided', () => {
    renderWithChakra(
      <SampleTable label='Label' caption='Caption' tableProps={{}} />,
    );

    const props = mockTable.mock.calls[0][0];

    const columnRenderCell = jest.fn(() => 'FROM_COLUMN');
    const result = props.getCells({
      column: { renderCell: columnRenderCell },
      data: { some: 'row' },
    });

    expect(result).toBe('FROM_COLUMN');
    expect(columnRenderCell).toHaveBeenCalledTimes(1);
  });

  it('getCells returns null if neither tableProps.getCells nor column.renderCell exist', () => {
    renderWithChakra(<SampleTable label='Label' caption='Caption' />);

    const props = mockTable.mock.calls[0][0];

    const result = props.getCells({
      column: {},
      data: {},
    });

    expect(result).toBeNull();
  });
});
