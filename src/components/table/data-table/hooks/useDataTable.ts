import { useCallback, useMemo, useState } from 'react';

import type {
  ColumnDef,
  ResolvedColumn,
  SortDirection,
  SortState,
} from '../types';
import { resolveColumns } from '../utils/columns';
import { sortRows } from '../utils/values';
import type { ColumnPreferences } from './useColumnPreferences';

export type DataTableSortOptions =
  /** Sorted in the browser. `initial` is the starting sort (default: none). */
  | { mode?: 'client'; initial?: SortState | null }
  /**
   * Sorted by the data source. The table only reports the requested sort;
   * the caller fetches and passes back the sorted `data` and current `state`.
   */
  | {
      mode: 'server';
      state: SortState | null;
      onChange: (next: SortState) => void;
    };

export interface DataTablePaginationOptions {
  /** Rows-per-page choices. The first is the starting size. */
  pageSizes?: number[];
}

export interface UseDataTableOptions<TRow> {
  data: TRow[];
  /** Keep the array stable (a module constant or memoized): cells memoize on it. */
  columns: ColumnDef<TRow>[];
  /** A stable, unique id per row. Used as the React key, so rows survive re-sorts. */
  getRowId: (row: TRow, index: number) => string;
  sort?: DataTableSortOptions;
  /** Client-side pagination. Server-paginated tables page their own `data`. */
  pagination?: boolean | DataTablePaginationOptions;
  /** Visibility, order and pinning from `useColumnPreferences`. */
  preferences?: ColumnPreferences;
}

export interface DataTableRow<TRow> {
  id: string;
  original: TRow;
}

export interface DataTablePagination {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  pageSizes: number[];
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
}

export interface DataTableInstance<TRow> {
  /** Visible columns, in display order. */
  columns: ResolvedColumn<TRow>[];
  /** Rows to render (sorted, and paginated when enabled). */
  rows: DataTableRow<TRow>[];
  /** Number of rows before pagination. */
  rowCount: number;
  sort: SortState | null;
  /** First click uses the column's default direction; later clicks flip it. */
  toggleSort: (columnId: string) => void;
  pagination?: DataTablePagination;
  pinFirstColumn: boolean;
}

const DEFAULT_PAGE_SIZES = [5, 10, 50, 100];

/** The sort a header click asks for: flip the current column, else start at its default. */
export const nextSort = (
  current: SortState | null,
  column: Pick<ResolvedColumn<unknown>, 'id' | 'descFirst'>,
): SortState => {
  const direction: SortDirection =
    current?.columnId === column.id
      ? current.direction === 'asc'
        ? 'desc'
        : 'asc'
      : column.descFirst
      ? 'desc'
      : 'asc';
  return { columnId: column.id, direction };
};

/**
 * Headless table state: resolves columns, applies preferences, sorts and
 * paginates. It knows nothing about where `data` came from, so React Query,
 * URL state and API mapping stay with the caller.
 */
export const useDataTable = <TRow>({
  data,
  columns: columnDefs,
  getRowId,
  sort: sortOptions,
  pagination: paginationOption,
  preferences,
}: UseDataTableOptions<TRow>): DataTableInstance<TRow> => {
  // Resolved once per column definition array. Visibility and order changes
  // then only filter/reorder these same objects, so unchanged columns keep
  // their identity and their cells skip re-rendering.
  const allColumns = useMemo(() => resolveColumns(columnDefs), [columnDefs]);

  const visibleIds = preferences?.visibleIds;
  const order = preferences?.order;
  const columns = useMemo(() => {
    if (!order || !visibleIds) {
      return allColumns.filter(c => c.defaultVisible || !c.hideable);
    }
    const byId = new Map(allColumns.map(c => [c.id, c]));
    return order
      .filter(id => visibleIds.includes(id))
      .map(id => byId.get(id))
      .filter((c): c is ResolvedColumn<TRow> => Boolean(c));
  }, [allColumns, order, visibleIds]);

  /****** Sort ******/
  const isServer = sortOptions?.mode === 'server';
  const initialSort =
    sortOptions && sortOptions.mode !== 'server'
      ? sortOptions.initial ?? null
      : null;
  const [clientSort, setClientSort] = useState<SortState | null>(initialSort);
  const requestedSort = isServer ? sortOptions.state : clientSort;

  // Client tables never sort on a column the user can't see: if the sorted
  // column is hidden, fall back to the first visible sortable column (same
  // direction). Server tables keep whatever the data source sorted by.
  const sort = useMemo(() => {
    if (isServer || !requestedSort) return requestedSort;
    if (columns.some(c => c.id === requestedSort.columnId)) {
      return requestedSort;
    }
    const fallback = columns.find(c => c.sortable);
    return fallback
      ? { columnId: fallback.id, direction: requestedSort.direction }
      : null;
  }, [isServer, requestedSort, columns]);

  const onServerSortChange = isServer ? sortOptions.onChange : undefined;
  const toggleSort = useCallback(
    (columnId: string) => {
      const column = allColumns.find(c => c.id === columnId);
      if (!column?.sortable) return;
      const next = nextSort(sort, column);
      if (onServerSortChange) onServerSortChange(next);
      else setClientSort(next);
    },
    [allColumns, sort, onServerSortChange],
  );

  /****** Rows ******/
  const baseRows = useMemo(
    () =>
      data.map((row, index) => ({ id: getRowId(row, index), original: row })),
    [data, getRowId],
  );

  const sortedRows = useMemo(() => {
    if (isServer || !sort) return baseRows;
    const column = allColumns.find(c => c.id === sort.columnId);
    if (!column) return baseRows;
    return sortRows(
      baseRows,
      row => column.getSortValue(row.original),
      sort.direction,
    );
  }, [isServer, sort, baseRows, allColumns]);

  /****** Pagination (client) ******/
  const pageSizes = useMemo(
    () =>
      (typeof paginationOption === 'object' && paginationOption.pageSizes) ||
      DEFAULT_PAGE_SIZES,
    [paginationOption],
  );
  const [pageSize, setPageSizeState] = useState(pageSizes[0]);
  const [requestedPage, setPageIndex] = useState(0);
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  // Clamped rather than reset in an effect, so a shrinking filter never
  // renders an empty page first.
  const pageIndex = Math.min(requestedPage, pageCount - 1);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPageIndex(0);
  }, []);

  const rows = useMemo(
    () =>
      paginationOption
        ? sortedRows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
        : sortedRows,
    [paginationOption, sortedRows, pageIndex, pageSize],
  );

  const pagination = useMemo(
    () =>
      paginationOption
        ? {
            pageIndex,
            pageSize,
            pageCount,
            pageSizes,
            setPageIndex,
            setPageSize,
          }
        : undefined,
    [paginationOption, pageIndex, pageSize, pageCount, pageSizes, setPageSize],
  );

  return {
    columns,
    rows,
    rowCount: sortedRows.length,
    sort,
    toggleSort,
    pagination,
    pinFirstColumn: preferences?.pinned ?? false,
  };
};
