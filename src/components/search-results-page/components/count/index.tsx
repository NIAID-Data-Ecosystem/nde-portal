import React from 'react';
import { Flex, Heading, HeadingProps, Spinner } from '@chakra-ui/react';
import { formatNumber } from 'src/utils/helpers';

// [COMPONENT INFO]: Displays total results count

interface ResultsCount extends HeadingProps {
  // Total number of results
  total: number;
  // Data loading mechanism
  isLoading: boolean;
}

const ResultsCount: React.FC<ResultsCount> = ({
  isLoading,
  total,
  ...props
}) => {
  return (
    <Flex
      alignItems='baseline'
      fontSize='md'
      fontWeight='semibold'
      lineHeight='short'
    >
      {isLoading ? (
        <Spinner
          color='primary.500'
          emptyColor='gray.200'
          size='md'
          speed='0.5s'
          thickness='1px'
          mr={1}
        />
      ) : (
        <Heading as='h2' mr={1} fontSize='2xl' fontWeight='inherit' {...props}>
          {formatNumber(total)}
        </Heading>
      )}
      Result{total !== 1 ? 's' : ' '}
    </Flex>
  );
};

export default ResultsCount;
