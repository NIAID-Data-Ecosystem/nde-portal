import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { SearchTabsProvider } from 'src/views/search/context/search-tabs-context';
import { useSearchQueryFromURL } from 'src/views/search/hooks/useSearchQueryFromURL';
import { Box, Flex, VStack } from '@chakra-ui/react';
import { Filters } from 'src/views/search/components/filters';
import { SelectedFilterType } from 'src/views/search/components/filters/types';
import { FILTER_CONFIGS } from 'src/views/search/components/filters/config';
import { queryFilterString2Object } from 'src/views/search/components/filters/utils/query-builders';
import { defaultQuery } from 'src/views/search/config/defaultQuery';
import { FilterTags } from 'src/views/search/components/filters/components/tag';
import { SearchResultsHeader } from 'src/views/search/components/search-results-header';
import { PaginationProvider } from 'src/views/search/context/pagination-context';
import { SearchResultsController } from 'src/views/search/components/search-results-tabs-controller';
import { fetchSearchResults } from 'src/utils/api';
import { TabType } from 'src/views/search/types';
import { tabs } from 'src/views/search/config/tabs';

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

  // If the initial tab is not set, return a loading state.
  if (!initialTab) {
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
          <Flex bg='page.alt' flex={1}>
            <Flex
              bg='#fff'
              margin='0 auto'
              maxW={{ base: 'unset', xl: '2000px' }}
              flex={1}
              overflow='hidden'
              mb={32}
              border='1px solid'
              borderRadius='semi'
              borderColor='gray.100'
            >
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
                <VStack alignItems='flex-start' p={4} bg='#fff' spacing={2}>
                  {/* Heading: Showing results for... */}
                  <SearchResultsHeader querystring={queryParams.q} />

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
