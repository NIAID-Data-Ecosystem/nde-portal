import React, { useCallback, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Text,
} from '@chakra-ui/react';
import { useFilterQueries } from '../hooks/useFilterQueries';
import { queryFilterObject2String } from '../utils/query-string';
import { SelectedFilterType } from '../types';
import { useRouter } from 'next/router';
import { FiltersSection } from './section';
import { FiltersList } from './list';
import { FiltersContainer } from './container';
import { DateFilter } from './date-filter';
import { updateRoute } from '../../../utils/update-route';
import { useSearchQueryFromURL } from '../../../hooks/useSearchQueryFromURL';
import { usePaginationContext } from '../../../context/pagination-context';
import { SHOW_VISUAL_SUMMARY } from 'src/utils/feature-flags';
import { FILTER_CONFIGS } from '../config';
import { useSearchResultsFetchedContext } from 'src/views/search/context/search-results-fetched-context';
import { useSearchTabsContext } from 'src/views/search/context/search-tabs-context';
import { useBioSampleAggregation } from 'src/views/search/hooks/useBioSampleAggregation';

interface FiltersProps {
  colorScheme?: string;
  isDisabled?: boolean;
  selectedFilters: SelectedFilterType;
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
    const { selectedTab } = useSearchTabsContext();
    const queryParams = useSearchQueryFromURL();
    const { resetPagination } = usePaginationContext();
    const filterIds = FILTER_CONFIGS.map(config => config.id);
    const [userSelectedFilters, setUserSelectedFilters] =
      useState<string[]>(filterIds);
    const { isFiltersFetchEnabled } = useSearchResultsFetchedContext();

    const visibleFiltersList = useMemo(
      () =>
        FILTER_CONFIGS.filter(filterConfig => {
          // Show filter if it's in the list of visible ids (i.e. the user hasn't hidden it) and if it is part of the tabs that should be shown for the current route
          const userHasSelectedToShow = userSelectedFilters.includes(
            filterConfig.id,
          );
          const isRelevantForTab =
            SHOW_VISUAL_SUMMARY ||
            filterConfig?.tabIds?.includes(selectedTab.id);
          return userHasSelectedToShow && isRelevantForTab;
        }),
      [userSelectedFilters, selectedTab.id],
    );

    // Build the extra_filter query param string based on selected filters, including date if selected
    const filtersAggParams = useMemo(() => {
      return {
        q: queryParams.q,
        extra_filter: queryFilterObject2String(queryParams.filters || {}) || '',
        use_ai_search: queryParams.use_ai_search ?? 'false',
        advancedSearch: queryParams.advancedSearch,
      };
    }, [
      queryParams.q,
      queryParams.filters,
      queryParams.use_ai_search,
      queryParams.advancedSearch,
    ]);

    // Always-on, lightweight (size=0) call scoped to
    // @type:Sample AND additionalType:"BioSample".
    // Its facet data is passed to useFilterQueries so Sample-category filter
    // counts reflect only BioSample records.
    const bioSampleAgg = useBioSampleAggregation(
      {
        q: queryParams.q,
        use_ai_search: queryParams.use_ai_search ?? 'false',
        advancedSearch: queryParams.advancedSearch,
      },
      { enabled: router.isReady },
    );

    // Use simplified filter queries hook
    const filtersAggQuery = useFilterQueries({
      configs: visibleFiltersList,
      enabled: isFiltersFetchEnabled,
      params: filtersAggParams,
      bioSampleAggregationData: bioSampleAgg.data,
    });

    const { results, error, isUpdating } = filtersAggQuery;

    const groupedFilters = useMemo(() => {
      return visibleFiltersList.reduce((groups, config) => {
        if (!groups[config.category]) {
          groups[config.category] = [];
        }
        groups[config.category].push(config);
        return groups;
      }, {} as Record<string, typeof visibleFiltersList>);
    }, [visibleFiltersList]);

    const groupedCategories = useMemo(
      () => Object.entries(groupedFilters),
      [groupedFilters],
    );

