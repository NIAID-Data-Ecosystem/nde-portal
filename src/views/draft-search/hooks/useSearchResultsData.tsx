import { queryFilterObject2String } from 'src/views/search-results-page/helpers';
import { useMemo } from 'react';
import { useQuerySearchResults } from 'src/views/search-results-page/hooks/useSearchResults';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { SearchQueryParams } from '../types';
import { UseQueryResult } from '@tanstack/react-query';

export const useSearchResultsData = (
  queryParams: SearchQueryParams,
  initialData: FetchSearchResultsResponse = {
    results: [],
    total: 0,
    facets: {},
  },
): UseQueryResult<FetchSearchResultsResponse | undefined, Error> => {
  const { q, filters, from, size, sort, shouldUseMetadataScore } = queryParams;

  const params = useMemo(
    () => ({
      ...queryParams,
      q,
      filters: queryFilterObject2String(filters) || '',
      facets: queryParams?.facets?.join(', ') || '',
      size: `${size}`,
      from: `${(from - 1) * size}`,
      sort: sort,
      use_metadata_score: shouldUseMetadataScore ? 'true' : 'false',
      show_meta: true,
      fields: [],
    }),
    [queryParams, q, filters, size, from, sort, shouldUseMetadataScore],
  );

  const queryKey = ['search-results', params];

  const query = useQuerySearchResults(params, {
    queryKey,
    refetchOnWindowFocus: false,
    enabled: typeof window !== 'undefined',
    initialData,
  });

  return query;
};
