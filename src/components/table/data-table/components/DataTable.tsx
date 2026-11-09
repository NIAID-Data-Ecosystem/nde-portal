import {
  Box,
  BoxProps,
  Skeleton,
  Text,
  useSlotRecipe,
  VisuallyHidden,
} from '@chakra-ui/react';
import React, {
  useCallback,
  useDeferredValue,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert } from 'src/components/alert';

import {
  DataTableInstance,
  nextSort,
  useDataTable,
  UseDataTableOptions,
} from '../hooks/useDataTable';
import { useScrollViewport } from '../hooks/useScrollViewport';
import type { ResolvedColumn } from '../types';
import { HeaderCell } from './HeaderCell';

export interface DataTableStatus {
  /** Data is loading. With no rows yet, skeleton rows stand in for them. */
  loading?: boolean;
  /** Shown in place of the rows when set; `true` uses a default message. */
  error?: React.ReactNode;
  /** Shown when there are no rows. Defaults to "No results". */
  empty?: React.ReactNode;
}

interface DataTableDisplayProps {
  /** The table's accessible name (a visually hidden caption). */
  label: string;
  status?: DataTableStatus;
  /**
   * The table's maximum height, as any CSS max-height: fixed (`'400px'`),
   * responsive (`{ base: '60vh', md: '80vh' }`) or parent-relative (`'100%'`
   * inside a parent with a definite height). Defaults to one screen
   * (`100dvh`); the table scrolls inside it with its header stuck, and a
   * table with fewer rows only takes the space it needs. A flex-column
   * parent can also size it: the table shrinks into the space its siblings
   * leave. `'none'` lets the table grow with its rows (the page scrolls; the
   * header scrolls away with it). A responsive value replaces the default at
   * every breakpoint, so include `base`.
   */
  maxHeight?: BoxProps['maxHeight'];
  /** A second horizontal scrollbar above the table. Off by default. */
  topScrollbar?: boolean;
  /** Highlight rows on hover. */
  interactive?: boolean;
  /** Placeholder rows while loading with no data. Defaults to 5. */
  skeletonRows?: number;
}

export type DataTableProps<TRow> = DataTableDisplayProps &
  (
    | { table: DataTableInstance<TRow> }
    | (UseDataTableOptions<TRow> & { table?: never })
  );

/* ------------------------------------------------------------------------- */

const DataCell = React.memo(function DataCell<TRow>({
  row,
  column,
}: {
  row: TRow;
  column: ResolvedColumn<TRow>;
}) {
  return (
    <td
      data-align={column.align === 'end' ? 'end' : undefined}
      data-wrap={column.wrap === 'normal' ? undefined : column.wrap}
    >
      <div style={column.contentStyle}>{column.renderCell(row)}</div>
    </td>
  );
}) as <TRow>(props: {
  row: TRow;
  column: ResolvedColumn<TRow>;
}) => React.ReactElement;

/*
Rows memoize on the row object and the visible-columns array. Re-sorting moves
keyed rows without re-rendering them; changing which columns show re-renders
the row, but each cell memoizes on its own column, so only new cells render.
*/
const DataRow = React.memo(function DataRow<TRow>({
  row,
  columns,
}: {
  row: TRow;
  columns: ResolvedColumn<TRow>[];
}) {
  return (
    <tr>
      {columns.map(column => (
        <DataCell key={column.id} row={row} column={column} />
      ))}
    </tr>
  );
}) as <TRow>(props: {
  row: TRow;
  columns: ResolvedColumn<TRow>[];
}) => React.ReactElement;

