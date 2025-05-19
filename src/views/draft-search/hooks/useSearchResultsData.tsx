import { useMemo } from 'react';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { SearchQueryParams } from '../types';
import { UseQueryResult } from '@tanstack/react-query';
import { Params } from 'src/utils/api';
import { useSearchResultsQuery } from './useSearchResultsQuery';
import { queryFilterObject2String } from '../components/filters/utils/query-builders';

export const useSearchResultsData = (
  queryParams: SearchQueryParams,
  placeholderData: FetchSearchResultsResponse = {
    results: [],
    total: 0,
    facets: {},
  },
): {
  response: UseQueryResult<FetchSearchResultsResponse | undefined, Error>;
  params: Params;
} => {
  const { q, filters, from, size, shouldUseMetadataScore, ...rest } =
    queryParams;

  const params = useMemo(
    () => ({
      ...rest,
      q,
      extra_filter: queryFilterObject2String(filters) || '',
      facets: queryParams?.facets?.join(', ') || '',
      size: `${size}`,
      from: `${(from - 1) * size}`,
      use_metadata_score: shouldUseMetadataScore ? 'true' : 'false',
    }),
    [rest, q, filters, queryParams?.facets, size, from, shouldUseMetadataScore],
  );

  const queryKey = ['search-results-draft', params];

  const queryResponse = useSearchResultsQuery(params, {
    queryKey,
    refetchOnWindowFocus: false,
    enabled: typeof window !== 'undefined',
    // placeholderData,
  });

  return { response: queryResponse, params };
};
