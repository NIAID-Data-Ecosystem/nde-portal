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
  Circle,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  ListItem,
  Stack,
  Switch,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { FaInfo } from 'react-icons/fa6';
import { Link } from 'src/components/link';
import {
  queryFilterObject2String,
  queryFilterString2Object,
  updateRoute,
} from 'src/components/filters/helpers';
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
import { encodeString } from 'src/utils/querystring-helpers';
import { SelectedFilterType } from '../filters/types';
// import { AdvancedSearchWithModal } from '../advanced-search/AdvancedSearchWithModal';
import { getQueryStatusError } from '../error/utils';
import Tooltip from '../tooltip';
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
  { name: 'A-Z', sortBy: 'name.raw', orderBy: 'asc' },
  { name: 'Z-A', sortBy: 'name.raw', orderBy: 'desc' },
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
  const [useMetadataScore, setUseMetadataScore] = useState(true);

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
    use_metadata_score: useMetadataScore ? 'true' : 'false',
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
        show_meta: true,
        size: params.size,
        from: params.from,
        sort: params.sort,
        use_metadata_score: params.use_metadata_score,
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
    },

    // Don't refresh everytime window is touched.
    {
      refetchOnWindowFocus: false,
      enabled: !!hasMounted,
      // set total state based on total property
      onSuccess: data => {
        if (data?.total) {
          setTotal(data.total);
        }
      },
    },
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

  // Update the route to reflect changes on page without re-render.
  const handleRouteUpdate = useCallback(
    (update: {}) => updateRoute(update, router),
    [router],
  );

  if (!hasMounted || !router.isReady) {
    return <></>;
  }
  if (error) {
    const errorMessage =
      error && getQueryStatusError(error as unknown as { status: string });
    return (
      // [ERROR STATE]: API response error
      <Error>
        <Flex flexDirection='column' alignItems='center'>
          <Text>
            {errorMessage?.message ||
              'It’s possible that the server is experiencing some issues.'}{' '}
            {errorMessage?.relatedLinks &&
              errorMessage?.relatedLinks?.length > 0 &&
              errorMessage.relatedLinks.map(
                ({ label, href, isExternal }, idx) => {
                  return (
                    <Link
                      key={`${label}-${idx}`}
                      href={href}
                      isExternal={isExternal}
                    >
                      {label}
                    </Link>
                  );
                },
              )}
          </Text>

          <Box mt={4}>
            <ErrorCTA>
              <Button onClick={() => router.reload()} variant='outline'>
                Retry
              </Button>
            </ErrorCTA>
          </Box>
        </Flex>
      </Error>
    );
  }

  return (
    <Flex w='100%' flexDirection='column' mx={[0, 0, 4]} flex={[1, 2]}>
      <Flex
        w='100%'
        borderBottom='2px solid'
        borderColor='gray.700'
        flexWrap={{ base: 'wrap-reverse', sm: 'wrap' }}
        justifyContent='space-between'
        alignItems='center'
      >
        <ResultsCount total={total} isLoading={isLoading} />
        {/* <Box my={2}>
            // <AdvancedSearchWithModal
              querystring={queryString === '__all__' ? '' : queryString}
              buttonProps={{ children: 'View query in Advanced Search' }}
            />
          </Box> */}
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
          <DownloadMetadata
            exportFileName={`nde-results-${queryString.replaceAll(' ', '_')}`}
            params={params}
            buttonProps={{ variant: 'outline' }}
          >
            Download Metadata
          </DownloadMetadata>

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
            <FormControl display='flex' alignItems='center' mx={1} my={2}>
              <Tooltip
                bg='white'
                isDisabled={sortOrder !== '_score'}
                label={
                  <Box color='text.body' lineHeight='shorter' p={1}>
                    <Text color='inherit' pb={1.5}>
                      Ranks results based on the presence of unique fields.
                    </Text>
                    <Text color='inherit' pb={1.5}>
                      First scores by query, then refines rankings with an
                      additional function score.
                    </Text>
                    <Text color='inherit' pb={1.5}>
                      Adjusts results based on a calculated metadata score.
                    </Text>
                  </Box>
                }
                hasArrow
                gutter={2}
              >
                <FormLabel
                  htmlFor='metadata-score-toggle'
                  mb='0'
                  mr={2}
                  display='flex'
                  alignItems='start'
                  opacity={sortOrder !== '_score' ? 0.4 : 1}
                >
                  Use Metadata Score?
                  <Circle
                    size={4}
                    borderColor='gray.600'
                    borderWidth='1px'
                    color='gray.600'
                    ml={1}
                  >
                    <Icon as={FaInfo} boxSize={2} />
                  </Circle>
                </FormLabel>
              </Tooltip>
              <Switch
                id='metadata-score-toggle'
                isChecked={useMetadataScore}
                onChange={() => setUseMetadataScore(prev => !prev)}
                colorScheme='secondary'
                isDisabled={sortOrder !== '_score'}
              />
            </FormControl>
          </Box>
        </Flex>
      </Pagination>

      {/* Display banner on last page if results exceed amount allotted by API */}
      <Collapse
        in={selectedPage === Math.floor(MAX_PAGES / selectedPerPage)}
        animateOpacity
      >
        <Banner status='info'>
          Only the first {formatNumber(10000)} results are displayed, please
          limit your query to get better results or use our API to download all
          results.
        </Banner>
      </Collapse>
      <Stack direction='row' justifyContent='space-between' flex={1} w='100%'>
        {/* Results Cards */}
        {/* Empty state if no results found */}
        {!isLoading && (!data || data.results.length === 0) && (
          <Empty message='No results found.' alignSelf='center' h='50vh'>
            <Text>Search yielded no results, please try again.</Text>
            <NextLink href={{ pathname: '/search' }}>
              <Button mt={4}>Go to search</Button>
            </NextLink>
          </Empty>
        )}

        <UnorderedList
          className='search-results-cards'
          ml={0}
          flex={3}
          w='100%'
        >
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
  );
};

export default SearchResultsPage;
