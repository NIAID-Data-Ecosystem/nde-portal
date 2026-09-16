import React from 'react';
import { Source } from 'src/hooks/api/useSourcesList';
import { FormattedResource } from 'src/utils/api/types';

export type RepositoryMatcherItem = Source | FormattedResource;

export type NameValue = { label: string; url: string; _id: string };

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

export type RepositoryMatcherColumn<TValue = unknown> = {
  id: string;
  label: string;
  fields: string[];
  columns?: {
    isSortable?: boolean;
    isDefault?: boolean;
    style?: React.CSSProperties;
  };
  /**
   * When true, the column cannot be hidden by the customize-columns popover.
   * Default: false.
   */
  required?: boolean;
  transform: (item: RepositoryMatcherItem) => TValue;
  component: (props: {
    value: TValue;
    isLoading?: boolean;
    data: RepositoryMatcherItem;
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
  filter?: RepositoryMatcherFilterConfig<TValue>;
  info?: {
    description?: string;
    tooltip?: string;
    /** Tooltip description for the filters section. */
    filterDescription?: string;
    /** Tooltip description for any sub-terms. */
    terms?: {
      label?: string;
      description?: string;
    }[];
  };
};
