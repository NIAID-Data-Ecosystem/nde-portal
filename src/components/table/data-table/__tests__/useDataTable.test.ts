import { act, renderHook } from '@testing-library/react';

import { ColumnPreferences } from '../hooks/useColumnPreferences';
import {
  nextSort,
  useDataTable,
  UseDataTableOptions,
} from '../hooks/useDataTable';
import type { ColumnDef } from '../types';

type Row = { id: string; name: string; date?: string; size?: number };

const COLUMNS: ColumnDef<Row>[] = [
  { id: 'name', header: 'Name', sort: true },
  { id: 'date', header: 'Date', type: 'date', sort: true },
  { id: 'size', header: 'Size', type: 'number', sort: true },
  { id: 'notes', header: 'Notes', defaultVisible: false },
];
const DATA: Row[] = [
  { id: '1', name: 'beta', date: '2021-01-01', size: 5 },
  { id: '2', name: 'Alpha', date: '2023-01-01', size: 50 },
  { id: '3', name: 'gamma', size: 1 },
];
const getRowId = (row: Row) => row.id;

const setup = (options: Partial<UseDataTableOptions<Row>> = {}) =>
  renderHook(
    (props: Partial<UseDataTableOptions<Row>>) =>
      useDataTable({
        data: DATA,
        columns: COLUMNS,
        getRowId,
        ...options,
        ...props,
      }),
    { initialProps: {} },
  );

const ids = (rows: { id: string }[]) => rows.map(r => r.id);

describe('nextSort', () => {
  it('starts at the column default and flips on repeat clicks', () => {
    expect(nextSort(null, { id: 'name', descFirst: false })).toEqual({
      columnId: 'name',
      direction: 'asc',
    });
    expect(nextSort(null, { id: 'date', descFirst: true })).toEqual({
      columnId: 'date',
      direction: 'desc',
    });
    expect(
      nextSort(
        { columnId: 'date', direction: 'desc' },
        { id: 'date', descFirst: true },
      ),
    ).toEqual({
      columnId: 'date',
      direction: 'asc',
    });
    expect(
      nextSort(
        { columnId: 'date', direction: 'asc' },
        { id: 'name', descFirst: false },
      ),
    ).toEqual({
      columnId: 'name',
      direction: 'asc',
    });
  });
});

describe('useDataTable', () => {
  it('shows default-visible columns in declared order without preferences', () => {
    const { result } = setup();
    expect(result.current.columns.map(c => c.id)).toEqual([
      'name',
      'date',
      'size',
    ]);
    expect(ids(result.current.rows)).toEqual(['1', '2', '3']);
    expect(result.current.sort).toBeNull();
  });

  it('sorts client-side: text ascending first, dates and numbers descending first', () => {
    const { result } = setup({
      sort: { initial: { columnId: 'name', direction: 'asc' } },
    });
    expect(ids(result.current.rows)).toEqual(['2', '1', '3']);

    act(() => result.current.toggleSort('name'));
    expect(result.current.sort).toEqual({
      columnId: 'name',
      direction: 'desc',
    });
    expect(ids(result.current.rows)).toEqual(['3', '1', '2']);

    act(() => result.current.toggleSort('date'));
    expect(result.current.sort).toEqual({
      columnId: 'date',
      direction: 'desc',
    });
    // Row 3 has no date, so it stays last.
    expect(ids(result.current.rows)).toEqual(['2', '1', '3']);

    act(() => result.current.toggleSort('size'));
    expect(ids(result.current.rows)).toEqual(['2', '1', '3']);
    act(() => result.current.toggleSort('size'));
    expect(ids(result.current.rows)).toEqual(['3', '1', '2']);
  });

  it('ignores sort requests for unsortable columns', () => {
    const { result } = setup();
    act(() => result.current.toggleSort('notes'));
    expect(result.current.sort).toBeNull();
  });

  it('in server mode reports the requested sort and leaves the data order alone', () => {
    const onChange = jest.fn();
    const { result } = setup({
      sort: {
        mode: 'server',
        state: { columnId: 'name', direction: 'asc' },
        onChange,
      },
    });
    expect(ids(result.current.rows)).toEqual(['1', '2', '3']);
    act(() => result.current.toggleSort('name'));
    expect(onChange).toHaveBeenCalledWith({
      columnId: 'name',
      direction: 'desc',
    });
    act(() => result.current.toggleSort('date'));
    expect(onChange).toHaveBeenLastCalledWith({
      columnId: 'date',
      direction: 'desc',
    });
    // The table reflects only what the caller passes back.
    expect(result.current.sort).toEqual({ columnId: 'name', direction: 'asc' });
  });

  it('applies preference visibility and order, keeping column identities stable', () => {
    const preferences = {
      visibleIds: ['size', 'name', 'notes'],
      order: ['size', 'name', 'notes', 'date'],
      pinned: true,
    } as ColumnPreferences;
    const { result, rerender } = setup({ preferences });
    expect(result.current.columns.map(c => c.id)).toEqual([
      'size',
      'name',
      'notes',
    ]);
    expect(result.current.pinFirstColumn).toBe(true);

    const nameColumn = result.current.columns[1];
    rerender({
      preferences: {
        ...preferences,
        visibleIds: ['name'],
        order: preferences.order,
      },
    });
    expect(result.current.columns[0]).toBe(nameColumn);
  });

  it('falls back to the first visible sortable column when the sorted column is hidden', () => {
    const preferences = {
      visibleIds: ['size', 'name'],
      order: ['size', 'name', 'date', 'notes'],
      pinned: false,
    } as ColumnPreferences;
    const { result } = setup({
      preferences,
      sort: { initial: { columnId: 'date', direction: 'desc' } },
    });
    expect(result.current.sort).toEqual({
      columnId: 'size',
      direction: 'desc',
    });
    expect(ids(result.current.rows)).toEqual(['2', '1', '3']);
  });

  it('paginates client-side and clamps the page when the data shrinks', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      name: `n${i}`,
    }));
    const { result, rerender } = setup({ data: many, pagination: true });
    expect(result.current.pagination).toMatchObject({
      pageIndex: 0,
      pageSize: 5,
      pageCount: 3,
    });
    expect(ids(result.current.rows)).toEqual(['0', '1', '2', '3', '4']);
    expect(result.current.rowCount).toBe(12);

    act(() => result.current.pagination!.setPageIndex(2));
    expect(ids(result.current.rows)).toEqual(['10', '11']);

    rerender({ data: many.slice(0, 6) });
    expect(result.current.pagination!.pageIndex).toBe(1);
    expect(ids(result.current.rows)).toEqual(['5']);

    act(() => result.current.pagination!.setPageSize(10));
    expect(result.current.pagination).toMatchObject({
      pageIndex: 0,
      pageSize: 10,
      pageCount: 1,
    });
  });
});
