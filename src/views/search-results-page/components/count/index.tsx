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
    <Flex
      w='100%'
      borderBottom='2px solid'
      borderColor='gray.700'
      flexWrap={{ base: 'wrap-reverse', sm: 'wrap' }}
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
          mr={2}
        />
      ) : (
        <Text mr={1} fontSize='2xl' fontWeight='inherit' {...props}>
          {formatNumber(total)}
        </Text>
      )}
      Result{total !== 1 ? 's' : ' '}
    </Flex>
  );
};

export default ResultsCount;
