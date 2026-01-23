import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import {
  SearchTabsProvider,
  DEFAULT_TAB_ID,
} from 'src/views/search/context/search-tabs-context';
import { useSearchQueryFromURL } from 'src/views/search/hooks/useSearchQueryFromURL';
import { Box, Flex, VStack } from '@chakra-ui/react';
import { Filters } from 'src/views/search/components/filters';
import { SelectedFilterType } from 'src/views/search/components/filters/types';
import { FILTER_CONFIGS } from 'src/views/search/components/filters/config';
import {
  queryFilterString2Object,
  queryFilterObject2String,
} from 'src/views/search/components/filters/utils/query-builders';
import {
  defaultQuery,
  getDefaultDateRange,
} from 'src/views/search/config/defaultQuery';
import { FilterTags } from 'src/views/search/components/filters/components/tag';
import { SearchResultsHeader } from 'src/views/search/components/search-results-header';
import { PaginationProvider } from 'src/views/search/context/pagination-context';
import { SearchResultsController } from 'src/views/search/components/search-results-tabs-controller';
import { fetchSearchResults } from 'src/utils/api';
import { tabs } from 'src/views/search/config/tabs';
import { OntologyBrowserPopup } from 'src/views/ontology-browser/components/popup';
import { SHOW_AI_ASSISTED_SEARCH } from 'src/utils/feature-flags';

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
  const hasInitialized = useRef(false);

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

  // Apply default date filter on first load only
  useEffect(() => {
    if (!router.isReady) return;

    const hasDateFilter = selectedFilters.date?.length > 0;
    if (hasDateFilter) return;

    handleRouteUpdate({
      filters: queryFilterObject2String({
        ...selectedFilters,
        date: getDefaultDateRange(),
      }),
    });
  }, [router.isReady]);

  // Validate and cap date filter at current year if it exceeds (runtime validation)
  useEffect(() => {
    if (!router.isReady || !hasInitialized.current) return;

    const hasDateFilter =
      selectedFilters.date && selectedFilters.date.length > 0;
    if (!hasDateFilter) return;

    const [start, end] = selectedFilters.date;
    if (!end || typeof end !== 'string') return;

    const endYear = parseInt(end.slice(0, 4), 10);
    const currentYear = new Date().getFullYear();

    if (endYear <= currentYear) return;

    handleRouteUpdate({
      filters: queryFilterObject2String({
        ...selectedFilters,
        date: [start, `${currentYear}-12-31`],
      }),
    });
  }, [router.isReady, selectedFilters, handleRouteUpdate]);

  // Get initial tab from URL or use default
  const initialTab = useMemo(() => {
    const tabFromUrl = router.query.tab as string;
    const tab = tabs.find(t => t.id === tabFromUrl);
    return tab?.id || DEFAULT_TAB_ID;
  }, [router.query.tab]);

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
              />
            </Flex>
            <Box flex={3}>
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
