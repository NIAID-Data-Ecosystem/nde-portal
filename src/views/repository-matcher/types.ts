import type { ColumnDef } from 'src/components/table/data-table';
import { Source } from 'src/hooks/api/useSourcesList';
import { FormattedResource } from 'src/utils/api/types';

export type RepositoryMatcherItem = Source | FormattedResource;

export type NameValue = { label: string; url: string; _id: string };

/** A table row: each column's transformed value keyed by column id. */
export type RepositoryMatcherRow = {
  _id: string;
  _raw: RepositoryMatcherItem;
  /** Lowercased concatenation of every column's searchable text. Built once
   * at data-load so the search hook can do a single substring check per row
   * instead of re-deriving search values on every keystroke. */
  _search: string;
} & Record<string, unknown>;

export type RepositoryMatcherFilterConfig<TValue = unknown> = {
  /** Optional grouping passed through to FiltersList. */
  groupBy?: { property: string; label: string }[];
  /**
   * Map a row's display value to the discrete filter terms it should
   * contribute. Each returned string becomes a checkbox entry and the row
   * matches the filter when any of its values is selected. Return [] to
   * exclude the row from this filter's terms.
   */
  getFilterValues: (value: TValue) => string[];
};

/**
 * A shared-table column (`header`, `type`, `cell`, `sort`, …) plus what only
 * the repository matcher needs: which API fields to fetch, how to build the
 * row value, and how the column feeds search, the filter sidebar and the
 * data dictionary. The table ignores the extra keys.
 *
 * `description` doubles as the header tooltip, the filter's description and
 * the dictionary entry.
 */
export type RepositoryMatcherColumn<TValue = any> = ColumnDef<
  RepositoryMatcherRow,
  TValue
> & {
  fields: string[];
  transform: (item: RepositoryMatcherItem) => TValue;
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
  filter?: RepositoryMatcherFilterConfig<TValue>;
  info?: {
    /** Tooltip description for the filters section. */
    filterDescription?: string;
    /** Definitions of the column's values, listed in the data dictionary. */
    terms?: {
      label?: string;
      description?: string;
    }[];
  };
};
