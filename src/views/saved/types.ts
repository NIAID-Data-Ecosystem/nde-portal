import { SavedDataset, SavedQuery } from 'src/hooks/useUserData/types';

/** Items the saved page can render in a table. */
export type SavedItem = SavedDataset | SavedQuery;
export interface SavedResourceItem extends SavedDataset {}

/**
 * A formatted table row. Each column's transformed value is keyed by column
 * id; `_id` dedupes rows and `_search` is the prebuilt search blob.
 */
export interface SavedRow {
  _id: string;
  _search: string;
  [key: string]: unknown;
}

export type SavedColumn<TItem = SavedItem, TValue = unknown> = {
  id: string;
  label: string;
  fields: string[];
  columns?: {
    isSortable?: boolean;
    isDefault?: boolean;
    style?: React.CSSProperties;
  };

  transform: (item: TItem) => TValue;
  component: (props: {
    value: TValue;
    isLoading?: boolean;
    data: TItem;
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
};
