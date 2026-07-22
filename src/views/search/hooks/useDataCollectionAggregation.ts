import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { encodeString } from 'src/utils/querystring-helpers';
import { DATA_COLLECTION_FACET_PROPERTIES } from '../components/filters/config';

export interface DataCollectionAggregationParams {
  q: string;
  use_ai_search?: string;
  advancedSearch?: string;
  extra_filter?: string;
}

/**
 * The raw Elasticsearch filter string that scopes any query to DataCollection
 * records.
 */
export const DATA_COLLECTION_EXTRA_FILTER = '@type:DataCollection';

/**
 * Always-on aggregation hook scoped to @type:DataCollection.
 *
 * Used to drive Data Collection filter facet counts so they reflect only
 * DataCollection records.
 *
 * Uses size=0 so no result documents are fetched (only facet data and the
 * total count are returned), keeping the request lightweight.
 */
export const useDataCollectionAggregation = (
  params: DataCollectionAggregationParams,
  options?: { enabled?: boolean },
) => {
  const {
    q,
    use_ai_search = 'false',
    advancedSearch,
    extra_filter = '',
  } = params;

  const encodedQ = advancedSearch === 'true' ? q : encodeString(q);

  // Combine the DataCollection type constraint with any active user filters.
  const combinedFilter = extra_filter
    ? `${extra_filter} AND ${DATA_COLLECTION_EXTRA_FILTER}`
    : DATA_COLLECTION_EXTRA_FILTER;

  return useQuery<FetchSearchResultsResponse | undefined>({
    queryKey: [
      'data-collection-aggregation',
      encodedQ,
      use_ai_search,
      advancedSearch,
      extra_filter,
    ],
    queryFn: () =>
      fetchSearchResults({
        q: encodedQ,
        extra_filter: combinedFilter,
        facets: DATA_COLLECTION_FACET_PROPERTIES,
        size: 0,
        facet_size: 1000,
        use_ai_search,
      }),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
