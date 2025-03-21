import { FormattedResource } from 'src/utils/api/types';
import { Flex, Skeleton, Text } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { MetadataLabel } from 'src/components/metadata';
import { ScrollContainer } from 'src/components/scroll-container';

interface ResourceCatalogCollectionProps {
  isLoading: boolean;
  collectionSize?: FormattedResource['collectionSize'];
}

export const ResourceCatalogCollection = ({
  collectionSize,
  isLoading,
}: ResourceCatalogCollectionProps) => {
  if (!collectionSize) return <></>;

  return (
    <Skeleton isLoaded={!isLoading} mx={1} py={2}>
      <Flex alignItems='baseline' lineHeight='short' mb={1}>
        <MetadataLabel label='Collection Size Details' />
      </Flex>
      <ScrollContainer
        overflow='auto'
        maxHeight='200px'
        border='1px solid'
        borderColor='gray.100'
        borderRadius='semi'
        my={2}
        py={2}
        px={0}
      >
        {collectionSize.map((collection, idx) => {
          if (collection?.value) {
            return (
              <Text
                key={idx}
                bg={idx % 2 ? 'niaid.50' : 'transparent'}
                lineHeight='tall'
                fontSize='sm'
                px={2}
                py={collectionSize.length > 1 ? 2 : 0}
              >
                {collection.value?.toLocaleString()}

                {collection?.unitText}
              </Text>
            );
          }
          return (
            <Text
              key={idx}
              bg={idx % 2 ? 'niaid.50' : 'transparent'}
              lineHeight='tall'
              fontSize='sm'
              px={2}
              py={collectionSize.length > 1 ? 2 : 0}
            >
              {collection.minValue?.toLocaleString()}
              {collection?.maxValue
                ? '- ' + collection.maxValue.toLocaleString()
                : ''}{' '}
              {collection?.unitText}
            </Text>
          );
        })}
      </ScrollContainer>
    </Skeleton>
  );
};
