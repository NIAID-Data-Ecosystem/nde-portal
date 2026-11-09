import {
  measureElement as measureRowElement,
  useVirtualizer,
} from '@tanstack/react-virtual';
import React, { useCallback, useLayoutEffect, useRef } from 'react';

import type { DataTableRow } from '../hooks/useDataTable';
import type { ResolvedColumn } from '../types';
import { DataRow } from './DataRow';

/*
The `<tbody>` of a table with `virtualize`: only the rows in and near the
viewport are mounted, between two spacer rows that stand in for the rest. It stays a
native table, so columns keep sizing to their content. They can shift a few
pixels as rows mount, but each column's min/max keeps that small (measured on
the Repository Matcher: 0–14 px with about 20 rows mounted).

Only rendered when `virtualize` is set: a plain table never runs any of this.
*/

/**
 * Rows mounted beyond each edge of the viewport. With the Repository Matcher's
 * tall rows (median 300 px), that's about 20 rows in all, the window size
 * where column widths measured stable.
 */
const OVERSCAN = 8;
/** Assumed row height until the first rows are measured. */
const INITIAL_ROW_ESTIMATE = 120;

const spacerStyle = (height: number): React.CSSProperties => ({
  height,
  padding: 0,
  border: 0,
  // Inline, so the recipe's row rules (stripes, hover, the pinned column's
  // sticky first cell) never style a spacer.
  background: 'transparent',
  position: 'static',
  boxShadow: 'none',
});

const Spacer = ({ height, colSpan }: { height: number; colSpan: number }) => (
  <tr aria-hidden='true'>
    <td colSpan={Math.max(colSpan, 1)} style={spacerStyle(height)} />
  </tr>
);

interface VirtualRowsProps<TRow> {
  rows: DataTableRow<TRow>[];
  columns: ResolvedColumn<TRow>[];
}

export const VirtualRows = <TRow,>({
  rows,
  columns,
}: VirtualRowsProps<TRow>) => {
  /*
  The scroll container is the table's parent (DataTable's viewport), found from
  this component's own <tbody>. Not from a ref on the viewport: React attaches
  a parent's ref after its children's layout effects run, so on a table that
  mounts with its rows the virtualizer would find no scroll element and mount
  nothing.
  */
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const getScrollElement = useCallback(
    () =>
      (tbodyRef.current?.closest('table')?.parentElement as HTMLDivElement) ??
      null,
    [],
  );

  // Unmeasured rows are estimated at the average of the rows measured so far,
  // so the total height (and the scrollbar thumb) is roughly right early on.
  const sizes = useRef({ byKey: new Map<React.Key, number>(), total: 0 });
  const estimateSize = useCallback(() => {
    const { byKey, total } = sizes.current;
    return byKey.size ? total / byKey.size : INITIAL_ROW_ESTIMATE;
  }, []);

  // The rows start below the header, inside the same scroll container.
  const headerHeight = useRef(0);
  useLayoutEffect(() => {
    headerHeight.current =
      tbodyRef.current?.closest('table')?.tHead?.offsetHeight ?? 0;
  }, [columns]);

  // Keyed by row id, so measurements survive sorting and filtering. Memoized:
  // the virtualizer recomputes every position when this changes.
  const getItemKey = useCallback((index: number) => rows[index].id, [rows]);

  const virtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    getScrollElement,
    getItemKey,
    estimateSize,
    measureElement: (element, entry, instance) => {
      const size = measureRowElement(element, entry, instance);
      const key = rows[instance.indexFromElement(element)]?.id;
      if (key !== undefined) {
        const { byKey } = sizes.current;
        sizes.current.total += size - (byKey.get(key) ?? 0);
        byKey.set(key, size);
      }
      return size;
    },
    scrollMargin: headerHeight.current,
    overscan: OVERSCAN,
    // Range changes render in the next frame, batched by React, instead of
    // synchronously inside every scroll event; overscan covers the gap.
    useFlushSync: false,
  });

  const items = virtualizer.getVirtualItems();
  // Nothing measured yet (or a viewport with no height, e.g. hidden).
  if (items.length === 0) return <tbody ref={tbodyRef} />;
  const first = items[0];
  const last = items[items.length - 1];
  const margin = virtualizer.options.scrollMargin;
  const above = first.start - margin;
  const below = virtualizer.getTotalSize() - (last.end - margin);
  // Stripes count `<tr>`s (`nth-of-type(even)`), so the spacers above keep
  // every row's parity: an odd first index needs one, an even one two (the
  // second empty).
  const spacersAbove = first.index === 0 ? 0 : first.index % 2 ? 1 : 2;

  return (
    <tbody ref={tbodyRef}>
      {spacersAbove > 0 && <Spacer height={above} colSpan={columns.length} />}
      {spacersAbove > 1 && <Spacer height={0} colSpan={columns.length} />}
      {items.map(item => (
        <DataRow
          key={item.key}
          row={rows[item.index].original}
          columns={columns}
          index={item.index}
          measureRef={virtualizer.measureElement}
        />
      ))}
      {below > 0 && <Spacer height={below} colSpan={columns.length} />}
    </tbody>
  );
};
