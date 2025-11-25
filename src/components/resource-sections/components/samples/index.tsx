import {
  Flex,
  Heading,
  List,
  ListItem,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { ScrollContainer } from 'src/components/scroll-container';
import { Sample } from 'src/utils/api/types';

interface SamplesDisplayProps {
  sample: Sample | null | undefined;
}

// Helper function to format unit text. Uppercase first letter and replace underscores with spaces.
const formatUnitText = (unit: string | undefined) => {
  if (!unit) return '';
  return unit
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase());
};

export const SamplesDisplay = ({ sample }: SamplesDisplayProps) => {
  return (
    <Flex flexDirection='column'>
      {/* Collection Size */}
      {sample?.collectionSize?.value && (
        <Text as='h4' fontSize='sm'>
          {formatUnitText(sample?.collectionSize?.unitText)}{' '}
          {sample?.collectionSize?.value
            ? `(${sample.collectionSize.value.toLocaleString()})`
            : ''}
        </Text>
      )}

      {/* Sample Quantity */}
      {sample?.sampleQuantity?.value && (
        <Text as='h4' fontSize='sm'>
          {formatUnitText(sample?.sampleQuantity?.unitText)}{' '}
          {sample?.sampleQuantity?.value
            ? `(${sample.sampleQuantity.value.toLocaleString()})`
            : ''}
        </Text>
      )}

      {/* Sample List */}
      {sample?.sampleList && sample.sampleList.length > 0 && (
        <ScrollContainer
          maxHeight='300px'
          border='0.15px solid'
          pr={0}
          borderColor='gray.100'
        >
          <UnorderedList ml={0}>
            {sample.sampleList.map((item, idx) => {
              return (
                <ListItem
                  key={item.identifier}
                  wordBreak='break-all'
                  lineHeight='short'
                  fontSize='sm'
                  bg={idx % 2 === 0 ? 'white' : 'page.alt'}
                  p={2}
                  borderBottom='0.15px solid'
                  borderColor='gray.100'
                >
                  <Link href={item.url}>
                    {item?.identifier?.replace(/-/g, '-')}
                  </Link>
                </ListItem>
              );
            })}
          </UnorderedList>
        </ScrollContainer>
      )}
    </Flex>
  );
};
