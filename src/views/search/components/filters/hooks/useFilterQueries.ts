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
import { mergeFacets } from '../utils/merge-facets';
import { FetchSearchResultsResponse } from 'src/utils/api/types';

/**
 * Defines the subset of a React Query result that this hook consumes from a
 * scoped aggregation, enabling callers to pass their `useQuery` result directly.
 */
export interface ScopedAggregationQuery {
  data: FetchSearchResultsResponse | undefined;
  isPending: boolean;
  isFetching: boolean;
  error: Error | null;
}

/**
 * Stand-in result used when the unscoped aggregation is disabled. It prevents
 * configs that route to it from inheriting React Query's permanent
 * `isPending: true` state for disabled queries, reporting them instead as
 * settled with no data.
 */
const IDLE_QUERY: ScopedAggregationQuery = {
  data: undefined,
  isPending: false,
  isFetching: false,
  error: null,
};

/**
 * React Query creates a new result object on every render. To avoid unnecessary
 * recomputation, the scoped query results are wrapped in a memoized object
 * whose identity changes only when one of the fields consumed by this hook changes.
 */
const useStableQuery = (
  query: ScopedAggregationQuery | undefined,
): ScopedAggregationQuery | undefined => {
  const data = query?.data;
  const isPending = query?.isPending;
  const isFetching = query?.isFetching;
  const error = query?.error ?? null;

  return useMemo(
    () =>
      query
        ? {
            data,
            isPending: !!isPending,
            isFetching: !!isFetching,
            error,
          }
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [!!query, data, isPending, isFetching, error],
  );
};

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
   * Whether to fire the internal unscoped aggregation. Callers that supply a
   * scoped query for every category they render (the filters panel) should
   * disable it. Defaults to `true` for callers that rely on it
   * (e.g. the Date filter).
   */
  enableMainAggregation?: boolean;
  /**
   * Facet properties to request from the unscoped aggregation. Defaults to
   * every facet property; callers that read only some should narrow it, since
   * aggregation cost scales with facet count.
   */
  mainAggregationFacets?: string;
  /**
   * BioSample-scoped aggregation query.
   * Drives Sample-category filter facet counts and their loading state.
   */
  bioSampleAggregation?: ScopedAggregationQuery;
  /**
   * ComputationalTool-scoped aggregation query.
   * Drives Computational Tool filter facet counts and their loading state.
   */
  computationalToolAggregation?: ScopedAggregationQuery;
  /**
   * Shared/Dataset aggregation query.
   * Includes all record types except non-BioSample Sample records.
   * Drives Shared/Dataset filter facet counts and their loading state.
   */
  sharedDatasetAggregation?: ScopedAggregationQuery;
  /**
   * DataCollection-scoped aggregation query.
   * Drives Data Collection filter facet counts and their loading state.
   */
  dataCollectionAggregation?: ScopedAggregationQuery;
}

export interface UseFilterQueriesResult {
  results: FilterResults | undefined;
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
}

/**
 * Selects the aggregation query that serves a given filter config.
 *
 * Routing rules:
 *   - "Sample" category: bioSampleAggregation
 *   - "Computational Tool": computationalToolAggregation
 *   - "Shared / Dataset": sharedDatasetAggregation
 *   - "Data Collection": dataCollectionAggregation
 *   - anything else (or a category whose scoped query was not supplied):
 *     the main aggregation
 *
 * The returned query is the single source of truth for both this filter's
 * facet data and its loading state, so a section unblocks as soon as its own
 * scoped request resolves rather than waiting on unrelated ones.
 */
const selectQueryForFilter = (
  config: FilterConfig,
  mainQuery: ScopedAggregationQuery,
  bioSampleAggregation: ScopedAggregationQuery | undefined,
  computationalToolAggregation: ScopedAggregationQuery | undefined,
  sharedDatasetAggregation: ScopedAggregationQuery | undefined,
  dataCollectionAggregation: ScopedAggregationQuery | undefined,
): ScopedAggregationQuery => {
  switch (config.category) {
    case 'Sample':
      return bioSampleAggregation ?? mainQuery;
    case 'Computational Tool':
      return computationalToolAggregation ?? mainQuery;
    case 'Shared / Dataset':
      return sharedDatasetAggregation ?? mainQuery;
    case 'Data Collection':
      return dataCollectionAggregation ?? mainQuery;
    default:
      return mainQuery;
  }
};

/**
 * Hook for deriving per-filter term lists from aggregation responses.
 *
 * Each filter category is routed to its appropriate scoped aggregation, which
 * supplies both that filter's facet data and its loading state:
 *   - Shared/Dataset: sharedDatasetAggregation (all types except non-BioSample Samples)
 *   - Computational Tool: computationalToolAggregation (@type:ComputationalTool only)
 *   - Sample: bioSampleAggregation (@type:Sample AND additionalType:"BioSample")
 *   - Data Collection: dataCollectionAggregation (@type:DataCollection only)
 *
 * Any category without a supplied scoped query falls back to the internal
 * unscoped aggregation, which callers that supply all four should turn off via
 * `enableMainAggregation: false`.
 */
