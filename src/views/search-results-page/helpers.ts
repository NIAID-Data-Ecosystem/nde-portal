import { OLD_FILTERS_CONFIG } from './components/filters/helpers';

// Default query parameters for the search.
export const defaultQuery = {
  queryString: '__all__',
  selectedPage: 1,
  selectedPerPage: 10,
  facets: Object.keys(OLD_FILTERS_CONFIG),
  facetSize: 1000,
  sortOrder: '_score',
};

// Default parameters for the search query.
export const defaultParams = {
  q: defaultQuery.queryString,
  extra_filter: '', // extra filter updates aggregate fields
  facet_size: defaultQuery.facetSize,
  size: `${defaultQuery.selectedPerPage}`,
  from: `${(defaultQuery.selectedPage - 1) * defaultQuery.selectedPerPage}`,
  sort: defaultQuery.sortOrder,
};

// Sorting configuration.
export const SORT_OPTIONS = [
  { name: 'Best Match', sortBy: '_score', orderBy: 'asc' },
  { name: 'Date: oldest to newest', sortBy: 'date', orderBy: 'asc' },
  { name: 'Date: newest to oldest', sortBy: 'date', orderBy: 'desc' },
  { name: 'A-Z', sortBy: 'name.raw', orderBy: 'asc' },
  { name: 'Z-A', sortBy: 'name.raw', orderBy: 'desc' },
] as const;
