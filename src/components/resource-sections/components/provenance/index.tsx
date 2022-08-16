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
import { FormattedResource } from 'src/utils/api/types';
import { Skeleton } from '@chakra-ui/skeleton';
import { getRepositoryImage } from 'src/utils/helpers';
import { assetPrefix } from 'next.config';
import { formatDate } from 'src/utils/api/helpers';

interface Provenance {
  isLoading: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  url?: FormattedResource['url'];
  sdPublisher?: FormattedResource['sdPublisher'];
}

const Provenance: React.FC<Provenance> = ({
  includedInDataCatalog,
  isLoading,
  url,
  sdPublisher,
}) => {
  const imageURL =
    includedInDataCatalog?.name &&
    getRepositoryImage(includedInDataCatalog.name);

  return (
    <Skeleton isLoaded={!isLoading}>
      <Stack spacing={4} alignItems='flex-start'>
        {/* Source where data is retrieved from */}
        {includedInDataCatalog?.name ? (
          <Stat>
            <dd>
              {imageURL && (
                <Image
                  h='50px'
                  objectFit='contain'
                  my={[2, 4]}
                  src={`${assetPrefix}${imageURL}`}
                  alt='Data source logo'
                />
              )}
            </dd>
            <StatLabel>Provided By</StatLabel>
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

        {/* Original publisher of data */}
        {sdPublisher && sdPublisher.length > 0 ? (
          sdPublisher?.map((publisher, i) => {
            if (
              (!publisher.name && !publisher.url) ||
              (publisher.name === 'N/A' && !publisher.url)
            ) {
              return <></>;
            }
            return (
              <Stat key={i}>
                <StatLabel>Original Source</StatLabel>
                <dd>
                  {publisher.url ? (
                    <Link href={publisher.url} target='_blank' isExternal>
                      {publisher.name || publisher.url}
                    </Link>
                  ) : (
                    <Text>{publisher.name || publisher.url}</Text>
                  )}
                </dd>
              </Stat>
            );
          })
        ) : (
          <></>
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
