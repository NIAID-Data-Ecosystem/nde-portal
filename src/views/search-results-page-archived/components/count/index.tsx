import React from 'react';
import { Flex, Spinner, Text, TextProps } from '@chakra-ui/react';
import { formatNumber } from 'src/utils/helpers';

// [COMPONENT INFO]: Displays total results count

interface ResultsCount extends TextProps {
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
    <>
      {isLoading ? (
        <Spinner
          color='primary.500'
          emptyColor='gray.200'
          size='md'
          speed='0.5s'
          thickness='1px'
          mr={2}
          mb={1}
        />
      ) : (
        <Text mr={1} fontSize='2xl' fontWeight='semibold' {...props}>
          {formatNumber(total)}
          <Text
            as='span'
            fontSize='md'
            fontWeight='semibold'
            lineHeight='short'
            ml={1}
          >
            Result{total !== 1 ? 's' : ' '}
          </Text>
        </Text>
      )}
    </>
  );
};

export default ResultsCount;
