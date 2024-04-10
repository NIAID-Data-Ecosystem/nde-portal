import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { PageContainer, PageContent } from 'src/components/page-container';
import { Box, Flex, Heading } from '@chakra-ui/react';
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
import { SearchResultsVisualizations } from 'src/views/search-results/visualisations';

const FilterTags = dynamic(() =>
  import('src/components/filters/components/filters-tag').then(
    mod => mod.FilterTags,
  ),
);

const defaultFilters = Object.keys(FILTERS_CONFIG).reduce(
  (r, k) => ({ ...r, [k]: [] }),
  {},
);

const Search: NextPage<{
  results: FormattedResource[];
  total: number;
}> = ({ results, total }) => {
  const hasMounted = useHasMounted();
  const router = useRouter();

  const { q, filters } = router.query; // Destructuring assignment

  const queryString = useMemo(() => {
    if (Array.isArray(q)) {
      return q.map(s => s.trim()).join('+');
    }
    return q || defaultParams.q;
  }, [q]);

  const selectedFilters: SelectedFilterType = useMemo(() => {
    const filterString = Array.isArray(filters)
      ? filters.join('')
      : filters || '';
    return queryFilterString2Object(filterString) || {};
  }, [filters]);

  const appliedFilters = useMemo(
    () =>
      Object.entries(selectedFilters).filter(
        ([_, filters]) => filters.length > 0,
      ),
    [selectedFilters],
  );

  const handleRouteUpdate = useCallback(
    (update: Record<string, any>) => {
      router.push({ query: { ...router.query, ...update } }, undefined, {
        shallow: true,
      });
    },
    [router],
  );

  const removeAllFilters = useCallback(() => {
    return handleRouteUpdate({
      from: defaultQuery.selectedPage,
      filters: defaultFilters,
    });
  }, [handleRouteUpdate]);

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
        <SearchResultsVisualizations
          total={total}
          queryParams={{
            ...defaultParams,
            ...router.query,
            q: queryString,
            extra_filter: Array.isArray(router.query.filters)
              ? router.query.filters.join('')
              : router.query.filters || '',
          }}
          selectedFilters={selectedFilters}
        />

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
                  appliedFilters.length > 0 ? removeAllFilters : undefined
                }
              />
            )}
          </ScrollContainer>
          {/* Result cards */}
          <SearchResultsPage
            results={results}
            total={total}
            queryParams={{
              ...defaultParams,
              ...router.query,
              q: queryString,
              extra_filter: Array.isArray(router.query.filters)
                ? router.query.filters.join('')
                : router.query.filters || '',
            }}
          />
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
        'collectionType',
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
    console.error(err); // Log the error for debugging
    return {
      props: {
        data: null,
        error: { message: 'Error retrieving data' },
      },
    };
  }
}

export default Search;
