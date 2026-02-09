import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { SearchState } from '../types';
import { fetchSearchResults } from 'src/utils/api';
import { useQuery } from '@tanstack/react-query';
import { queryFilterObject2String } from '../../filters/utils/query-builders';

type UseAggregationQueryArgs = {
  property: string;
  searchState: SearchState;
  enabled: boolean;
};

type UseAggregationQueryResult = {
  data?: FetchSearchResultsResponse;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
};

// Fetch aggregation data for a given property and search state.
export const useAggregationQuery = ({
  property,
  searchState,
  enabled,
}: UseAggregationQueryArgs): UseAggregationQueryResult => {
  const params = {
    ...searchState,
    from: '' + searchState.from,
    filters: queryFilterObject2String(searchState.filters) || '',
    extra_filter: queryFilterObject2String(searchState.filters) || '',
    facet_size: searchState?.facet_size || 100,
    facets: property,
    size: 0,
  };

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['search-results-facets', params],
    queryFn: async () => await fetchSearchResults(params),
    enabled,
  });
  return {
    data,
    isLoading,
    isFetching,
    isError: !!error,
    refetch,
  };
};
