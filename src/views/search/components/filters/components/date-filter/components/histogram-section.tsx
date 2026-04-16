import React from 'react';
import dynamic from 'next/dynamic';
import { Flex, Spinner, Text } from '@chakra-ui/react';
import { FilterTermType } from '../../../types';
import { SHOW_VISUAL_SUMMARY } from 'src/utils/feature-flags';

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
      px={SHOW_VISUAL_SUMMARY ? 4 : 10}
      mt={SHOW_VISUAL_SUMMARY ? undefined : -1.5}
      position='relative'
      minHeight='180px'
      height='100%'
    >
      {!SHOW_VISUAL_SUMMARY && (isLoading || isUpdating) && (
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
