import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { encodeString } from 'src/utils/querystring-helpers';
import { ALL_FACET_PROPERTIES } from '../components/filters/config';

export interface SharedDatasetAggregationParams {
  q: string;
  use_ai_search?: string;
  advancedSearch?: string;
  extra_filter?: string;
}

/**
 * The raw Elasticsearch filter string that scopes any query to all record
 * types EXCEPT non-BioSample Sample records.
 *
 * Written as a negative exclusion so the query remains compatible with the
 * existing extra_filter AND-chaining pattern:
 *   NOT (@type:Sample AND NOT additionalType:"BioSample")
 */
export const SHARED_DATASET_EXTRA_FILTER =
  'NOT (@type:Sample AND NOT additionalType:"BioSample")';

/**
 * Always-on aggregation hook for Shared/Dataset filters.
 *
 * Includes all record types but excludes Sample records that do NOT have
 * additionalType="BioSample", so that BioSample records are counted alongside
 * Datasets, ResourceCatalogs, and ComputationalTools.
 *
 * Uses size=0 so no result documents are fetched (only facet data and the
 * total count are returned), keeping the request lightweight.
 */
export const useSharedDatasetAggregation = (
  params: SharedDatasetAggregationParams,
  options?: { enabled?: boolean },
) => {
  const {
    q,
    use_ai_search = 'false',
    advancedSearch,
    extra_filter = '',
  } = params;

  const encodedQ = advancedSearch === 'true' ? q : encodeString(q);

  // Combine the shared/dataset constraint with any active user filters.
  const combinedFilter = extra_filter
    ? `${extra_filter} AND ${SHARED_DATASET_EXTRA_FILTER}`
    : SHARED_DATASET_EXTRA_FILTER;

  return useQuery<FetchSearchResultsResponse | undefined>({
    queryKey: [
      'shared-dataset-aggregation',
      encodedQ,
      use_ai_search,
      advancedSearch,
      extra_filter,
    ],
    queryFn: () =>
      fetchSearchResults({
        q: encodedQ,
        extra_filter: combinedFilter,
        facets: ALL_FACET_PROPERTIES,
        hist: 'date',
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
