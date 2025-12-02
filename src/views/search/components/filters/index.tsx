import React, { useCallback, useMemo } from 'react';
import { useFilterQueries } from './hooks/useFilterQueries';
import { FILTER_CONFIGS } from './config';
import { useRouter } from 'next/router';
import { FiltersSection } from './components/section';
import { FiltersList } from './components/list';
import { FiltersContainer } from './components/container';
import { FiltersDateSlider } from './components/date-slider';
import { SelectedFilterType } from './types';
import { queryFilterObject2String } from './utils/query-builders';
import { updateRoute } from '../../utils/update-route';
import { useSearchQueryFromURL } from '../../hooks/useSearchQueryFromURL';
import { usePaginationContext } from '../../context/pagination-context';
import { useSearchTabsContext } from '../../context/search-tabs-context';
import { getTabFilterProperties } from './utils/tab-filter-utils';
import { TabType } from '../../types';

// Interface for Filters component props
interface FiltersProps {
  colorScheme?: string;
  isDisabled?: boolean;
  selectedFilters: SelectedFilterType;
  removeAllFilters: () => void;
}

// Filters component
export const Filters: React.FC<FiltersProps> = React.memo(
  ({
    colorScheme = 'primary',
    isDisabled,
    removeAllFilters,
    selectedFilters,
  }) => {
    const router = useRouter();
    const queryParams = useSearchQueryFromURL();
    const { resetPagination } = usePaginationContext();
    const { selectedTab } = useSearchTabsContext();

    // Determine appropriate filters for the selected tab
    const filtersForTab = useMemo(() => {
      const allowedProperties = getTabFilterProperties(
        selectedTab.id as TabType['id'],
      );
      return FILTER_CONFIGS.filter(config =>
        allowedProperties.includes(config.property),
      );
    }, [selectedTab.id]);

    // Omits date filter from filter config since date is handled differently i.e. as a histogram
    const config = useMemo(
      () => filtersForTab.filter(facet => facet.property !== 'date'),
      [filtersForTab],
    );

    // Use custom hook to get filter query results
    const { results, error, isLoading, isUpdating } = useFilterQueries({
      initialParams: {
        q: queryParams.q,
      },
      updateParams: {
        q: queryParams.q,
        extra_filter: queryFilterObject2String(queryParams.filters) || '',
        use_ai_search: queryParams.use_ai_search,
      },
      config,
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
      <FiltersContainer
        title='Search Filters'
        error={error}
        filtersList={filtersForTab}
        isDisabled={isDisabled}
        selectedFilters={selectedFilters}
        removeAllFilters={() => {
          resetPagination();
          removeAllFilters();
        }}
      >
        {filtersForTab.map(config => {
          const { _id, name, property } = config;
          const selected = selectedFilters?.[property]?.map(filter => {
            if (typeof filter === 'object') {
              return Object.keys(filter)[0];
            } else {
              return filter;
            }
          });

          if (property === 'date') {
            return (
              <FiltersSection
                key={config.name}
                name={config.name}
                description={config.description}
              >
                <FiltersDateSlider
                  colorScheme={colorScheme}
                  handleSelectedFilter={values =>
                    handleSelectedFilters(values, property)
                  }
                  resetFilter={() => handleSelectedFilters([], property)}
                  selectedDates={selected || []}
                  queryParams={{
                    q: queryParams.q,
                    extra_filter:
                      queryFilterObject2String(queryParams.filters) || '',
                  }}
                />
              </FiltersSection>
            );
          }
          return (
            <FiltersSection
              key={config.name}
              name={config.name}
              description={config.description}
            >
              <FiltersList
                config={config}
                colorScheme={colorScheme}
                searchPlaceholder={`Search ${name.toLowerCase()} filters`}
                terms={results?.[_id]?.['data'] || []}
                selectedFilters={selected || []}
                handleSelectedFilters={values =>
                  handleSelectedFilters(values, property)
                }
                isLoading={
                  results?.[_id]?.['isLoading'] ||
                  results?.[_id]?.['isPlaceholderData'] ||
                  results?.[_id]?.['isPending']
                }
                isUpdating={isUpdating}
              />
            </FiltersSection>
          );
        })}
      </FiltersContainer>
    );
  },
);
