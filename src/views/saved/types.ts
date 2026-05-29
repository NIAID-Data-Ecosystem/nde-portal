import { FavoriteDataset } from 'src/hooks/useUserData';

export interface SavedResourceItem extends FavoriteDataset {}

export interface SavedResourceRow {
  _id: string;
  name: string;
  dataset_id: string;
  saved_at: string;
  _search: string;
}

export type SavedResourceColumn<TValue = unknown> = {
  id: string;
  label: string;
  fields: string[];
  columns?: {
    isSortable?: boolean;
    isDefault?: boolean;
    style?: React.CSSProperties;
  };

  transform: (item: SavedResourceItem) => TValue;
  component: (props: {
    value: TValue;
    isLoading?: boolean;
    data: SavedResourceItem;
  }) => React.ReactNode;
  /**
   * Reduce the column's display value to a sortable primitive. Omit for
   * columns whose display value is already a string/number.
   */
  getSortValue?: (value: TValue) => string | number;
  /**
   * Reduce the column's display value to text the search bar can match
   * against. Return a string, an array of strings, or null to opt the column
   * out of search. Omit when the display value is already string/string[].
   */
  getSearchValue?: (value: TValue) => string | string[] | null;
  /**
   * Opts the column into the filter sidebar. Omit to leave the column out of
   * filtering.
   */
};