const StatusRow = ({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) => (
  <tr>
    <td className='nde-status-cell' colSpan={Math.max(colSpan, 1)}>
      <div>{children}</div>
    </td>
  </tr>
);

/* ------------------------------------------------------------------------- */

/** Rows rendered in the first pass when data arrives; the rest follow. */
const FIRST_PAINT_ROWS = 20;

const DataTableView = <TRow,>({
  table,
  label,
  status,
  maxHeight,
  topScrollbar = false,
  interactive = false,
  skeletonRows = 5,
}: DataTableDisplayProps & { table: DataTableInstance<TRow> }) => {
  const recipe = useSlotRecipe({ key: 'dataTable' });
  const styles = useMemo(() => recipe(), [recipe]);
  const captionId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const topScrollbarRef = useRef<HTMLDivElement>(null);
  const floatingScrollbarRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { columns, sort, toggleSort, pinFirstColumn } = table;
  // A new set of rows (filtering, clearing a search, a page of results)
  // renders in a time-sliced background pass, so it never blocks input; the
  // previous rows stay up until it's ready. When there were no rows before
  // (data just arrived), the first screenful renders straight away instead.
  const deferredRows = useDeferredValue(table.rows);
  const rowsPending = deferredRows !== table.rows;
  const rows =
    rowsPending && deferredRows.length === 0
      ? table.rows.slice(0, FIRST_PAINT_ROWS)
      : deferredRows;
  const loading = !!status?.loading;
  // While the first rows are still on their way, keep the skeleton rather
  // than flashing the empty state.
  const showSkeleton = (loading || rowsPending) && rows.length === 0;

  useScrollViewport(
    {
      root: rootRef,
      viewport: viewportRef,
      topScrollbar: topScrollbarRef,
      floatingScrollbar: floatingScrollbarRef,
      sentinel: sentinelRef,
    },
    [pinFirstColumn, topScrollbar],
  );

  // Announced after a header click: `aria-sort` alone isn't re-read by most
  // screen readers while focus stays on the button.
  const [announcement, setAnnouncement] = useState('');
  const handleSort = useCallback(
    (columnId: string) => {
      const column = columns.find(c => c.id === columnId);
      if (column) {
        const next = nextSort(sort, column);
        setAnnouncement(
          `Sorted by ${column.header}, ${
            next.direction === 'asc' ? 'ascending' : 'descending'
          }`,
        );
      }
      toggleSort(columnId);
    },
    [columns, sort, toggleSort],
  );

  let body: React.ReactNode;
  if (status?.error) {
    body = (
      <StatusRow colSpan={columns.length}>
        <Alert status='error' role='alert' title='Something went wrong'>
          {status.error === true
            ? 'This table could not be loaded. Please try again later.'
            : status.error}
        </Alert>
      </StatusRow>
    );
  } else if (showSkeleton) {
    body = Array.from({ length: skeletonRows }, (_, index) => (
      <tr key={`skeleton-${index}`}>
        {columns.map(column => (
          <td key={column.id}>
            <div style={column.contentStyle}>
              <Skeleton height='3.5' width='80%' my={1} />
            </div>
          </td>
        ))}
      </tr>
    ));
  } else if (rows.length === 0) {
    body = (
      <StatusRow colSpan={columns.length}>
        {status?.empty ?? (
          <Text textAlign='center' color='fg.muted'>
            No results
          </Text>
        )}
      </StatusRow>
    );
  } else {
    body = rows.map(row => (
      <DataRow key={row.id} row={row.original} columns={columns} />
    ));
  }

  return (
    <Box
      ref={rootRef}
      className='nde-data-table'
      css={styles.root}
      maxHeight={maxHeight}
      data-pinned={pinFirstColumn ? '' : undefined}
      data-interactive={interactive ? '' : undefined}
    >
      {topScrollbar && (
        <Box
          ref={topScrollbarRef}
          className='nde-synced-scrollbar'
          css={styles.scrollbar}
          aria-hidden='true'
          tabIndex={-1}
        >
          <div style={{ height: 1 }} />
        </Box>
      )}
      <Box ref={viewportRef} css={styles.viewport} aria-labelledby={captionId}>
        <Box asChild css={styles.table}>
          <table aria-busy={loading || rowsPending || undefined}>
            <VisuallyHidden asChild>
              <caption id={captionId}>{label}</caption>
            </VisuallyHidden>
            <thead>
              <tr>
                {columns.map(column => (
                  <HeaderCell
                    key={column.id}
                    column={column}
                    direction={
                      sort?.columnId === column.id ? sort.direction : undefined
                    }
                    onSort={handleSort}
                    disabled={showSkeleton}
                  />
                ))}
              </tr>
            </thead>
            <tbody>{body}</tbody>
          </table>
        </Box>
      </Box>
      <div
        ref={sentinelRef}
        aria-hidden='true'
        // `flexShrink: 0`: the bounded root (a flex column) would otherwise
        // shrink it to almost nothing, as with the top scrollbar.
        style={{ height: 1, marginTop: -1, flexShrink: 0 }}
      />
      <Box
        ref={floatingScrollbarRef}
        className='nde-synced-scrollbar nde-floating-scrollbar'
        css={styles.scrollbar}
        aria-hidden='true'
        tabIndex={-1}
      >
        <div style={{ height: 1 }} />
      </Box>
      <VisuallyHidden aria-live='polite'>{announcement}</VisuallyHidden>
    </Box>
  );
};

const UncontrolledDataTable = <TRow,>({
  label,
  status,
  maxHeight,
  topScrollbar,
  interactive,
  skeletonRows,
  ...options
}: DataTableDisplayProps & UseDataTableOptions<TRow>) => {
  const table = useDataTable(options);
  return (
    <DataTableView
      table={table}
      label={label}
      status={status}
      maxHeight={maxHeight}
      topScrollbar={topScrollbar}
      interactive={interactive}
      skeletonRows={skeletonRows}
    />
  );
};

/**
 * The shared data table: native table markup with sticky headers, sortable
 * columns, an optional pinned first column, and consistent cells.
 *
 * Pass `data` + `columns` (+ `getRowId`) for a self-contained table, or a
 * `table` from `useDataTable` when something outside the table (a column
 * customizer, a results count) needs the same state — the same split as
 * Chakra's `Root` and `RootProvider`.
 */
export const DataTable = <TRow,>(props: DataTableProps<TRow>) =>
  props.table ? (
    <DataTableView {...props} table={props.table} />
  ) : (
    <UncontrolledDataTable
      {...(props as DataTableDisplayProps & UseDataTableOptions<TRow>)}
    />
  );
