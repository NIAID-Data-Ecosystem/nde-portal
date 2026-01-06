import { Box, Flex } from '@chakra-ui/react';
import { Sample } from 'src/utils/api/types';
import { SampleQuantity } from './components/SampleQuantity';
import { SampleCollectionList } from './components/SampleCollectionList';
import { SampleProperties } from './components/SampleProperties';

interface SamplesDisplayProps {
  sample: Sample | null | undefined;
}

export const SamplesDisplay = ({ sample }: SamplesDisplayProps) => {
  return (
    <Flex flexDirection='column' gap={8}>
      {/* Sample Properties Table*/}
      {sample && (
        <Box>
          <SampleProperties data={sample} />
        </Box>
      )}
      {/* Sample Quantities List */}
      {sample?.sampleQuantity && (
        <Box>
          <SampleQuantity data={sample.sampleQuantity} />
        </Box>
      )}
      {/* Sample Collection Table*/}
      {sample?.collectionSize?.value && (
        <Box>
          <SampleCollectionList data={sample} />
        </Box>
      )}
    </Flex>
  );
};
