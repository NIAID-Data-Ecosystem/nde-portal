import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Flex,
  Link,
  ListItem,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import {
  queryFilterObject2String,
  queryFilterString2Object,
  updateRoute,
} from 'src/components/filters/helpers';
import { Pagination } from './components/pagination';
import { useHasMounted } from 'src/hooks/useHasMounted';
import { SortDropdown } from './components/sort';
import { encodeString } from 'src/utils/querystring-helpers';
import { SelectedFilterType } from '../filters/types';
import { defaultQuery } from './helpers';
import { MetadataScoreToggle } from './components/metadata-score-toggle';
import { useQuerySearchResults } from './hooks/useSearchResults';
import ResultsCount from 'src/components/search-results-page/components/count';
import { FILTERS_CONFIG } from './components/filters/helpers';
import Card from './components/card';
import { FormattedResource } from 'src/utils/api/types';
import { ErrorCTA } from '../error';
import { Error } from 'src/components/error';
import { getQueryStatusError } from '../error/utils';
import { DownloadMetadata } from '../download-metadata';

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
  const [shouldUseMetadataScore, setShouldUseMetadataScore] = useState(true);

  const hasMounted = useHasMounted();
  const router = useRouter();

  // Currently selected filters.
  const defaultFilters = useMemo(
    () => Object.keys(FILTERS_CONFIG).reduce((r, k) => ({ ...r, [k]: [] }), {}),
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

  // Query Parameters
  const filter_string = queryFilterObject2String(selectedFilters);

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

  const getQueryString = () => {
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
  };
  const querystring = getQueryString();

  const params = {
    // don't escape parenthesis or colons when its an advanced search
    q: router.query.advancedSearch ? querystring : encodeString(querystring),
    extra_filter: filter_string || '', // extra filter updates aggregate fields
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
  };

  const [total, setTotal] = useState<number>(initialTotal);

  const { isLoading, isRefetching, error, data } = useQuerySearchResults(
    params,
    {
      // Don't refresh everytime window is touched.
      refetchOnWindowFocus: false,
      enabled: router.isReady,
      onSuccess: data => {
        setTotal(data?.total || 0);
      },
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

  // number of cards to show on the page
  const numCards = useMemo(
    () => Math.min(data?.results.length || selectedPerPage, selectedPerPage),
    [data?.results.length, selectedPerPage],
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
    <Flex w='100%' flexDirection='column' mx={[0, 0, 4]} flex={[1, 2]}>
      <Flex
        w='100%'
        borderBottom='2px solid'
        borderColor='gray.700'
        flexWrap={{ base: 'wrap-reverse', sm: 'wrap' }}
        justifyContent='space-between'
        alignItems='center'
      >
        <ResultsCount
          isLoading={isLoading || isRefetching || !router.isReady}
          total={total}
        />
      </Flex>

      {/* Search results controls */}
      <Box borderRadius='semi' boxShadow='base' bg='white' px={4} py={2}>
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
            handleSelectedPerPage={v => handleRouteUpdate({ from: 1, size: v })}
          />
          <DownloadMetadata
            flex={1}
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
      </Box>
      {/* Results Cards */}
      <UnorderedList className='search-results-cards' ml={0} flex={3} w='100%'>
        {Array(numCards)
          .fill(null)
          .map((_, idx) => {
            return (
              <ListItem key={idx} my={4} mb={8}>
                <Card
                  isLoading={!router.isReady || isLoading || isRefetching}
                  data={data?.results[idx]}
                />
              </ListItem>
            );
          })}
      </UnorderedList>
    </Flex>
  );
};

export default SearchResultsPage;
