import type {NextPage} from 'next';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {useQuery} from 'react-query';
import Empty from 'src/components/empty';
import PageContainer, {PageContent} from 'src/components/page-container';
import {Pagination, Filter, Card} from 'src/components/search-results';
import {fetchSearchResults} from 'src/utils/api';
import {encodeString} from 'src/utils/querystring-helpers';
import {FetchSearchResultsResponse} from 'src/utils/api/types';
import {
  Accordion,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Link,
  ListItem,
  SearchInput,
  Skeleton,
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

const Search: NextPage = () => {
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
  };

  // Currently selected filters.
  const [selectedFilters, setSelectedFilters] = useState(defaultFilters);

  // Currently selected page.
  const [queryString, setQueryString] = useState(defaultQuery.queryString);

  // Currently selected page.
  const [selectedPage, setSelectedPage] = useState(defaultQuery.selectedPage);

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
  const router = useRouter();

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
      },
    ],
    () => {
      const filter_string = queryFilterObject2String(selectedFilters);
      return fetchSearchResults({
        q: filter_string
          ? `${queryString} AND ${filter_string}`
          : `${queryString}`,
        size: `${selectedPerPage}`,
        from: `${(selectedPage - 1) * selectedPerPage}`,
        facet_size: defaultQuery.facetSize,
        facets: defaultQuery.facets.join(','),
      });
    },
  );
  console.log(data);
  // Set initial state based on route params.
  useEffect(() => {
    const {q, size, filters, from} = router.query;

    setQueryString(prev =>
      q
        ? Array.isArray(q)
          ? q.map(s => encodeString(s)).join('+')
          : encodeString(q)
        : prev,
    );

    setSelectedPage(prev =>
      from ? (Array.isArray(from) ? +from[0] : +from) : prev,
    );

    setSelectedPerPage(prev =>
      size ? (Array.isArray(size) ? +size[0] : +size) : prev,
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

  // if no router params.
  if (!router.query.q) {
    return <></>;
  }
  // [ERROR STATE]: API response error
  if (error) {
    return <div>something went wrong</div>;
  }

  // [EMPTY STATE]: No results returned.
  if (!isLoading && (!data || !data.results || data.results.length === 0)) {
    return (
      <PageContainer
        hasNavigation
        title='Search results'
        metaDescription='Search results page.'
      >
        <Empty
          message='No results available.'
          imageUrl='/assets/dataset.png'
          imageAlt='dataset icon'
          alignSelf='center'
        >
          <Text>Search yielded no results, please try again.</Text>
          <Button as={Link} href={'/search'} mt={4}>
            Go to search page.
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  return (
    <>
      {/* import altmetric script for badge embeds */}
      <Script
        type='text/javascript'
        src='https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js'
        strategy='afterInteractive'
      />
      <PageContainer
        hasNavigation
        title='Search results'
        metaDescription='Search results page.'
        p={0}
      >
        <Box w={'100%'}>
          <PageContent bg='white' minH={'unset'}>
            {/* Search bar */}
            {/* [TO DO]: handle change / handleSubmit*/}
            <SearchInput
              ariaLabel='Search for datasets'
              colorScheme='primary'
              handleChange={() => {}}
              handleSubmit={() => {}}
              w='100%'
            />
          </PageContent>

          <PageContent w='100%' flexDirection='column'>
            {/* Chips for filters */}
            <Flex pb={4}>
              {/* hide buttons if no filters are applied. */}
              <Button
                opacity={chips.length > 0 ? 1 : 0}
                mx={1}
                variant='outline'
                onClick={removeAllFilters}
              >
                Clear All
              </Button>
              {chips.map(([filterName, filterValues]) => {
                return filterValues.map(v => {
                  return (
                    <Tag key={v} mx={1} colorScheme='primary'>
                      <TagLabel>{v}</TagLabel>
                      <TagCloseButton
                        onClick={() => removeSelectedFilter(filterName, v)}
                      />
                    </Tag>
                  );
                });
              })}
            </Flex>
            <Heading as='h1' size='md'>
              Search Results
            </Heading>
            <Pagination
              selectedPage={selectedPage}
              handleSelectedPage={v => updateRoute({from: v})}
              selectedPerPage={selectedPerPage}
              handleSelectedPerPage={v => updateRoute({from: 1, size: v})}
              total={totalItems}
            />
            <Flex>
              <Box
                w={400}
                position='sticky'
                h='100vh'
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
                  {facets &&
                    Object.entries(facets).map(([filterKey, filterValue]) => {
                      return (
                        <Filter
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
                        ></Filter>
                      );
                    })}
                </Accordion>
              </Box>
              <Box flex={1} px={6}>
                <UnorderedList>
                  {data?.results &&
                    data.results.map(result => {
                      return (
                        <ListItem key={result.id} my={4}>
                          <Skeleton isLoaded={!isLoading}>
                            <Card {...result}></Card>
                          </Skeleton>
                        </ListItem>
                      );
                    })}
                </UnorderedList>
              </Box>
            </Flex>
          </PageContent>
        </Box>
      </PageContainer>
    </>
  );
};

export default Search;
