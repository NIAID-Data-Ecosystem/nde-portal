import React from 'react';
import {Box, Button, Flex, Image, Link, Stack, Text} from 'nde-design-system';
import {FormattedResource} from 'src/utils/api/types';
import {Skeleton} from '@chakra-ui/skeleton';
import {MetadataField} from '../section';
import {ResourceLinks} from 'src/components/resource/';
import {getRepositoryImage} from 'src/utils/helpers';

interface Provenance {
  isLoading: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
}

const Provenance: React.FC<Provenance> = ({
  includedInDataCatalog,
  isLoading,
}) => {
  const imageURL =
    includedInDataCatalog?.name &&
    getRepositoryImage(includedInDataCatalog.name);

  return (
    <Skeleton isLoaded={!isLoading} p={4}>
      <Stack spacing={4}>
        {imageURL && (
          <Image
            w={'100px'}
            objectFit='contain'
            my={[2, 4]}
            src={imageURL}
            alt='Data source logo'
          />
        )}
        {includedInDataCatalog?.name && (
          <MetadataField isLoading={isLoading} label={`Organization's name`}>
            {includedInDataCatalog.url ? (
              <Link href={includedInDataCatalog.url} target='_blank' isExternal>
                {includedInDataCatalog.name}
              </Link>
            ) : (
              <Text>{includedInDataCatalog.name}</Text>
            )}
          </MetadataField>
        )}

        {includedInDataCatalog?.versionDate && (
          <MetadataField
            isLoading={isLoading}
            label='Version Date'
            value={new Date(includedInDataCatalog.versionDate).toLocaleString()}
          ></MetadataField>
        )}
        {includedInDataCatalog?.url && (
          <Button
            colorScheme='primary'
            variant='outline'
            href={includedInDataCatalog.url}
            h='unset'
            pl={3}
            isExternal
          >
            <Flex alignItems='center' direction={['column', 'row']}>
              <Text color='inherit' whiteSpace='normal'>
                View data in source repository
              </Text>
            </Flex>
          </Button>
        )}
      </Stack>
    </Skeleton>
  );
};

export default Provenance;
