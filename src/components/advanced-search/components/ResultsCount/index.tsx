import { Flex, Heading, Spinner } from '@chakra-ui/react';
import { useQuery } from 'react-query';
import { getQueryStatusError } from 'src/components/error/utils';
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
    {
      refetchOnWindowFocus: false,
      enabled: !!queryString,
      retry: 1,
      onError: error => {
        const errorMessage = getQueryStatusError(
          error as unknown as { status: string },
        );
        handleErrors(errorMessage ? [errorMessage] : []);
      },
      onSuccess: res => {
        setCount(res?.total || 0);
        if (res?.total === 0) {
          handleErrors([
            {
              id: 'no-results',
              type: 'warning',
              title: 'Search generates no results.',
              message:
                'Your search query has no errors but it generates 0 results. Try making it more general.',
            },
          ]);
        }
      },
    },
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
