import React from 'react';
import dynamic from 'next/dynamic';
import { Flex, Spinner, Text } from '@chakra-ui/react';
import { FacetTermWithDetails } from '../../../types';

const Histogram = dynamic(() => import('./histogram'), {
  ssr: false,
});

interface HistogramSectionProps {
  data: FacetTermWithDetails[];
  hasData: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  onDateSelect: (dates: string[]) => void;
}

export const HistogramSection: React.FC<HistogramSectionProps> = ({
  data,
  hasData,
  isLoading,
  isUpdating,
  onDateSelect,
}) => {
  return (
    <Flex
      w='100%'
      flexDirection='column'
      alignItems='center'
      p={4}
      px={10}
      mt={-1.5}
      position='relative'
      minHeight='180px'
    >
      {(isLoading || isUpdating) && (
        <Flex
          position='absolute'
          top={0}
          width='100%'
          height='100%'
          bg='whiteAlpha.600'
          zIndex={1000}
          alignItems='center'
          justifyContent='center'
        >
          <Spinner
            color='accent.600'
            emptyColor='white'
            position='absolute'
            size='md'
            thickness='2px'
          />
        </Flex>
      )}

      {hasData ? (
        <Histogram updatedData={data || []} handleClick={onDateSelect} />
      ) : (
        !isLoading &&
        !isUpdating && (
          <Text fontStyle='italic' color='gray.800' mt={1}>
            No results with date information.
          </Text>
        )
      )}
    </Flex>
  );
};
