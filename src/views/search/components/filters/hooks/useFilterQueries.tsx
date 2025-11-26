import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { Params } from 'src/utils/api';
import { FilterConfig, QueryData, RawQueryResult } from '../types';

// Function to create a hash map from the filtered results for faster lookup
const createFilteredResultsMap = (updatedResults: QueryData) => {
  return Object.keys(updatedResults).reduce((acc, facet) => {
    acc[facet] = new Map();
    updatedResults[facet]['data'].forEach(item => {
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
export const mergeResults = (
  initialResults: QueryData,
  updatedResults: QueryData,
): QueryData => {
  const filteredResultsMap = createFilteredResultsMap(updatedResults);

  // Convert initialResults object to an array of [facet, data] pairs,
  // transform them, and then convert back to an object
  return Object.fromEntries(
    Object.entries(initialResults).map(([key, { data }]) => [
      key,
      {
        // Transform data by updating the count based on filteredResultsMap
        data: data
          .map(item => ({
            ...item, // Spread existing properties of the item
            count: filteredResultsMap[key]?.get(item.term) ?? 0, // Update count or set to 0 if not found
          }))
          // Sort the items by count in descending order
          .sort((a, b) => b.count - a.count),
      },
    ]),
  ) as QueryData;
};

/**
 * Combines query results and determines if any query is loading.
 *
 * @param queryResult - The array of query results.
 * @returns An object containing the combined data and the loading state.
 */
const combineQueryResults = (
  queryResult: UseQueryResult<RawQueryResult, Error>[],
) => {
  const isLoading = queryResult.some(query => query.isLoading);
  const isPending = queryResult.some(query => query.isPending);
  const isPlaceholderData = queryResult.some(query => query.isPlaceholderData);
  const error = queryResult.find(query => query.error)?.error;
  const results = queryResult.reduce(
    (acc, { data }, idx) => {
      if (!data || !data?.id) return acc;
      const { id, results } = data;

      if (!acc[id]) {
        acc[id] = { ...queryResult[idx], data: [] };
      }

      acc[id]['data'] = acc[id]['data'].concat(results);
      return acc;
    },
    {} as {
      [id: string]: { data: RawQueryResult['results'] };
    },
  );

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
    data: {
      [facet: string]: { data: RawQueryResult['results'] };
    };
    isLoading: boolean;
    isPlaceholderData: boolean;
    isPending: boolean;
    error: Error | null;
  },
) => {
  const transformedResults = { ...data };
  Object.keys(data).forEach(id => {
    const configFacet = config.find(f => f._id === id);

    const items = data[id]['data'].map(item =>
      configFacet?.transformData
        ? configFacet.transformData(item)
        : { ...item, label: item?.label || item.term },
    );

    transformedResults[id] = { ...data[id], data: items };
  });
  return {
    data: transformedResults as QueryData,
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
 * If initialParams and updateParams have the same extra_filter,
 * only the initial queries are run.
 *
 * @param config - The filter configuration array.
 * @param initialParams - The parameters used in the initial query.
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
  const initialQueries = useMemo(() => {
    return config
      .flatMap(
        facetConfig =>
          facetConfig?.createQueries &&
          facetConfig.createQueries(
            facetConfig._id,
            {
              q: initialParams.q,
              extra_filter: initialParams?.extra_filter || '',
              facets: facetConfig.property,
            },
            {
              queryKey: ['search-results'],
              placeholderData: {
                total: 0,
                results: [],
                facets: {
                  [facetConfig._id]: {
                    terms: Array(5)
                      .fill('')
                      .map((_, index) => ({
                        label: `Loading... ${index}`,
                        term: `Loading... ${index}`,
                        facetConfig: facetConfig.property,
                        count: 0,
                      })),
                  },
                  total: 0,
                },
              },
              refetchOnWindowFocus: false,
            },
          ),
      )
      .filter(query => !!query);
  }, [config, initialParams.q, initialParams.extra_filter]);

  // Note: Wrap useQueries combine function in callback because inline functions will run on every render.
  // https://tanstack.com/query/latest/docs/framework/react/reference/useQueries#memoization
  const combineCallback = useCallback(
    (data: UseQueryResult<RawQueryResult, Error>[]) => {
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

  // Check if the extra_filter is the same in both params
  // If they're the same, no need to run update queries (they'd be duplicates)
  const shouldRunUpdateQueries = useMemo(() => {
    return Boolean(
      updateParams &&
        updateParams.extra_filter &&
        updateParams.extra_filter !== initialParams.extra_filter &&
        initialResults &&
        Object.keys(initialResults).length > 0,
    );
  }, [updateParams, initialParams.extra_filter, initialResults]);

  const updateQueries = useMemo(() => {
    return config
      .filter(facet => facet?.createQueries)
      .flatMap(
        facetConfig =>
          facetConfig?.createQueries &&
          facetConfig.createQueries(
            facetConfig._id,
            { ...updateParams, facets: facetConfig.property },
            {
              queryKey: ['filtered'],
              enabled: shouldRunUpdateQueries,
              refetchOnWindowFocus: false,
            },
          ),
      )
      .filter(query => !!query);
  }, [config, updateParams, shouldRunUpdateQueries]);

  // Fetch the updated results with the selected filters
  const {
    data: updatedResults,
    isLoading: isUpdating,
    error: updatedError,
    isPending: updatedPending,
  } = useQueries({
    queries: updateQueries,
    combine: combineCallback,
  });

  // Merge initial and filtered results (if they exist)
  const [mergedResults, setMergedResults] = useState<QueryData>({});

  useEffect(() => {
    if (
      shouldRunUpdateQueries &&
      !isUpdating &&
      updatedResults &&
      Object.keys(updatedResults)?.length > 0
    ) {
      const merged = mergeResults(initialResults, updatedResults);
      setMergedResults(merged);
    } else if (!isLoading && !isUpdating && initialResults) {
      // If update queries are disabled (because params are the same),
      // just use initialResults directly
      setMergedResults(initialResults);
    }
  }, [
    initialResults,
    updatedResults,
    shouldRunUpdateQueries,
    isUpdating,
    isLoading,
  ]);

  // Combine errors from initial and filtered queries
  const error = initialError || updatedError;
  return {
    error,
    initialResults,
    isLoading: isLoading || isPlaceholderData || isPending,
    isUpdating: shouldRunUpdateQueries && (isUpdating || updatedPending),
    results: mergedResults,
  };
};
