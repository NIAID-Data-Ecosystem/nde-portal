import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableData, TableWithSearch } from '..';
import { renderWithClient } from 'src/__tests__/mocks/utils';

const mockData = [
  {
    _id: 'source_01',
    name: 'Source 1',
    abstract: 'Lorem ipsum dolor sit amet',
    domain: 'IID',
    conditionsOfAccess: 'Open',
    type: 'ResourceCatalog',
  },
  {
    _id: 'source_02',
    name: 'Source 2',
    abstract: 'Orci varius natoque penatibus et magnis dis parturient montes',
    domain: 'Generalist',
    conditionsOfAccess: 'Open',
    type: 'Dataset',
  },
  {
    _id: 'source_03',
    name: 'Source 3',
    abstract: 'Lorem ipsum dolor sit amet',
    domain: 'IID',
    conditionsOfAccess: 'Restricted',
    type: 'ResourceCatalog',
  },
  {
    _id: '04',
    name: 'Sample Article',
    abstract: 'An abstract here',
    domain: 'Generalist',
    conditionsOfAccess: 'Unknown',
    type: 'Dataset',
  },
] as TableData[];
const mockColumns = [
  {
    title: 'name',
    property: 'name',
    isSortable: true,
    props: { maxW: '280px', minW: '280px' },
  },
  {
    title: 'description',
    property: 'abstract',
  },
  {
    title: 'Type',
    property: 'type',
    isSortable: true,
    props: { maxW: '180px', minW: '180px' },
  },
  {
    title: 'Research Domain',
    property: 'domain',
    isSortable: true,
    props: { maxW: '225px', minW: '225px' },
  },
  {
    title: 'access',
    property: 'conditionsOfAccess',
    isSortable: true,
    props: { maxW: '150px', minW: '150px' },
  },
];

describe('TableWithSearch Component', () => {
  const ariaLabel = 'Table of repositories and resource catalogs';
  const defaultProps = {
    ariaLabel,
    caption: 'List of repositories and resource catalogs',
    isLoading: false,
  };

  it('renders without crashing', () => {
    // render with client used for chakra ui skeleton components
    renderWithClient(
      <TableWithSearch
        data={mockData}
        columns={mockColumns}
        {...defaultProps}
      />,
    );
    const table = screen.getByRole('table', {
      name: ariaLabel,
    });
    expect(table).toBeInTheDocument();
  });

  it('displays no results found when data is empty', () => {
    render(
      <TableWithSearch data={[]} columns={mockColumns} {...defaultProps} />,
    );
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('updates search term and filters data', async () => {
    renderWithClient(
      <TableWithSearch
        data={mockData}
        columns={mockColumns}
        {...defaultProps}
      />,
    );
    const searchInput = screen.getByLabelText('Search table');
    userEvent.type(searchInput, 'Sample');
    await waitFor(() => {
      expect(screen.getByText('Sample Article')).toBeInTheDocument();
    });
  });

  it('displays filter tags when filters are applied', async () => {
    const { rerender } = renderWithClient(
      <TableWithSearch
        data={mockData}
        columns={mockColumns}
        {...defaultProps}
      />,
    );
    // Find the filter and simulate a click
    const typeButton = screen.getByRole('button', { name: /type/i });
    await userEvent.click(typeButton);
    const checkboxInput = screen.getByRole('checkbox', {
      name: 'Resource Catalog',
    });
    // Simulate the user clicking the checkbox
    await userEvent.click(checkboxInput);

    rerender(
      <TableWithSearch
        data={mockData}
        columns={mockColumns}
        {...defaultProps}
      />,
    );

    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });
  it('clears all filters when clear all is clicked', async () => {
    const { rerender } = renderWithClient(
      <TableWithSearch
        data={mockData}
        columns={mockColumns}
        {...defaultProps}
      />,
    );
    // Find the filter and simulate a click
    const typeButton = screen.getByRole('button', { name: /type/i });
    await userEvent.click(typeButton);
    const checkboxInput = screen.getByRole('checkbox', {
      name: 'Resource Catalog',
    });
    // Simulate the user clicking the checkbox
    await userEvent.click(checkboxInput);

    rerender(
      <TableWithSearch
        data={mockData}
        columns={mockColumns}
        {...defaultProps}
      />,
    );

    const clearAllContainer = screen.getByText('Clear all').parentElement;

    if (!clearAllContainer) throw new Error('Clear all container not found');
    const closeButton = within(clearAllContainer).getByRole('button', {
      name: 'close',
    });

    await userEvent.click(closeButton);

    expect(closeButton).not.toBeInTheDocument();
  });
});
