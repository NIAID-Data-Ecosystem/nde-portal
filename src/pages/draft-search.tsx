import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { PageContainer } from 'src/components/page-container';
import { useCallback, useMemo } from 'react';
import { FormattedResource } from 'src/utils/api/types';
import {
  SearchTabsProvider,
  tabs,
} from 'src/views/draft-search/context/search-tabs-context';
import { useSearchQueryFromURL } from 'src/views/draft-search/hooks/useSearchQueryFromURL';
import { Box, Flex, VStack } from '@chakra-ui/react';
import { Filters } from 'src/views/draft-search/components/filters';
import { SelectedFilterType } from 'src/views/draft-search/components/filters/types';
import { FILTER_CONFIGS } from 'src/views/draft-search/components/filters/config';
import { queryFilterString2Object } from 'src/views/draft-search/components/filters/utils/query-builders';
import { defaultQuery } from 'src/views/draft-search/config/defaultQuery';
import { FilterTags } from 'src/views/draft-search/components/filters/components/tag';
import { SearchResultsHeader } from 'src/views/draft-search/components/search-results-header';
import { PaginationProvider } from 'src/views/draft-search/context/pagination-context';
import { SearchResultsController } from 'src/views/draft-search/components/search-results-tabs-controller';

// Default filters list.
const defaultFilters = FILTER_CONFIGS.reduce(
  (r, { property }) => ({ ...r, [property]: [] }),
  {},
);
//  This page renders the search results from the search bar.
const Search: NextPage<{
  results: FormattedResource[];
  total: number;
}> = ({ results, total }) => {
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
  const initialTab = useMemo(() => {
    if (!router.isReady) return null;

    const defaultTab = tabs.find(t => t.isDefault)?.id || tabs[0].id;
    const tabParamId = router.query.tab as string;
    const tab = tabs.find(t => t.id === tabParamId);
    return tab?.id || defaultTab;
  }, [router.isReady, router.query.tab]);

  if (!router.isReady || initialTab === null) {
    return null;
  }

  return (
    <PageContainer
      title='Search'
      metaDescription='NDE Discovery Portal - Search results list based on query.'
      px={0}
      py={0}
      includeSearchBar
    >
      <SearchTabsProvider initialTab={initialTab}>
        <PaginationProvider>
          <Flex bg='page.alt'>
            <Flex
              id='search-page-filters-sidebar'
              borderRight='0.5px solid'
              borderRightColor='gray.200'
              bg='#fff'
              flex={{ base: 0, lg: 1 }}
              height='100vh'
              minW={{ base: 'unset', lg: '380px' }}
              maxW={{ base: 'unset', lg: '450px' }}
              position={{ base: 'unset', lg: 'sticky' }}
              top='0px'
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
              <SearchResultsController />
            </Box>
          </Flex>
        </PaginationProvider>
      </SearchTabsProvider>
    </PageContainer>
  );
};

export default Search;
