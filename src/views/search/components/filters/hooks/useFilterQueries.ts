import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { fetchMetadata } from 'src/hooks/api/helpers';
import { FilterConfig, FilterTermType, FilterResults } from '../types';
import { SearchQueryParams } from 'src/views/search/types';
import { useRouter } from 'next/router';
import {
  useAggregation,
  AggregationQueryParams,
} from 'src/views/search/hooks/useAggregation';
import { ALL_FACET_PROPERTIES } from '../config';
import { FetchSearchResultsResponse } from 'src/utils/api/types';

/**
 * Hook options
 */
interface UseFilterQueriesOptions {
  /** Filter configurations to query */
  configs: FilterConfig[];
  /** Query parameters for the filter API calls */
  params: SearchQueryParams;
  /** Whether queries are enabled (e.g. gated on search results loading first) */
  enabled?: boolean;
  /**
   * Pre-fetched BioSample-scoped aggregation response.
   * Used for Sample-category filter facet counts.
   */
  bioSampleAggregationData?: FetchSearchResultsResponse | undefined;
  /**
   * Pre-fetched ComputationalTool-scoped aggregation response.
   * Used for Computational Tool filter facet counts.
   */
  computationalToolAggregationData?: FetchSearchResultsResponse | undefined;
  /**
   * Pre-fetched Shared/Dataset aggregation response.
   * Includes all record types except non-BioSample Sample records.
   * Used for Shared/Dataset filter facet counts.
   */
  sharedDatasetAggregationData?: FetchSearchResultsResponse | undefined;
}

export interface UseFilterQueriesResult {
  results: FilterResults | undefined;
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
}

/**
 * Selects the correct aggregation response for a given filter config.
 *
 * Routing rules:
 *   - "Sample" category:  bioSampleAggregationData
 *   - "Computational Tool": computationalToolAggregationData
 *   - "Shared / Dataset": sharedDatasetAggregationData
 *   - anything else: fallback main aggregation response
 */
const selectAggregationForFilter = (
  config: FilterConfig,
  mainResponse: FetchSearchResultsResponse | undefined,
  bioSampleAggregationData: FetchSearchResultsResponse | undefined,
  computationalToolAggregationData: FetchSearchResultsResponse | undefined,
  sharedDatasetAggregationData: FetchSearchResultsResponse | undefined,
): FetchSearchResultsResponse | undefined => {
  switch (config.category) {
    case 'Sample':
      return bioSampleAggregationData ?? mainResponse;
    case 'Computational Tool':
      return computationalToolAggregationData ?? mainResponse;
    case 'Shared / Dataset':
      return sharedDatasetAggregationData ?? mainResponse;
    default:
      return mainResponse;
  }
};

/**
 * Hook for fetching filter data.
 *
 * Makes a single aggregation API call for all facets + date histogram,
 * then derives per-filter results from the response.
 *
 * Each filter category is routed to its appropriate scoped aggregation:
 *   - Shared/Dataset:sharedDatasetAggregationData (all types except non-BioSample Samples)
 *   - Computational Tool: computationalToolAggregationData (@type:ComputationalTool only)
 *   - Sample: bioSampleAggregationData (@type:Sample AND additionalType:"BioSample")
 */
