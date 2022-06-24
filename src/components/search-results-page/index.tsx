import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import Empty from 'src/components/empty';
import { PageContent } from 'src/components/page-container';
import { fetchAllSearchResults, fetchSearchResults } from 'src/utils/api';
import { encodeString } from 'src/utils/querystring-helpers';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Heading,
  ListItem,
  Spinner,
  Stack,
  Text,
  UnorderedList,
} from 'nde-design-system';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from 'src/components/filter/helpers';
import { Error, ErrorCTA } from 'src/components/error';
import { Pagination, MAX_PAGES } from './components/pagination';
import { useHasMounted } from 'src/hooks/useHasMounted';
import { FilterTags } from './components/filters/components/tags';
import {
  FACET_SIZE,
  Filters,
  filtersConfig,
  SelectedFilterType,
} from './components/filters';
import Card from './components/card';
import Banner from '../banner';
import { formatNumber } from 'src/utils/helpers';
import { SortResults } from './components/sort';
import ResultsCount from './components/count';
import { DownloadMetadata } from '../download-metadata';

/*
[COMPONENT INFO]:
 Search results pages displays the list of records returned by a search.
 Contains filters, filter tags, search results cards.
*/

// Sorting mechanism.
export interface SortOptions {
  name: string;
  sortBy: string;
  orderBy: 'asc' | 'desc';
}
const sort_options: SortOptions[] = [
  { name: 'Best Match', sortBy: '_score', orderBy: 'asc' },
  { name: 'Date: oldest to newest', sortBy: 'date', orderBy: 'asc' },
  { name: 'Date: newest to oldest', sortBy: 'date', orderBy: 'desc' },
  { name: 'A-Z', sortBy: 'name', orderBy: 'asc' },
  { name: 'Z-A', sortBy: 'name', orderBy: 'desc' },
];

const displayQueryString = (str: string) => {
  if (!str) {
    return;
  }

  if (str.charAt(0) === '(') {
    str = str.replace('(', '');
  }
  if (str.slice(-1) === ')') {
    str = str.replace(/.$/, '');
  }
  return str;
};

