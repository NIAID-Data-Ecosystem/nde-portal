import type { NextPage } from 'next';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flex, Text, UnorderedList } from '@chakra-ui/react';
import { PageContainer, PageContent } from 'src/components/page-container';
import { Main, Sidebar } from 'src/components/sources';
import { Error, ErrorCTA } from 'src/components/error';
import axios from 'axios';
import { MetadataSource } from 'src/hooks/api/types';
import { getQueryStatusError } from 'src/components/error/utils';
import { fetchMetadata } from 'src/hooks/api/helpers';
import { getFundedByNIAID } from 'src/utils/helpers';

export interface SourceResponse extends MetadataSource {
  dateCreated?: string;
  key: string;
  id: MetadataSource['sourceInfo']['identifier'];
  name: MetadataSource['sourceInfo']['name'];
  description: MetadataSource['sourceInfo']['description'];
  dateModified: MetadataSource['version'];
  numberOfRecords: number;
  schema: MetadataSource['sourceInfo']['schema'];
  url: MetadataSource['sourceInfo']['url'];
  isNiaidFunded?: boolean;
}

interface SourcesProps {
  data: SourceResponse[];
  error: { status: number; message: string; type: string } | null;
  children: React.ReactNode;
}
const Sources: NextPage<SourcesProps> = ({ data, error }) => {
  const router = useRouter();

  // Fetch metadata stats from API.
  const {
    data: metadata,
    isLoading,
    error: metadataError,
  } = useQuery({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
    select: res => {
      const sources = res.src;
      const sourceDetails = Object.entries(sources).map(([key, source]) => {
        const id = (source.sourceInfo && source.sourceInfo.identifier) || key;
        const githubInfo = data?.find(item => {
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
          name: (source?.sourceInfo && source?.sourceInfo?.name) || key,
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
        sources: sourceDetails,
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
            <Flex
              flexDirection='column'
              bg='page.alt'
              display={['none', 'none', 'flex']}
              as='nav'
              aria-label='Navigation for data sources.'
              maxW='450px'
              flex={1}
            >
              <UnorderedList
                display='flex'
                flexDirection='column'
                py={4}
                top={0}
                ml={0}
              >
                {!isLoading && metadata ? (
                  <Sidebar data={metadata.sources} />
                ) : (
                  <></>
                )}
              </UnorderedList>
            </Flex>
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

const fetchGithubCommits = async (sourcePath: string) => {
  const url = `https://api.github.com/repos/NIAID-Data-Ecosystem/nde-crawlers/commits`;
  const response = await axios.get(url, {
    headers: {
      Authorization: process.env.GH_API_KEY
        ? `Bearer ${process.env.GH_API_KEY}`
        : '',
      'Content-Type': 'application/json',
    },
    params: {
      path: sourcePath,
    },
  });

  return response.data;
};

const extractCommitDates = (data: any[]) => {
  const dates: string[] = [];
  data.forEach((item: { commit: { author: { date: string } } }) => {
    dates.push(item.commit.author.date);
  });
  // Get the last date in the array which corresponds to the first commit.
  return dates[dates.length - 1];
};

export async function getStaticProps() {
  const fetchRepositoryInfo = async (sourceData: any[]) => {
    try {
      const data = await Promise.all(
        sourceData.map(async ([k, source]: [string, any]) => {
          const sourceObject = {
            id: source?.sourceInfo?.identifier || k,
            sourcePath: source?.code?.file || null,
          };

          // Get parent collection source path if source path is not found for source.
          if (!sourceObject.sourcePath) {
            const parentId = source?.sourceInfo?.parentCollection?.id;
            if (parentId) {
              const parentSource = sourceData.find(
                (item: any) => item[0] === parentId,
              );
              sourceObject.sourcePath = parentSource?.[1]?.code?.file || null;
            }
          }

          // If no source path is found, skip fetching GitHub data
          if (!sourceObject.sourcePath) {
            return sourceObject;
          }

          // Fetch source information from GitHub.
          try {
            const githubData = await fetchGithubCommits(
              sourceObject.sourcePath,
            );
            const dateCreated = extractCommitDates(githubData);
            return { ...sourceObject, dateCreated };
          } catch (err: any) {
            console.error(`Failed to fetch GitHub commits: ${err.message}`);
            return sourceObject;
          }
        }),
      );
      return { error: null, data };
    } catch (err: any) {
      console.error(`Failed to process source data: ${err.message}`);
      return {
        data: [],
        error: {
          type: 'error',
          status: err.response?.status || 500,
          message: err.response?.statusText || 'Unknown error',
        },
      };
    }
  };

  try {
    const sources = await fetchMetadata();
    if (!sources) {
      return { props: { error: 'No source data found' } };
    }

    const sourceData = await fetchRepositoryInfo(Object.entries(sources.src));

    return { props: { ...sourceData } };
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
