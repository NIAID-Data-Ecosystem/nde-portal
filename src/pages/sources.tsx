import type { NextPage } from 'next';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import { Main } from 'src/views/sources';
import { Error, ErrorCTA } from 'src/components/error';
import { Metadata } from 'src/hooks/api/types';
import { getQueryStatusError } from 'src/components/error/utils';
import { fetchMetadata } from 'src/hooks/api/helpers';
import { Source, useSourcesList } from 'src/hooks/api/useSourcesList';
import {
  Label,
  Sidebar,
  SidebarItem,
} from 'src/components/table-of-contents/layouts/sidebar';
import { formatDate } from 'src/utils/api/helpers';
import { BadgeWithTooltip } from 'src/components/badges/components/BadgeWithTooltip';
import { fetchSourceInformationFromGithub } from 'src/views/sources/helpers';

/** Build-time GitHub commit info, keyed by source identifier. */
interface GithubSourceInfo {
  id: string;
  dateCreated?: string;
}

/** Convert an identifier into a URL-safe anchor slug by replacing whitespace with dashes. */
export const formatIdentifierAsAnchorSlug = (id: string) => {
  return id.replace(/\s+/g, '-');
};

/** Build a source's anchor slug from its `_id` field. */
const getSourceAnchorSlug = (source: Source) => {
  if (!source._id) {
    console.log('Missing _id for source: ', source.name);
    return '';
  }
  return formatIdentifierAsAnchorSlug(source._id);
};

/**
 * A `Source` from `useSourcesList` enriched with page-level, presentational
 * fields: an anchor `slug` and the build-time GitHub `dateCreated`
 * ("First Released"). Resource catalogs carry neither a GitHub record nor the
 * metadata-only fields (`schema`, `numberOfRecords`, ...), so those stay
 * undefined.
 */
export type SourceDisplayItem = Source & {
  slug: string;
  dateCreated?: string;
};

interface SourcesProps {
  // Optional: build-time prefetch may be absent if the API was unreachable
  // during the static export. The client-side query recovers in that case.
  data?: {
    githubInfo: {
      data: GithubSourceInfo[];
      error: { status: number; message: string; type: string } | null;
    };
    sourceMetadata: {
      data: Metadata;
    };
  };
  children: React.ReactNode;
}
const Sources: NextPage<SourcesProps> = ({ data }) => {
  const router = useRouter();

  // Source list (repositories + resource catalogs).
  const {
    data: sources,
    isLoading,
    error: metadataError,
  } = useSourcesList({
    refetchOnWindowFocus: false,
  });

  // Build metadata (API version + last-harvested date). Shares the cached
  // ['metadata'] query with `useSourcesList`, so this adds no network request.
  const { data: meta } = useQuery({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
    placeholderData: () => data?.sourceMetadata?.data,
    select: res => ({ version: res.build_version, date: res.build_date }),
    refetchOnWindowFocus: false,
  });

  // Enrich each source with the anchor `slug` and the build-time GitHub
  // `dateCreated`, then sort alphabetically by name.
  const sourceItems = useMemo<SourceDisplayItem[]>(() => {
    const githubInfo = data?.githubInfo?.data || [];
    return (sources || [])
      .map(source => {
        const github = githubInfo.find(item => item.id === source.identifier);

        return {
          ...source,
          slug: getSourceAnchorSlug(source),
          dateCreated: github?.dateCreated,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sources, data?.githubInfo?.data]);

  return (
    <PageContainer
      id='sources-page'
      meta={getPageSeoConfig('/sources')}
      px={0}
      py={0}
    >
      <Flex>
        {metadataError ? (
          <Error>
            <Flex flexDirection='column' flex={1} alignItems='center'>
              <Text>
                {
                  getQueryStatusError(
                    metadataError as unknown as { status: string },
                  )?.message
                }
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
        {!metadataError && (
          <>
            <Sidebar aria-label='Navigation for data sources.'>
              {!isLoading &&
                sourceItems.map(source => {
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
              <Main data={sourceItems} isLoading={isLoading} metadata={meta} />
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
    console.warn(
      `Could not prefetch source metadata at build time: ${err.message}. ` +
        `Falling back to client-side fetch.`,
    );
    return { props: {} };
  }
}

export default Sources;
