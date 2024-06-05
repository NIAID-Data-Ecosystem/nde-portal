import type { NextPage } from 'next';
import React from 'react';
import { useQuery } from 'react-query';
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

export interface SourceResponse {
  dateCreated?: string;
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
  } = useQuery(['metadata'], fetchMetadata, {
    refetchOnMount: true,

    select: res => {
      const sources = res.src;

      const sourceDetails = Object.entries(sources).map(([key, source]) => {
        const id = (source.sourceInfo && source.sourceInfo.identifier) || key;
        const githubInfo = data.find(item => {
          return item.id === id;
        });

        // in place for when we have a dateModified field in the API that is not in iso format.
        const dateModified = source.version?.includes('T')
          ? source.version
          : /^\d+$/.test(source.version)
          ? `${source.version.substring(0, 4)}-${source.version.substring(
              4,
              6,
            )}-${source.version.substring(6, 8)}T00:00:00`
          : '';

        return {
          ...githubInfo,
          id,
          name: (source.sourceInfo && source.sourceInfo.name) || key,
          description:
            (source.sourceInfo && source.sourceInfo.description) || '',
          dateModified,
          numberOfRecords: source.stats[key] || 0,
          schema: (source.sourceInfo && source.sourceInfo.schema) || null,
          url: (source.sourceInfo && source.sourceInfo.url) || '',
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
  });

  return (
    <PageContainer
      id='sources-page'
      title='Sources'
      metaDescription='NDE Discovery Portal - API data sources.'
      px={0}
      py={0}
      disableSearchBar
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
                  <Button onClick={() => router.reload()} variant='outline'>
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
              w='50%'
              as='nav'
              aria-label='Navigation for data sources.'
              maxW='450px'
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
              flex={1}
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
  const fetchRepositoryInfo = async (sourceData: any) => {
    try {
      const data = await Promise.all(
        sourceData.map(async ([k, source]: [string, any]) => {
          const sourceData = {
            id: (source.sourceInfo && source.sourceInfo.identifier) || k,
            sourcePath: source?.code?.file || null,
          };
          if (!sourceData.sourcePath) {
            return sourceData;
          }

          // Fetch source information from github
          try {
            const url = `https://api.github.com/repos/NIAID-Data-Ecosystem/nde-crawlers/commits`;
            const response = await axios.get(url, {
              headers: {
                Authorization: process.env.GH_API_KEY
                  ? `Bearer ${process.env.GH_API_KEY}`
                  : '',
                'Content-Type': 'application/json',
              },
              params: {
                url: '/repos/{owner}/{repo}/commits?path={path}',
                owner: 'NIAID-Data-Ecosystem',
                repo: 'nde-crawlers',
                path: sourceData.sourcePath,
              },
            });
            const data = await response.data;
            const dates: string[] = [];
            if (data) {
              data.forEach(
                (jsonObj: { commit: { author: { date: string } } }) => {
                  dates.push(jsonObj.commit.author.date);
                },
              );
            }

            return { ...sourceData, dateCreated: dates[dates.length - 1] };
          } catch (err) {
            throw err;
          }
        }),
      );
      return { error: null, data };
    } catch (err: any) {
      return {
        data: [],
        error: {
          type: 'error',
          status: err.response.status,
          message: err.response.statusText,
        },
      };
    }
  };
  const sources = await fetchMetadata()
    .then(data => ({ data }))
    .catch(err => {
      return {
        data: null,
        error: {
          type: 'error',
          status: err.response.status,
        },
      };
    });
  if (!sources.data) {
    return { props: { ...sources } };
  }
  const sourceData = await fetchRepositoryInfo(
    Object.entries(sources.data.src),
  );
  return { props: { ...sourceData } };
}

export default Sources;