export const useFilterQueries = ({
  configs,
  params,
  enabled = true,
  enableMainAggregation = true,
  mainAggregationFacets = ALL_FACET_PROPERTIES,
  bioSampleAggregation: bioSampleAggregationProp,
  computationalToolAggregation: computationalToolAggregationProp,
  sharedDatasetAggregation: sharedDatasetAggregationProp,
  dataCollectionAggregation: dataCollectionAggregationProp,
}: UseFilterQueriesOptions): UseFilterQueriesResult => {
  const bioSampleAggregation = useStableQuery(bioSampleAggregationProp);
  const computationalToolAggregation = useStableQuery(
    computationalToolAggregationProp,
  );
  const sharedDatasetAggregation = useStableQuery(sharedDatasetAggregationProp);
  const dataCollectionAggregation = useStableQuery(
    dataCollectionAggregationProp,
  );

  const router = useRouter();
  const queriesEnabled = router.isReady && enabled && enableMainAggregation;

  // The unscoped aggregation. Requests a stable facet list (all properties by
  // default) so the query key does not churn with which filters are visible.
  const aggParams: AggregationQueryParams = useMemo(
    () => ({
      q: params.q || '',
      extra_filter: params.extra_filter || '',
      facets: mainAggregationFacets,
      use_ai_search: params?.use_ai_search ?? 'false',
      advancedSearch: params?.advancedSearch,
      hist: 'date',
    }),
    [
      params.q,
      params.extra_filter,
      params.use_ai_search,
      params.advancedSearch,
      mainAggregationFacets,
    ],
  );

  const aggQuery = useAggregation({
    params: aggParams,
    enabled: queriesEnabled,
  });

  // Source facets still need metadata for genre grouping
  const hasSourceConfig = configs.some(c => c.queryType === 'source');
  const metadataQuery = useQuery({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
    enabled: router.isReady && enabled && hasSourceConfig,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const mainQuery: ScopedAggregationQuery = useMemo(
    () =>
      enableMainAggregation
        ? {
            data: aggQuery.data,
            isPending: aggQuery.isPending,
            isFetching: aggQuery.isFetching,
            error: (aggQuery.error as Error) || null,
          }
        : IDLE_QUERY,
    [
      enableMainAggregation,
      aggQuery.data,
      aggQuery.isPending,
      aggQuery.isFetching,
      aggQuery.error,
    ],
  );

  // Every aggregation query that at least one of `configs` reads from. Used for
  // the hook-level loading/error state; per-filter state comes from that
  // filter's own query, so one slow category cannot stall the others.
  const activeQueries = useMemo(() => {
    const queries = new Set<ScopedAggregationQuery>();
    configs.forEach(config => {
      queries.add(
        selectQueryForFilter(
          config,
          mainQuery,
          bioSampleAggregation,
          computationalToolAggregation,
          sharedDatasetAggregation,
          dataCollectionAggregation,
        ),
      );
    });
    return Array.from(queries);
  }, [
    configs,
    mainQuery,
    bioSampleAggregation,
    computationalToolAggregation,
    sharedDatasetAggregation,
    dataCollectionAggregation,
  ]);

  const isLoading = activeQueries.some(query => query.isPending);
  const isUpdating =
    !isLoading && activeQueries.some(query => query.isFetching);
  const error = activeQueries.find(query => query.error)?.error || null;

  // Keep a ref to the last fully-resolved results so consumers
  // see stable data while queries are refetching.
  const settledResultsRef = useRef<FilterResults>({} as FilterResults);

  const results = useMemo(() => {
    const prev = settledResultsRef.current;

    const next = configs.reduce((acc, config) => {
      let terms: FilterTermType[] = [];

      // Route to the correct scoped aggregation for this filter's category.
      const activeQuery = selectQueryForFilter(
        config,
        mainQuery,
        bioSampleAggregation,
        computationalToolAggregation,
        sharedDatasetAggregation,
        dataCollectionAggregation,
      );
      const activeResponse = activeQuery.data;
      const configIsLoading = activeQuery.isPending;
      const configIsUpdating = !configIsLoading && activeQuery.isFetching;

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
              groupBy: (repoList as any[])
                .find(
                  (r: any) =>
                    r.sourceInfo?.name === t.term ||
                    r.sourceInfo?.identifier === t.term,
                )
                ?.sourceInfo?.genre?.includes('IID')
                ? 'IID'
                : 'Generalist',
            }));
          }
        } else {
          // Standard facet. Filters that span several API fields have their
          // terms and Any/No counts merged here (see mergeFacets).
          const facetData = mergeFacets(
            activeResponse.facets,
            config.property,
            activeResponse.total,
          );
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

            // Prepend "Any" (_exists_)
            terms = [
              {
                term: '_exists_',
                label: 'Any',
                count: facetData.existsCount,
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
        isLoading: configIsLoading,
        isUpdating: configIsUpdating,
        error: activeQuery.error,
      };
      return acc;
    }, {} as FilterResults);

    if (!isLoading && !isUpdating) {
      settledResultsRef.current = next;
    }

    return next;
  }, [
    configs,
    mainQuery,
    bioSampleAggregation,
    computationalToolAggregation,
    sharedDatasetAggregation,
    dataCollectionAggregation,
    isLoading,
    isUpdating,
    metadataQuery.data,
  ]);

  return {
    results,
    isLoading,
    isUpdating,
    error,
  };
};
