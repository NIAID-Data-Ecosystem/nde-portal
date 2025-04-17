import { Params } from 'src/utils/api';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from 'src/views/search-results-page/helpers';
import { UrlObject } from 'url';

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
