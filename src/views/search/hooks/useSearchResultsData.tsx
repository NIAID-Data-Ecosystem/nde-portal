import { useMemo } from 'react';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { SearchQueryParams } from '../types';
import { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { Params } from 'src/utils/api';
import { useSearchResultsQuery } from './useSearchResultsQuery';
import { queryFilterObject2String } from '../components/filters/utils/query-builders';

// [TO DO]: Add handling of ai enabled searches
export const useSearchResultsData = (
  queryParams: SearchQueryParams,
  options?: Partial<
    UseQueryOptions<FetchSearchResultsResponse | undefined, Error>
  >,
): {
  response: UseQueryResult<FetchSearchResultsResponse | undefined, Error>;
  params: Params;
} => {
  const {
    q,
    filters,
    from,
    size,
    shouldUseMetadataScore,
    shouldUseAISearch,
    ...rest
  } = queryParams;

  const params = useMemo(
    () => ({
      ...rest,
      q,
      extra_filter: (filters && queryFilterObject2String(filters)) || '',
      facets: queryParams?.facets?.join(', ') || '',
      size: size ? `${size}` : undefined,
      from: from && size ? `${(from - 1) * size}` : undefined,
      use_metadata_score: shouldUseMetadataScore ? 'true' : 'false',
      use_ai_search: shouldUseAISearch ? 'true' : 'false',
    }),
    [
      rest,
      q,
      filters,
      queryParams?.facets,
      size,
      from,
      shouldUseMetadataScore,
      shouldUseAISearch,
    ],
  );

  const queryKey = ['search-results-draft', params];

  const queryResponse = useSearchResultsQuery(params, {
    queryKey,
    refetchOnWindowFocus: false,
    enabled: typeof window !== 'undefined',
    ...options,
  });

  return { response: queryResponse, params };
};
