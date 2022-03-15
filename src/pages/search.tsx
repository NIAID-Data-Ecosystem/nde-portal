import type {NextPage} from 'next';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {useQuery} from 'react-query';
import Empty from 'src/components/empty';
import PageContainer from 'src/components/page-container';
import {
  SearchResultCard,
  List,
  Pagination,
} from 'src/components/search-results';
import {fetchSearchResults} from 'src/utils/api';
import {encodeString} from 'src/utils/querystring-helpers';
import {FetchSearchResultsResponse} from 'src/utils/api/types';
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Skeleton,
  Text,
} from 'nde-design-system';

const Search: NextPage = () => {
  // Default config for query.
  const defaultQuery = {
    queryString: '__all__',
    selectedPage: 1,
    selectedPerPage: 10,
  };

  const facets = [
    '_index',
    'variableMeasured',
    'measurementTechnique',
    'keywords',
  ];
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

  // Get query params from url params
  const router = useRouter();

  // Set initial state based on route params.
  useEffect(() => {
    // Add filters
    const {q, size, from} = router.query;

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
  }, [router]);

  // Update the route to reflect changes on page without re-render.
  const updateRoute = (update: any) => {
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

  const {isLoading, error, data} = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    [
      'search-results',
      {q: queryString, size: selectedPerPage, from: selectedPage},
    ],
    () =>
      fetchSearchResults({
        q: queryString,
        size: `${selectedPerPage}`,
        from: `${(selectedPage - 1) * selectedPerPage}`,
      }),
  );

  useEffect(() => {
    setTotalItems(prev => data?.total || prev);
  }, [data?.total]);

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
    <PageContainer
      hasNavigation
      title='Search results'
      metaDescription='Search results page.'
    >
      <Box w={'100%'}>
        <Heading as={'h1'} size={'h4'}>
          Search Results
        </Heading>
        <Pagination
          selectedPage={selectedPage}
          handleSelectedPage={v => updateRoute({from: v})}
          selectedPerPage={selectedPerPage}
          handleSelectedPerPage={v => updateRoute({from: 1, size: v})}
          total={totalItems}
        />
      </Box>
      {/* filters */}
      {/* {data?.hits.length === 0 ? (
        <Empty message='Search yielded no results.' />
      ) : (
        <List isLoading={isLoading} error={error}>
          <ul>
            {data?.hits.map(result => {
              // Card
              return (
                <SearchResultCard
                  key={result?._id}
                  id={result?.identifier}
                  title={result?.name}
                  authorDetails={result?.creator}
                  description={result?.description}
                  accessType={'unrestricted'}
                  keywords={result?.keywords || []}
                  sourceDetails={{
                    id: result?._id,
                    imageUrl: result?.image,
                    name: result?.curatedBy?.name,
                    url: result?.url,
                  }}
                />
              );
            })}
          </ul>
        </List>
      )} */}
    </PageContainer>
  );
};

export default Search;
