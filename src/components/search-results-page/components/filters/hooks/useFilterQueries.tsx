import { useMemo } from 'react';
import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { Params } from 'src/utils/api';
import { FILTER_CONFIGS, TransformedQueryResult } from '../helpers';
import { FetchSearchResultsResponse } from 'src/utils/api/types';

// Define the type for the query result accumulator
type QueryResultAccumulator = {
  [facet: string]: TransformedQueryResult['results'];
};

// Custom hook to manage filter queries
export const useFilterQueries = (queryParams: Params) => {
  // Memoize the initial queries to avoid unnecessary recalculations
  const initialQueries = useMemo(() => {
    return FILTER_CONFIGS.flatMap(facet =>
      facet.getQueries({ ...queryParams, extra_filter: '' }, { enabled: true }),
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

  // Memoize the updated queries with the selected filters and only run when the initial results are available and extra filters are selected.
  const filteredQueries = useMemo(() => {
    return FILTER_CONFIGS.flatMap(facet =>
      facet.getQueries(queryParams, {
        queryKey: ['search-results', 'filtered', queryParams],
        enabled: Boolean(
          queryParams &&
            queryParams.extra_filter &&
            initialResults &&
            Object.keys(initialResults).length > 0,
        ),
      }),
    );
  }, [queryParams, initialResults]);

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

  console.log('initialResults', initialResults);
  console.log('filteredResults', filteredResults);
  return { initialResults: [], filteredResults: [] };
};
