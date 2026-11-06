import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { act, render, screen, within } from 'src/__tests__/utils/render';

import { DataTable } from '../components/DataTable';
import { useDataTable } from '../hooks/useDataTable';
import type { ColumnDef, SortState } from '../types';

type File = { id: string; name: string; size?: number; modified?: string };

const COLUMNS: ColumnDef<File>[] = [
  { id: 'name', header: 'Name', sort: true },
  { id: 'size', header: 'Size', type: 'number', sort: true },
  {
    id: 'modified',
    header: 'Modified',
    type: 'date',
    sort: true,
    description: 'When the file last changed.',
  },
];
const FILES: File[] = [
  { id: 'a', name: 'beta.csv', size: 1200, modified: '2024-02-01' },
  { id: 'b', name: 'alpha.csv', size: 50, modified: '2023-05-01' },
  { id: 'c', name: 'gamma.csv' },
];
const getRowId = (file: File) => file.id;

const setup = async (ui: React.ReactElement) => {
  const user = userEvent.setup();
  const result = render(ui);
  await act(async () => {});
  return { user, ...result };
};

const table = () => screen.getByRole('table', { name: 'Files' });
const columnTexts = (index: number) =>
  within(table())
    .getAllByRole('row')
    .slice(1)
    .map(row => within(row).getAllByRole('cell')[index].textContent);

describe('DataTable', () => {
  it('renders a captioned native table from data and columns alone', async () => {
    await setup(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
      />,
    );
    expect(table().tagName).toBe('TABLE');
    expect(within(table()).getAllByRole('columnheader')).toHaveLength(3);
    expect(columnTexts(0)).toEqual(['beta.csv', 'alpha.csv', 'gamma.csv']);
    // Numbers are formatted and right-aligned; missing values say so once.
    const sizeCell = within(table()).getAllByRole('row')[1].children[1];
    expect(sizeCell).toHaveTextContent('1,200');
    expect(sizeCell).toHaveAttribute('data-align', 'end');
    expect(columnTexts(1)[2]).toBe('—No data');
  });

  it('sorts client-side from one button per header, with aria-sort and an announcement', async () => {
    const { user } = await setup(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
      />,
    );
    const size = screen.getByRole('columnheader', { name: /size/i });
    expect(size).not.toHaveAttribute('aria-sort');

    await user.click(within(size).getByRole('button', { name: 'Size' }));
    // Numbers start descending; the missing size stays last.
    expect(size).toHaveAttribute('aria-sort', 'descending');
    expect(columnTexts(0)).toEqual(['beta.csv', 'alpha.csv', 'gamma.csv']);
    expect(screen.getByText('Sorted by Size, descending')).toBeInTheDocument();

    await user.click(within(size).getByRole('button', { name: 'Size' }));
    expect(size).toHaveAttribute('aria-sort', 'ascending');
    expect(columnTexts(0)).toEqual(['alpha.csv', 'beta.csv', 'gamma.csv']);
  });

  it('offers a header description from its own info button, without sorting', async () => {
    const { user } = await setup(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
      />,
    );
    const header = screen.getByRole('columnheader', { name: /modified/i });
    // The sort button's name is just the title.
    expect(
      within(header).getByRole('button', { name: 'Modified' }),
    ).toBeInTheDocument();
    const info = within(header).getByRole('button', { name: 'About Modified' });
    // Screen readers get the description without opening anything.
    expect(info).toHaveAccessibleDescription('When the file last changed.');

    // A tap toggles it (tooltips don't open for touch on their own).
    await user.pointer({ keys: '[TouchA]', target: info });
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'When the file last changed.',
    );
    expect(header).not.toHaveAttribute('aria-sort');
  });

  it('delegates sorting in server mode and renders the data as given', async () => {
    const onChange = jest.fn();
    const Server = () => {
      const tableState = useDataTable({
        data: FILES,
        columns: COLUMNS,
        getRowId,
        sort: {
          mode: 'server',
          state: { columnId: 'name', direction: 'asc' },
          onChange,
        },
      });
      return <DataTable label='Files' table={tableState} />;
    };
    const { user } = await setup(<Server />);
    expect(
      screen.getByRole('columnheader', { name: /^name/i }),
    ).toHaveAttribute('aria-sort', 'ascending');
    // Not re-sorted locally.
    expect(columnTexts(0)).toEqual(['beta.csv', 'alpha.csv', 'gamma.csv']);
    await user.click(screen.getByRole('button', { name: 'Modified' }));
    expect(onChange).toHaveBeenCalledWith<[SortState]>({
      columnId: 'modified',
      direction: 'desc',
    });
  });

  it('shows skeleton rows while loading with no data, and disables sorting', async () => {
    await setup(
      <DataTable
        label='Files'
        data={[]}
        columns={COLUMNS}
        getRowId={getRowId}
        status={{ loading: true }}
        skeletonRows={3}
      />,
    );
    expect(table()).toHaveAttribute('aria-busy', 'true');
    expect(within(table()).getAllByRole('row')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Name' })).toBeDisabled();
  });

  it('spans empty and error messages across every column', async () => {
    const { rerender } = await setup(
      <DataTable
        label='Files'
        data={[]}
        columns={COLUMNS}
        getRowId={getRowId}
      />,
    );
    const emptyCell = within(table()).getByText('No results').closest('td');
    expect(emptyCell).toHaveAttribute('colspan', '3');

    rerender(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
        status={{ error: true }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be loaded/i);
    expect(screen.getByRole('alert').closest('td')).toHaveAttribute(
      'colspan',
      '3',
    );
  });

  it('keeps cell DOM nodes across unrelated parent re-renders', async () => {
    let bump: () => void = () => {};
    const Parent = () => {
      const [count, setCount] = useState(0);
      bump = () => setCount(c => c + 1);
      return (
        <>
          <span>{count}</span>
          <DataTable
            label='Files'
            data={FILES}
            columns={COLUMNS}
            getRowId={getRowId}
          />
        </>
      );
    };
    await setup(<Parent />);
    const before = screen.getByText('alpha.csv');
    act(() => bump());
    expect(screen.getByText('alpha.csv')).toBe(before);
  });
});
