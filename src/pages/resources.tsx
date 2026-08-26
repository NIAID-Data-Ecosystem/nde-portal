import { Box, Button, Card, Flex, Link, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import SITE_CONFIG from 'configs/site.config.json';
import { omit } from 'lodash';
import type { NextPage } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Empty from 'src/components/empty';
import { Error, ErrorCTA } from 'src/components/error';
import { getQueryStatusError } from 'src/components/error/utils';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import { SiteConfig } from 'src/components/page-container/types';
import Sections from 'src/components/resource-sections';
import { Sidebar } from 'src/components/resource-sections/components/sidebar';
import { Route, showSection } from 'src/components/resource-sections/helpers';
import { RESOURCE_SECTIONS } from 'src/components/resource-sections/resource-sections';
import { getResourceById } from 'src/utils/api';
import { FormattedResource } from 'src/utils/api/types';
import {
  SHOULD_HIDE_SAMPLES,
  SHOW_DATA_COLLECTIONS_TAB,
} from 'src/utils/feature-flags';
import { SavedDataErrorToast } from 'src/views/saved/components/saved-data-error-toast';

const siteConfig = SITE_CONFIG as SiteConfig;

// Displays empty message when no data exists.
const EmptyState = () => {
  return (
    <Card.Root w='100%'>
      <Empty message='No data available.' alignSelf='center' h='50vh'>
        <Text>No information about this dataset is available.</Text>

        <Button mt={4} asChild>
          <NextLink href={{ pathname: '/search' }}>Go to search</NextLink>
        </Button>
      </Empty>
    </Card.Root>
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

  const loading = loadingData || !router.isReady;

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

  const { routes } = RESOURCE_SECTIONS as {
    title: string;
    routes: Route[];
  };

  // Check if the metadata is available for a given section before displaying it in navbar or page.
  const sections = routes.filter(route => {
    // Hide the "description" section for data collection resources, as it is handled differently.
    const isDataCollectionType = data?.['@type'] === 'DataCollection';
    if (isDataCollectionType && route.hash === 'description') {
      return false;
    }
    return !SHOULD_HIDE_SAMPLES(route.hash) && showSection(route, data);
  });

  const errorResponse =
    error && getQueryStatusError(error as unknown as { status: string });

  if (
    (!loading && Boolean(!id || id.toString() === 'undefined')) ||
    (!loading && !data)
  ) {
    // Redirect to 404 page if no id is provided or no data is found for the given id.
    router.push('/404');
    return <></>;
  }

  // Redirect to 404 page if the data is of type DataCollection and the SHOW_DATA_COLLECTIONS_TAB feature flag is set to false.
  if (
    !loading &&
    data?.['@type'] === 'DataCollection' &&
    !SHOW_DATA_COLLECTIONS_TAB
  ) {
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
            <SavedDataErrorToast />
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
                              target='_blank'
                              rel='noopener noreferrer'
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
            ) : !loading && !data ? (
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
                    <Card.Root
                      className='main-content'
                      flex={3}
                      p={0}
                      width='100%'
                      css={{
                        '& >*': { p: 0 },
                      }}
                      minW={150}
                      overflow='unset'
                    >
                      <Sections
                        loading={loading}
                        data={data}
                        sections={sections}
                      />
                    </Card.Root>

                    <Sidebar
                      data={data}
                      loading={loading}
                      sections={sections.filter(
                        section => section.ui?.showInNavigation,
                      )}
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
