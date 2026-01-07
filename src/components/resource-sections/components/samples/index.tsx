import { Box, Flex } from '@chakra-ui/react';
import { SampleAggregate, SampleCollection } from 'src/utils/api/types';
import { SampleCollectionList } from './components/SampleCollectionList';
import { SampleProperties } from './components/SampleProperties';

interface SamplesDisplayProps {
  sample: SampleAggregate | SampleCollection | null | undefined;
}

export const SamplesDisplay = ({ sample }: SamplesDisplayProps) => {
  return (
    <Flex flexDirection='column' gap={8}>
      {/* Sample Properties Table*/}
      {sample?.['@type'] === 'Sample' && (
        <Box>
          <SampleProperties data={sample} />
        </Box>
      )}
      {/* Sample Collection Table*/}
      {sample?.['@type'] === 'SampleCollection' && (
        <Box>
          <SampleCollectionList data={sample} />
        </Box>
      )}
    </Flex>
  );
};
