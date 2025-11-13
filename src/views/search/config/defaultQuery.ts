import { SearchQueryParams } from '../types';

// Sorting configuration.
export const SORT_OPTIONS = [
  {
    label: 'Best match',
    value: '_score',
    sortBy: '_score',
    orderBy: 'asc',
    tooltip: 'Sort by relevancy (field name is boosted).',
  },
  {
    label: 'Date: Least recent',
    value: 'date',
    sortBy: 'date',
    orderBy: 'asc',
    tooltip: 'Sort by least recent activity (created, published or modified).',
  },
  {
    label: 'Date: Most recent',
    value: '-date',
    sortBy: 'date',
    orderBy: 'desc',
    tooltip: 'Sort by most recent activity (created, published or modified).',
  },
  {
    label: 'A-Z',
    value: 'name.raw',
    sortBy: 'name.raw',
    orderBy: 'asc',
    tooltip: 'Sort in alphabetical order (title).',
  },
  {
    label: 'Z-A',
    value: '-name.raw',
    sortBy: 'name.raw',
    orderBy: 'desc',
    tooltip: 'Sort in reverse alphabetical order (title).',
  },
];

export const PAGE_SIZE_OPTIONS = [
  { label: '10', value: 10 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
];

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
