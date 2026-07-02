import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import {
  DateFilter,
  prepareInitialParams,
} from 'src/views/search/components/filters/components/date-filter';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from 'src/views/search/components/filters/utils/query-string';
import { UseFilterQueriesResult } from 'src/views/search/components/filters/hooks/useFilterQueries';
import { ChartDatum } from 'src/views/search/components/summary/types';
import { useSearchQueryFromURL } from 'src/views/search/hooks/useSearchQueryFromURL';
import { updateRoute } from 'src/views/search/utils/update-route';
import { usePaginationContext } from 'src/views/search/context/pagination-context';
import { APPLY_DEFAULT_DATE_PARAM } from 'src/views/search/config/defaultQuery';
import { useSearchResultsFetchedContext } from 'src/views/search/context/search-results-fetched-context';
import { SelectedFilterType } from 'src/views/search/components/filters/types';
import { useSharedDatasetAggregation } from 'src/views/search/hooks/useSharedDatasetAggregation';

export interface DateHistogramProps {
  /** Array of data values used to generate the chart. */
  data: ChartDatum[];

  /** Callback when a slice is clicked. */
  onSliceClick?: (id: string) => void;

  /** Function to determine if a slice is selected. */
  isSliceSelected?: (id: string) => boolean;

  /** Whether the histogram is expanded into a modal. */
  isExpanded?: boolean;
}

// TO DO: This component currently reuses the DateFilter component for convenience,
// but in the future (once Visual Summary is approved), the Date Histogram will be
// completely decoupled from the DateFilter and will have its own API call and state
// management via useVisualizationData. The shared use of the aggregate query data is
// a temporary solution to avoid duplicating the logic for shaping the histogram data
// in both places, but this will be refactored in the future so that the DateHistogram
// gets its data directly from useVisualizationData instead of through the DateFilter
// props.
export const DateHistogram = (props: DateHistogramProps) => {
  const { data } = props;
  const property = 'date';
  const router = useRouter();
  const queryParams = useSearchQueryFromURL();
  const { resetPagination } = usePaginationContext();
  const { isFiltersFetchEnabled } = useSearchResultsFetchedContext();

  const selectedFilters: SelectedFilterType = useMemo(() => {
    const queryFilters = router.query.filters;
    const filterString = Array.isArray(queryFilters)
      ? queryFilters.join('')
      : queryFilters || '';
    return queryFilterString2Object(filterString) || {};
  }, [router.query.filters]);

  const selected = selectedFilters?.['date']?.map(filter => {
    if (typeof filter === 'object') {
      return Object.keys(filter)[0];
    } else {
      return filter;
    }
  });

  const handleUpdate = useCallback(
    (update: {}) => {
      resetPagination();
      return updateRoute(router, update);
    },
    [resetPagination, router],
  );

  const handleSelectedFilters = useCallback(
    (values: string[], facet: string) => {
      const updatedValues = values.map(value => {
        // return object with inverted facet + key for exists values
        if (value === '-_exists_' || value === '_exists_') {
          return { [value]: [facet] };
        }
        return value;
      });
      let updatedFilterString = queryFilterObject2String({
        ...selectedFilters,
        ...{ [facet]: updatedValues },
      });
      handleUpdate({
        from: 1,
        filters: updatedFilterString,
        // Adjusting the date via the histogram opts out of the default range.
        ...(facet === 'date' ? { [APPLY_DEFAULT_DATE_PARAM]: 'false' } : {}),
      });
    },
    [selectedFilters, handleUpdate],
  );

  // Reuse visualization hook output as the "updated" date query payload expected
  // by DateFilter. This keeps fetching and shape-normalization in
  // useVisualizationData.
  const updatedAggregateQueryData = useMemo<UseFilterQueriesResult>(() => {
    const terms = (data || []).map(item => ({
      term: item.term || item.id,
      label: item.label,
      count: item.value,
      facet: 'date',
    }));

    return {
      results: {
        date: {
          id: 'date',
          terms,
          data: terms,
          isLoading: false,
          isUpdating: false,
          error: null,
        },
      },
      isLoading: false,
      isUpdating: false,
      error: null,
    };
  }, [data]);

  const histogramQueryParams = useMemo(
    () => ({
      q: queryParams.q,
      extra_filter: queryFilterObject2String(queryParams.filters || {}) || '',
      use_ai_search: queryParams.use_ai_search ?? 'false',
      advancedSearch: queryParams.advancedSearch,
    }),
    [queryParams],
  );

  // Strip the date filter from the query params before fetching the initial
  // (unfiltered) histogram data. This mirrors what DateFilter does internally
  // via prepareInitialParams so that the background bar heights represent the
  // full year totals, making the grey partial bar visible only when the user
  // selects a sub-year date range (e.g. 2025-01-31 / 2025-03-31).
  //
  // prepareInitialParams is the single source of truth for this stripping
  // logic — exported from DateFilter to avoid duplication.
  //
  // React Query deduplicates this against any matching call already in cache,
  // so no extra network request is fired when the params are identical.
  const initialAggParams = useMemo(
    () => prepareInitialParams(histogramQueryParams),
    [histogramQueryParams],
  );

  const sharedDatasetAgg = useSharedDatasetAggregation(
    {
      q: initialAggParams.q,
      extra_filter: initialAggParams.extra_filter,
      use_ai_search: initialAggParams.use_ai_search,
      advancedSearch: histogramQueryParams.advancedSearch,
    },
    { enabled: isFiltersFetchEnabled },
  );

  // Shape the sharedDatasetAgg hist_dates terms into the UseFilterQueriesResult
  // format expected by DateFilter's initialAggregateQueryData prop. This is the
  // same shape as updatedAggregateQueryData above, but sourced from the
  // date-filter-stripped scoped aggregation so that background bars always
  // represent full-year totals. The grey partial bar then only appears when
  // updatedCount (filtered) is genuinely less than count (full year), i.e.,
  // when the user selects a sub-year date range.
  const initialAggregateQueryData = useMemo<UseFilterQueriesResult>(() => {
    const terms = (sharedDatasetAgg.data?.facets?.hist_dates?.terms || []).map(
      item => ({
        term: item.term,
        label: item.term.split('-')[0] || item.term,
        count: item.count,
        facet: 'date',
      }),
    );

    return {
      results: {
        date: {
          id: 'date',
          terms,
          data: terms,
          isLoading: sharedDatasetAgg.isLoading,
          isUpdating:
            sharedDatasetAgg.isFetching && !sharedDatasetAgg.isLoading,
          error: sharedDatasetAgg.error ?? null,
        },
      },
      isLoading: sharedDatasetAgg.isLoading,
      isUpdating: sharedDatasetAgg.isFetching && !sharedDatasetAgg.isLoading,
      error: sharedDatasetAgg.error ?? null,
    };
  }, [sharedDatasetAgg]);

  return (
    <DateFilter
      colorScheme='secondary'
      queryParams={histogramQueryParams}
      selectedDates={selected || []}
      handleSelectedFilter={values => handleSelectedFilters(values, property)}
      resetFilter={() => handleSelectedFilters([], property)}
      showHistogram={true}
      showDateControls={false}
      enabled={isFiltersFetchEnabled}
      updatedAggregateQueryData={updatedAggregateQueryData}
      initialAggregateQueryData={initialAggregateQueryData}
    />
  );
};
