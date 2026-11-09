import React from 'react';

import type { ResolvedColumn } from '../types';

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

export interface DataRowProps<TRow> {
  row: TRow;
  columns: ResolvedColumn<TRow>[];
  /**
   * Virtualized tables only (see VirtualRows): the row's position among all
   * rows, and the virtualizer's measuring ref. Left out otherwise, so a plain
   * table renders exactly as before.
   */
  index?: number;
  measureRef?: (element: HTMLTableRowElement | null) => void;
}

/*
Rows memoize on the row object and the visible-columns array. Re-sorting moves
keyed rows without re-rendering them; changing which columns show re-renders
the row, but each cell memoizes on its own column, so only new cells render.
(A virtualized row whose position changes re-renders too, for its index; its
cells don't.)
*/
export const DataRow = React.memo(function DataRow<TRow>({
  row,
  columns,
  index,
  measureRef,
}: DataRowProps<TRow>) {
  return (
    <tr
      ref={measureRef}
      data-index={index}
      // The header row is 1.
      aria-rowindex={index === undefined ? undefined : index + 2}
    >
      {columns.map(column => (
        <DataCell key={column.id} row={row} column={column} />
      ))}
    </tr>
  );
}) as <TRow>(props: DataRowProps<TRow>) => React.ReactElement;
