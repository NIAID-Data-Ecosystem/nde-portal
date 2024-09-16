import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { PageContainer, PageContent } from 'src/components/page-container';
import { Divider, Flex, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { useHasMounted } from 'src/hooks/useHasMounted';
import SearchResultsPage from 'src/views/search-results-page-draft';
import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  defaultParams,
  defaultQuery,
  queryFilterString2Object,
} from 'src/views/search-results-page-draft/helpers';
import { fetchSearchResults } from 'src/utils/api';
import { Filters } from 'src/views/search-results-page-draft/components/filters';
import { FormattedResource } from 'src/utils/api/types';
import { FILTER_CONFIGS } from 'src/views/search-results-page-draft/components/filters/config';
import { SelectedFilterType } from 'src/views/search-results-page-draft/components/filters/types';
import { encodeString } from 'src/utils/querystring-helpers';
import ResultsCount from 'src/views/search-results-page-draft/components/count';
import { SearchResultsVisualizations } from 'src/views/search-results-page-draft/components/topic-browser';

const FilterTags = dynamic(() =>
  import(
    'src/views/search-results-page-draft/components/filters/components/tag'
  ).then(mod => mod.FilterTags),
);

//  This page renders the search results from the search bar.
const Search: NextPage<{
  results: FormattedResource[];
  total: number;
}> = ({ results, total }) => {
  const hasMounted = useHasMounted();
  const router = useRouter();
  const [count, setCount] = useState<{
    total: number;
    isLoading: boolean;
  }>({
    total,
    isLoading: !router.isReady || true,
  });

  const getQueryString = useCallback(() => {
    let querystring = router.query.q;

    if (!querystring) {
      querystring = defaultQuery.queryString;
    } else {
      querystring = Array.isArray(querystring)
        ? `${querystring.map(s => s.trim()).join('+')}`
        : `${querystring.trim()}`;
    }

    return router.query.advancedSearch
      ? querystring
      : encodeString(querystring);
  }, [router]);

  const querystring = useMemo(() => getQueryString(), [getQueryString]);

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
    () =>
      FILTER_CONFIGS.reduce(
        (r, { property }) => ({ ...r, [property]: [] }),
        {},
      ),
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
      <PageContent
        w='100%'
        flexDirection='column'
        alignItems='center'
        px={{ base: 2, sm: 4, xl: '5vw' }}
      >
        {/* Number of search results */}
        <ResultsCount isLoading={count.isLoading} total={count.total} />

        <Stack
          bg='white'
          border='1px solid'
          borderColor='gray.100'
          borderRadius='semi'
          flexDirection='column'
          mb={2}
          py={4}
          pb={1}
          px={4}
          spacing={2}
          w='100%'
        >
          {/* Search query */}

          <Heading
            as='h1'
            fontSize='sm'
            fontWeight='medium'
            lineHeight='shorter'
            color='black'
          >
            <Text as='span' color='gray.800' fontSize='sm' fontWeight='normal'>
              {querystring === '__all__'
                ? 'Showing all results'
                : 'Showing results for:'}
            </Text>
            {querystring !== '__all__' &&
              ' ' + querystring.replaceAll('\\', '')}
          </Heading>

          {/* Tags with the names of the currently selected filters */}
          {Object.values(applied_filters).length > 0 && (
            <>
              <Divider />
              <Text
                color='gray.800'
                fontSize='sm'
                fontWeight='medium'
                lineHeight='short'
              >
                Results filtered by:
              </Text>
              <FilterTags
                selectedFilters={selectedFilters}
                handleRouteUpdate={handleRouteUpdate}
                removeAllFilters={removeAllFilters}
              />
            </>
          )}
          <SearchResultsVisualizations
            queryParams={{
              ...defaultParams,
              ...router.query,
              q: querystring,
              extra_filter: Array.isArray(router.query.filters)
                ? router.query.filters.join('')
                : router.query.filters || '',
            }}
          />
        </Stack>

        <HStack
          w='100%'
          spacing={[0, 0, 4, 4, 6]}
          alignItems='flex-start'
          maxW='2600px'
        >
          {/* Filters sidebar */}
          <Flex
            flex={{ base: 0, lg: 1 }}
            height='100vh'
            minW={{ base: 'unset', lg: '300px' }}
            maxW={{ base: 'unset', lg: '450px' }}
            position={{ base: 'unset', lg: 'sticky' }}
            top='0px'
            bg='white'
            borderRadius='semi'
            boxShadow='base'
          >
            {router.isReady && hasMounted && (
              <Filters
                colorScheme='secondary'
                queryParams={{
                  ...defaultParams,
                  ...router.query,
                  q: querystring,
                  filters: undefined,
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
          </Flex>
          {/* Result cards */}
          <SearchResultsPage
            results={results}
            total={total}
            setCount={setCount}
          />
        </HStack>
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
