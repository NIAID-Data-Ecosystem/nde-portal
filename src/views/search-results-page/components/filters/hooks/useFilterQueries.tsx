import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { Params } from 'src/utils/api';
import { FilterConfig, QueryResult, TransformedFacetResults } from '../types';

// Function to create a hash map from the filtered results for faster lookup
const createFilteredResultsMap = (updatedResults: {
  [facet: string]: QueryResult['results'];
}) => {
  return Object.keys(updatedResults).reduce((acc, facet) => {
    acc[facet] = new Map();
    updatedResults[facet].forEach(item => {
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
 * @param updatedResults - The results fetched with the selected filters.
 * @returns The merged results with counts from filtered results if available, otherwise counts are set to 0.
 */
const mergeResults = (
  initialResults: TransformedFacetResults,
  updatedResults: { [facet: string]: QueryResult['results'] },
): TransformedFacetResults => {
  const mergedResults: TransformedFacetResults = { ...initialResults };

  const filteredResultsMap = createFilteredResultsMap(updatedResults);
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
  queryResult: UseQueryResult<QueryResult, Error>[],
) => {
  const isLoading = queryResult.some(query => query.isLoading);
  const isPending = queryResult.some(query => query.isPending);
  const isPlaceholderData = queryResult.some(query => query.isPlaceholderData);
  const error = queryResult.find(query => query.error)?.error;
  const results = queryResult.reduce((acc, { data }) => {
    if (!data || !data?.facet) return acc;
    const { facet, results } = data;

    acc[facet] = acc[facet] ? acc[facet].concat(results) : results;
    return acc;
  }, {} as { [facet: string]: QueryResult['results'] });
  return {
    data: results,
    isLoading,
    isPlaceholderData,
    isPending,
    error: error || null,
  };
};

/**
 * Transform terms based on the filter configuration.
 *
 * @param queryResult - The object returned by the combine data.
 * @returns An object containing the transformed combined data and the loading state.
 */
const transformResults = (
  config: FilterConfig[],
  {
    data,
    ...queryResult
  }: {
    data: { [facet: string]: QueryResult['results'] };
    isLoading: boolean;
    isPlaceholderData: boolean;
    isPending: boolean;
    error: Error | null;
  },
) => {
  const transformedResults = { ...data };
  Object.keys(data).forEach(facet => {
    const configFacet = config.find(f => f.property === facet);

    transformedResults[facet] = data[facet].map(item =>
      configFacet?.transformData
        ? configFacet.transformData(item)
        : { ...item, label: item?.label || item.term },
    );
  });

  return {
    data: transformedResults as TransformedFacetResults,
    ...queryResult,
  };
};

/**
 * Custom hook to manage filter queries.
 *
 * This hook handles the creation, execution, and merging of filter queries.
 * It fetches the initial results without any extra filters and then fetches the filtered results with selected filters.
 * The initial and filtered results are merged such that counts from filtered results replace those in initial results.
 * If an item is not present in filtered results, its count is set to 0. The results are sorted by count in descending order.
 *
 * @param config - The filter configuration array.
 * @param initialParams - The parameters used in the update query.
 * @param updateParams - The parameters used in the update query.
 * @returns The merged initial and filtered results.
 */
export const useFilterQueries = ({
  config,
  initialParams,
  updateParams,
}: {
  config: FilterConfig[];
  initialParams: Params;
  updateParams: Params;
}) => {
  // Memoize the initial queries to avoid unnecessary recalculations
  // ignore extra_filter and filters in the initial queries to get all the possible results (regardless of filter selection)
  const initialQueries = useMemo(() => {
    return config
      .flatMap(
        facet =>
          facet?.createQueries &&
          facet.createQueries(
            {
              q: initialParams.q,
              extra_filter: initialParams?.extra_filter || '',
            },
            {
              queryKey: ['search-results'],
              placeholderData: {
                total: 0,
                results: [],
                facets: {
                  [facet.property]: {
                    terms: Array(5)
                      .fill('')
                      .map((_, index) => ({
                        label: `Loading... ${index}`,
                        term: `Loading... ${index}`,
                        facet: facet.property,
                        count: 0,
                      })),
                  },
                  total: 0,
                },
              },
              refetchOnWindowFocus: false,
            },
            true,
          ),
      )
      .filter(query => !!query);
  }, [config, initialParams.q, initialParams.extra_filter]);

  // Note: Wrap useQueries combine function in callback because inline functions will run on every render.
  // https://tanstack.com/query/latest/docs/framework/react/reference/useQueries#memoization
  const combineCallback = useCallback(
    (data: UseQueryResult<QueryResult, Error>[]) => {
      return transformResults(config, combineQueryResults(data));
    },
    [config],
  );

  // Fetch initial data.
  const {
    data: initialResults,
    isLoading,
    isPending,
    isPlaceholderData,
    error: initialError,
  } = useQueries({
    queries: initialQueries,
    combine: combineCallback,
  });

  // Determine if filtered queries should be enabled i.e. run when the initial results are available and extra filters are selected.
  // Used to update the counts in the initial results with the selected filters.
  const enableUpdate = useMemo(
    () =>
      Boolean(
        updateParams &&
          updateParams.extra_filter &&
          initialResults &&
          Object.keys(initialResults).length > 0,
      ),
    [updateParams, initialResults],
  );

  const updateQueries = useMemo(() => {
    return config
      .filter(facet => facet?.createQueries)
      .flatMap(
        facet =>
          facet?.createQueries &&
          facet.createQueries(updateParams, {
            queryKey: ['filtered'],
            enabled: enableUpdate,
            refetchOnWindowFocus: false,
          }),
      )
      .filter(query => !!query);
  }, [config, updateParams, enableUpdate]);

  // Fetch the updated results with the selected filters
  const {
    data: updatedResults,
    isLoading: isUpdating,
    error: updatedError,
  } = useQueries({
    queries: updateQueries,
    combine: combineCallback,
  });

  // Merge initial and filtered results (if they exist)
  const [mergedResults, setMergedResults] = useState<TransformedFacetResults>(
    {},
  );

  useEffect(() => {
    if (enableUpdate && !isUpdating) {
      const merged = mergeResults(initialResults, updatedResults);
      setMergedResults(merged);
    } else {
      setMergedResults(initialResults);
    }
  }, [initialResults, updatedResults, enableUpdate, isUpdating]);

  // Combine errors from initial and filtered queries
  const error = initialError || updatedError;

  return {
    results: mergedResults,
    error,
    isLoading: isLoading || isPlaceholderData || isPending,
    initialResults,
    isUpdating,
  };
};
