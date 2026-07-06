import { SearchQueryParams } from '../types';

// Sorting configuration.
export const SORT_OPTIONS = [
  {
    name: 'Best match',
    value: '_score',
    sortBy: '_score',
    orderBy: 'asc',
    tooltip: 'Sort by relevancy (field name is boosted).',
  },
  {
    name: 'Date: Least recent',
    value: 'date',
    sortBy: 'date',
    orderBy: 'asc',
    tooltip: 'Sort by least recent activity (created, published or modified).',
  },
  {
    name: 'Date: Most recent',
    value: '-date',
    sortBy: 'date',
    orderBy: 'desc',
    tooltip: 'Sort by most recent activity (created, published or modified).',
  },
  {
    name: 'A-Z',
    value: 'name.raw',
    sortBy: 'name.raw',
    orderBy: 'asc',
    tooltip: 'Sort in alphabetical order (title).',
  },
  {
    name: 'Z-A',
    value: '-name.raw',
    sortBy: 'name.raw',
    orderBy: 'desc',
    tooltip: 'Sort in reverse alphabetical order (title).',
  },
];

export const PAGE_SIZE_OPTIONS = [
  { name: '10', value: 10 },
  { name: '50', value: 50 },
  { name: '100', value: 100 },
];

// Default date range configuration
export const DEFAULT_DATE_RANGE = {
  startYear: 2000,
  getEndYear: () => new Date().getFullYear(),
} as const;

// Generate default date filter range [startDate, endDate]
const getDefaultDateRange = (): [string, string] => {
  const startDate = `${DEFAULT_DATE_RANGE.startYear}-01-01`;
  const endDate = `${DEFAULT_DATE_RANGE.getEndYear()}-12-31`;
  return [startDate, endDate];
};

export const getDefaultDateFilter = (includeResourcesWithoutDate = true) => {
  return includeResourcesWithoutDate
    ? [...getDefaultDateRange(), { '-_exists_': ['date'] }]
    : getDefaultDateRange();
};

// Default parameters for the search query.
export type DefaultSearchQueryParams = Omit<
  SearchQueryParams,
  'from' | 'size' | 'sort'
> &
  Required<Pick<SearchQueryParams, 'from' | 'size' | 'sort'>>;

export const defaultQuery: DefaultSearchQueryParams = {
  q: '__all__',
  from: 1,
  size: PAGE_SIZE_OPTIONS[0].value,
  sort: SORT_OPTIONS[0].value,
};

// Tabs that should default to a larger page size. Any tab not listed here
// falls back to defaultQuery.size (10).
export const DEFAULT_SIZE_BY_TAB: Record<string, number> = {
  s: 50, // Samples
  dc: 50, // Data Collections
};

export const getDefaultSizeForTab = (tabId: string): number =>
  DEFAULT_SIZE_BY_TAB[tabId] ?? defaultQuery.size;

export const defaultSelectedFilters = {
  date: getDefaultDateFilter(),
};

// The default date range (see `defaultSelectedFilters`) is seeded whenever a
// query has no `date` filter. `applyDefaultDate` is the explicit signal that
// lets a user opt out of that seeding — distinguishing "the user deliberately
// cleared the date filter" from "fresh visit", which otherwise look identical
// in the URL. It travels two ways:
//   - `APPLY_DEFAULT_DATE_PARAM`: a URL query param (`'false'` = suppress).
//   - `APPLY_DEFAULT_DATE_FILTER_KEY`: a reserved key persisted inside a saved
//     query's `filters` object (never serialized into the URL/API filter
//     string — see `queryFilterObject2String`).
export const APPLY_DEFAULT_DATE_PARAM = 'applyDefaultDate';
export const APPLY_DEFAULT_DATE_FILTER_KEY = '_applyDefaultDate';

/**
 * Whether the default date range should be seeded for the current query.
 * Shared by `useSearchQueryFromURL` and the search page's first-load effect so
 * the rule stays in one place: seed only when the user hasn't opted out via the
 * `applyDefaultDate` param AND the query doesn't already carry a `date` filter.
 */
export const shouldApplyDefaultDate = (
  applyDefaultDateParam: string | string[] | undefined,
  filters: Record<string, any>,
): boolean => {
  const optedOut = applyDefaultDateParam === 'false';
  const hasDate = Array.isArray(filters?.date) && filters.date.length > 0;
  return !optedOut && !hasDate;
};
