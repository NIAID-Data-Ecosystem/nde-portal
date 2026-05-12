import React, { useEffect } from 'react';
import { omit } from 'lodash';
import type { NextPage } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, Button, Card, Flex, Link, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import { getResourceById } from 'src/utils/api';
import { FormattedResource } from 'src/utils/api/types';
import Empty from 'src/components/empty';
import { Error, ErrorCTA } from 'src/components/error';
import Sections from 'src/components/resource-sections';
import navigationData from 'src/components/resource-sections/resource-sections.json';
import { Route, showSection } from 'src/components/resource-sections/helpers';
import { getQueryStatusError } from 'src/components/error/utils';
import { Sidebar } from 'src/components/resource-sections/components/sidebar';
import SITE_CONFIG from 'configs/site.config.json';
import { SiteConfig } from 'src/components/page-container/types';
import { SHOULD_HIDE_SAMPLES } from 'src/utils/feature-flags';

const siteConfig = SITE_CONFIG as SiteConfig;

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

export interface ResourceData extends FormattedResource {
  rawData: Omit<
    FormattedResource['rawData'],
    '_id' | '_ignored' | '_score' | '_meta'
  >;
}

const ResourcePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // Access query client
  const {
    isLoading: loadingData,
    error,
    data,
  } = useQuery<FormattedResource | undefined, Error, ResourceData | undefined>({
    queryKey: ['search-result', { id }],
    queryFn: async () => {
      const data = await getResourceById(id, { show_meta: true });

      return data;
    },
    refetchOnWindowFocus: false,
    // Disable query when id is undefined
    enabled: Boolean(id && id.toString() !== 'undefined'),
    select: data => {
      if (data) {
        return {
          ...data,
          //  used for displaying and embedding metadata
          rawData: omit(data.rawData, ['_id', '_ignored', '_score', '_meta']),
        };
      }
    },
  });

  const isLoading = loadingData || !router.isReady;

  // embed metadata
  useEffect(() => {
    if (data && data.rawData) {
      const scriptId = 'structured-data-jsonld';

      // Remove existing json ld script if present
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.remove();
      }

      const scriptTag = document.createElement('script');
      const metadata = JSON.stringify(data.rawData, null, 2);
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('id', scriptId);
      scriptTag.text = metadata;
      document.head.appendChild(scriptTag);
    }
  }, [data]);

  const { routes } = navigationData as {
    title: string;
    routes: Route[];
  };

  // Check if the metadata is available for a given section before displaying it in navbar or page.
  const sections = routes.filter(
    route => !SHOULD_HIDE_SAMPLES(route.hash) && showSection(route, data),
  );

  const errorResponse =
    error && getQueryStatusError(error as unknown as { status: string });

  if (
    (!isLoading && Boolean(!id || id.toString() === 'undefined')) ||
    (!isLoading && !data)
  ) {
    // Redirect to 404 page if no id is provided or no data is found for the given id.
    router.push('/404');
    return <></>;
  }

  return (
    <>
      <PageContainer
        meta={getPageSeoConfig('/resources', {
          title: `${data?.name ? data?.name : 'Resource'}`,
          description: data?.description
            ? data?.description.slice(0, 160)
            : siteConfig.pages['/resources'].seo.description,
          keywords: data?.keywords?.slice(0, 15) ||
            siteConfig.pages['/resources'].seo.keywords || ['hello'],
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/resources?id=${
            Array.isArray(id) ? id[0].toLowerCase() : id?.toLowerCase()
          }`,
        })}
        includeSearchBar
      >
        <PageContent>
          <Flex
            flexDirection='column'
            maxW={{ base: 'unset', xl: '2000px' }}
            margin='0 auto'
            p={{ base: 0, md: 4 }}
            justifyContent='center'
            mb={32}
            flex={1}
            w='100%'
          >
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
            ) : !isLoading && !data ? (
              // [EMPTY STATE]: No Results
              <EmptyState />
            ) : (
              <Flex
                className='page-content'
                flexDirection='column'
                flex={1}
                pb={32}
                width='100%'
                alignItems='center'
                m='0 auto'
              >
                <Flex w='100%' h='100%' flexDirection='column' minW={150}>
                  <Flex
                    height='100%'
                    p={{ sm: 0, md: 2 }}
                    flexDirection={['column', 'column', 'row']}
                  >
                    <Card
                      className='main-content'
                      flex={3}
                      p={0}
                      width='100%'
                      sx={{ '>*': { p: 0 } }}
                      minW={150}
                      overflow='unset'
                    >
                      <Sections
                        isLoading={isLoading}
                        data={data}
                        sections={sections}
                      />
                    </Card>

                    <Sidebar
                      data={data}
                      isLoading={isLoading}
                      sections={sections}
                    />
                  </Flex>
                </Flex>
              </Flex>
            )}
          </Flex>
        </PageContent>
      </PageContainer>
    </>
  );
};

export default ResourcePage;
