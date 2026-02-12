import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { DateFilter } from 'src/views/search/components/filters/components/date-filter';
import { SelectedFilterType } from 'src/views/search/components/filters/types';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from 'src/views/search/components/filters/utils/query-builders';
import { ChartDatum } from 'src/views/search/components/summary/types';
import { useSearchQueryFromURL } from 'src/views/search/hooks/useSearchQueryFromURL';
import { updateRoute } from 'src/views/search/utils/update-route';
import { usePaginationContext } from 'src/views/search/context/pagination-context';

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

export const DateHistogram = (props: DateHistogramProps) => {
  const property = 'date';
  const router = useRouter();
  const queryParams = useSearchQueryFromURL();
  const { resetPagination } = usePaginationContext();

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

  return (
    <DateFilter
      colorScheme='secondary'
      queryParams={{
        q: queryParams.q,
        extra_filter: queryFilterObject2String(queryParams.filters) || '',
      }}
      // handleSelectedFilter={values => {
      //   console.log(values, props);
      // }}
      // resetFilter={() => {
      //   console.log('reset date filter');
      // }}
      selectedDates={selected || []}
      handleSelectedFilter={values => handleSelectedFilters(values, property)}
      resetFilter={() => handleSelectedFilters([], property)}
    />
  );
};
1;
