import React from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Link,
  Stack,
  StackDivider,
  Text,
} from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { Skeleton } from '@chakra-ui/skeleton';
import { getRepositoryImage } from 'src/utils/helpers';
import { assetPrefix } from 'next.config';
import { formatDate } from 'src/utils/api/helpers';
import StatField from '../overview/components/stat-field';

interface Provenance {
  isLoading: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  url?: FormattedResource['url'];
  sdPublisher?: FormattedResource['sdPublisher'];
  curatedBy?: FormattedResource['curatedBy'];
}

const Provenance: React.FC<Provenance> = ({
  includedInDataCatalog,
  isLoading,
  url,
  sdPublisher,
  curatedBy,
}) => {
  const imageURL =
    includedInDataCatalog?.name &&
    getRepositoryImage(includedInDataCatalog.name);

  return (
    <Skeleton isLoaded={!isLoading} display='flex' flexWrap='wrap'>
      <Stack spacing={2} alignItems='flex-start' my={4}>
        <Heading as='h3' size='xs' color='gray.700' lineHeight='short'>
          Repository Information
        </Heading>
        {/* Source where data is retrieved from */}
        {includedInDataCatalog?.name ? (
          <StatField label='Provided By' isLoading={isLoading}>
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
          </StatField>
        ) : (
          <Text>No data available.</Text>
        )}

        {/* Original publisher of data */}
        {sdPublisher &&
          sdPublisher.length > 0 &&
          sdPublisher?.map((publisher, i) => {
            if (
              (!publisher.name && !publisher.url) ||
              (publisher.name === 'N/A' && !publisher.url)
            ) {
              return <></>;
            }
            return (
              <StatField key={i} label='Original Source' isLoading={isLoading}>
                <dd>
                  {publisher.url ? (
                    <Link href={publisher.url} target='_blank' isExternal>
                      {publisher.name || publisher.url}
                    </Link>
                  ) : (
                    <Text>{publisher.name || publisher.url}</Text>
                  )}
                </dd>
              </StatField>
            );
          })}

        {includedInDataCatalog?.versionDate && (
          <StatField label='Version Date' isLoading={isLoading}>
            <dd>{formatDate(includedInDataCatalog.versionDate)} </dd>
          </StatField>
        )}

        {url && (
          <Button
            colorScheme='primary'
            variant='outline'
            href={url}
            h='unset'
            isExternal
            size='sm'
          >
            <Flex alignItems='center' direction={['column', 'row']}>
              <Text color='inherit' whiteSpace='normal'>
                View data in source repository
              </Text>
            </Flex>
          </Button>
        )}
      </Stack>

      {curatedBy && (
        <Box my={4}>
          <Heading as='h3' size='xs' color='gray.700' lineHeight='short'>
            Curation Information
          </Heading>
          <Stack
            direction={['column', 'row']}
            divider={<StackDivider borderColor='gray.200' />}
          >
            {(curatedBy?.name || curatedBy?.url) && (
              <StatField label='Curated by' isLoading={isLoading}>
                {curatedBy.url ? (
                  <Link href={curatedBy.url} isExternal whiteSpace='nowrap'>
                    {curatedBy?.name || curatedBy.url}
                  </Link>
                ) : (
                  <> {curatedBy?.name}</>
                )}
              </StatField>
            )}

            {curatedBy?.versionDate && (
              <StatField label='Version date' isLoading={isLoading}>
                {curatedBy?.versionDate}
              </StatField>
            )}
          </Stack>
        </Box>
      )}
    </Skeleton>
  );
};

export default Provenance;
