import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { SearchTabsProvider } from 'src/views/search/context/search-tabs-context';
import { useSearchQueryFromURL } from 'src/views/search/hooks/useSearchQueryFromURL';
import { Box, Flex, VStack } from '@chakra-ui/react';
import { Filters } from 'src/views/search/components/filters';
import {
  SelectedFilterType,
  SelectedFilterTypeValue,
} from 'src/views/search/components/filters/types';
import { FILTER_CONFIGS } from 'src/views/search/components/filters/config';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from 'src/views/search/components/filters/utils/query-builders';
import { defaultQuery } from 'src/views/search/config/defaultQuery';
import { FilterTags } from 'src/views/search/components/filters/components/tag';
import { SearchResultsHeader } from 'src/views/search/components/search-results-header';
import { PaginationProvider } from 'src/views/search/context/pagination-context';
import { SearchResultsController } from 'src/views/search/components/search-results-tabs-controller';
import { fetchSearchResults } from 'src/utils/api';
import { TabType } from 'src/views/search/types';
import { tabs } from 'src/views/search/config/tabs';
import { OntologyBrowserPopup } from 'src/views/ontology-browser/components/popup';
import {
  SHOW_AI_ASSISTED_SEARCH,
  SHOW_VISUAL_SUMMARY,
} from 'src/utils/feature-flags';
import SummaryGrid from 'src/views/search/components/summary';
import { ChartType } from 'src/views/search/components/summary/types';
import { updateRoute } from 'src/views/search/utils/update-route';
import { useActiveVizIds } from 'src/views/search/components/summary/hooks/useActiveVizIds';

// initial testing with strings, definedTerm, number, date.
const VIZ_CONFIG = [
  {
    id: 'sources',
    label: 'Sources',
    property: 'includedInDataCatalog.name',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'sourceOrganization.name',
    label: 'Program Collection',
    property: 'sourceOrganization.name',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'healthCondition.name.raw',
    label: 'Health Condition',
    property: 'healthCondition.name.raw',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'infectiousAgent.name',
    label: 'Pathogen Species',
    property: 'infectiousAgent.displayName.raw',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'species.name',
    label: 'Host Species',
    property: 'species.displayName.raw',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'funding.funder.name.raw',
    label: 'Funding',
    property: 'funding.funder.name.raw',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'conditionsOfAccess',
    label: 'Conditions of Access',
    property: 'conditionsOfAccess',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'variableMeasured.name.raw',
    label: 'Variable Measured',
    property: 'variableMeasured.name.raw',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'measurementTechnique.name.raw',
    label: 'Measurement Technique',
    property: 'measurementTechnique.name.raw',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'topicCategory.name.raw',
    label: 'Topic Category',
    property: 'topicCategory.name.raw',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'applicationCategory.raw',
    label: 'Application Category',
    property: 'applicationCategory.raw',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'operatingSystem.raw',
    label: 'Operating System',
    property: 'operatingSystem.raw',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'programmingLanguage.raw',
    label: 'Programming Language',
    property: 'programmingLanguage.raw',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'featureList.name.raw',
    label: 'Feature List',
    property: 'featureList.name.raw',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'input.name.raw',
    label: 'Input',
    property: 'input.name.raw',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
  {
    id: 'output.name.raw',
    label: 'Output',
    property: 'output.name.raw',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'pie' as const,
      bar: { minPercent: 0.0001, maxItems: 10 },
      pie: { minPercent: 0.01 },
    },
  },
];

const DEFAULT_ACTIVE_VIZ_IDS = [
  'sources',
  'infectiousAgent.name',
  'species.name',
];

