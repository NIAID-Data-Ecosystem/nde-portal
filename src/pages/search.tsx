import type {NextPage} from 'next';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {useQuery} from 'react-query';
import Empty from 'src/components/empty';
import {
  PageContainer,
  PageContent,
  SearchBar,
} from 'src/components/page-container';
import {Filter, Card} from 'src/components/search-results';
import {fetchSearchResults} from 'src/utils/api';
import {encodeString} from 'src/utils/querystring-helpers';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import {
  Accordion,
  Box,
  Button,
  Collapse,
  Flex,
  Heading,
  ListItem,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  UnorderedList,
} from 'nde-design-system';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from 'src/components/search-results/helpers';
import Script from 'next/script';
import LoadingSpinner from 'src/components/loading';
import ErrorMessage from 'src/components/error';
import {
  Pagination,
  DisplayResults,
} from 'src/components/search-results/components/pagination';
import {ButtonGroup} from '@chakra-ui/button';
import {useHasMounted} from 'src/hooks/useHasMounted';

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

const Search: NextPage = () => {
  const hasMounted = useHasMounted();
  const router = useRouter();

  const defaultFilters: {
    [key: string]: (string | number)[];
  } = {
    keywords: [],
    variableMeasured: [],
    measurementTechnique: [],
    'curatedBy.name': [],
    'includedInDataCatalog.name': [],
  };

  // Default config for query.
  const defaultQuery = {
    queryString: '',
    selectedPage: 1,
    selectedPerPage: 10,
    facets: Object.keys(defaultFilters),
    facetSize: 1000,
    sortOrder: '_score', // defaults to score
  };

  // Currently selected filters.
  const [selectedFilters, setSelectedFilters] = useState(defaultFilters);

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

  //  Total items
  const [totalItems, setTotalItems] = useState(0);

  //  Facets that are applies to search results
  const [facets, setFacets] = useState<
    FetchSearchResultsResponse['facets'] | null
  >(null);

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
      if (!queryString) {
        return;
      }
      const filter_string = queryFilterObject2String(selectedFilters);
      return fetchSearchResults({
        q: filter_string
          ? `${queryString} AND ${filter_string}`
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
    setQueryString(prev =>
      q
        ? Array.isArray(q)
          ? `(${q.map(s => encodeString(s)).join('+')})`
          : `(${encodeString(q)})`
        : prev,
    );
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
      return (
        queryObject || {
          keywords: [],
          variableMeasured: [],
          measurementTechnique: [],
          'curatedBy.name': [],
          'includedInDataCatalog.name': [],
        }
      );
    });
  }, [router]);

  // Total number of results
  useEffect(() => {
    setTotalItems(prev => data?.total || prev);
  }, [data?.total]);

  useEffect(() => {
    setFacets(prev => data?.facets || prev);
  }, [data?.facets]);

  // Update the route to reflect changes on page without re-render.
  const updateRoute = (update: {}) => {
    router.push(
      {
        pathname: '/search',
        query: {
          ...router.query,
          ...update,
        },
      },
      undefined,
      {
        // prevents re-render
        shallow: true,
      },
    );
  };

  // Display applied filters as tags
  const chips = Object.entries(selectedFilters).filter(
    ([_, filters]) => filters.length > 0,
  );

  const removeSelectedFilter = (name: string, value: string | number) => {
    const filterValues = selectedFilters[name].filter(v => v !== value);
    setSelectedFilters(() => {
      return {...selectedFilters, [name]: filterValues};
    });
  };

  const removeAllFilters = () => {
    return updateRoute({
      from: defaultQuery.selectedPage,
      filters: defaultFilters,
    });
  };

  // [FIX]: altmetric badges need this to render properly on data update.
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
      <PageContainer
        hasNavigation
        title='Search results'
        metaDescription='Search results page.'
        px={0}
        py={0}
      >
        <Box w={'100%'}>
          <SearchBar value={router.query.q || ''} />
          <PageContent w='100%' flexDirection='column' minW={'740px'}>
            {error ? (
              // [ERROR STATE]: API response error
              <ErrorMessage message="It's possible that the server is experiencing some issues.">
                <ButtonGroup>
                  <Button onClick={() => router.reload()} variant='outline'>
                    Retry
                  </Button>
                  <Button as='a' href='/'>
                    Back to Home
                  </Button>
                </ButtonGroup>
              </ErrorMessage>
            ) : (
              <>
                {/* Chips for filters */}
                {/* hide buttons if no filters are applied. */}
                <Collapse in={chips.length > 0}>
                  <Flex pb={4}>
                    <Button mx={1} variant='outline' onClick={removeAllFilters}>
                      Clear All
                    </Button>
                    {chips.map(([filterName, filterValues]) => {
                      return filterValues.map(v => {
                        return (
                          <Tag key={v} mx={1} colorScheme='primary'>
                            <TagLabel>{v}</TagLabel>
                            <TagCloseButton
                              onClick={() =>
                                removeSelectedFilter(filterName, v)
                              }
                            />
                          </Tag>
                        );
                      });
                    })}
                  </Flex>
                </Collapse>
                <Heading as='h1' size='md'>
                  Search Results
                </Heading>

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
                  total={totalItems}
                >
                  <Pagination
                    selectedPage={selectedPage}
                    handleSelectedPage={v => updateRoute({from: v})}
                    selectedPerPage={selectedPerPage}
                    handleSelectedPerPage={v => updateRoute({from: 1, size: v})}
                    total={totalItems}
                  ></Pagination>
                </DisplayResults>

                <Stack
                  direction='row'
                  justifyContent='space-between'
                  flex={1}
                  w={'100%'}
                >
                  {/* Filters sidebar */}
                  {/* [TO DO]: Render version for mobile. */}
                  <Box
                    flex={1}
                    minW='240px'
                    h='auto'
                    position='sticky'
                    top='62px'
                    boxShadow='base'
                    background='white'
                    borderRadius='semi'
                    my={4}
                    overflowY='auto'
                  >
                    <Flex
                      justifyContent={'space-between'}
                      px={4}
                      py={4}
                      alignItems='center'
                    >
                      <Heading size={'sm'} fontWeight={'normal'}>
                        Filters
                      </Heading>

                      <Button
                        variant={'outline'}
                        size='sm'
                        onClick={removeAllFilters}
                        isDisabled={chips.length === 0}
                      >
                        clear all
                      </Button>
                    </Flex>
                    <Accordion bg={'white'} allowMultiple defaultIndex={[0]}>
                      {facets ? (
                        Object.entries(facets).map(
                          ([filterKey, filterValue]) => {
                            return (
                              <Filter
                                isLoading={isLoading}
                                key={filterKey}
                                name={filterKey}
                                terms={filterValue.terms}
                                selectedFilters={selectedFilters[filterKey]}
                                handleSelectedFilters={updatedFilters => {
                                  let filters = queryFilterObject2String({
                                    ...selectedFilters,
                                    ...updatedFilters,
                                  });
                                  updateRoute({
                                    from: defaultQuery.selectedPage,
                                    filters,
                                  });
                                }}
                              />
                            );
                          },
                        )
                      ) : (
                        <LoadingSpinner isLoading={isLoading}></LoadingSpinner>
                      )}
                    </Accordion>
                  </Box>

                  {/* Results Cards */}
                  {/* Empty state if no results found */}
                  {!isLoading && (!data || data.results.length === 0) && (
                    <Empty
                      message='No results found.'
                      imageUrl='/assets/empty.png'
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
                    <UnorderedList>
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
                  total={totalItems}
                ></Pagination>
              </>
            )}
          </PageContent>
        </Box>
      </PageContainer>
    </>
  );
};

export default Search;