const SearchResultsPage = () => {
  const [total, setTotal] = useState(0);

  const hasMounted = useHasMounted();
  const router = useRouter();

  // Default config for query.
  const defaultQuery = {
    queryString: '__all__',
    selectedPage: 1,
    selectedPerPage: 10,
    facets: Object.keys(filtersConfig),
    facetSize: FACET_SIZE,
    sortOrder: '_score',
  };

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

  // Get query params from url params

  const { isLoading, error, data } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    [
      'search-results',
      {
        q: queryString,
        size: selectedPerPage,
        from: selectedPage,
        filters: selectedFilters,
        sortOrder,
      },
    ],
    () => {
      if (typeof queryString !== 'string' && !queryString) {
        return;
      }
      const filter_string = queryFilterObject2String(selectedFilters);

      return fetchSearchResults({
        q: filter_string
          ? `${
              queryString === '__all__' ? '' : `${queryString} AND `
            }${filter_string}`
          : `${queryString}`,
        size: `${selectedPerPage}`,
        from: `${(selectedPage - 1) * selectedPerPage}`,
        facet_size: defaultQuery.facetSize,
        facets: defaultQuery.facets.join(','),
        sort: sortOrder,
      });
    },
    // Don't refresh everytime window is touched.
    { refetchOnWindowFocus: false, enabled: true },
  );

  // Get all data for download
  const {
    isLoading: metadataIsLoading,
    error: metadataError,
    data: metadataData,
    refetch,
    isRefetching,
    isFetching,
  } = useQuery<any | undefined, Error>(
    [
      'all-search-results',
      {
        q: queryString,
        filters: selectedFilters,
      },
    ],
    () => {
      if (typeof queryString !== 'string' && !queryString) {
        return;
      }
      const filter_string = queryFilterObject2String(selectedFilters);

      return fetchAllSearchResults({
        q: filter_string
          ? `${
              queryString === '__all__' ? '' : `${queryString} AND `
            }${filter_string}`
          : `${queryString}`,
      });
    },
    // Don't refresh everytime window is touched.
    { refetchOnWindowFocus: false, enabled: false },
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
        ? `(${querystring.map(s => encodeString(s.trim())).join('+')})`
        : `(${encodeString(querystring.trim())})`;
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
  }, [
    defaultFilters,
    defaultQuery.queryString,
    defaultQuery.selectedPage,
    router,
  ]);

  // Update the route to reflect changes on page without re-render.
  const updateRoute = (update: {}) => {
    router.push(
      {
        query: {
          ...router.query,
          ...update,
        },
      },
      undefined,
      {
        shallow: true,
        scroll: true,
      },
    );
  };

  // Currently applied filters
  const applied_filters = Object.entries(selectedFilters).filter(
    ([_, filters]) => filters.length > 0,
  );

  const removeAllFilters = () => {
    return updateRoute({
      from: defaultQuery.selectedPage,
      filters: defaultFilters,
    });
  };

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
        <Flex w='100%'>
          {/* Filters sidebar */}
          <PageContent w='100%' flexDirection='column'>
            <Heading
              as='h1'
              size='md'
              color='text.body'
              fontWeight='semibold'
              mb={4}
            >
              {queryString === '__all__'
                ? `Showing all results`
                : `Showing results for`}

              {queryString !== '__all__' && (
                <Heading
                  as='span'
                  ml={2}
                  fontWeight={'bold'}
                  size='md'
                  w='100%'
                >
                  {displayQueryString(queryString)}
                </Heading>
              )}
            </Heading>
            {metadataError && (
              <Box my={2}>
                <Banner status='error'>
                  Something went with the download. Try again.
                </Banner>
              </Box>
            )}
            {/* Chips with the names of the currently selected filters */}
            <FilterTags
              tags={applied_filters}
              removeAllFilters={removeAllFilters}
              removeSelectedFilter={(name: string, value: string | number) => {
                const updatedFilter = {
                  [name]: selectedFilters[name].filter(v => v !== value),
                };

                let filters = queryFilterObject2String({
                  ...selectedFilters,
                  ...updatedFilter,
                });
                updateRoute({
                  from: defaultQuery.selectedPage,
                  filters,
                });
              }}
            />
            <Flex w='100%'>
              <Filters
                searchTerm={queryString}
                facets={{ isLoading: isLoading, data: data?.facets }}
                selectedFilters={selectedFilters}
                removeAllFilters={
                  applied_filters.length > 0
                    ? () => removeAllFilters()
                    : undefined
                }
                handleSelectedFilters={(
                  updatedFilters: typeof selectedFilters,
                ) => {
                  let updatedFilterString = queryFilterObject2String({
                    ...selectedFilters,
                    ...updatedFilters,
                  });

                  updateRoute({
                    from: defaultQuery.selectedPage,
                    filters: updatedFilterString,
                  });
                }}
              />
              <Flex
                w='100%'
                flexDirection={'column'}
                mx={[0, 0, 4]}
                flex={[1, 2]}
              >
                <Flex w='100%' borderBottom='2px solid' borderColor='gray.700'>
                  <ResultsCount total={total} isLoading={isLoading} />
                </Flex>

                <Pagination
                  id={'pagination-top'}
                  selectedPage={selectedPage}
                  handleSelectedPage={from => {
                    updateRoute({ from });
                  }}
                  selectedPerPage={selectedPerPage}
                  total={total}
                  isLoading={isLoading}
                  ariaLabel='paginate through resources top bar'
                >
                  <Flex
                    flex={1}
                    justifyContent='space-between'
                    borderBottom='1px solid'
                    borderColor={'page.alt'}
                    pb={4}
                    mb={4}
                  >
                    <Flex>
                      {isLoading && (
                        <Spinner
                          thickness='6px'
                          speed='0.65s'
                          emptyColor='gray.200'
                          color='primary.500'
                          size='xl'
                        />
                      )}
                    </Flex>
                    <Box>
                      <Flex w='100%' justifyContent='flex-end' pb={4}>
                        <DownloadMetadata
                          exportName={'nde-results'}
                          loadMetadata={() =>
                            refetch().then(response => response.data?.results)
                          }
                          colorScheme='primary'
                          variant='outline'
                          isLoading={isFetching}
                        >
                          Download Metadata
                        </DownloadMetadata>
                        {isFetching && <Text></Text>}
                      </Flex>
                      <Collapse in={isFetching}>
                        <Text fontSize='xs' fontStyle='italic'>
                          Note: Large sets of metadata may take along time to
                          download.
                        </Text>
                      </Collapse>
                      <SortResults
                        sortOptions={sort_options}
                        sortOrder={sortOrder}
                        handleSortOrder={sort =>
                          updateRoute({
                            sort,
                            from: defaultQuery.selectedPage,
                          })
                        }
                        selectedPerPage={selectedPerPage}
                        handleSelectedPerPage={v =>
                          updateRoute({ from: 1, size: v })
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
                      h={'50vh'}
                    >
                      <Text>Search yielded no results, please try again.</Text>
                      <Button href='/' mt={4}>
                        Go to search page.
                      </Button>
                    </Empty>
                  )}

                  <UnorderedList ml={0} flex={3} w={'100%'}>
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
                  id={'pagination-bottom'}
                  selectedPage={selectedPage}
                  handleSelectedPage={from => {
                    updateRoute({ from });
                  }}
                  selectedPerPage={selectedPerPage}
                  total={total}
                  isLoading={isLoading}
                  ariaLabel='paginate through resources bottom bar'
                />
              </Flex>
            </Flex>
          </PageContent>
        </Flex>
      )}
    </>
  );
};

export default SearchResultsPage;
