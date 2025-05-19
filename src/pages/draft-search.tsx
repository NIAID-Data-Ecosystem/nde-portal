import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { PageContainer, PageContent } from 'src/components/page-container';
import { useCallback, useMemo } from 'react';
import { FormattedResource } from 'src/utils/api/types';
import {
  SearchProvider,
  tabs,
} from 'src/views/draft-search/context/search-context';
import { useSearchQueryParams } from 'src/views/draft-search/hooks/useSearchQueryParams';
import { useSearchResultsData } from 'src/views/draft-search/hooks/useSearchResultsData';
import { Box, Flex } from '@chakra-ui/react';
import { Filters } from 'src/views/draft-search/components/filters';
import { SelectedFilterType } from 'src/views/draft-search/components/filters/types';
import { FILTER_CONFIGS } from 'src/views/draft-search/components/filters/config';
import { queryFilterString2Object } from 'src/views/draft-search/components/filters/utils/query-builders';
import { defaultQuery } from 'src/views/draft-search/config/defaultQuery';
import { SearchResultsController } from 'src/views/draft-search/components/search-results-controller';

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

  const queryParams = useSearchQueryParams();

  const { params } = useSearchResultsData({
    ...queryParams,
    size: 0,
    facets: ['@type'],
  });

  // Set the initial tab based on the router query
  const initialTab = useMemo(() => {
    if (!router.isReady) return null;

    const defaultTab = tabs.find(t => t.isDefault)?.id || tabs[0].id;
    const tabParamId = router.query.tab as string;
    const tab = tabs.find(t => t.id === tabParamId);
    return tab?.id || defaultTab;
  }, [router.isReady, router.query.tab]);

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
      <SearchProvider initialTab={initialTab}>
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
            {router.isReady && (
              <Filters
                colorScheme='secondary'
                queryParams={{
                  ...params,
                  ...router.query,
                  filters: undefined,
                  extra_filter: Array.isArray(router.query.filters)
                    ? router.query.filters.join('')
                    : router.query.filters || '',
                }}
                selectedFilters={selectedFilters}
                removeAllFilters={
                  appliedFilters.length > 0 ? removeAllFilters : undefined
                }
              />
            )}
          </Flex>
          <Box flex={3}>
            {/* Filter tags */}
            {/* Search Results */}
            <SearchResultsController tabs={tabs}></SearchResultsController>
          </Box>
        </Flex>
      </SearchProvider>
    </PageContainer>
  );
};

export default Search;
