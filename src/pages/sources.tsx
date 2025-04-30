import type { NextPage } from 'next';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { PageContainer, PageContent } from 'src/components/page-container';
import { Main } from 'src/views/sources';
import { Error, ErrorCTA } from 'src/components/error';
import { Metadata, MetadataSource } from 'src/hooks/api/types';
import { getQueryStatusError } from 'src/components/error/utils';
import { fetchMetadata } from 'src/hooks/api/helpers';
import { getFundedByNIAID } from 'src/utils/helpers';
import {
  Label,
  Sidebar,
  SidebarItem,
} from 'src/components/table-of-contents/layouts/sidebar';
import { formatDate } from 'src/utils/api/helpers';
import { BadgeWithTooltip } from 'src/components/badges/components/BadgeWithTooltip';
import { fetchSourceInformationFromGithub } from 'src/views/sources/helpers';

export interface SourceResponse extends MetadataSource {
  dateCreated?: string;
  key: string;
  id: MetadataSource['sourceInfo']['identifier'];
  slug: string;
  name: MetadataSource['sourceInfo']['name'];
  description: MetadataSource['sourceInfo']['description'];
  dateModified: MetadataSource['version'];
  numberOfRecords: number;
  schema: MetadataSource['sourceInfo']['schema'];
  url: MetadataSource['sourceInfo']['url'];
  isNiaidFunded?: boolean;
}

interface SourcesProps {
  data: {
    githubInfo: {
      data: SourceResponse[];
      error: { status: number; message: string; type: string } | null;
    };
    sourceMetadata: {
      data: Metadata;
    };
  };
  error: { status: number; message: string; type: string } | null;
  children: React.ReactNode;
}
const Sources: NextPage<SourcesProps> = ({ data, error }) => {
  const router = useRouter();

  // Fetch metadata stats from API.
  const {
    data: metadata,
    isFetching: isLoading,
    error: metadataError,
  } = useQuery({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
    initialData: () => data.sourceMetadata.data,
    select: res => {
      const sources = res.src;
      const sourceDetails = Object.entries(sources).map(([key, source]) => {
        const id = (source.sourceInfo && source.sourceInfo.identifier) || key;
        const name = (source?.sourceInfo && source?.sourceInfo?.name) || key;
        const githubInfo = data?.githubInfo.data.find(item => {
          return item.id === id;
        });

        // in place for when we have a dateModified field in the API that is not in iso format.
        const dateModified = source?.version?.includes('T')
          ? source.version
          : /^\d+$/.test(source.version)
          ? `${source.version.substring(0, 4)}-${source.version.substring(
              4,
              6,
            )}-${source.version.substring(6, 8)}T00:00:00`
          : '';

        return {
          ...githubInfo,
          ...source,
          key,
          id,
          slug: name.replace(/\s+/g, '-'),
          name,
          description:
            (source?.sourceInfo && source?.sourceInfo?.description) || '',
          dateModified,
          numberOfRecords: source?.stats?.[key] || 0,
          schema: (source?.sourceInfo && source?.sourceInfo?.schema) || null,
          url: (source?.sourceInfo && source?.sourceInfo?.url) || '',
          isNiaidFunded: getFundedByNIAID(source.sourceInfo?.name),
        };
      });
      return {
        meta: {
          version: res.build_version,
          date: res.build_date,
        },
        sources: sourceDetails.sort((a: { name: string }, b: { name: any }) =>
          a.name.localeCompare(b.name),
        ),
      };
    },
    refetchOnMount: true,
  });

  return (
    <PageContainer
      id='sources-page'
      title='Sources'
      metaDescription='NDE Discovery Portal - API data sources.'
      px={0}
      py={0}
    >
      <Flex>
        {error || metadataError ? (
          <Error>
            <Flex flexDirection='column' flex={1} alignItems='center'>
              <Text>
                {error
                  ? getQueryStatusError(error as unknown as { status: string })
                      ?.message
                  : ''}
                {!error && metadataError
                  ? getQueryStatusError(
                      metadataError as unknown as { status: string },
                    )?.message
                  : ''}
              </Text>
              <Box mt={4}>
                <ErrorCTA>
                  <Button
                    onClick={() => router.reload()}
                    variant='outline'
                    size='md'
                  >
                    Retry
                  </Button>
                </ErrorCTA>
              </Box>
            </Flex>
          </Error>
        ) : (
          <></>
        )}
        {!(error || metadataError) && (
          <>
            <Sidebar aria-label='Navigation for data sources.'>
              {!isLoading &&
                metadata?.sources.map(source => {
                  return (
                    <SidebarItem
                      key={source.slug}
                      label={
                        <Label>
                          {source.name}
                          {/* Add tag to show source is funded by NIAID */}
                          {source.isNiaidFunded && (
                            <BadgeWithTooltip
                              colorScheme='blue'
                              variant='subtle'
                              mx={2}
                            >
                              NIAID
                            </BadgeWithTooltip>
                          )}
                        </Label>
                      }
                      subLabel={`Latest Release ${
                        source.dateModified
                          ? formatDate(source.dateModified)
                          : 'N/A'
                      }`}
                      href={`#${source.slug}`}
                    />
                  );
                })}
            </Sidebar>
            <PageContent
              bg='#fff'
              maxW={{ base: 'unset', lg: '1200px' }}
              margin='0 auto'
              px={4}
              py={4}
              justifyContent='flex-start'
              mb={32}
              flex={3}
            >
              <Main
                data={metadata?.sources}
                isLoading={isLoading}
                metadata={metadata?.meta}
              />
            </PageContent>
          </>
        )}
      </Flex>
    </PageContainer>
  );
};

export async function getStaticProps() {
  try {
    const sources = await fetchMetadata();
    if (!sources) {
      return { props: { error: 'No source data found' } };
    }

    const sourceData = await fetchSourceInformationFromGithub(
      Object.entries(sources.src),
    );

    return {
      props: {
        data: {
          githubInfo: {
            data: sourceData.data,
            error: sourceData.error,
          },
          sourceMetadata: {
            data: sources,
          },
        },
      },
    };
  } catch (err: any) {
    console.error(`Failed to fetch metadata: ${err.message}`);
    return {
      props: {
        error: {
          type: 'error',
          status: err.response?.status || 500,
          message: err.response?.statusText || 'Unknown error',
        },
      },
    };
  }
}

export default Sources;
