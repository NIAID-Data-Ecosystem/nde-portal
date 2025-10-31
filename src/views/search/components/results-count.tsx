import { Flex, Spinner, Text, TextProps } from '@chakra-ui/react';
import React from 'react';

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
      px={4}
      w='100%'
      borderBottom='1px solid'
      borderColor='gray.200'
      flexWrap={{ base: 'wrap-reverse', sm: 'wrap' }}
    >
      {isLoading ? (
        <Spinner
          color='primary.500'
          css={{ '--spinner-track-color': 'colors.gray.200' }}
          size='md'
          animationDuration='0.5s'
          borderWidth='1px'
          mr={2}
        />
      ) : (
        <Text fontSize='xl' fontWeight='semibold' lineHeight='short' {...props}>
          {total.toLocaleString()}
          {total > 0 && (
            <Text as='span' fontSize='md' fontWeight='inherit' ml={1}>
              Result{total !== 1 ? 's' : ' '}
            </Text>
          )}
        </Text>
      )}
    </Flex>
  );
};

export default ResultsCount;
