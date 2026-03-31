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
}

/**
 * Hook for fetching filter data.
 *
 * Makes a single aggregation API call for all facets + date histogram,
 * then derives per-filter results from the response.
 */
export const useFilterQueries = ({
  configs,
  params,
  enabled = true,
}: UseFilterQueriesOptions): {
  results: FilterResults;
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
} => {
  const router = useRouter();
  const queriesEnabled = router.isReady && enabled;
  // Always request ALL facet properties + hist=date so the query key is stable
  // regardless of which filters are currently visible. This prevents refetches
  // when the user toggles filter visibility and enables cache sharing with the
  // date filter and visual summary.
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

  // Single aggregation query for all facets + date histogram
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

      if (response?.facets) {
        if (config.queryType === 'histogram') {
          // Date histogram data from hist=date
          const facetData = response.facets['date'];
          if (facetData?.terms) {
            terms = facetData.terms.map(t => ({
              term: t.term,
              label: t.term.split('-')[0] || t.term,
              count: t.count,
              facet: 'date',
            }));
          }
          // Append -_exists_ using missing
          if (facetData && facetData.missing > 0) {
            terms.push({
              term: '-_exists_',
              label: 'No',
              count: facetData.missing,
              facet: 'date',
            });
          }
        } else if (config.queryType === 'source') {
          // Source facets need metadata for groupBy
          const facetData = response.facets[config.property];
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
          const facetData = response.facets[config.property];
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
            const existsCount = response.total - (facetData.missing || 0);
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
  }, [configs, response, isLoading, isUpdating, metadataQuery.data]);

  return {
    results,
    isLoading,
    isUpdating,
    error,
  };
};
