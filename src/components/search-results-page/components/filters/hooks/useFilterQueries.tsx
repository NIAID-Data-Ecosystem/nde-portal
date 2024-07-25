import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Params } from 'src/utils/api';
import { FILTER_CONFIGS, TransformedQueryResult } from '../helpers';

// Define the type for the query result accumulator
type QueryResultAccumulator = {
  [facet: string]: TransformedQueryResult['results'];
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

  // Iterate over each facet in the initial results
  for (const facet in initialResults) {
    if (filteredResults[facet]) {
      // If the facet is found in the filtered results, update the counts
      mergedResults[facet] = initialResults[facet].map(item => {
        const filteredItem = filteredResults[facet].find(
          f => f.term === item.term,
        );
        return {
          ...item,
          count: filteredItem ? filteredItem.count : 0,
        };
      });
    } else {
      // If the facet is not found in the filtered results, set the counts to 0
      mergedResults[facet] = initialResults[facet].map(item => ({
        ...item,
        count: 0,
      }));
    }
    // Sort the results of each facet by count indescending order
    mergedResults[facet].sort((a, b) => b.count - a.count);
  }

  return mergedResults;
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
  const initialQueries = useMemo(() => {
    return FILTER_CONFIGS.flatMap(facet =>
      facet.getQueries(
        { ...queryParams, extra_filter: '' },
        { queryKey: ['search-results'], enabled: true },
      ),
    );
  }, [queryParams]);

  // Fetch the initial results without any extra filters
  const initialResults = useQueries({
    queries: initialQueries,
    combine: queryResult => {
      return queryResult.reduce((acc, { data }) => {
        if (!data) return acc;
        const { facet, results } = data;
        acc[facet] = acc[facet] ? acc[facet].concat(results) : results;
        return acc;
      }, {} as QueryResultAccumulator);
    },
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
      facet.getQueries(queryParams, {
        queryKey: ['filtered'],
        enabled: enableFilteredQueries,
      }),
    );
  }, [queryParams, enableFilteredQueries]);

  // Fetch the updated results with the selected filters
  const filteredResults = useQueries({
    queries: filteredQueries,
    combine: queryResult =>
      queryResult.reduce((acc, { data }) => {
        if (!data) return acc;
        const { facet, results } = data;
        acc[facet] = acc[facet] ? acc[facet].concat(results) : results;
        return acc;
      }, {} as QueryResultAccumulator),
  });

  // Merge initial and filtered results
  const mergedResults = useMemo(() => {
    if (enableFilteredQueries) {
      return mergeResults(initialResults, filteredResults);
    }
    return initialResults;
  }, [initialResults, filteredResults, enableFilteredQueries]);

  return { results: mergedResults };
};
