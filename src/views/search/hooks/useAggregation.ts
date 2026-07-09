import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { encodeString } from 'src/utils/querystring-helpers';

export interface AggregationQueryParams {
  q: string;
  extra_filter: string;
  facets: string;
  facet_size?: number;
  use_ai_search: string;
  advancedSearch?: string;
  hist?: string;
}

export const buildAggregationQueryKey = (params: AggregationQueryParams) =>
  ['aggregation', params] as const;

export const fetchAggregation = async (
  params: AggregationQueryParams,
): Promise<FetchSearchResultsResponse | undefined> => {
  const encodedQuery =
    params.advancedSearch === 'true' ? params.q : encodeString(params.q);

  return fetchSearchResults({
    q: encodedQuery,
    extra_filter: params.extra_filter,
    facets: params.facets,
    hist: params?.hist || undefined,
    size: 0,
    facet_size: params.facet_size || 1000,
    use_ai_search: params.use_ai_search,
  });
};

interface UseAggregationOptions {
  params: AggregationQueryParams;
  enabled?: boolean;
}

export const useAggregation = ({
  params,
  enabled = true,
}: UseAggregationOptions) => {
  return useQuery({
    queryKey: buildAggregationQueryKey(params),
    queryFn: () => fetchAggregation(params),
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
