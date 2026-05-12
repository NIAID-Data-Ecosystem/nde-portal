import React, { useMemo } from 'react';
import { Skeleton } from 'src/components/skeleton';
import { Table } from 'src/components/table';
import { BaseColumn, ResultsTableProps } from './types';
import { deriveControlledSortProps, getApiSortFieldForProperty } from './utils';

/**
 * Generic results table shared by all search-result table views (Samples,
 * Data Collections, and future table types):
 *
 *  - `columns`: the master column list for this table type
 *  - `toRow`: converts a FormattedResource to a flat row object
 *  - `getCells`: renders individual cells (column-specific logic)
 *  - `requiredColumnIds`: fallback columns shown when visible set is empty
 *
 * Everything else (sticky headers, top scrollbar, controlled sort, column
 * visibility/ordering, zebra striping) is handled here so each table type
 * only needs to supply its data and rendering logic.
 */
export const ResultsTable = <TColumn extends BaseColumn>({
  columns,
  results,
  isLoading,
  toRow,
  getCells,
  ariaLabel,
  caption,
  requiredColumnIds,
  visibleColumnIds,
  columnOrder,
  currentSort,
  onSortChange,
}: ResultsTableProps<TColumn>) => {
  const rows = useMemo(() => results.map(toRow), [results, toRow]);

  // Required columns used as the fallback when visibleColumnIds resolves to
  // an empty array (e.g. during pre-hydration or after a "Clear All").
  const requiredColumns = useMemo(
    () => columns.filter(col => requiredColumnIds.includes(col.id)),
    [columns, requiredColumnIds],
  );

  // Build the ordered + filtered column list:
  // 1. Start from columnOrder (if provided) or the master list order.
  // 2. Keep only columns that are in visibleColumnIds.
  // 3. Fall back to required columns if the result is empty.
  const visibleColumns = useMemo(() => {
    const sourceOrder =
      columnOrder && columnOrder.length > 0
        ? columnOrder
            .map(id => columns.find(c => c.id === id))
            .filter((c): c is TColumn => !!c)
        : columns;

    const filtered = visibleColumnIds
      ? sourceOrder.filter(col => visibleColumnIds.includes(col.id))
      : sourceOrder;

    return filtered.length > 0 ? filtered : requiredColumns;
  }, [columns, visibleColumnIds, columnOrder, requiredColumns]);

  // Controlled sort: derive which column property is active and its direction.
  const { controlledSortProperty, controlledSortAsc } = useMemo(
    () =>
      currentSort
        ? deriveControlledSortProps(currentSort, columns)
        : { controlledSortProperty: null, controlledSortAsc: true },
    [currentSort, columns],
  );

  // When the user clicks a sort toggle, map the column property back to the
  // API field and bubble the change up to the parent.
  const handleControlledSort = useMemo(() => {
    if (!onSortChange) return undefined;
    return (property: string, ascending: boolean) => {
      const apiField = getApiSortFieldForProperty(property, columns);
      if (apiField) {
        onSortChange(apiField, ascending);
      }
    };
  }, [onSortChange, columns]);

  return (
    <Skeleton isLoaded={!isLoading} width='100%'>
      <Table
        ariaLabel={ariaLabel}
        caption={caption}
        columns={visibleColumns}
        data={rows as any}
        getCells={getCells as any}
        isLoading={isLoading}
        hasPagination={false}
        // Sticky headers require a bounded maxHeight + overflowY on the
        // container so the browser has a scroll boundary for position:sticky.
        stickyHeader
        // Mirror a scrollbar at the top of the table so users don't have to
        // scroll to the bottom to pan horizontally.
        showTopScrollbar
        tableContainerProps={{
          overflowX: 'auto',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
        tableHeadProps={{
          sx: {
            th: { borderBottom: 'none' },
            tr: { borderBottom: '1px solid', borderColor: 'gray.200' },
          },
        }}
        getTableRowProps={(_, idx) => ({
          bg: idx % 2 === 0 ? 'white' : 'page.alt',
        })}
        controlledSortProperty={controlledSortProperty}
        controlledSortAsc={controlledSortAsc}
        onControlledSort={handleControlledSort}
      />
    </Skeleton>
  );
};
