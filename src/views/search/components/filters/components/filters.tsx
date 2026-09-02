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
import {
  queryFilterObject2String,
  sanitizeExistsFilterValues,
} from '../utils/query-string';
import { FilterConfig, SelectedFilterType } from '../types';
import { useRouter } from 'next/router';
import { FiltersSection } from './section';
import { FiltersList } from './list';
import { FiltersContainer } from './container';
import { DateFilter } from './date-filter';
import { CollectionSizeFilter } from './collection-size-filter';
import { updateRoute } from '../../../utils/update-route';
import { useSearchQueryFromURL } from '../../../hooks/useSearchQueryFromURL';
import { usePaginationContext } from '../../../context/pagination-context';
import {
  FILTER_CONFIGS,
  getFacetPropertiesForCategory,
  getFilterStateProperties,
} from '../config';
import { COLLECTION_SIZE_FILTER_ID } from 'src/views/search/config/collection-size';
import { APPLY_DEFAULT_DATE_PARAM } from 'src/views/search/config/defaultQuery';
import { useSearchResultsFetchedContext } from 'src/views/search/context/search-results-fetched-context';
import { useBioSampleAggregation } from 'src/views/search/hooks/useBioSampleAggregation';
import { useComputationalToolAggregation } from 'src/views/search/hooks/useComputationalToolAggregation';
import { useSharedDatasetAggregation } from 'src/views/search/hooks/useSharedDatasetAggregation';
import { useDataCollectionAggregation } from 'src/views/search/hooks/useDataCollectionAggregation';

/** Applied endpoints of a filter's range key, as plain strings. */
const selectedRangeValues = (
  selectedFilters: SelectedFilterType,
  config: FilterConfig,
): string[] => {
  if (!config.rangeProperty) return [];
  return (selectedFilters[config.rangeProperty] || []).filter(
    (value): value is string => typeof value === 'string',
  );
};

