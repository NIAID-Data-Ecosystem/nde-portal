/**
 * The shared data table. See README.md in this folder.
 *
 * - `DataTable`: presentation (native table, sticky header, sort, pinning).
 * - `useDataTable`: headless state (columns, sort, pagination).
 * - `useColumnPreferences` + `ColumnCustomizer`: per-table column choices.
 * - `useTableSearch`: free-text filtering of prebuilt rows.
 * - cells: `EmptyValue`, `LinkCell`, `TagsCell` for custom `cell`s.
 */
export { EmptyValue, LinkCell, TagsCell } from './cells';
export type { ColumnCustomizerProps } from './components/ColumnCustomizer';
export { ColumnCustomizer } from './components/ColumnCustomizer';
export type { DataTableProps, DataTableStatus } from './components/DataTable';
export { DataTable } from './components/DataTable';
export type {
  ColumnPreferences,
  UseColumnPreferencesOptions,
} from './hooks/useColumnPreferences';
export { useColumnPreferences } from './hooks/useColumnPreferences';
export type {
  DataTableInstance,
  DataTablePagination,
  DataTableRow,
  DataTableSortOptions,
  UseDataTableOptions,
} from './hooks/useDataTable';
export { useDataTable } from './hooks/useDataTable';
export { useTableSearch } from './hooks/useTableSearch';
export type {
  CellContext,
  ColumnDef,
  ColumnSize,
  ColumnType,
  ResolvedColumn,
  SortDirection,
  SortState,
  SortValue,
} from './types';
export { createColumnHelper } from './types';
export { isEmptyValue, toSearchValue, toText } from './utils/values';
