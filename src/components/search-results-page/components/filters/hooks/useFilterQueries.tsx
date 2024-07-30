import { useEffect, useMemo, useState } from 'react';
import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { Params } from 'src/utils/api';
import { FILTER_CONFIGS } from '../config';
import { TransformedQueryResult } from '../types';

// Define the type for the query result accumulator
type QueryResultAccumulator = {
  [facet: string]: TransformedQueryResult['results'];
};

// Function to create a hash map from the filtered results for faster lookup
const createFilteredResultsMap = (filteredResults: QueryResultAccumulator) => {
  return Object.keys(filteredResults).reduce((acc, facet) => {
    acc[facet] = new Map();
    filteredResults[facet].forEach(item => {
      acc[facet].set(item.term, item.count);
    });
    return acc;
  }, {} as { [facet: string]: Map<string, number> });
};

/**
 * Merges initial and filtered results.
 *
 * This function takes the initial results and filtered results and combines them.
 * If there are filtered results, and the query is enabled, it updates the initial results with the counts from the filtered results.
 * If an item is not found in the filtered results, its count is set to 0.
 *
 * @param initialResults - The initial results fetched without any extra filters.
 * @param filteredResults - The results fetched with the selected filters.
 * @returns The merged results with counts from filtered results if available, otherwise counts are set to 0.
 */
const mergeResults = (
  initialResults: QueryResultAccumulator,
  filteredResults: QueryResultAccumulator,
): QueryResultAccumulator => {
  const mergedResults: QueryResultAccumulator = { ...initialResults };

  const filteredResultsMap = createFilteredResultsMap(filteredResults);

  // Iterate over each facet in the initial results
  for (const facet in initialResults) {
    if (filteredResultsMap[facet]) {
      mergedResults[facet] = initialResults[facet].map(item => ({
        ...item,
        count: filteredResultsMap[facet].get(item.term) ?? 0,
      }));
    } else {
      mergedResults[facet] = initialResults[facet].map(item => ({
        ...item,
        count: 0,
      }));
    }
    // Sort the results of each facet by count in descending order
    mergedResults[facet].sort((a, b) => b.count - a.count);
  }

  return mergedResults;
};

/**
 * Combines query results and determines if any query is loading.
 *
 * @param queryResult - The array of query results.
 * @returns An object containing the combined data and the loading state.
 */
const combineQueryResults = (
  queryResult: UseQueryResult<TransformedQueryResult, Error>[],
): { data: QueryResultAccumulator; isLoading: boolean } => {
  const isLoading = queryResult.some(query => query.isLoading);

  const results = queryResult.reduce((acc, { data }) => {
    if (!data || !data?.facet) return acc;
    const { facet, results } = data;
    acc[facet] = acc[facet] ? acc[facet].concat(results) : results;
    return acc;
  }, {} as QueryResultAccumulator);
  return { data: results, isLoading };
};

/**
 * Custom hook to manage filter queries.
 *
 * This hook handles the creation, execution, and merging of filter queries.
 * It fetches the initial results without any extra filters and then fetches the filtered results with selected filters.
 * The initial and filtered results are merged such that counts from filtered results replace those in initial results.
 * If an item is not present in filtered results, its count is set to 0. The results are sorted by count in descending order.
 *
 * @param queryParams - The parameters used in the query.
 * @returns The merged initial and filtered results.
 */

export const useFilterQueries = (queryParams: Params) => {
  // Memoize the initial queries to avoid unnecessary recalculations
  // ignore extra_filter and filters in the initial queries to get all the possible results (regardless of filter selection)
  const initialQueries = useMemo(() => {
    return FILTER_CONFIGS.flatMap(facet =>
      facet.createQueries(
        { ...queryParams, extra_filter: '', filters: '' },
        { queryKey: ['search-results'], enabled: true },
      ),
    );
  }, [queryParams]);

  // Fetch the initial results without any extra filters
  const { data: initialResults, isLoading } = useQueries({
    queries: initialQueries,
    combine: combineQueryResults,
  });
  // Determine if filtered queries should be enabled i.e. run when the initial results are available and extra filters are selected.
  const enableFilteredQueries = useMemo(
    () =>
      Boolean(
        queryParams &&
          queryParams.extra_filter &&
          initialResults &&
          Object.keys(initialResults).length > 0,
      ),
    [queryParams, initialResults],
  );

  const filteredQueries = useMemo(() => {
    return FILTER_CONFIGS.flatMap(facet =>
      facet.createQueries(queryParams, {
        queryKey: ['filtered'],
        enabled: enableFilteredQueries,
      }),
    );
  }, [queryParams, enableFilteredQueries]);

  // Fetch the updated results with the selected filters
  const { data: filteredResults, isLoading: isUpdating } = useQueries({
    queries: filteredQueries,
    combine: combineQueryResults,
  });

  // Merge initial and filtered results (if they exist)
  const [mergedResults, setMergedResults] = useState<QueryResultAccumulator>(
    {},
  );

  useEffect(() => {
    if (!enableFilteredQueries) {
      setMergedResults(initialResults);
    } else if (enableFilteredQueries && !isUpdating) {
      const merged = mergeResults(initialResults, filteredResults);
      setMergedResults(merged);
    }
  }, [initialResults, filteredResults, enableFilteredQueries, isUpdating]);

  return {
    results: mergedResults,
    error: null,
    isLoading,
    isUpdating,
  };
};
