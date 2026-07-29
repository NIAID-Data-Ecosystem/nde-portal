import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { encodeString } from 'src/utils/querystring-helpers';
import { getFacetPropertiesForCategory } from '../components/filters/config';

export interface BioSampleAggregationParams {
  q: string;
  use_ai_search?: string;
  advancedSearch?: string;
  extra_filter?: string;
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
 * Accepts an optional `extra_filter` so that user-selected filters from the
 * filter panel are respected.
 *
 * Uses size=0 so no result documents are fetched (only facet data and the
 * total count are returned), keeping the request lightweight.
 *
 * Only requests the "Sample" category's facet properties. The Samples tab
 * count reads `total`, which is unaffected by `facets`.
 */
export const useBioSampleAggregation = (
  params: BioSampleAggregationParams,
  options?: { enabled?: boolean },
) => {
  const {
    q,
    use_ai_search = 'false',
    advancedSearch,
    extra_filter = '',
  } = params;

  const encodedQ = advancedSearch === 'true' ? q : encodeString(q);

  // Combine the BioSample type constraint with any active user filters.
  const combinedFilter = extra_filter
    ? `${extra_filter} AND ${BIOSAMPLE_EXTRA_FILTER}`
    : BIOSAMPLE_EXTRA_FILTER;

  return useQuery<FetchSearchResultsResponse | undefined>({
    queryKey: [
      'biosample-aggregation',
      encodedQ,
      use_ai_search,
      advancedSearch,
      extra_filter,
    ],
    queryFn: () =>
      fetchSearchResults({
        q: encodedQ,
        extra_filter: combinedFilter,
        // Omitted entirely (rather than sent empty) when feature flags hide
        // every Sample filter, so the request still returns `total`.
        facets: getFacetPropertiesForCategory('Sample') || undefined,
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
