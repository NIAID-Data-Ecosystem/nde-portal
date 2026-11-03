import { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Params } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';

import { queryFilterObject2String } from '../components/filters/utils/query-string';
import { SearchQueryParams } from '../types';
import { useSearchResultsQuery } from './useSearchResultsQuery';

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
    use_ai_search,
    additionalFilter,
    ...rest
  } = queryParams;

  const params = useMemo(() => {
    const baseExtraFilter =
      (filters && queryFilterObject2String(filters)) || '';

    const extra_filter = additionalFilter
      ? baseExtraFilter
        ? `${baseExtraFilter} AND ${additionalFilter}`
        : additionalFilter
      : baseExtraFilter;

    return {
      ...rest,
      q,
      extra_filter,
      facets: queryParams?.facets?.join(', ') || '',
      size: size ? `${size}` : undefined,
      from: from && size ? `${(from - 1) * size}` : undefined,
      use_metadata_score: shouldUseMetadataScore ? 'true' : 'false',
      use_ai_search,
    };
  }, [
    rest,
    q,
    filters,
    additionalFilter,
    queryParams?.facets,
    size,
    from,
    shouldUseMetadataScore,
    use_ai_search,
  ]);

  const queryKey = ['search-results', params];

  const queryResponse = useSearchResultsQuery(params, {
    queryKey,
    refetchOnWindowFocus: false,
    enabled: typeof window !== 'undefined',
    ...options,
  });

  return { response: queryResponse, params };
};
