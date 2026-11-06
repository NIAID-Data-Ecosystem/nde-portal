import type React from 'react';

/**
 * The kind of content a column holds. It is the one lever that drives a
 * column's defaults — renderer, alignment, wrapping, size and the direction
 * of its first sort click — so most columns only need an `id`, a `header` and
 * (sometimes) a `type`. Every default can still be overridden per column.
 */
export type ColumnType =
  /** Plain text. The default. */
  | 'text'
  /** Long prose, clamped to a few lines with "Show more". */
  | 'longText'
  /** A measurement or count: right-aligned, thousands separators, desc first. */
  | 'number'
  /** A calendar date shown as YYYY-MM-DD, desc first. */
  | 'date'
  /** A code or ID. Never number-formatted; may break anywhere. */
  | 'identifier'
  /** A URL, or `{ href, label }`. */
  | 'link'
  /** An array of values, one per line, "Show N more" past 5. */
  | 'list'
  /** An array of short terms shown as tags, "Show N more" past 12. */
  | 'tags';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

/** What a column sorts on. Empty values always sort last. */
export type SortValue = string | number | null | undefined;

/** Soft width bounds in px. `max` is where content starts wrapping. */
export interface ColumnSize {
  min?: number;
  max?: number;
}

export interface CellContext<TRow, TValue = unknown> {
  value: TValue;
  row: TRow;
  column: ResolvedColumn<TRow>;
}

export interface ColumnDef<TRow, TValue = any> {
  /** Stable id: used for persistence, sorting and React keys. */
  id: string;
  /** Visible header label, also used by the column customizer. */
  header: string;
  /** Shown in the header tooltip and as the header's accessible description. */
  description?: string;
  /** Reads the cell value from a row. Defaults to `row[id]`. */
  accessor?: (row: TRow) => TValue;
  /** Drives the column's defaults. Defaults to `'text'`. */
  type?: ColumnType;
  /**
   * Custom cell. Return `null` to show the shared "No data" placeholder.
   * Omit to use the `type`'s default renderer.
   */
  cell?: (ctx: CellContext<TRow, TValue>) => React.ReactNode;
  /**
   * `true` makes the column sortable on its value. Pass an object to sort on
   * a derived value, or to override the first-click direction.
   */
  sort?:
    | boolean
    | {
        value?: (value: TValue, row: TRow) => SortValue;
        descFirst?: boolean;
      };
  size?: ColumnSize;
  align?: 'start' | 'end';
  /** `false` keeps the column visible and first. Defaults to `true`. */
  hideable?: boolean;
  /** Whether the column starts visible. Defaults to `true`. */
  defaultVisible?: boolean;
}

/** A column with every default filled in. Built once per column definition. */
export interface ResolvedColumn<TRow> {
  id: string;
  header: string;
  description?: string;
  type: ColumnType;
  align: 'start' | 'end';
  /** `normal` wraps at words, `anywhere` also breaks long URLs/IDs, `nowrap` never wraps. */
  wrap: 'normal' | 'anywhere' | 'nowrap';
  sortable: boolean;
  descFirst: boolean;
  hideable: boolean;
  defaultVisible: boolean;
  /** Inline style for the cell's inner wrapper; one shared object per column. */
  contentStyle: React.CSSProperties;
  /**
   * The header's inner wrapper: the column's minimum only, so the header
   * spans the whole cell (its sort arrows sit at the cell's end) even when
   * the column grows past its content maximum.
   */
  headerStyle: React.CSSProperties;
  getValue: (row: TRow) => unknown;
  getSortValue: (row: TRow) => SortValue;
  renderCell: (row: TRow) => React.ReactNode;
  def: ColumnDef<TRow>;
}

/** Infers each column's value type from its `accessor`. Optional sugar. */
export const createColumnHelper =
  <TRow>() =>
  <TValue>(def: ColumnDef<TRow, TValue>): ColumnDef<TRow, TValue> =>
    def;
