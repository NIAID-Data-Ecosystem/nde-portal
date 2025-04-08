import { queryFilterObject2String } from 'src/views/search-results-page/helpers';
import { UrlObject } from 'url';

// Helper function to generate a URL object for search results.
export const getSearchResultsRoute = ({
  querystring,
  facet,
  term,
}: {
  querystring: string;
  facet?: string;
  term?: string;
}): UrlObject => {
  if (!facet || !term) {
    return {
      pathname: `/search`,
      query: {
        q: querystring,
      },
    };
  }
  return {
    pathname: `/search`,
    query: {
      q: querystring,
      filters: queryFilterObject2String({
        [facet]: [term],
      }),
    },
  };
};
