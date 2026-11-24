/**
 * The shared data table. See README.md in this folder.
 *
 * - `DataTable`: presentation (native table, sticky header, sort, pinning,
 *   the pager for client pagination).
 * - `useDataTable`: headless state (columns, sort, pagination).
 * - `useColumnPreferences` + `ColumnCustomizer`: per-table column choices.
 * - `useTableSearch`: free-text filtering of prebuilt rows.
 * - cells (see `cells/index.ts`) for custom `cell`s, and the term formatters.
 */
export type { LinkEntry, TermValue } from './cells';
export {
  AccessBadgeCell,
  EmptyValue,
  ExpandableList,
  ExpandableText,
  LinkCell,
  LinkListCell,
  renderTerm,
  ResourceLinkCell,
  TagsCell,
  TermsCell,
  toTermEntry,
} from './cells';
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
export { formatNumericValue, formatTerm, formatUnitText } from './utils/terms';
export { isEmptyValue, toSearchValue, toText } from './utils/values';
