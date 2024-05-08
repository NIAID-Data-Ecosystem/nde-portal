import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { PageContainer, PageContent } from 'src/components/page-container';
import { Flex, Heading } from '@chakra-ui/react';
import { useHasMounted } from 'src/hooks/useHasMounted';
import SearchResultsPage from 'src/components/search-results-page';
import { queryFilterString2Object } from 'src/components/filters/helpers';
import { useCallback, useMemo } from 'react';
import { SelectedFilterType } from 'src/components/filters/types';
import dynamic from 'next/dynamic';
import {
  defaultParams,
  defaultQuery,
} from 'src/components/search-results-page/helpers';
import { FILTERS_CONFIG } from 'src/components/search-results-page/components/filters/helpers';
import { fetchSearchResults } from 'src/utils/api';
import { Filters } from 'src/components/search-results-page/components/filters';
import { FormattedResource } from 'src/utils/api/types';
import { ScrollContainer } from 'src/components/scroll-container';

const FilterTags = dynamic(() =>
  import('src/components/filters/components/filters-tag').then(
    mod => mod.FilterTags,
  ),
);

//  This page renders the search results from the search bar.
const Search: NextPage<{
  results: FormattedResource[];
  total: number;
}> = ({ results, total }) => {
  const hasMounted = useHasMounted();
  const router = useRouter();

  const queryString = useMemo(
    () =>
      Array.isArray(router.query.q)
        ? router.query.q.map(s => s.trim()).join('+')
        : router.query.q || defaultParams.q,
    [router.query.q],
  );

  ////////////////////////////////////////////////////
  ////////////////// Update Router ///////////////////
  ////////////////////////////////////////////////////

  const selectedFilters: SelectedFilterType = useMemo(() => {
    const queryFilters = router.query.filters;
    const filterString = Array.isArray(queryFilters)
      ? queryFilters.join('')
      : queryFilters || '';
    return queryFilterString2Object(filterString) || {};
  }, [router.query.filters]);

  // Currently applied filters
  const applied_filters = useMemo(
    () =>
      Object.entries(selectedFilters).filter(
        ([_, filters]) => filters.length > 0,
      ),
    [selectedFilters],
  );

  // Default filters list.
  const defaultFilters = useMemo(
    () => Object.keys(FILTERS_CONFIG).reduce((r, k) => ({ ...r, [k]: [] }), {}),
    [],
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
      from: defaultQuery.selectedPage,
      filters: defaultFilters,
    });
  }, [handleRouteUpdate, defaultFilters]);
  return (
    <PageContainer
      title='Search'
      metaDescription='NDE Discovery Portal - Search results list based on query.'
      px={0}
      py={0}
    >
      <PageContent w='100%' flexDirection='column'>
        {/* Search query */}
        <Heading
          as='h1'
          fontSize='sm'
          color='gray.800'
          fontWeight='normal'
          lineHeight='short'
          mb={4}
        >
          {queryString === '__all__'
            ? `Showing all results`
            : `Showing results for`}
          <br />
          {queryString !== '__all__' && (
            <Heading as='span' fontWeight='bold' fontSize='inherit'>
              {queryString.replaceAll('\\', '')}
            </Heading>
          )}
        </Heading>

        {/* Tags with the names of the currently selected filters */}
        {Object.values(selectedFilters).length > 0 && (
          <FilterTags
            selectedFilters={selectedFilters}
            handleRouteUpdate={handleRouteUpdate}
            removeAllFilters={removeAllFilters}
          />
        )}
        <Flex w='100%'>
          {/* Filters sidebar */}
          <ScrollContainer
            flex={{ base: 0, md: 1 }}
            minW={{ base: 'unset', md: '270px' }}
            maxW={{ base: 'unset', md: '400px' }}
            position={{ base: 'unset', md: 'sticky' }}
            h='100vh'
            top='0px'
            boxShadow={{ base: 'unset', md: 'base' }}
            bg={{ base: 'unset', md: 'white' }}
            borderRadius='semi'
            overflowY='auto'
          >
            {router.isReady && hasMounted && (
              <Filters
                colorScheme='secondary'
                queryParams={{
                  ...defaultParams,
                  ...router.query,
                  q: queryString,
                  extra_filter: Array.isArray(router.query.filters)
                    ? router.query.filters.join('')
                    : router.query.filters || '',
                }}
                selectedFilters={selectedFilters}
                removeAllFilters={
                  applied_filters.length > 0 ? removeAllFilters : undefined
                }
              />
            )}
          </ScrollContainer>
          {/* Result cards */}
          <SearchResultsPage results={results} total={total} />
        </Flex>
      </PageContent>
    </PageContainer>
  );
};

export async function getStaticProps() {
  try {
    const data = await fetchSearchResults({
      ...defaultParams,
      facet_size: 0,
      // don't escape parenthesis or colons when its an advanced search
      q: '__all__',
      size: '10',
      from: '1',
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
    return { props: { results: data?.results || [], total: data?.total } };
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
