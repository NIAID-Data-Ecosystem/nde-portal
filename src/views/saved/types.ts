import type { ColumnDef } from 'src/components/table/data-table';
import { SavedDataset, SavedQuery } from 'src/hooks/useUserData/types';

import { SavedResourceAdditionalMetadata } from './hooks/useBatchResourcesData';

/** Items the saved page can render in a table. */
export type SavedItem = SavedDataset | SavedQuery;

/**
 * A saved dataset enriched with metadata fetched from the API by `_id`
 * (see `useBatchResourcesData`).
 */
export interface SavedResourceItem
  extends SavedDataset,
    SavedResourceAdditionalMetadata {}

/**
 * A table row: the saved item as it came, plus its row id and search text.
 * The item is kept whole (not spread into the row) so the bookmark buttons can
 * hand it back to the favorites API without the table's own fields.
 */
export interface SavedRow<TItem> {
  /** Dedupes and keys the rows. */
  _id: string;
  /** Lowercased text of every column, matched by the section's search box. */
  _search: string;
  item: TItem;
}

/**
 * A saved table column: a DataTable column over `SavedRow`s, plus what the
 * section's search box matches for it.
 */
export type SavedColumnDef<TItem, TValue = any> = ColumnDef<
  SavedRow<TItem>,
  TValue
> & {
  /** Required: the table's default, `row[id]`, would miss the wrapped item. */
  accessor: (row: SavedRow<TItem>) => TValue;
  /**
   * The column's text for search: a string, strings, or `null` to leave the
   * column out. Defaults to `toSearchValue` of the column's value.
   */
  search?: (value: TValue, item: TItem) => string | string[] | null;
};
