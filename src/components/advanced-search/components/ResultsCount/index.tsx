import { Flex, Heading, Spinner } from 'nde-design-system';
import { useQuery } from 'react-query';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { formatNumber } from 'src/utils/helpers';

interface ResultsCountProps {
  queryString: string;
}

export const ResultsCount: React.FC<ResultsCountProps> = ({ queryString }) => {
  // Get total count of results based on query string.
  const { isLoading, error, data } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    [
      'search-results',
      {
        queryString,
      },
    ],
    () => {
      if (typeof queryString !== 'string' && !queryString) {
        return;
      }

      return fetchSearchResults({
        q: queryString,
        size: 0,
      });
    },
    // Don't refresh everytime window is touched.
    { refetchOnWindowFocus: false, enabled: !!queryString },
  );

  if ((!isLoading && !data) || error) {
    return <></>;
  }

  return (
    <Flex w='100%' justifyContent='flex-end'>
      <Heading
        as='h3'
        fontSize='md'
        fontWeight='medium'
        bg='blackAlpha.50'
        p={2}
        px={4}
      >
        {isLoading ? (
          <Spinner
            color='primary.500'
            emptyColor='gray.200'
            thickness='2px'
            mx={2}
          ></Spinner>
        ) : (
          <Heading as='span' mx={1} size='inherit' color='inherit'>
            {data?.total ? formatNumber(data.total) : 0}
          </Heading>
        )}
        result{data?.total === 1 ? '' : 's'}
      </Heading>
    </Flex>
  );
};
