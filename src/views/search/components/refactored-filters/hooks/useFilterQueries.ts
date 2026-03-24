import { keepPreviousData, useQueries } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { fetchSearchResults } from 'src/utils/api';
import { fetchMetadata } from 'src/hooks/api/helpers';
import { encodeString } from 'src/utils/querystring-helpers';
import { FilterConfig, FilterTerm, FilterResults } from '../types';
import { Facet, FacetTerm } from 'src/utils/api/types';
import { SearchQueryParams } from 'src/views/search/types';
import { useRouter } from 'next/router';

/**
 * Build base query parameters for facet queries
 */
const buildFacetParams = (
  params: SearchQueryParams,
  facetProperty: string,
  extraFilter?: string,
) => {
  const encodedQuery =
    params.advancedSearch === 'true' ? params.q : encodeString(params.q);

  return {
    q: encodedQuery,
    extra_filter: extraFilter || params.extra_filter || '',
    filters: '',
    size: 0,
    facet_size: params.facet_size || 1000,
    facets: facetProperty,
    sort: undefined,
    use_ai_search: params.use_ai_search,
  };
};

/**
 * Fetch standard facet data with exists/not-exists counts
 */
const fetchStandardFacet = async (
  params: SearchQueryParams,
  config: FilterConfig,
): Promise<FilterTerm[]> => {
  const { property } = config;

  // Add _exists_ filter to get counts for "Any" option to filter string.
  const existsFilter = params.extra_filter
    ? `${params.extra_filter} AND _exists_:${property}`
    : `_exists_:${property}`;

  const queryParams = buildFacetParams(params, property, existsFilter);
  const data = await fetchSearchResults(queryParams);

  if (!data?.facets) {
    return [];
  }

  const facetData = Object.values(data.facets)[0] as Facet[keyof Facet];
  const terms: FilterTerm[] =
    facetData?.terms?.map((t: FacetTerm) => {
      const transformed = config.transformData
        ? config.transformData({ term: t.term, count: t.count, label: t.term })
        : { term: t.term, count: t.count, label: t.term };

      return {
        term: transformed.term,
        label: transformed.label,
        count: transformed.count,
      };
    }) || [];

  // Add "Any" (_exists_) option with total count
  const allTerms: FilterTerm[] = [
    { term: '_exists_', label: 'Any', count: data.total },
    ...terms,
  ];

  // Fetch "Not specified" (-_exists_) count
  const notExistsFilter = params.extra_filter
    ? `${params.extra_filter} AND -_exists_:${property}`
    : `-_exists_:${property}`;

  const notExistsParams = buildFacetParams(params, property, notExistsFilter);
  notExistsParams.facet_size = 0;

  const notExistsData = await fetchSearchResults(notExistsParams);

  if (notExistsData && notExistsData.total > 0) {
    allTerms.push({
      term: '-_exists_',
      label: 'No',
      count: notExistsData.total,
    });
  }

  return allTerms;
};

/**
 * Fetch source facet data with repository metadata
 */
const fetchSourceFacet = async (
  params: SearchQueryParams,
  config: FilterConfig,
): Promise<FilterTerm[]> => {
  const queryParams = buildFacetParams(params, config.property);

  const [data, repos] = await Promise.all([
    fetchSearchResults(queryParams),
    fetchMetadata(),
  ]);

  if (!data?.facets) {
    return [];
  }

  const facetData = Object.values(data.facets)[0] as Facet[keyof Facet];
  const repoList =
    (repos?.src &&
      Object.values(repos.src).filter((repo: any) => repo?.sourceInfo)) ||
    [];

  return (
    facetData?.terms?.map((t: FacetTerm) => ({
      term: t.term,
      label: t.term,
      count: t.count,
      groupBy:
        (repoList as any[]).find((r: any) => r.sourceInfo?.name === t.term)
          ?.sourceInfo?.genre || 'Generalist',
    })) || []
  );
};

/**
 * Fetch date histogram data
 */
const fetchDateFacet = async (
  params: SearchQueryParams,
): Promise<FilterTerm[]> => {
  const property = 'date';
  // Date uses histogram aggregation
  const queryParams = {
    ...buildFacetParams(params, ''),
    hist: property,
    facets: '',
  };

  const data = await fetchSearchResults(queryParams);
  const facetData = Object.values(data?.facets)[0] as Facet[keyof Facet];

  const terms: FilterTerm[] =
    facetData?.terms?.map((t: FacetTerm) => ({
      term: t.term,
      label: t.term.split('-')[0] || t.term, // Extract year
      count: t.count,
    })) || [];

  // Fetch resources with no date information.
  const notExistsFilter = params.extra_filter
    ? `${params.extra_filter} AND -_exists_:${property}`
    : `-_exists_:${property}`;

  const notExistsParams = buildFacetParams(params, property, notExistsFilter);
  notExistsParams.facet_size = 0;

  const notExistsData = await fetchSearchResults(notExistsParams);

  if (notExistsData && notExistsData.total > 0) {
    terms.push({
      term: '-_exists_',
      label: 'No',
      count: notExistsData.total,
    });
  }

  return terms;
};

/**
 * Main fetch function that routes to the appropriate fetcher based on query type
 */
const fetchFilterData = async (
  params: SearchQueryParams,
  config: FilterConfig,
): Promise<FilterTerm[]> => {
  switch (config.queryType) {
    case 'source':
      return fetchSourceFacet(params, config);
    case 'histogram':
      return fetchDateFacet(params);
    case 'facet':
    default:
      return fetchStandardFacet(params, config);
  }
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
}

/**
 * Hook for fetching filter data
 *
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

  // Create queries for each filter config
  const queries = useMemo(
    () =>
      configs.map(config => ({
        queryKey: ['filter', config.id, params],
        queryFn: () => fetchFilterData(params, config),
        enabled: queriesEnabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
      })),
    [configs, params, queriesEnabled],
  );

  // Execute all queries
  const queryResults = useQueries({ queries });

  const error = queryResults.find(r => r.error)?.error || null;

  // isLoading: queries are disabled (waiting for gate) or performing initial fetch
  // In React Query v5, disabled queries report isPending=true but isLoading=false,
  // so we check isPending directly to cover the "not yet enabled" state.
  const isLoading = queryResults.some(r => r.isPending);
  const isUpdating = !isLoading && queryResults.some(r => r.isFetching);

  // Keep a ref to the last fully-resolved results so consumers
  // see stable data while queries are refetching.
  const settledResultsRef = useRef<FilterResults>({} as FilterResults);

  const results = useMemo(() => {
    const prev = settledResultsRef.current;

    const next = configs.reduce((acc, config, index) => {
      const result = queryResults[index];
      const data = result.data as FilterTerm[] | undefined;
      const terms =
        data && data.length > 0 ? data : prev[config.id]?.terms || [];

      acc[config.id] = {
        id: config.id,
        terms,
        data: terms,
        isLoading,
        isUpdating,
        error: result.error,
      };
      return acc;
    }, {} as FilterResults);

    if (!isLoading && !isUpdating) {
      settledResultsRef.current = next;
    }

    return next;
  }, [configs, queryResults, isLoading, isUpdating]);

  return {
    results,
    isLoading,
    isUpdating,
    error,
  };
};
