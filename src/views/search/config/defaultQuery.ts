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
export const getDefaultDateRange = (): [string, string] => {
  const startDate = `${DEFAULT_DATE_RANGE.startYear}-01-01`;
  const endDate = `${DEFAULT_DATE_RANGE.getEndYear()}-12-31`;
  return [startDate, endDate];
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
