import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { PageContainer, PageContent } from 'src/components/page-container';
import { Box, Flex, Heading } from '@chakra-ui/react';
import {
  defaultParams,
  defaultQuery,
  // defaultQuery,
} from 'src/components/search-results-page/helpers';
import SearchResultsPage from 'src/components/search-results-page';
import { fetchSearchResults } from 'src/utils/api';
import { FormattedResource } from 'src/utils/api/types';
import { queryFilterString2Object } from 'src/components/filters/helpers';
import { useCallback, useMemo } from 'react';
import { SelectedFilterType } from 'src/components/filters/types';
import FilterTags from 'src/components/filters/components/filters-tag';
import { FILTERS_CONFIG } from 'src/components/search-results-page/components/filters/helpers';
import { Filters } from 'src/components/search-results-page/components/filters';
import { useHasMounted } from 'src/hooks/useHasMounted';

//  This page renders the search results from the search bar.
const Search: NextPage<{
  results: FormattedResource[];
  total: number;
}> = ({ results, total }) => {
  const hasMounted = useHasMounted();
  const router = useRouter();

  const queryString = Array.isArray(router.query.q)
    ? router.query.q.map(s => s.trim()).join('+')
    : router.query.q || defaultParams.q;

  ////////////////////////////////////////////////////
  ////////////////// Update Router ///////////////////
  ////////////////////////////////////////////////////
  const queryParams = {
    ...defaultParams,
    ...router.query,
    q: queryString,
    extra_filter: Array.isArray(router.query.filters)
      ? router.query.filters.join('')
      : router.query.filters || '',
  };

  const handleRouteUpdate = useCallback(
    (update: Record<string, any>) => {
      router.push({ query: { ...router.query, ...update } }, undefined, {
        shallow: true,
      });
    },
    [router],
  );

  const selectedFilters: SelectedFilterType = useMemo(() => {
    const queryFilters = router.query.filters;
    const filterString = Array.isArray(queryFilters)
      ? queryFilters.join('')
      : queryFilters || '';
    return queryFilterString2Object(filterString) || {};
  }, [router.query.filters]);

  const applied_filters = Object.entries(selectedFilters).filter(
    ([_, filters]) => filters.length > 0,
  );

  // Default filters list.
  const defaultFilters = useMemo(
    () => Object.keys(FILTERS_CONFIG).reduce((r, k) => ({ ...r, [k]: [] }), {}),
    [],
  );

  // Reset the filters to the default.
  const removeAllFilters = () => {
    return handleRouteUpdate({
      from: defaultQuery.selectedPage,
      filters: defaultFilters,
    });
  };

  return (
    <PageContainer
      title='Search'
      metaDescription='NDE Discovery Portal - Search results list based on query.'
      px={0}
      py={0}
    >
      <Box w='100%'>
        <Flex w='100%'>
          <PageContent w='100%' flexDirection='column'>
            <Heading
              as='h1'
              size='sm'
              color='text.body'
              mb={4}
              fontWeight='normal'
            >
              {queryString === '__all__'
                ? `Showing all results`
                : `Showing results for`}

              {queryString !== '__all__' && (
                <Heading as='span' ml={1} fontWeight='semibold' size='inherit'>
                  {queryString.replaceAll('\\', '')}
                </Heading>
              )}
            </Heading>
            {router.query.filters && (
              <FilterTags
                selectedFilters={selectedFilters}
                handleRouteUpdate={handleRouteUpdate}
                removeAllFilters={removeAllFilters}
              />
            )}
            <Flex w='100%'>
              {/* Filters sidebar */}
              <Filters
                colorScheme='secondary'
                queryParams={queryParams}
                selectedFilters={selectedFilters}
                removeAllFilters={
                  applied_filters.length > 0 ? removeAllFilters : undefined
                }
              />
              {/* Result cards */}
              <SearchResultsPage results={results} total={total} />
            </Flex>
          </PageContent>
        </Flex>
      </Box>
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
