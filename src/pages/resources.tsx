import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import NextLink from 'next/link';
import { PageContainer, PageContent } from 'src/components/page-container';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { getResourceById } from 'src/utils/api';
import { FormattedResource } from 'src/utils/api/types';
import Empty from 'src/components/empty';
import {
  Box,
  Button,
  Card,
  Collapse,
  Flex,
  Link,
  ListItem,
  Text,
  UnorderedList,
} from 'nde-design-system';
import {
  Navigation,
  RelatedDatasets,
  ResourceLinks,
} from 'src/components/resource-sections/components';
import { Error, ErrorCTA } from 'src/components/error';
import Sections, { sectionMetadata } from 'src/components/resource-sections';
import navigationData from 'configs/resource-sections.json';
import { Route, showSection } from 'src/components/resource-sections/helpers';
import { useLocalStorage } from 'usehooks-ts';
import { CardContainer } from 'src/components/resource-sections/components/related-datasets';
import ResourceStats from 'src/components/resource-sections/components/stats';
import { getQueryStatusError } from 'src/components/error/utils';

// Displays empty message when no data exists.
const EmptyState = () => {
  return (
    <Card w='100%'>
      <Empty message='No data available.' alignSelf='center' h='50vh'>
        <Text>No information about this dataset is available.</Text>
        <NextLink href={{ pathname: '/search' }}>
          <Button mt={4}>Go to search</Button>
        </NextLink>
      </Empty>
    </Card>
  );
};

const ResourcePage: NextPage = props => {
  const router = useRouter();
  const { id } = router.query;
  const [searchHistory] = useLocalStorage<string[]>('basic-searches', []);
  // Access query client

  const {
    isLoading: loadingData,
    error,
    data,
  } = useQuery<FormattedResource | undefined, Error>(
    ['search-result', { id }],
    () => getResourceById(id),
    {
      refetchOnWindowFocus: false,
    },
  );

  const isLoading = loadingData || !router.isReady;

  // embed metadata
  useEffect(() => {
    if (data && data.rawData) {
      let script_tag = document.createElement('script');
      let metadata = JSON.stringify(data.rawData, null, 2);
      script_tag.setAttribute('type', 'application/ld+json');
      script_tag.text = metadata;
      document.head.appendChild(script_tag);
    }
  }, [data]);

  // embed altmetric data. For more information: https://api.altmetric.com/embeds.html
  useEffect(() => {
    // @ts-ignore
    if (window._altmetric_embed_init) {
      // @ts-ignore
      window._altmetric_embed_init();
    }
    /* import altmetric script for badge embeds */
    let altmetricsScript = document.createElement('script');
    altmetricsScript.setAttribute(
      'src',
      'https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js',
    );
    document.body.appendChild(altmetricsScript);
  }, [data]);

  const { routes } = navigationData as {
    title: string;
    routes: Route[];
  };

  // Check if the metadata is available for a given section before displaying it in navbar or page.
  const sections = routes.filter(route =>
    showSection(
      { ...route, metadataProperties: sectionMetadata[route.hash] },
      data,
    ),
  );

  const errorResponse =
    error && getQueryStatusError(error as unknown as { status: string });

  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isLoading && !id) {
    router.push('/404');
    return <></>;
  }

  return (
    <>
      <PageContainer
        hasNavigation
        title={`${data?.name ? data?.name : isLoading ? '' : 'Resource'}`}
        metaDescription='NDE Discovery Portal - Detailed resource information.'
      >
        <PageContent>
          {error ? (
            // [ERROR STATE]: API response error
            <Error>
              <Flex flexDirection='column' alignItems='center'>
                <Text>
                  {errorResponse?.message ||
                    'It’s possible that the server is experiencing some issues.'}{' '}
                  {errorResponse?.relatedLinks &&
                    errorResponse?.relatedLinks?.length > 0 &&
                    errorResponse.relatedLinks.map(
                      ({ label, href, isExternal }, idx) => {
                        return (
                          <Link
                            key={`${label}-${idx}`}
                            href={href}
                            isExternal={isExternal}
                          >
                            {label}
                          </Link>
                        );
                      },
                    )}
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
          ) : !isLoading && !data ? (
            // [EMPTY STATE]: No Results
            <EmptyState />
          ) : (
            <Flex w='100%' h='100%' flexDirection='column' minW={150}>
              <Flex
                height='100%'
                p={2}
                flexDirection={['column', 'column', 'row']}
              >
                <Card
                  flex={3}
                  p={0}
                  width='100%'
                  sx={{ '>*': { p: 0 } }}
                  minW={150}
                >
                  <Sections
                    isLoading={isLoading}
                    data={data}
                    sections={sections}
                  />
                </Card>
                <Box
                  flex={1}
                  position='sticky'
                  top='0px'
                  w='100%'
                  h='100%'
                  minW='350px'
                  display={{ base: 'none', lg: 'block' }}
                >
                  <Card
                    flex={1}
                    ml={[0, 0, 4]}
                    my={[2, 2, 0]}
                    sx={{ '>*': { p: 0 } }}
                  >
                    {data && (data.citation || data.doi || data.nctid) ? (
                      <ResourceStats
                        includedInDataCatalog={data?.includedInDataCatalog}
                        citation={data?.citation}
                        doi={data?.doi}
                        nctid={data?.nctid}
                        aggregateRating={data?.aggregateRating}
                        interactionStatistics={data?.interactionStatistics}
                      />
                    ) : null}
                    {/* Show external links such as source url, in header when on mobile */}
                    <ResourceLinks
                      isLoading={isLoading}
                      includedInDataCatalog={data?.includedInDataCatalog}
                      mainEntityOfPage={data?.mainEntityOfPage}
                      codeRepository={data?.codeRepository}
                      hasPart={data?.hasPart}
                      url={data?.url}
                      usageInfo={data?.usageInfo}
                    />
                  </Card>

                  {/* Local navigation for page */}
                  {sections.length > 0 && (
                    <Card
                      flex={1}
                      ml={[0, 0, 4]}
                      my={2}
                      sx={{ '>*': { p: [2, 4, 4, 6] } }}
                    >
                      <Navigation routes={sections} />
                    </Card>
                  )}

                  {/* Associated Resources with current page */}
                  <RelatedDatasets
                    isLoading={isLoading}
                    isRelatedTo={data?.isRelatedTo || null}
                    includedInDataCatalog={data?.includedInDataCatalog}
                  />

                  {/* Search History links */}
                  {isMounted && (
                    <Collapse in={!!searchHistory.length}>
                      <CardContainer heading='Previous Searches'>
                        <UnorderedList ml={0}>
                          {searchHistory.map((search, index) => (
                            <ListItem key={index}>
                              <NextLink
                                href={{
                                  pathname: '/search',
                                  query: { q: search },
                                }}
                                passHref
                              >
                                <Link
                                  as='span'
                                  wordBreak='break-word'
                                  fontSize='xs'
                                >
                                  {search}
                                </Link>
                              </NextLink>
                            </ListItem>
                          ))}
                        </UnorderedList>
                      </CardContainer>
                    </Collapse>
                  )}
                </Box>
              </Flex>
            </Flex>
          )}
        </PageContent>
      </PageContainer>
    </>
  );
};

export default ResourcePage;
