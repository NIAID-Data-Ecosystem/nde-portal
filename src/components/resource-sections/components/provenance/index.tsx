import React from 'react';
import {
  Box,
  Heading,
  Image,
  Link,
  Stack,
  StackDivider,
  Text,
} from '@candicecz/test-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { Skeleton } from '@chakra-ui/skeleton';
import { getRepositoryImage } from 'src/utils/helpers';
import { formatDate } from 'src/utils/api/helpers';
import StatField from '../overview/components/stat-field';
import { ExternalSourceButton } from 'src/components/external-buttons/';

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
  return (
    <Skeleton isLoaded={!isLoading} display='flex' flexWrap='wrap'>
      <Stack spacing={2} alignItems='flex-start' m={4} w='100%'>
        <Heading as='h3' size='xs' color='gray.700' lineHeight='short'>
          Repository Information
        </Heading>

        {includedInDataCatalog?.name ? (
          <StatField label='' isLoading={isLoading}>
            {/* Source where data is retrieved from */}
            {includedInDataCatalog.url ? (
              <ExternalSourceButton
                w='100%'
                alt='Data source name'
                src={
                  getRepositoryImage(includedInDataCatalog.name) || undefined
                }
                colorScheme='secondary'
                href={url || undefined}
                sourceHref={includedInDataCatalog?.url}
                name='Access Data'
              />
            ) : (
              <ExternalSourceButton
                w='100%'
                alt='Data source name'
                src={
                  getRepositoryImage(includedInDataCatalog.name) || undefined
                }
                colorScheme='secondary'
                sourceHref={includedInDataCatalog?.url}
                name='Access Data'
              />
            )}
          </StatField>
        ) : (
          <Text>No data available.</Text>
        )}

        {includedInDataCatalog?.name && (
          <StatField label='Name' isLoading={isLoading}>
            {includedInDataCatalog.name}
          </StatField>
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
                {publisher.url ? (
                  <Link href={publisher.url} target='_blank' isExternal>
                    {publisher.name || publisher.url}
                  </Link>
                ) : (
                  <Text>{publisher.name || publisher.url}</Text>
                )}
              </StatField>
            );
          })}

        {includedInDataCatalog?.versionDate && (
          <StatField label='Version Date' isLoading={isLoading}>
            {formatDate(includedInDataCatalog.versionDate)}
          </StatField>
        )}
      </Stack>

      {curatedBy && (
        <Box m={4}>
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
                  <Link
                    href={curatedBy.url}
                    target='_blank'
                    whiteSpace='nowrap'
                  >
                    {/* {curatedBy?.name || curatedBy.url} */}

                    {curatedBy?.name && getRepositoryImage(curatedBy.name) ? (
                      <Image
                        h='50px'
                        objectFit='contain'
                        my={[2, 4]}
                        src={`${getRepositoryImage(curatedBy.name)}`}
                        alt='Data source logo'
                      />
                    ) : (
                      curatedBy?.name || curatedBy.url
                    )}
                  </Link>
                ) : (
                  <>
                    {curatedBy?.name && getRepositoryImage(curatedBy.name) ? (
                      <Image
                        h='50px'
                        objectFit='contain'
                        my={[2, 4]}
                        src={`${getRepositoryImage(curatedBy.name)}`}
                        alt='Data source logo'
                      />
                    ) : (
                      curatedBy?.name || curatedBy.url
                    )}
                  </>
                )}
              </StatField>
            )}

            {curatedBy?.versionDate && (
              <StatField label='Version date' isLoading={isLoading}>
                {formatDate(curatedBy?.versionDate)}
              </StatField>
            )}
          </Stack>
        </Box>
      )}
    </Skeleton>
  );
};

export default Provenance;
