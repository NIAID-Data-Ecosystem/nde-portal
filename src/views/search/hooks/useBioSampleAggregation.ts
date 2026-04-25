import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { encodeString } from 'src/utils/querystring-helpers';
import { ALL_FACET_PROPERTIES } from '../components/filters/config';

export interface BioSampleAggregationParams {
  q: string;
  use_ai_search?: string;
  advancedSearch?: string;
}

/**
 * The raw Elasticsearch filter string that scopes any query to BioSample records.
 */
export const BIOSAMPLE_EXTRA_FILTER =
  '@type:Sample AND additionalType:"BioSample"';

/**
 * Always-on aggregation hook scoped to @type:Sample AND additionalType:"BioSample".
 *
 * Runs in parallel with the main aggregation so that:
 *  - The Samples tab count is always visible.
 *  - Sample-category filter facet counts reflect only BioSample records.
 *
 * Uses size=0 so no result documents are fetched (only facet data and the
 * total count are returned), keeping the request lightweight.
 */
export const useBioSampleAggregation = (
  params: BioSampleAggregationParams,
  options?: { enabled?: boolean },
) => {
  const { q, use_ai_search = 'false', advancedSearch } = params;

  const encodedQ = advancedSearch === 'true' ? q : encodeString(q);

  return useQuery<FetchSearchResultsResponse | undefined>({
    queryKey: [
      'biosample-aggregation',
      encodedQ,
      use_ai_search,
      advancedSearch,
    ],
    queryFn: () =>
      fetchSearchResults({
        q: encodedQ,
        extra_filter: BIOSAMPLE_EXTRA_FILTER,
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
