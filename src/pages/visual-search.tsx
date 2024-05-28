import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { PageContainer, PageContent } from 'src/components/page-container';
import { Divider, Heading, Stack, Text } from '@chakra-ui/react';
import { useHasMounted } from 'src/hooks/useHasMounted';
import SearchResultsPage from 'src/components/search-results-page';
import { queryFilterString2Object } from 'src/components/filters/helpers';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import ResultsCount from 'src/components/search-results-page/components/count';
import { encodeString } from 'src/utils/querystring-helpers';
import { SearchResultsVisualizations } from 'src/views/visual-search/visualisations';

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

  // Default filters list.
  const defaultFilters = useMemo(
    () => Object.keys(FILTERS_CONFIG).reduce((r, k) => ({ ...r, [k]: [] }), {}),
    [],
  );

  const [selectedFilters, setSelectedFilters] =
    useState<SelectedFilterType>(defaultFilters);

  // Set initial state based on route params.
  useEffect(() => {
    setSelectedFilters(() => {
      // convert url string to query object
      let queryObject = queryFilterString2Object(router.query.filters);
      return {
        ...defaultFilters,
        ...queryObject,
      };
    });
  }, [defaultFilters, router]);

  // Currently applied filters
  const applied_filters = useMemo(
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
        {/*  Results count */}
        <Stack
          bg='white'
          border='1px solid'
          borderColor='gray.100'
          borderRadius='semi'
          flexDirection='column'
          mb={2}
          py={2}
          px={4}
          spacing={2}
        >
          {/* Search query */}

          <Heading
            as='h1'
            fontSize='sm'
            fontWeight='medium'
            lineHeight='shorter'
            color='black'
            p={1}
          >
            <Text as='span' color='gray.800' fontSize='xs' fontWeight='normal'>
              {querystring === '__all__'
                ? 'Showing all results'
                : 'Showing results for:'}
            </Text>
            {querystring !== '__all__' &&
              ' ' + querystring.replaceAll('\\', '')}
          </Heading>

          <ResultsCount
            total={total}
            querystring={querystring}
            selectedFilters={selectedFilters}
          />
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

          {/* Tags with the names of the currently selected filters */}
          {Object.values(applied_filters).length > 0 && (
            <>
              <Divider />
              <Text
                color='gray.800'
                fontSize='xs'
                fontWeight='normal'
                lineHeight='short'
              >
                Filter results by:
              </Text>
              <FilterTags
                selectedFilters={selectedFilters}
                handleRouteUpdate={handleRouteUpdate}
                removeAllFilters={removeAllFilters}
              />
            </>
          )}
          {/* TO DO: Visual summary in collapsible */}
        </Stack>

        <Stack flexDirection='row' w='100%' spacing={{ base: 0, md: 2 }}>
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
            pr={{ base: 0, md: 2 }}
          >
            {router.isReady && hasMounted && (
              <Filters
                colorScheme='secondary'
                queryParams={{
                  ...defaultParams,
                  ...router.query,
                  q: querystring,
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
          <SearchResultsPage
            results={results}
            total={total}
            querystring={querystring}
            selectedFilters={selectedFilters}
          />
        </Stack>
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