export const useFilterQueries = ({
  configs,
  params,
  enabled = true,
  bioSampleAggregationData,
  computationalToolAggregationData,
  sharedDatasetAggregationData,
}: UseFilterQueriesOptions): UseFilterQueriesResult => {
  const router = useRouter();
  const queriesEnabled = router.isReady && enabled;

  // Keep the main aggregation query as a fallback / cache-warming call.
  // Always request ALL facet properties + hist=date so the query key is stable
  // regardless of which filters are currently visible.
  const aggParams: AggregationQueryParams = useMemo(
    () => ({
      q: params.q || '',
      extra_filter: params.extra_filter || '',
      facets: ALL_FACET_PROPERTIES,
      use_ai_search: params?.use_ai_search ?? 'false',
      advancedSearch: params?.advancedSearch,
      hist: 'date',
    }),
    [
      params.q,
      params.extra_filter,
      params.use_ai_search,
      params.advancedSearch,
    ],
  );

  // Main (unscoped) aggregation: kept as fallback when a scoped response is
  // not yet available.
  const aggQuery = useAggregation({
    params: aggParams,
    enabled: queriesEnabled,
  });

  // Source facets still need metadata for genre grouping
  const hasSourceConfig = configs.some(c => c.queryType === 'source');
  const metadataQuery = useQuery({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
    enabled: queriesEnabled && hasSourceConfig,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const response = aggQuery.data;
  const isLoading = aggQuery.isPending;
  const isUpdating = !isLoading && aggQuery.isFetching;
  const error = (aggQuery.error as Error) || null;

  // Keep a ref to the last fully-resolved results so consumers
  // see stable data while queries are refetching.
  const settledResultsRef = useRef<FilterResults>({} as FilterResults);

  const results = useMemo(() => {
    const prev = settledResultsRef.current;

    const next = configs.reduce((acc, config) => {
      let terms: FilterTermType[] = [];

      // Route to the correct scoped aggregation for this filter's category.
      const activeResponse = selectAggregationForFilter(
        config,
        response,
        bioSampleAggregationData,
        computationalToolAggregationData,
        sharedDatasetAggregationData,
      );

      if (activeResponse?.facets) {
        if (config.queryType === 'histogram') {
          // Date histogram data from hist=date
          const missingDatesCount = activeResponse?.facets?.date?.missing || 0;
          const histogramDates = activeResponse?.facets?.hist_dates;
          if (histogramDates?.terms) {
            terms = histogramDates.terms.map(t => ({
              term: t.term,
              label: t.term.split('-')[0] || t.term,
              count: t.count,
              facet: 'date',
            }));
          }
          // Append -_exists_ using missing
          if (missingDatesCount > 0) {
            terms.push({
              term: '-_exists_',
              label: 'Missing',
              count: missingDatesCount,
              facet: 'date',
            });
          }
        } else if (config.queryType === 'source') {
          // Source facets need metadata for groupBy
          const facetData = activeResponse.facets[config.property];
          if (facetData?.terms) {
            const repos = metadataQuery.data;
            const repoList =
              (repos?.src &&
                Object.values(repos.src).filter((r: any) => r?.sourceInfo)) ||
              [];
            terms = facetData.terms.map(t => ({
              term: t.term,
              label: t.term,
              count: t.count,
              facet: config.property,
              groupBy:
                (repoList as any[]).find(
                  (r: any) => r.sourceInfo?.name === t.term,
                )?.sourceInfo?.genre || 'Generalist',
            }));
          }
        } else {
          // Standard facet
          const facetData = activeResponse.facets[config.property];
          if (facetData?.terms) {
            const mappedTerms = facetData.terms.map(t => {
              const transformed = config.transformData
                ? config.transformData({
                    term: t.term,
                    count: t.count,
                    label: t.term,
                  })
                : { term: t.term, count: t.count, label: t.term };
              return {
                term: transformed.term,
                label: transformed.label,
                count: transformed.count,
                facet: config.property,
              };
            });

            // Prepend "Any" (_exists_) using total - missing
            const existsCount = activeResponse.total - (facetData.missing || 0);
            terms = [
              {
                term: '_exists_',
                label: 'Any',
                count: existsCount,
                facet: config.property,
              },
              ...mappedTerms,
            ];

            // Append "No" (-_exists_) using missing (only if missing > 0 AND config allows it)
            if ((facetData.missing || 0) > 0 && config.showMissing !== false) {
              terms.push({
                term: '-_exists_',
                label: 'No',
                count: facetData.missing,
                facet: config.property,
              });
            }
          }
        }
      }

      const finalTerms =
        terms.length > 0 ? terms : prev[config.id]?.terms || [];

      acc[config.id] = {
        id: config.id,
        terms: finalTerms,
        data: finalTerms,
        isLoading,
        isUpdating,
        error: aggQuery.error,
      };
      return acc;
    }, {} as FilterResults);

    if (!isLoading && !isUpdating) {
      settledResultsRef.current = next;
    }

    return next;
  }, [
    configs,
    response,
    bioSampleAggregationData,
    computationalToolAggregationData,
    sharedDatasetAggregationData,
    isLoading,
    isUpdating,
    metadataQuery.data,
    aggQuery.error,
  ]);

  return {
    results,
    isLoading,
    isUpdating,
    error,
  };
};