/** True when any of the filter's state keys currently holds a value. */
const hasActiveSelection = (
  selectedFilters: SelectedFilterType,
  config: FilterConfig,
): boolean =>
  getFilterStateProperties(config).some(property => {
    const values = selectedFilters?.[property];
    return Array.isArray(values) && values.length > 0;
  });

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
    const queryParams = useSearchQueryFromURL();
    const { resetPagination } = usePaginationContext();
    const filterIds = FILTER_CONFIGS.map(config => config.id);
    const [userSelectedFilters, setUserSelectedFilters] =
      useState<string[]>(filterIds);
    const { isFiltersFetchEnabled } = useSearchResultsFetchedContext();

    const visibleFiltersList = useMemo(
      () =>
        FILTER_CONFIGS.filter(filterConfig => {
          // Show filter if it's in the list of visible ids (i.e. the user hasn't hidden it)
          const userHasSelectedToShow = userSelectedFilters.includes(
            filterConfig.id,
          );

          return userHasSelectedToShow;
        }),
      [userSelectedFilters],
    );

    // Build the extra_filter query param string based on selected filters.
    // This is passed into each scoped aggregation hook so that user-selected
    // filters are always respected on top of the type-scoping constraints.
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

    // Sample filters: @type:Sample AND additionalType:"BioSample"
    // Passes extra_filter so counts respect the user's selected filters,
    // consistent with the Shared/Dataset and Computational Tool hooks.
    const bioSampleAgg = useBioSampleAggregation(
      {
        q: queryParams.q,
        use_ai_search: queryParams.use_ai_search ?? 'false',
        advancedSearch: queryParams.advancedSearch,
        extra_filter: filtersAggParams.extra_filter,
      },
      { enabled: router.isReady },
    );

    // Computational Tool filters: @type:ComputationalTool
    // User-selected filters are passed via extra_filter so the counts stay
    // consistent with what the user has already narrowed down.
    const computationalToolAgg = useComputationalToolAggregation(
      {
        q: queryParams.q,
        use_ai_search: queryParams.use_ai_search ?? 'false',
        advancedSearch: queryParams.advancedSearch,
        extra_filter: filtersAggParams.extra_filter,
      },
      { enabled: router.isReady },
    );

    // Shared/Dataset filters: all types except non-BioSample Sample records
    const sharedDatasetAgg = useSharedDatasetAggregation(
      {
        q: queryParams.q,
        use_ai_search: queryParams.use_ai_search ?? 'false',
        advancedSearch: queryParams.advancedSearch,
        extra_filter: filtersAggParams.extra_filter,
      },
      { enabled: router.isReady },
    );

    // Data Collection filters: @type:DataCollection.
    // The category currently has no filters of its own — Content Type covers
    // DataCollection records from the Shared/Dataset section — so skip the
    // request rather than send one with no `facets` param.
    const dataCollectionAgg = useDataCollectionAggregation(
      {
        q: queryParams.q,
        use_ai_search: queryParams.use_ai_search ?? 'false',
        advancedSearch: queryParams.advancedSearch,
        extra_filter: filtersAggParams.extra_filter,
      },
      {
        enabled:
          router.isReady &&
          getFacetPropertiesForCategory('Data Collection') !== '',
      },
    );

    // Use simplified filter queries hook.
    // The four scoped aggregations above cover every filter category, so the
    // unscoped all-facet aggregation is disabled here.
    const filtersAggQuery = useFilterQueries({
      configs: visibleFiltersList,
      enabled: isFiltersFetchEnabled,
      enableMainAggregation: false,
      params: filtersAggParams,
      bioSampleAggregation: bioSampleAgg,
      computationalToolAggregation: computationalToolAgg,
      sharedDatasetAggregation: sharedDatasetAgg,
      dataCollectionAggregation: dataCollectionAgg,
    });

    const { results, error } = filtersAggQuery;

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
            const hasSelection = filters.some(filterConfig =>
              hasActiveSelection(selectedFilters, filterConfig),
            );
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

    // Applies several filter keys in one route update. Used by filters that
    // own more than one key (see `FilterConfig.rangeProperty`), where writing
    // each key separately would push two routes and lose the first.
    const handleApplyFilters = useCallback(
      (patch: SelectedFilterType) => {
        handleUpdate({
          from: 1,
          filters: queryFilterObject2String({
            ...selectedFilters,
            ...patch,
          }),
        });
      },
      [selectedFilters, handleUpdate],
    );

    const handleSelectedFilters = useCallback(
      (values: string[], facet: string) => {
        // Normalize the facet's previous selection to plain strings, mirroring
        // how `selected` is derived for each filter section below.
        const prevValues = (selectedFilters[facet] || []).map(value =>
          typeof value === 'object' ? Object.keys(value)[0] : value,
        );

        // Checking "Any"/"No" clears everything else for this facet.
        const sanitizedValues = sanitizeExistsFilterValues(values, prevValues);

        const updatedValues = sanitizedValues.map(value => {
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
          // Touching the date filter makes the date value authoritative. The
          // reset button passes an empty value → opt out of the default range;
          // a real value drops the param (the value already suppresses it).
          ...(facet === 'date'
            ? {
                [APPLY_DEFAULT_DATE_PARAM]:
                  updatedValues.length > 0 ? undefined : 'false',
              }
            : {}),
        });
      },
      [selectedFilters, handleUpdate],
    );

    const getFilterIndicesForOpenState = useCallback(
      (filtersInCategory: typeof visibleFiltersList) => {
        return filtersInCategory
          .map((config, index) =>
            hasActiveSelection(selectedFilters, config) ? index : -1,
          )
          .filter(index => index !== -1);
      },
      [selectedFilters],
    );

    // Determine visibility based on route
    // On search page: show both histogram and controls when visual summary is enabled
    // On visual-summary page: show only controls (histogram is in the grid)
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
                          {id === COLLECTION_SIZE_FILTER_ID ? (
                            <CollectionSizeFilter
                              colorScheme={colorScheme}
                              terms={results?.[id]?.terms || []}
                              selectedUnits={selected || []}
                              selectedRange={selectedRangeValues(
                                selectedFilters,
                                filterConfig,
                              )}
                              isLoading={results?.[id]?.isLoading ?? true}
                              queryParams={filtersAggParams}
                              enabled={isFiltersFetchEnabled}
                              onApply={handleApplyFilters}
                            />
                          ) : id === 'date' ? (
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
                              showHistogram={false}
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
                              // Per-filter state only
                              isUpdating={results?.[id]?.isUpdating}
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
