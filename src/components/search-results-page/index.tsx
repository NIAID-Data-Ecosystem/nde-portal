import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import Empty from 'src/components/empty';
import { fetchSearchResults } from 'src/utils/api';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import {
  Box,
  Button,
  Collapse,
  Flex,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from 'nde-design-system';
import {
  queryFilterObject2String,
  queryFilterString2Object,
  updateRoute,
} from 'src/components/filters';
import { Error, ErrorCTA } from 'src/components/error';
import { Pagination, MAX_PAGES } from './components/pagination';
import { useHasMounted } from 'src/hooks/useHasMounted';
import { FACET_SIZE, filtersConfig } from './components/filters';
import Card from './components/card';
import Banner from '../banner';
import { formatNumber } from 'src/utils/helpers';
import { SortResults } from './components/sort';
import ResultsCount from './components/count';
import { DownloadMetadata } from '../download-metadata';
import NextLink from 'next/link';
import { FaChartBar } from 'react-icons/fa';
import { encodeString } from 'src/utils/querystring-helpers';
import { SelectedFilterType } from '../filters/types';

/*
[COMPONENT INFO]:
 Search results pages displays the list of records returned by a search.
 Contains filters, filter tags, search results cards.
*/

// Sorting configuration.
export const sortOptions = [
  { name: 'Best Match', sortBy: '_score', orderBy: 'asc' },
  { name: 'Date: oldest to newest', sortBy: 'date', orderBy: 'asc' },
  { name: 'Date: newest to oldest', sortBy: 'date', orderBy: 'desc' },
  // [TO DO]: Add once prod has been updated.
  // { name: 'A-Z', sortBy: 'name.raw', orderBy: 'asc' },
  // { name: 'Z-A', sortBy: 'name.raw', orderBy: 'desc' },
] as const;

export interface SortOptionsInterface {
  name: (typeof sortOptions)[number]['name'];
  sortBy: (typeof sortOptions)[number]['sortBy'];
  orderBy: (typeof sortOptions)[number]['orderBy'];
}

// Default config for query.
export const defaultQuery = {
  queryString: '__all__',
  selectedPage: 1,
  selectedPerPage: 10,
  facets: Object.keys(filtersConfig),
  facetSize: FACET_SIZE,
  sortOrder: '_score',
};

const SearchResultsPage = () => {
  const [total, setTotal] = useState(0);

  const hasMounted = useHasMounted();
  const router = useRouter();

  // Currently selected filters.
  const defaultFilters = useMemo(
    () => Object.keys(filtersConfig).reduce((r, k) => ({ ...r, [k]: [] }), {}),
    [],
  );

  const [selectedFilters, setSelectedFilters] =
    useState<SelectedFilterType>(defaultFilters);
  // Currently selected page.
  const [queryString, setQueryString] = useState(defaultQuery.queryString);

  // Currently selected page.
  const [selectedPage, setSelectedPage] = useState(defaultQuery.selectedPage);

  const [sortOrder, setSortOrder] = useState(defaultQuery.sortOrder);

  //  Items per page to show
  const [selectedPerPage, setSelectedPerPage] = useState(
    defaultQuery.selectedPerPage,
  );

  // Query Parameters
  const filter_string = queryFilterObject2String(selectedFilters);
  const params = {
    // don't escape parenthesis or colons when its an advanced search
    q: router.query.advancedSearch ? queryString : encodeString(queryString),
    extra_filter: filter_string || '', // extra filter updates aggregate fields
    facet_size: defaultQuery.facetSize,
    size: `${selectedPerPage}`,
    from: `${(selectedPage - 1) * selectedPerPage}`,
    sort: sortOrder,
  };

  const { isLoading, error, data } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    [
      'search-results',
      {
        ...params,
        filters: selectedFilters,
        size: selectedPerPage,
        from: selectedPage,
        sortOrder,
      },
    ],
    () => {
      if (typeof queryString !== 'string' && !queryString) {
        return;
      }

      return fetchSearchResults({
        q: params.q,
        extra_filter: params.extra_filter,
        size: params.size,
        from: params.from,
        sort: params.sort,
      });
    },
    // Don't refresh everytime window is touched.
    { refetchOnWindowFocus: false, enabled: !!hasMounted },
  );

  // Set total results value
  useEffect(() => {
    setTotal(prev => {
      if (!data || data.total === undefined) {
        return prev;
      }
      if (!isLoading) {
        return data.total;
      }
      return prev;
    });
  }, [data, isLoading]);

  // Set initial state based on route params.
  useEffect(() => {
    const { q, size, filters, from, sort } = router.query;
    setQueryString(prev => {
      let querystring = q;

      if (querystring === undefined || querystring === prev) {
        return prev;
      }
      // if query string is empty we return all results
      if (querystring === '') {
        return defaultQuery.queryString;
      }
      return Array.isArray(querystring)
        ? `${querystring.map(s => s.trim()).join('+')}`
        : `${querystring.trim()}`;
    });
    setSelectedPage(() => {
      if (!from) {
        return defaultQuery.selectedPage;
      }
      return Array.isArray(from) ? +from[0] : +from;
    });

    setSelectedPerPage(prev =>
      size ? (Array.isArray(size) ? +size[0] : +size) : prev,
    );

    setSortOrder(prev =>
      sort ? (Array.isArray(sort) ? sort[0] : sort) : prev,
    );

    setSelectedFilters(() => {
      // convert url string to query object
      let queryObject = queryFilterString2Object(filters);
      return {
        ...defaultFilters,
        ...queryObject,
      };
    });
  }, [defaultFilters, router]);

  // embed altmetric data. For more information: https://api.altmetric.com/embeds.html
  useEffect(() => {
    // @ts-ignore
    if (window._altmetric_embed_init) {
      // @ts-ignore
      window._altmetric_embed_init();
    } else {
      /* import altmetric script for badge embeds */
      let altmetricsScript = document.createElement('script');
      altmetricsScript.setAttribute(
        'src',
        'https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js',
      );
      document.body.appendChild(altmetricsScript);
    }
  }, [data]);

  // Update the route to reflect changes on page without re-render.
  const handleRouteUpdate = useCallback(
    (update: {}) => updateRoute(update, router),
    [router],
  );

  if (!hasMounted || !router.isReady) {
    return null;
  }
  return (
    <>
      {error ? (
        // [ERROR STATE]: API response error
        <Error message="It's possible that the server is experiencing some issues.">
          <ErrorCTA>
            <Button onClick={() => router.reload()} variant='outline'>
              Retry
            </Button>
          </ErrorCTA>
        </Error>
      ) : (
        <>
          <Box flex={1}>
            <Flex w='100%' flexDirection='column' mx={[0, 0, 4]} flex={[1, 2]}>
              <Flex
                w='100%'
                borderBottom='2px solid'
                borderColor='gray.700'
                flexWrap='wrap'
                justifyContent='space-between'
                alignItems='center'
              >
                <ResultsCount total={total} isLoading={isLoading} />
              </Flex>

              <Pagination
                id='pagination-top'
                selectedPage={selectedPage}
                handleSelectedPage={from => {
                  handleRouteUpdate({ from });
                }}
                selectedPerPage={selectedPerPage}
                total={total}
                isLoading={isLoading}
                ariaLabel='paginate through resources top bar'
              >
                <Flex
                  flex={1}
                  justifyContent='space-between'
                  alignItems='center'
                  flexWrap='wrap'
                  flexDirection={{ md: 'row-reverse' }}
                  pb={[4, 4, 2]}
                  mb={[4, 4, 2]}
                  borderBottom={{ base: '1px solid' }}
                  borderColor={{ base: 'page.alt' }}
                  w='100%'
                  minW={{ md: 500 }}
                >
                  <Flex
                    alignItems='center'
                    flex={1}
                    justifyContent={{
                      base: 'center',
                      sm: 'flex-start',
                      xl: 'flex-end',
                    }}
                    flexWrap={{ base: 'wrap', md: 'nowrap' }}
                    flexDirection={['column', 'row']}
                    mb={2}
                    w='100%'
                    mx={{ base: 0, xl: 2 }}
                  >
                    <Box mr={[0, 2]} w={['100%', 'unset']} m={[1]} ml={0}>
                      <DownloadMetadata
                        exportName='nde-results'
                        variant='outline'
                        params={params}
                      >
                        Download Metadata
                      </DownloadMetadata>
                    </Box>
                    <NextLink
                      href={router.asPath.replace('search', 'summary')}
                      passHref
                    >
                      <Button
                        leftIcon={<FaChartBar />}
                        whiteSpace='nowrap'
                        px={{ base: 4, md: 6 }}
                        flex={1}
                        w='100%'
                        m={[1]}
                        maxW={{ base: 'unset', sm: '200px' }}
                      >
                        Visual Summary
                      </Button>
                    </NextLink>
                  </Flex>
                  <Box
                    w={['100%', '100%', 'unset']}
                    flex={{ base: 'unset', md: 1 }}
                    minW={{ base: 'unset', md: 300 }}
                    mr={{ base: 'unset', md: 2 }}
                  >
                    <SortResults
                      sortOptions={sortOptions}
                      sortOrder={sortOrder}
                      handleSortOrder={sort => {
                        handleRouteUpdate({
                          sort,
                          from: defaultQuery.selectedPage,
                        });
                      }}
                      selectedPerPage={selectedPerPage}
                      handleSelectedPerPage={v =>
                        handleRouteUpdate({ from: 1, size: v })
                      }
                    />
                  </Box>
                </Flex>
              </Pagination>

              {/* Display banner on last page if results exceed amount allotted by API */}
              <Collapse
                in={selectedPage === Math.floor(MAX_PAGES / selectedPerPage)}
                animateOpacity
              >
                <Banner status='info'>
                  Only the first {formatNumber(10000)} results are displayed,
                  please limit your query to get better results or use our API
                  to download all results.
                </Banner>
              </Collapse>
              <Stack
                direction='row'
                justifyContent='space-between'
                flex={1}
                w='100%'
              >
                {/* Results Cards */}
                {/* Empty state if no results found */}
                {!isLoading && (!data || data.results.length === 0) && (
                  <Empty
                    message='No results found.'
                    alignSelf='center'
                    h='50vh'
                  >
                    <Text>Search yielded no results, please try again.</Text>
                    <Button href='/' mt={4}>
                      Go to search page.
                    </Button>
                  </Empty>
                )}

                <UnorderedList ml={0} flex={3} w='100%'>
                  {isLoading || (data && data.results?.length > 0)
                    ? new Array(selectedPerPage).fill(null).map((_, i) => {
                        const result: FormattedResource | null =
                          data?.results && data.results.length > 0
                            ? data.results[i]
                            : null;

                        // if waiting for results to load display placeholder loading cards until content is available
                        if (result || isLoading) {
                          return (
                            <ListItem key={i} my={4} mb={8}>
                              <Card isLoading={isLoading} data={result} />
                            </ListItem>
                          );
                        }
                      })
                    : null}
                </UnorderedList>
              </Stack>
              <Pagination
                id='pagination-bottom'
                selectedPage={selectedPage}
                handleSelectedPage={from => {
                  handleRouteUpdate({ from });
                }}
                selectedPerPage={selectedPerPage}
                total={total}
                isLoading={isLoading}
                ariaLabel='paginate through resources bottom bar'
              />
            </Flex>
          </Box>
        </>
      )}
    </>
  );
};

export default SearchResultsPage;
