import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { DateFilter } from 'src/views/search/components/filters/components/date-filter';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from 'src/views/search/components/filters/utils/query-string';
import { UseFilterQueriesResult } from 'src/views/search/components/filters/hooks/useFilterQueries';
import { ChartDatum } from 'src/views/search/components/summary/types';
import { useSearchQueryFromURL } from 'src/views/search/hooks/useSearchQueryFromURL';
import { updateRoute } from 'src/views/search/utils/update-route';
import { usePaginationContext } from 'src/views/search/context/pagination-context';
import { useSearchResultsFetchedContext } from 'src/views/search/context/search-results-fetched-context';
import { SelectedFilterType } from 'src/views/search/components/filters/types';

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

// TO DO: This component currently reuses the DateFilter component for convenience, but in the future (once Visual Summary is approved), the Date Histogram will be completely decoupled from the DateFilter and will have its own API call and state management via useVisualizationData. The shared use of the aggregate query data is a temporary solution to avoid duplicating the logic for shaping the histogram data in both places, but this will be refactored in the future so that the DateHistogram gets its data directly from useVisualizationData instead of through the DateFilter props.
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
      });
    },
    [selectedFilters, handleUpdate],
  );

  // Reuse visualization hook output as the "updated" date query payload expected by DateFilter.
  // This keeps fetching and shape-normalization in useVisualizationData.
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
    />
  );
};
