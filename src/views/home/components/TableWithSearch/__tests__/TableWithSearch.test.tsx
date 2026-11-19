import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithClient } from 'src/__tests__/mocks/utils';
import { render, screen, waitFor, within } from 'src/__tests__/utils/render';

import { TableData, TableWithSearch } from '..';
import { RESOURCES_TABLE_COLUMNS } from '../columns';

const mockData = [
  {
    _id: 'source_01',
    name: 'Source 1',
    abstract: 'Lorem ipsum dolor sit amet',
    domain: 'IID',
    conditionsOfAccess: 'Open',
    type: ['Resource Catalog'],
  },
  {
    _id: 'source_02',
    name: 'Source 2',
    abstract: 'Orci varius natoque penatibus et magnis dis parturient montes',
    domain: 'Generalist',
    conditionsOfAccess: 'Open',
    type: ['Dataset Repository'],
  },
  {
    _id: 'source_03',
    name: 'Source 3',
    abstract: 'Lorem ipsum dolor sit amet',
    domain: 'IID',
    conditionsOfAccess: 'Restricted',
    type: ['Resource Catalog'],
  },
  {
    _id: '04',
    name: 'Sample Article',
    abstract: 'An abstract here',
    domain: 'Generalist',
    conditionsOfAccess: 'Unknown',
    type: ['Dataset Repository'],
  },
] as TableData[];
const mockColumns = RESOURCES_TABLE_COLUMNS;

describe('TableWithSearch Component', () => {
  const label = 'List of repositories and resource catalogs';
  const defaultProps = { label, loading: false };

  /** Body rows' cell text, in order. */
  const getBodyRows = () =>
    within(screen.getByRole('table', { name: label }))
      .getAllByRole('row')
      .slice(1)
      .map(row =>
        within(row)
          .getAllByRole('cell')
          .map(cell => cell.textContent),
      );

  it('renders without crashing', () => {
    // render with client used for chakra ui skeleton components
    renderWithClient(
      <TableWithSearch
        data={mockData}
        columns={mockColumns}
        {...defaultProps}
      />,
    );
    const table = screen.getByRole('table', { name: label });
    expect(table).toBeInTheDocument();
  });

  it('displays no results found when data is empty', () => {
    render(
      <TableWithSearch data={[]} columns={mockColumns} {...defaultProps} />,
    );
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('starts sorted by name, ascending', () => {
    renderWithClient(
      <TableWithSearch
        data={mockData}
        columns={mockColumns}
        {...defaultProps}
      />,
    );
    expect(getBodyRows().map(cells => cells[0])).toEqual([
      'Sample Article',
      'Source 1',
      'Source 2',
      'Source 3',
    ]);
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
  });

  it('links names to their url and lists types and domains alphabetically', () => {
    renderWithClient(
      <TableWithSearch
        data={[
          {
            _id: 'source_05',
            name: 'Linked Source',
            abstract: 'Has a link',
            domain: ['IID', 'Generalist'],
            conditionsOfAccess: 'Open Access',
            type: ['Resource Catalog', 'Dataset Repository'],
            url: '/search?q=linked',
          },
        ]}
        columns={mockColumns}
        {...defaultProps}
      />,
    );
    expect(screen.getByRole('link', { name: 'Linked Source' })).toHaveAttribute(
      'href',
      '/search?q=linked',
    );
    expect(getBodyRows()[0]).toEqual([
      'Linked Source',
      'Has a link',
      'Dataset Repository, Resource Catalog',
      'Generalist, IID',
      'Open Access',
    ]);
  });

  it('shows "No data" for missing values', () => {
    renderWithClient(
      <TableWithSearch
        data={[
          {
            _id: 'source_06',
            name: 'Sparse Source',
            domain: '',
            conditionsOfAccess: '',
            type: [],
          },
        ]}
        columns={mockColumns}
        {...defaultProps}
      />,
    );
    expect(getBodyRows()[0]).toEqual([
      'Sparse Source',
      '—No data',
      '—No data',
      '—No data',
      '—No data',
    ]);
  });

  it('shows the empty state when the search matches nothing', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <TableWithSearch
        data={mockData}
        columns={mockColumns}
        emptyState={<p>No items match</p>}
        {...defaultProps}
      />,
    );
    await user.type(screen.getByLabelText('Search table'), 'zzz-no-match');
    expect(await screen.findByText('No items match')).toBeInTheDocument();
    expect(screen.getByText('0 results')).toBeInTheDocument();
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
    const user = userEvent.setup();
    await user.type(searchInput, 'Sample');
    await waitFor(() => {
      expect(screen.getByText('Sample Article')).toBeInTheDocument();
    });
  });

  it('displays filter tags when filters are applied', async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithClient(
      <TableWithSearch
        data={mockData}
        columns={mockColumns}
        {...defaultProps}
      />,
    );
    // Find the filter and simulate a click
    const typeButton = screen.getByRole('button', {
      name: /type/i,
      expanded: false,
    });
    await user.click(typeButton);
    const checkboxInput = await screen.findByRole('checkbox', {
      name: 'Resource Catalog',
    });
    // Simulate the user clicking the checkbox
    await user.click(checkboxInput);

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
    const user = userEvent.setup();

    renderWithClient(
      <TableWithSearch
        data={mockData}
        columns={mockColumns}
        {...defaultProps}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /type/i, expanded: false }),
    );

    // Scope inside the filter menu, which is a `menu` (not a dialog) in v3.
    const menu = await screen.findByRole('menu');

    const checkbox = await within(menu).findByRole('checkbox', {
      name: /resource catalog/i,
    });

    await user.click(checkbox);

    // "Clear all" should show up once filter applied
    const clearAll = await screen.findByText(/clear all/i);

    const clearAllContainer = clearAll.parentElement;
    if (!clearAllContainer) throw new Error('Clear all container not found');

    const closeButton = within(clearAllContainer).getByRole('button', {
      name: /close/i,
    });

    await user.click(closeButton);

    // Don't do `expect(closeButton).not.toBeInTheDocument()` on the same node reference
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /close/i }),
      ).not.toBeInTheDocument();
    });
  });
});
