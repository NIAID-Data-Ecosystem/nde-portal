import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Collapse,
  Flex,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import {
  queryFilterObject2String,
  queryFilterString2Object,
  updateRoute,
} from 'src/views/search-results-page/helpers';
import { MAX_PAGES, Pagination } from './components/pagination';
import { SortDropdown } from './components/sort';
import { encodeString, RESERVED_CHARS } from 'src/utils/querystring-helpers';
import { defaultQuery } from './helpers';
import { useQuerySearchResults } from './hooks/useSearchResults';
import ResultsCount from 'src/views/search-results-page/components/count';
import Card from './components/card';
import { FormattedResource } from 'src/utils/api/types';
import Empty from 'src/components/empty';
import NextLink from 'next/link';
import { formatNumber } from 'src/utils/helpers';
import { ErrorMessage } from './components/error';
import { Link } from 'src/components/link';
import { DownloadMetadata } from 'src/components/download-metadata';
import Banner from 'src/components/banner';
import { FILTER_CONFIGS } from './components/filters/config';
import { SelectedFilterType } from './components/filters/types';

/*
[COMPONENT INFO]:
 Search results pages displays the list of records returned by a search.
 Contains filters, filter tags, search results cards.
*/

const SearchResultsPage = ({
  results,
  total: initialTotal,
}: {
  results: FormattedResource[];
  total: number;
}) => {
  const router = useRouter();

  // Currently selected filters.
  const defaultFilters = useMemo(
    () =>
      FILTER_CONFIGS.reduce(
        (r, { property }) => ({ ...r, [property]: [] }),
        {},
      ),
    [],
  );

  const [selectedFilters, setSelectedFilters] =
    useState<SelectedFilterType>(defaultFilters);

  // Currently selected page.
  const [selectedPage, setSelectedPage] = useState(defaultQuery.selectedPage);

  const [sortOrder, setSortOrder] = useState(defaultQuery.sortOrder);

  //  Items per page to show
  const [selectedPerPage, setSelectedPerPage] = useState(
    defaultQuery.selectedPerPage,
  );

  // Set initial state based on route params.
  useEffect(() => {
    const { size, filters, from, sort } = router.query;

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

  const params = useMemo(
    () => ({
      // don't escape parenthesis or colons when its an advanced search
      q: querystring,
      extra_filter: queryFilterObject2String(selectedFilters) || '', // extra filter updates aggregate fields
      size: `${selectedPerPage}`,
      from: `${(selectedPage - 1) * selectedPerPage}`,
      sort: sortOrder,
      show_meta: true,
      fields: [
        '_meta',
        '@type',
        'alternateName',
        'applicationCategory',
        'author',
        'availableOnDevice',
        'conditionsOfAccess',
        'date',
        'description',
        'doi',
        'featureList',
        'funding',
        'healthCondition',
        'includedInDataCatalog',
        'infectiousAgent',
        'input',
        'isAccessibleForFree',
        'license',
        'measurementTechnique',
        'name',
        'operatingSystem',
        'output',
        'programmingLanguage',
        'sdPublisher',
        'softwareHelp',
        'softwareRequirements',
        'softwareVersion',
        'species',
        'topicCategory',
        'url',
        'usageInfo',
        'variableMeasured',
      ],
    }),
    [querystring, selectedFilters, selectedPerPage, selectedPage, sortOrder],
  );

  const { isLoading, isRefetching, error, data } = useQuerySearchResults(
    params,
    {
      queryKey: ['search-results', params],
      // Don't refresh everytime window is touched.
      refetchOnWindowFocus: false,
      enabled: router.isReady,
      initialData: { results, total: initialTotal, facets: {} },
    },
  );
  const total = data?.total || 0;

  // Update the route to reflect changes on page without re-render.
  const handleRouteUpdate = useCallback(
    (update: {}) => updateRoute(update, router),
    [router],
  );

  const numCards = useMemo(
    () =>
      Math.min(
        isLoading ? selectedPerPage : data?.results?.length || 0,
        selectedPerPage,
      ),
    [isLoading, data?.results?.length, selectedPerPage],
  );

  if (error) {
    return <ErrorMessage error={error} querystring={querystring} />;
  }
  return (
    <Flex w='100%' flexDirection='column' flex={[1, 2]}>
      {/* Number of search results */}
      <ResultsCount
        isLoading={isLoading || isRefetching || !router.isReady}
        total={total}
      />

      {/* Search results controls */}
      {numCards > 0 && (
        <Stack borderRadius='semi' boxShadow='base' bg='white' px={4} py={2}>
          <Flex
            borderBottom={{ base: '1px solid' }}
            borderColor={{ base: 'page.alt' }}
            flexDirection={{ base: 'column-reverse', md: 'row' }}
            alignItems={{ base: 'unset', md: 'center' }}
            pb={2}
          >
            <SortDropdown
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
            <DownloadMetadata
              flex={1}
              pb={{ base: 2, md: 0 }}
              exportFileName={`nde-results-${querystring.replaceAll(' ', '_')}`}
              params={params}
              buttonProps={{ variant: 'outline' }}
            >
              Download Metadata
            </DownloadMetadata>
          </Flex>

          <Pagination
            id='pagination-top'
            ariaLabel='paginate through resources top bar'
            handleSelectedPage={from => {
              handleRouteUpdate({ from });
            }}
            isLoading={isLoading}
            selectedPage={selectedPage}
            selectedPerPage={selectedPerPage}
            total={total}
          />
        </Stack>
      )}

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

      {/* Empty state if no results found */}
      {!isLoading && (!data || data?.results?.length === 0) && (
        <Empty message='No results found.' alignSelf='center'>
          <Text>No results found. Please try again.</Text>
          <Box
            p={4}
            m={4}
            border='1px solid'
            borderRadius='semi'
            borderColor='page.placeholder'
            bg='niaid.50'
          >
            <Text fontWeight='medium'>Suggestions:</Text>
            <UnorderedList styleType='disc' spacing={1} lineHeight='short'>
              <ListItem listStyleType='inherit'>
                Try using more general keywords.
              </ListItem>
              <ListItem listStyleType='inherit'>
                Use different or fewer keywords.
              </ListItem>
              <ListItem listStyleType='inherit'>
                Ensure that the use of reserved fields in fielded queries are
                intentional and followed by a colon.
              </ListItem>
              <ListItem listStyleType='inherit'>
                Ensure reserved characters ( {RESERVED_CHARS.join(' ')}) are
                preceded by a backslash (\).
              </ListItem>
              <ListItem>
                <Link href={'/docs/advanced-searching'} isExternal>
                  For more information, see the documentation.
                </Link>
              </ListItem>
            </UnorderedList>
          </Box>
          <NextLink href={{ pathname: '/search' }}>
            <Button mt={4}>Go to search</Button>
          </NextLink>
        </Empty>
      )}

      {/* Results Cards */}
      {numCards > 0 && (
        <UnorderedList
          className='search-results-cards'
          ml={0}
          flex={3}
          w='100%'
        >
          {Array(numCards)
            .fill(null)
            .map((_, idx) => {
              return (
                <ListItem key={idx} my={4} mb={8}>
                  <Card
                    isLoading={!router.isReady || isLoading || isRefetching}
                    data={data?.results[idx]}
                    referrerPath={router.asPath}
                    querystring={querystring}
                  />
                </ListItem>
              );
            })}
        </UnorderedList>
      )}

      {numCards > 0 && (
        <Flex borderRadius='semi' boxShadow='base' bg='white' px={4} py={2}>
          <Pagination
            id='pagination-bottom'
            ariaLabel='paginate through resources bottom bar'
            handleSelectedPage={from => {
              handleRouteUpdate({ from });
            }}
            isLoading={isLoading}
            selectedPage={selectedPage}
            selectedPerPage={selectedPerPage}
            total={total}
          />
        </Flex>
      )}
    </Flex>
  );
};

export default SearchResultsPage;
