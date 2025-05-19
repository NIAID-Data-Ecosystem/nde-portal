import { SearchQueryParams } from '../types';
import { SORT_OPTIONS } from './sortOptions';

const FACET_SIZE = 1000; // Default size for facets
const SIZE = 10;
const PAGE = 1;

// Default parameters for the search query.
export const defaultQuery: SearchQueryParams = {
  q: '__all__',
  filters: '', // extra filter updates aggregate fields
  facet_size: FACET_SIZE,
  from: PAGE,
  size: SIZE,
  sort: SORT_OPTIONS[0].sortBy,
};
