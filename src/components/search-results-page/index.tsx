import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Link,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import {
  queryFilterObject2String,
  updateRoute,
} from 'src/components/filters/helpers';
import { MAX_PAGES, Pagination } from './components/pagination';
import { SortDropdown } from './components/sort';
import { SelectedFilterType } from '../filters/types';
import { defaultQuery } from './helpers';
import { MetadataScoreToggle } from './components/metadata-score-toggle';
import { useQuerySearchResults } from './hooks/useSearchResults';
import Card from './components/card';
import { FormattedResource } from 'src/utils/api/types';
import { ErrorCTA } from '../error';
import { Error } from 'src/components/error';
import { getQueryStatusError } from '../error/utils';
import { DownloadMetadata } from '../download-metadata';
import Empty from 'src/components/empty';
import NextLink from 'next/link';
import Banner from '../banner';
import { formatNumber } from 'src/utils/helpers';
import ResultsCount from 'src/components/search-results-page/components/count';

/*
[COMPONENT INFO]:
 Search results pages displays the list of records returned by a search.
 Contains filters, filter tags, search results cards.
*/

const SearchResultsPage = ({
  results,
  total: initialTotal,
  selectedFilters,
  querystring,
}: {
  results: FormattedResource[];
  total: number;
  selectedFilters: SelectedFilterType;
  querystring: string;
}) => {
  const [shouldUseMetadataScore, setShouldUseMetadataScore] = useState(true);

  const router = useRouter();

  // Currently selected page.
  const [selectedPage, setSelectedPage] = useState(defaultQuery.selectedPage);

  const [sortOrder, setSortOrder] = useState(defaultQuery.sortOrder);

  //  Items per page to show
  const [selectedPerPage, setSelectedPerPage] = useState(
    defaultQuery.selectedPerPage,
  );

  // Set initial state based on route params.
  useEffect(() => {
    const { size, from, sort } = router.query;

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
  }, [router]);

  const params = useMemo(
    () => ({
      // don't escape parenthesis or colons when its an advanced search
      q: querystring,
      extra_filter: queryFilterObject2String(selectedFilters) || '', // extra filter updates aggregate fields
      size: `${selectedPerPage}`,
      from: `${(selectedPage - 1) * selectedPerPage}`,
      sort: sortOrder,
      use_metadata_score: shouldUseMetadataScore ? 'true' : 'false',
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
    }),
    [
      querystring,
      selectedFilters,
      selectedPerPage,
      selectedPage,
      sortOrder,
      shouldUseMetadataScore,
    ],
  );

  const { isLoading, isRefetching, error, data } = useQuerySearchResults(
    params,
    {
      // Don't refresh everytime window is touched.
      refetchOnWindowFocus: false,
      enabled: router.isReady,
      initialData: { results, total: initialTotal, facets: {} },
    },
  );

  // Update the route to reflect changes on page without re-render.
  const handleRouteUpdate = useCallback(
    (update: {}) => updateRoute(update, router),
    [router],
  );

  const handleMetadataScoreToggle = useCallback(
    () => setShouldUseMetadataScore(prev => !prev),
    [],
  );

  const numCards = useMemo(
    () =>
      Math.min(
        isLoading ? selectedPerPage : data?.results.length || 0,
        selectedPerPage,
      ),
    [isLoading, data?.results?.length, selectedPerPage],
  );

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
    <Flex w='100%' flexDirection='column' flex={[1, 2]}>
      {/* <Flex
        bg='white'
        border='1px solid'
        borderColor='gray.100'
        mb={1}
        borderRadius='semi'
        py={2}
        px={4}
        flexDirection='column'
      >
        <ResultsCount
          total={initialTotal}
          querystring={querystring}
          selectedFilters={selectedFilters}
          isEnabled={router.isReady}
        />
      </Flex> */}
      {/* Search results controls */}
      {numCards > 0 && (
        <Stack borderRadius='semi' boxShadow='base' bg='white' px={4} py={2}>
          <MetadataScoreToggle
            isChecked={shouldUseMetadataScore}
            isDisabled={sortOrder !== '_score'}
            handleToggle={handleMetadataScoreToggle}
          />
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
            total={data?.total || initialTotal || 0}
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
      {!isLoading && (!data || data.results.length === 0) && (
        <Empty message='No results found.' alignSelf='center' h='50vh'>
          <Text>Search yielded no results, please try again.</Text>
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
                  />
                </ListItem>
              );
            })}
        </UnorderedList>
      )}
    </Flex>
  );
};

export default SearchResultsPage;