// Default filters list.
const defaultFilters = FILTER_CONFIGS.reduce(
  (r, { property }) => ({ ...r, [property]: [] }),
  {},
);
//  This page renders the search results from the search bar.
const Search: NextPage<{
  initialData: FetchSearchResultsResponse;
}> = ({ initialData }) => {
  const router = useRouter();

  const { activeVizIds, toggleViz, isVizActive } = useActiveVizIds(
    DEFAULT_ACTIVE_VIZ_IDS,
  );

  const queryParams = useSearchQueryFromURL();

  const selectedFilters: SelectedFilterType = useMemo(() => {
    const queryFilters = router.query.filters;
    const filterString = Array.isArray(queryFilters)
      ? queryFilters.join('')
      : queryFilters || '';
    return queryFilterString2Object(filterString) || {};
  }, [router.query.filters]);

  // Currently applied filters
  const appliedFilters = useMemo(
    () =>
      Object.entries(selectedFilters).filter(
        ([_, filters]) => filters.length > 0,
      ),
    [selectedFilters],
  );

  /*** Router handlers ***/
  // Update the route to reflect changes on page without re-render.
  const handleRouteUpdate = useCallback(
    (update: Record<string, any>) => {
      router.push({ query: { ...router.query, ...update } }, undefined, {
        shallow: true,
      });
    },
    [router],
  );

  // Reset the filters to the default.
  const removeAllFilters = useCallback(() => {
    return handleRouteUpdate({
      from: defaultQuery.from,
      filters: defaultFilters,
    });
  }, [handleRouteUpdate]);

  // Set the initial tab based on the router query
  const [initialTab, setInitialTab] = useState<TabType['id'] | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const defaultTab = tabs.find(t => t.isDefault)?.id || tabs[0].id;
    const tabParamId = router.query.tab as string;
    const tab = tabs.find(t => t.id === tabParamId);
    setInitialTab(tab?.id || defaultTab);
  }, [router]);

  const handleUpdate = useCallback(
    (update: {}) => {
      return updateRoute(router, update);
    },
    [router],
  );

  const handleSelectedFilters = useCallback(
    (values: SelectedFilterTypeValue[], facet: string) => {
      // Merge + de-dupe
      // Normalize _exists_ filters into object form
      // const normalizedValues = mergedValues.map(value =>
      //   value === '_exists_' || value === '-_exists_'
      //     ? { [value]: [facet] }
      //     : value,
      // );

      const updatedFilterString = queryFilterObject2String({
        ...selectedFilters,
        [facet]: values,
      });

      handleUpdate({
        from: 1,
        filters: updatedFilterString,
      });
    },
    [selectedFilters, handleUpdate],
  );

  // If the initial tab is not set, return a loading state.
  if (!initialTab || !SHOW_VISUAL_SUMMARY) {
    return null;
  }
  return (
    <PageContainer
      meta={getPageSeoConfig('/search')}
      px={0}
      py={0}
      includeSearchBar
    >
      <SearchTabsProvider initialTab={initialTab}>
        <PaginationProvider>
          <Flex bg='page.alt'>
            <Flex
              id='search-page-filters-sidebar'
              bg='#fff'
              borderRight='0.5px solid'
              borderRightColor='gray.200'
              flex={{ base: 0, lg: 1 }}
              minW={{ base: 'unset', lg: '380px' }}
              maxW={{ base: 'unset', lg: '450px' }}
            >
              {/* Filters sidebar */}
              <Filters
                colorScheme='secondary'
                selectedFilters={selectedFilters}
                isDisabled={appliedFilters.length === 0}
                removeAllFilters={removeAllFilters}
                onToggleViz={toggleViz}
                isVizActive={isVizActive}
              />
            </Flex>

            <Box flex={3} maxW='1800px'>
              <VStack
                alignItems='flex-start'
                p={4}
                bg='#fff'
                borderBottom='1px solid'
                borderRight='1px solid'
                borderColor='gray.100'
                spacing={2}
              >
                <Flex flex={1} flexDirection='column' width='100%'>
                  <Flex flex={1} justifyContent='flex-end'>
                    <OntologyBrowserPopup
                      querystring={
                        queryParams.q === '__all__' ? '' : queryParams.q
                      }
                      selectedFilters={selectedFilters}
                    />
                  </Flex>
                  {/* Heading: Showing results for... */}
                  <SearchResultsHeader
                    querystring={queryParams.q}
                    showAIBanner={
                      SHOW_AI_ASSISTED_SEARCH &&
                      router.query.use_ai_search === 'true'
                    }
                  />
                </Flex>

                {/* Filter tags : Tags with the names of the currently selected filters */}
                {Object.values(selectedFilters).length > 0 && (
                  <FilterTags
                    filtersConfig={FILTER_CONFIGS}
                    selectedFilters={selectedFilters}
                    handleRouteUpdate={handleRouteUpdate}
                    removeAllFilters={removeAllFilters}
                  />
                )}
              </VStack>
              {SHOW_VISUAL_SUMMARY && activeVizIds.length > 0 && (
                <SummaryGrid
                  searchParams={queryParams}
                  onFilterUpdate={(values, facet) => {
                    handleSelectedFilters(values, facet);
                  }}
                  activeVizIds={activeVizIds}
                  removeActiveVizId={toggleViz}
                  configs={VIZ_CONFIG}
                  selectedFilters={selectedFilters}
                />
              )}
              {/* Search Results */}
              <SearchResultsController initialData={initialData} />
            </Box>
          </Flex>
        </PaginationProvider>
      </SearchTabsProvider>
    </PageContainer>
  );
};

export async function getStaticProps() {
  try {
    const defaultParams = {
      q: defaultQuery.q,
      extra_filter: '',
      size: `${defaultQuery.size}`,
      from: `${defaultQuery.from}`,
      sort: defaultQuery.sort,
    };
    const data = await fetchSearchResults({
      ...defaultParams,
      facets: '@type',
      facet_size: 100,
      sort: '',
      show_meta: true,
      fields: [
        '_meta',
        '@type',
        'alternateName',
        'author',
        'conditionsOfAccess',
        'date',
        'description',
        'doi',
        'funding',
        'healthCondition',
        'includedInDataCatalog',
        'infectiousAgent',
        'isAccessibleForFree',
        'license',
        'measurementTechnique',
        'name',
        'sdPublisher',
        'species',
        'url',
        'usageInfo',
        'variableMeasured',
      ],
    });
    return {
      props: {
        initialData: {
          results: data?.results || [],
          total: data?.total || 0,
          facets: data?.facets || {},
        },
      },
    };
  } catch (err) {
    return {
      props: {
        data: null,
        error: { message: 'Error retrieving data' },
      },
    };
  }
}

export default Search;
