import type { SortState } from 'src/components/table';

import type { SearchColumnDef } from './columns';

/*
Server sort for the tables on the shared DataTable. `fields` maps each
sortable column id to its API sort field (e.g. `{ name: 'name.raw' }`); the
URL/API sort string is that field, with a leading `-` for descending.
*/

/**
 * The table's sort state for an API sort string, or `null` when no column
 * sorts on it (e.g. "Best match", `_score`), so no header shows as sorted.
 */
export const toSortState = (
  apiSort: string | undefined,
  fields: Record<string, string>,
): SortState | null => {
  if (!apiSort) return null;
  const descending = apiSort.startsWith('-');
  const field = descending ? apiSort.slice(1) : apiSort;
  const columnId = Object.keys(fields).find(id => fields[id] === field);
  return columnId ? { columnId, direction: descending ? 'desc' : 'asc' } : null;
};

/** Each column with an `apiSortField`, by column id. */
export const apiSortFields = (
  columns: SearchColumnDef[],
): Record<string, string> =>
  Object.fromEntries(
    columns.flatMap(column =>
      column.apiSortField ? [[column.id, column.apiSortField]] : [],
    ),
  );
