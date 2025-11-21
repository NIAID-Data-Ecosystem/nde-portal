import { Flex, Heading } from '@chakra-ui/react';
import { Sample } from 'src/utils/api/types';

interface SamplesDisplayProps {
  sample: Sample | null | undefined;
}

export const SamplesDisplay = ({ sample }: SamplesDisplayProps) => {
  return (
    <Flex flexDirection='column'>
      <Heading size='sm'>
        Samples{' '}
        {sample?.collectionSize?.value
          ? `(${sample.collectionSize.value.toLocaleString()})`
          : ''}
      </Heading>
    </Flex>
  );
};