    const categoryAccordionDefaultIndex = useMemo(() => {
      if (groupedCategories.length === 0) {
        return [] as number[];
      }

      const categoriesWithActiveFilters = new Set(
        groupedCategories
          .map(([_, filters], index) => {
            const hasSelection = filters.some(filterConfig => {
              const values = selectedFilters?.[filterConfig.property];
              return Array.isArray(values) && values.length > 0;
            });
            return hasSelection ? index : -1;
          })
          .filter(index => index !== -1),
      );

      if (categoriesWithActiveFilters.size === 0) {
        return [0];
      }

      return Array.from(categoriesWithActiveFilters).sort((a, b) => a - b);
    }, [groupedCategories, selectedFilters]);

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
        } as SelectedFilterType);
        handleUpdate({
          from: 1,
          filters: updatedFilterString,
        });
      },
      [selectedFilters, handleUpdate],
    );

    const getFilterIndicesForOpenState = useCallback(
      (filtersInCategory: typeof visibleFiltersList) => {
        return filtersInCategory
          .map((config, index) => {
            const values = selectedFilters?.[config.property];
            return Array.isArray(values) && values.length > 0 ? index : -1;
          })
          .filter(index => index !== -1);
      },
      [selectedFilters],
    );

    // Determine visibility based on route
    // On search page: show both histogram and controls when visual summary is enabled
    // On visual-summary page: show only controls (histogram is in the grid)
    const showHistogram = !SHOW_VISUAL_SUMMARY;
    const showDateControls = true; // Always show controls in filters
    return (
      <FiltersContainer
        title='Search Filters'
        error={error}
        filtersList={FILTER_CONFIGS}
        isDisabled={isDisabled}
        onVisibleFiltersChange={setUserSelectedFilters}
        removeAllFilters={() => {
          resetPagination();
          removeAllFilters();
        }}
      >
        <Accordion allowMultiple defaultIndex={categoryAccordionDefaultIndex}>
          {groupedCategories.map(([category, filtersInCategory]) => {
            return (
              <AccordionItem key={category} border='none'>
                <h2>
                  <AccordionButton
                    px={4}
                    py={{ base: 3, md: 2 }}
                    bg='gray.50'
                    borderBottom='1px solid'
                    borderBottomColor='gray.100'
                    _hover={{ bg: 'gray.100' }}
                  >
                    <Box flex='1' textAlign='left'>
                      <Text
                        fontSize='sm'
                        fontWeight='semibold'
                        color='gray.800'
                      >
                        {category}
                      </Text>
                    </Box>

                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel px={2} py={1} bg='blackAlpha.50'>
                  <Accordion
                    allowMultiple
                    defaultIndex={getFilterIndicesForOpenState(
                      filtersInCategory,
                    )}
                  >
                    {filtersInCategory.map(filterConfig => {
                      const { id, name, property, description } = filterConfig;
                      const selected = selectedFilters?.[property]?.map(
                        filter => {
                          if (typeof filter === 'object') {
                            return Object.keys(filter)[0];
                          }
                          return filter;
                        },
                      );

                      return (
                        <FiltersSection
                          key={name}
                          name={name}
                          description={description}
                          filterId={filterConfig.chart ? id : undefined}
                          isVizActive={
                            filterConfig.chart && isVizActive
                              ? isVizActive(id)
                              : false
                          }
                          onToggleViz={onToggleViz}
                        >
                          {id === 'date' ? (
                            <DateFilter
                              colorScheme={colorScheme}
                              handleSelectedFilter={values =>
                                handleSelectedFilters(values, property)
                              }
                              resetFilter={() =>
                                handleSelectedFilters([], property)
                              }
                              selectedDates={selected || []}
                              updatedAggregateQueryData={filtersAggQuery}
                              queryParams={filtersAggParams}
                              showHistogram={showHistogram}
                              showDateControls={showDateControls}
                              enabled={isFiltersFetchEnabled}
                            />
                          ) : (
                            <FiltersList
                              config={filterConfig}
                              colorScheme={colorScheme}
                              searchPlaceholder={`Search ${name.toLowerCase()} filters`}
                              terms={results?.[id]?.terms || []}
                              selectedFilters={selected || []}
                              handleSelectedFilters={values =>
                                handleSelectedFilters(values, property)
                              }
                              isLoading={results?.[id]?.isLoading ?? true}
                              isUpdating={
                                results?.[id]?.isUpdating || isUpdating
                              }
                            />
                          )}
                        </FiltersSection>
                      );
                    })}
                  </Accordion>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      </FiltersContainer>
    );
  },
);
