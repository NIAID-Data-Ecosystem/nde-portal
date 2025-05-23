import { SORT_OPTIONS } from 'src/views/search-results-page/helpers';
import { SearchQueryParams } from '../types';

const FACET_SIZE = 1000; // Default size for facets
const SIZE = 10;
const PAGE = 1;

// Default parameters for the search query.
export const defaultQuery: SearchQueryParams = {
  q: '__all__',
  from: PAGE,
  size: SIZE,
  sort: SORT_OPTIONS[0].sortBy,
};
