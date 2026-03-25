import React, { useCallback, useMemo, useState } from 'react';
import { useFilterQueries } from '../hooks/useFilterQueries';
import { filtersToQueryString } from '../utils/query-string';
import { SelectedFilters } from '../types';
import { useRouter } from 'next/router';
import { FiltersSection } from './section';
import { FiltersList } from './list';
import { FiltersContainer } from './container';
import { DateFilter } from './date-filter';
import { updateRoute } from '../../../utils/update-route';
import { useSearchQueryFromURL } from '../../../hooks/useSearchQueryFromURL';
import { usePaginationContext } from '../../../context/pagination-context';
import { shouldEnableInVisualSummaryPage } from 'src/utils/feature-flags';
import { FILTER_CONFIGS } from '../config';

interface FiltersProps {
  colorScheme?: string;
  isDisabled?: boolean;
  selectedFilters: SelectedFilters;
  removeAllFilters: () => void;
  onToggleViz?: (filterId: string) => void;
  isVizActive?: (filterId: string) => boolean;
}

export const Filters = React.memo(
  ({
    colorScheme = 'primary',
    isDisabled,
    selectedFilters,
    removeAllFilters,
    onToggleViz,
    isVizActive,
  }: FiltersProps) => {
    const router = useRouter();
    const queryParams = useSearchQueryFromURL();
    const { resetPagination } = usePaginationContext();
    const [visibleFilterIds, setVisibleFilterIds] = useState<string[]>(
      FILTER_CONFIGS.map(config => config.id),
    );

    // Omits date filter from filter config since date is handled differently (as a histogram)
    const configWithoutDate = useMemo(
      () => FILTER_CONFIGS.filter(facet => facet.property !== 'date'),
      [FILTER_CONFIGS],
    );

    // Build the extra_filter query param string based on selected filters, including date if selected
    const filterString = useMemo(() => {
      return filtersToQueryString(queryParams.filters || {}) || '';
    }, [queryParams.filters, selectedFilters.date]);

    // Use simplified filter queries hook
    const { results, error, isLoading, isUpdating } = useFilterQueries({
      configs: configWithoutDate,
      params: {
        q: queryParams.q,
        extra_filter: filterString,
      },
      updateParams: {
        q: queryParams.q,
        extra_filter: filterString,
        use_ai_search: queryParams.use_ai_search,
      },
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
        let updatedFilterString = filtersToQueryString({
          ...selectedFilters,
          ...{ [facet]: updatedValues },
        } as SelectedFilters);
        handleUpdate({
          from: 1,
          filters: updatedFilterString,
        });
      },
      [selectedFilters, handleUpdate],
    );

    const visibleFilterConfigs = useMemo(
      () =>
        FILTER_CONFIGS.filter(filterConfig =>
          visibleFilterIds.includes(filterConfig.id),
        ),
      [visibleFilterIds],
    );

    return (
      <FiltersContainer
        title='Search Filters'
        error={error}
        filtersList={FILTER_CONFIGS}
        isDisabled={isDisabled}
        selectedFilters={selectedFilters}
        onVisibleFiltersChange={setVisibleFilterIds}
        removeAllFilters={() => {
          resetPagination();
          removeAllFilters();
        }}
      >
        {visibleFilterConfigs.map(filterConfig => {
          const { id, name, property, description } = filterConfig;
          const selected = selectedFilters?.[property]?.map(filter => {
            if (typeof filter === 'object') {
              return Object.keys(filter)[0];
            } else {
              return filter;
            }
          });

          if (property === 'date') {
            // Determine visibility based on route
            // On search page: show both histogram and controls when visual summary is enabled
            // On visual-summary page: show only controls (histogram is in the grid)
            const showHistogram = !shouldEnableInVisualSummaryPage(
              router.pathname,
            );
            const showDateControls = true; // Always show controls in filters

            return (
              <FiltersSection
                key={name}
                name={name}
                description={description}
                filterId={filterConfig.chart ? id : undefined}
                isVizActive={
                  filterConfig.chart && isVizActive ? isVizActive(id) : false
                }
                onToggleViz={onToggleViz}
              >
                <DateFilter
                  colorScheme={colorScheme}
                  handleSelectedFilter={values =>
                    handleSelectedFilters(values, property)
                  }
                  resetFilter={() => handleSelectedFilters([], property)}
                  selectedDates={selected || []}
                  queryParams={{
                    q: queryParams.q,
                    extra_filter:
                      filtersToQueryString(
                        queryParams.filters as SelectedFilters,
                      ) || '',
                  }}
                  showHistogram={showHistogram}
                  showDateControls={showDateControls}
                />
              </FiltersSection>
            );
          }

          // Convert terms from simplified format for FiltersList
          const filterTerms =
            results?.[id]?.terms.map(term => ({
              term: term.term,
              label: term.label,
              count: term.count,
              groupBy: term.groupBy,
              facet: property,
            })) || [];

          return (
            <FiltersSection
              key={name}
              name={name}
              description={description}
              filterId={filterConfig.chart ? id : undefined}
              isVizActive={
                filterConfig.chart && isVizActive ? isVizActive(id) : false
              }
              onToggleViz={onToggleViz}
            >
              <FiltersList
                config={filterConfig}
                colorScheme={colorScheme}
                searchPlaceholder={`Search ${name.toLowerCase()} filters`}
                terms={filterTerms}
                selectedFilters={selected || []}
                handleSelectedFilters={values =>
                  handleSelectedFilters(values, property)
                }
                isLoading={results?.[id]?.isLoading}
                isUpdating={results?.[id]?.isUpdating || isUpdating}
              />
            </FiltersSection>
          );
        })}
      </FiltersContainer>
    );
  },
);
