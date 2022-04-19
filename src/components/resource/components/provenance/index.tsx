import React from 'react';
import {
  Button,
  Flex,
  Image,
  Link,
  Stack,
  Stat,
  StatLabel,
  Text,
} from 'nde-design-system';
import {FormattedResource} from 'src/utils/api/types';
import {Skeleton} from '@chakra-ui/skeleton';
import {formatDate, getRepositoryImage} from 'src/utils/helpers';

interface Provenance {
  isLoading: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  url?: FormattedResource['url'];
}

const Provenance: React.FC<Provenance> = ({
  includedInDataCatalog,
  isLoading,
  url,
}) => {
  const imageURL =
    includedInDataCatalog?.name &&
    getRepositoryImage(includedInDataCatalog.name);

  return (
    <Skeleton isLoaded={!isLoading}>
      <Stack spacing={4} alignItems='start'>
        {includedInDataCatalog?.name ? (
          <Stat>
            <dd>
              {imageURL && (
                <Image
                  h='50px'
                  objectFit='contain'
                  my={[2, 4]}
                  src={imageURL}
                  alt='Data source logo'
                />
              )}
            </dd>
            <StatLabel>Source organization</StatLabel>
            <dd>
              {includedInDataCatalog.url ? (
                <Link
                  href={includedInDataCatalog.url}
                  target='_blank'
                  isExternal
                >
                  {includedInDataCatalog.name}
                </Link>
              ) : (
                <Text>{includedInDataCatalog.name}</Text>
              )}
            </dd>
          </Stat>
        ) : (
          <Text>No data available.</Text>
        )}

        {includedInDataCatalog?.versionDate && (
          <Stat>
            <StatLabel>Version Date</StatLabel>
            <dd>{formatDate(includedInDataCatalog.versionDate)} </dd>
          </Stat>
        )}
        {url && (
          <Button
            colorScheme='primary'
            variant='outline'
            href={url}
            h='unset'
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
