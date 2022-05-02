import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {useQuery} from 'react-query';
import Empty from 'src/components/empty';
import {PageContent} from 'src/components/page-container';
import {fetchSearchResults} from 'src/utils/api';
import {encodeString} from 'src/utils/querystring-helpers';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import {
  Box,
  Button,
  Flex,
  Heading,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from 'nde-design-system';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from 'src/components/search-results-page/components/filters/helpers';
import LoadingSpinner from 'src/components/loading';
import ErrorMessage from 'src/components/error';
import {
  Pagination,
  DisplayResults,
} from 'src/components/search-results-page/components/pagination';
import {useHasMounted} from 'src/hooks/useHasMounted';
import {assetPrefix} from 'next.config';
import {FilterTags} from './components/filters/components/tags';
import {
  FACET_SIZE,
  Filters,
  filtersConfig,
  SelectedFilterType,
} from './components/filters';
import Card from './components/card';

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
  {name: 'Best Match', sortBy: '_score', orderBy: 'asc'},
  {name: 'Date: oldest to newest', sortBy: 'date', orderBy: 'asc'},
  {name: 'Date: newest to oldest', sortBy: 'date', orderBy: 'desc'},
  {name: 'A-Z', sortBy: 'name', orderBy: 'asc'},
  {name: 'Z-A', sortBy: 'name', orderBy: 'desc'},
];

const SearchResultsPage = () => {
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
  const defaultFilters = Object.keys(filtersConfig).reduce(
    (r, k) => ({...r, [k]: []}),
    {},
  );

  const [selectedFilters, setSelectedFilters] =
    useState<SelectedFilterType>(defaultFilters);
  // Currently selected page.
  const [queryString, setQueryString] = useState(defaultQuery.queryString);

  // Currently selected page.
  const [selectedPage, setSelectedPage] = useState(defaultQuery.selectedPage);

  const [sortOrder, setSortOrder] = useState(defaultQuery.sortOrder);
  // const [orderBy, setOrderBy] = useState(defaultQuery.orderBy);

  //  Items per page to show
  const [selectedPerPage, setSelectedPerPage] = useState(
    defaultQuery.selectedPerPage,
  );

  // Get query params from url params
  const {isLoading, error, data} = useQuery<
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
    {refetchOnWindowFocus: false},
  );

  // Set initial state based on route params.

  useEffect(() => {
    const {q, size, filters, from, sort} = router.query;
    setQueryString(prev => {
      let querystring = q;
      if (querystring === undefined) {
        return prev;
      }
      // if query string is empty we return all results
      if (querystring === '') {
        querystring = defaultQuery.queryString;
      }
      return Array.isArray(querystring)
        ? `(${querystring.map(s => encodeString(s.trim())).join('+')})`
        : `${encodeString(querystring.trim())}`;
    });
    setSelectedPage(prev =>
      from ? (Array.isArray(from) ? +from[0] : +from) : prev,
    );

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
        '@type': [],
        keywords: [],
        variableMeasured: [],
        'measurementTechnique.name': [],
        'includedInDataCatalog.name': [],
        ...queryObject,
      };
    });
  }, [router, defaultQuery.queryString]);

  // Update the route to reflect changes on page without re-render.
  const updateRoute = (update: {}) => {
    router.push(
      {
        // pathname: `/search`,
        query: {
          ...router.query,
          ...update,
        },
      },
      undefined,
      {
        shallow: true,
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
        <ErrorMessage message="It's possible that the server is experiencing some issues.">
          <Flex
            flex={1}
            flexDirection={['column', 'column', 'row']}
            justifyContent='center'
          >
            <Button m={1} onClick={() => router.reload()} variant='outline'>
              Retry
            </Button>
            <Button m={1} as='a' href='/'>
              Back to Home
            </Button>
          </Flex>
        </ErrorMessage>
      ) : (
        <Flex w='100%'>
          {/* Filters sidebar */}
          <PageContent w='100%' flexDirection='column'>
            <Heading as='h1' size='md' mb={4}>
              {queryString === '__all__'
                ? 'Showing all results'
                : `Showing search results for ${queryString}`}
            </Heading>
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
            ></FilterTags>
            <Flex>
              <Filters
                searchTerm={queryString}
                facets={{isLoading: isLoading, data: data?.facets}}
                selectedFilters={selectedFilters}
                removeAllFilters={
                  applied_filters.length === 0 ? removeAllFilters : undefined
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
              <Flex flexDirection={'column'} mx={[0, 0, 4]} flex={1}>
                <DisplayResults
                  sortOptions={sort_options}
                  sortOrder={sortOrder}
                  handleSortOrder={sort =>
                    updateRoute({
                      sort,
                      from: defaultQuery.selectedPage,
                    })
                  }
                  selectedPerPage={selectedPerPage}
                  handleSelectedPerPage={v => updateRoute({from: 1, size: v})}
                  total={data?.total || 0}
                >
                  <Pagination
                    selectedPage={selectedPage}
                    handleSelectedPage={v => updateRoute({from: v})}
                    selectedPerPage={selectedPerPage}
                    handleSelectedPerPage={v => updateRoute({from: 1, size: v})}
                    total={data?.total || 0}
                    ariaLabel='paginate through resources top bar'
                  ></Pagination>
                </DisplayResults>

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
                      imageUrl={`${assetPrefix}/assets/empty.png`}
                      imageAlt='Missing information icon.'
                      alignSelf='center'
                      h={'50vh'}
                    >
                      <Text>Search yielded no results, please try again.</Text>
                      <Button href='/' mt={4}>
                        Go to search page.
                      </Button>
                    </Empty>
                  )}
                  <Box flex={3}>
                    <UnorderedList ml={0}>
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
                                  <Card
                                    isLoading={isLoading}
                                    {...result}
                                  ></Card>
                                </ListItem>
                              );
                            }
                          })
                        : null}
                    </UnorderedList>
                  </Box>
                </Stack>
                <Pagination
                  selectedPage={selectedPage}
                  handleSelectedPage={v => updateRoute({from: v})}
                  selectedPerPage={selectedPerPage}
                  handleSelectedPerPage={v => updateRoute({from: 1, size: v})}
                  total={data?.total || 0}
                  ariaLabel='paginate through resources bottom bar'
                ></Pagination>
              </Flex>
            </Flex>
          </PageContent>
        </Flex>
      )}
    </>
  );
};

export default SearchResultsPage;
