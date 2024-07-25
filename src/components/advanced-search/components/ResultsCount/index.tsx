import { useEffect } from 'react';
import { Flex, Heading, Spinner } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { formatNumber } from 'src/utils/helpers';
import { QueryStringError } from 'src/components/error/types';

interface ResultsCountProps {
  queryString: string;
  handleErrors: (errors: QueryStringError[]) => void;
  setCount: (count: number) => void;
}

export const ResultsCount: React.FC<ResultsCountProps> = ({
  queryString,
  handleErrors,
  setCount,
}) => {
  // Get total count of results based on query string.
  const { isLoading, error, data } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    // Don't refresh everytime window is touched.
    {
      queryKey: [
        'search-results',
        {
          queryString,
        },
      ],
      queryFn: () => {
        if (typeof queryString !== 'string' && !queryString) {
          return;
        }

        return fetchSearchResults({
          q: queryString,
          size: 0,
        });
      },
      enabled: !!queryString,
      retry: 1,
    },
  );

  useEffect(() => {
    setCount(data?.total || 0);
  }, [data, setCount]);

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
