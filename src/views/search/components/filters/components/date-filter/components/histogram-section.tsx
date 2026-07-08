import React from 'react';
import dynamic from 'next/dynamic';
import { Flex, Text } from '@chakra-ui/react';
import { FilterTermType } from '../../../types';

const Histogram = dynamic(() => import('./histogram'), {
  ssr: false,
});

interface HistogramSectionProps {
  data: FilterTermType[];
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
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false);
  React.useEffect(() => {
    if (!isLoading && !isUpdating) {
      setHasLoadedOnce(true);
    }
  }, [isLoading, isUpdating]);

  return (
    <Flex
      w='100%'
      flexDirection='column'
      alignItems='center'
      py={2}
      px={4}
      position='relative'
      minHeight='180px'
      height='100%'
    >
      {hasData ? (
        <Histogram updatedData={data || []} handleClick={onDateSelect} />
      ) : (
        hasLoadedOnce &&
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
