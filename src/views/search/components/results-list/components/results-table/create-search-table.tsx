import { Box } from '@chakra-ui/react';
import React, { useCallback, useMemo } from 'react';
import {
  ColumnCustomizer as SharedColumnCustomizer,
  ColumnDef,
  DataTable,
  SortState,
  useColumnPreferences,
  useDataTable,
} from 'src/components/table/data-table';
import { FormattedResource } from 'src/utils/api/types';

import type { SearchColumnDef } from './columns';
import { apiSortFields, toSortState } from './sort';

/*
Builds a Search results table (Datasets, Computational Tools, …) on the shared
DataTable from a short config. What every Search table shares lives here, so a
table file only lists its columns:

- column preferences (visibility, order, pinning) persisted per table, with
  the old popover's keys migrated;
- server-side sorting: the URL's API sort string in, a sort request out (the
  page updates the URL and refetches);
- the layout the page gives it: full width, capped at 70vh with its header
  stuck, reorderable columns, and an optional pinned first column (off until
  the user turns it on).

Data fetching, pagination and the card/table switch stay with the page.
*/

export interface SearchTableConfig {
  /** Preferences persist in localStorage under `nde:table:<tableId>:v1`. */
  tableId: string;
  /** The table's accessible name (a visually hidden caption). */
  label: string;
  /** Every column the table offers, in their default order. */
  columns: SearchColumnDef[];
  /** The keys the pre-DataTable popover wrote, migrated on first read. */
  legacyKeys: { visible: string; order: string };
  /** What "Clear All" leaves. Defaults to the non-hideable columns. */
  fallbackIds?: string[];
}

export interface SearchTableProps {
  /** The current page of results, already sorted by the API. */
  results: FormattedResource[];
  /**
   * Results are being fetched: skeleton rows when there are none yet, a
   * small loading indicator over the current ones otherwise.
   */
  loading: boolean;
  /**
   * The current API sort string (e.g. `"name.raw"` or `"-date"`; a leading `-`
   * is descending). The matching column shows as sorted; a sort no column
   * matches ("Best match") shows none.
   */
  currentSort?: string;
  /**
   * Called when a sortable header is clicked, with that column's API sort
   * field and the requested direction.
   */
  onSortChange: (apiField: string, ascending: boolean) => void;
}

export interface SearchTable {
  Table: React.ComponentType<SearchTableProps>;
  /** The "Customize Columns" popover, for the results toolbar. */
  ColumnCustomizer: React.ComponentType;
  /** The columns as the table uses them (sortable where the API can sort). */
  columns: ColumnDef<FormattedResource>[];
  config: SearchTableConfig;
}

const getRowId = (row: FormattedResource, index: number) =>
  row._id || row.id || String(index);

export const createSearchTable = (config: SearchTableConfig): SearchTable => {
  const { tableId, label, legacyKeys, fallbackIds } = config;

  // Sortable exactly where the API has a sort field. Built once, so cells can
  // memoize on these definitions.
  const columns: ColumnDef<FormattedResource>[] = config.columns.map(
    ({ apiSortField, ...column }) => ({
      ...column,
      sort: apiSortField ? column.sort ?? true : false,
    }),
  );
  const sortFields = apiSortFields(config.columns);

  // The customizer and the table each call this; the same table id gives them
  // one shared state.
  const usePreferences = () =>
    useColumnPreferences({ tableId, columns, fallbackIds, legacyKeys });

  const ColumnCustomizer = () => {
    const preferences = usePreferences();
    return (
      <SharedColumnCustomizer
        columns={columns}
        preferences={preferences}
        allowReorder
        allowPinning
      />
    );
  };
  ColumnCustomizer.displayName = `SearchColumnCustomizer(${tableId})`;

  const Table = ({
    results,
    loading,
    currentSort,
    onSortChange,
  }: SearchTableProps) => {
    const preferences = usePreferences();
    const sortState = useMemo(
      () => toSortState(currentSort, sortFields),
      [currentSort],
    );
    const handleSortChange = useCallback(
      (next: SortState) => {
        const field = sortFields[next.columnId];
        if (field) onSortChange(field, next.direction === 'asc');
      },
      [onSortChange],
    );

    const table = useDataTable({
      data: results,
      columns,
      getRowId,
      preferences,
      sort: { mode: 'server', state: sortState, onChange: handleSortChange },
    });

    return (
      // Full width: the results column centres its children, and the table
      // would otherwise shrink to its content when few columns are shown.
      <Box width='100%'>
        <DataTable
          table={table}
          label={label}
          // The page sets the height, as the legacy tables did; rows scroll
          // inside it with the header stuck.
          maxHeight='70vh'
          skeletonRows={10}
          status={{ loading }}
        />
      </Box>
    );
  };
  Table.displayName = `SearchTable(${tableId})`;

  return { Table, ColumnCustomizer, columns, config };
};
