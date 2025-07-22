import { scaleOrdinal } from '@visx/scale';
import { UrlObject } from 'url';
import { Params } from 'src/utils/api';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from 'src/views/search-results-page-archived/helpers';

// Color scale for data types.
export const getFillColor = scaleOrdinal({
  domain: ['Dataset', 'ComputationalTool', 'ResourceCatalog'],
  range: ['#e8c543', '#ff8359', '#6e95fc'],
});

// Helper function to generate a URL object for search results.
export const getSearchResultsRoute = ({
  query,
  facet,
  term,
}: {
  query: Params;
  facet?: string;
  term?: string;
}): UrlObject => {
  const querystring = query.q || '';
  const queryFilters = queryFilterString2Object(query.extra_filter);
  if (!facet || !term) {
    return {
      pathname: `/search`,
      query: {
        q: querystring,
        filters: queryFilterObject2String({
          ...queryFilters,
        }),
      },
    };
  }
  return {
    pathname: `/search`,
    query: {
      q: querystring,
      filters: queryFilterObject2String({
        ...queryFilters,
        [facet]: [term],
      }),
    },
  };
};
