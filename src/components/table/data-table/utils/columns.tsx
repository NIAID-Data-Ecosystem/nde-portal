import React from 'react';

import { DEFAULT_RENDERERS, EmptyValue } from '../cells';
import type {
  ColumnDef,
  ColumnSize,
  ColumnType,
  ResolvedColumn,
} from '../types';
import { isEmptyValue, toSortValue } from './values';

interface TypeDefaults {
  align: 'start' | 'end';
  wrap: ResolvedColumn<unknown>['wrap'];
  descFirst: boolean;
  size: ColumnSize;
}

/*
Per-type defaults. The sizes are soft bounds for native `table-layout: auto`:
`min` is the narrowest the column gets before the table scrolls sideways, and
`max` caps how wide the column's content asks to be, so one long description
can't take all the spare width. Seeded from the widths the search and
repository-matcher tables hard-coded before.
*/
export const TYPE_DEFAULTS: Record<ColumnType, TypeDefaults> = {
  text: {
    align: 'start',
    wrap: 'normal',
    descFirst: false,
    size: { min: 140, max: 320 },
  },
  longText: {
    align: 'start',
    wrap: 'normal',
    descFirst: false,
    size: { min: 280, max: 560 },
  },
  number: { align: 'end', wrap: 'nowrap', descFirst: true, size: { min: 80 } },
  date: { align: 'start', wrap: 'nowrap', descFirst: true, size: { min: 100 } },
  identifier: {
    align: 'start',
    wrap: 'anywhere',
    descFirst: false,
    size: { min: 120, max: 260 },
  },
  link: {
    align: 'start',
    wrap: 'anywhere',
    descFirst: false,
    size: { min: 160, max: 320 },
  },
  list: {
    align: 'start',
    wrap: 'normal',
    descFirst: false,
    size: { min: 160, max: 320 },
  },
  tags: {
    align: 'start',
    wrap: 'normal',
    descFirst: false,
    size: { min: 180, max: 360 },
  },
};

const px = (value?: number) => (value == null ? undefined : `${value}px`);

/**
 * Fills in a column's defaults once, so rendering never re-derives them. The
 * returned object is what cells and headers memoize on, so callers must keep
 * it stable (see `useResolvedColumns`).
 */
export const resolveColumn = <TRow,>(
  def: ColumnDef<TRow>,
): ResolvedColumn<TRow> => {
  const type = def.type ?? 'text';
  const defaults = TYPE_DEFAULTS[type];
  const size = { ...defaults.size, ...def.size };
  const sortOptions = typeof def.sort === 'object' ? def.sort : undefined;
  const getValue = def.accessor
    ? (row: TRow) => def.accessor!(row)
    : (row: TRow) => (row as Record<string, unknown>)?.[def.id];

  const column: ResolvedColumn<TRow> = {
    id: def.id,
    header: def.header,
    description: def.description,
    type,
    align: def.align ?? defaults.align,
    wrap: defaults.wrap,
    sortable: Boolean(def.sort),
    descFirst: sortOptions?.descFirst ?? defaults.descFirst,
    hideable: def.hideable ?? true,
    defaultVisible: def.defaultVisible ?? true,
    contentStyle: { minWidth: px(size.min), maxWidth: px(size.max) },
    headerStyle: { minWidth: px(size.min) },
    getValue,
    getSortValue: sortOptions?.value
      ? row => sortOptions.value!(getValue(row), row)
      : row => toSortValue(getValue(row)),
    renderCell: row => {
      const value = getValue(row);
      if (def.cell) {
        const content = def.cell({ value, row, column });
        return content == null || content === false || content === '' ? (
          <EmptyValue />
        ) : (
          content
        );
      }
      if (isEmptyValue(value)) return <EmptyValue />;
      return DEFAULT_RENDERERS[type]({ value, column });
    },
    def,
  };
  return column;
};

export const resolveColumns = <TRow,>(defs: ColumnDef<TRow>[]) =>
  defs.map(def => resolveColumn(def));
