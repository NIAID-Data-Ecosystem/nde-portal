import { Flex, Skeleton, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import SITE_CONFIG from 'configs/site.config.json';
import type { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { fetchAllFeatures, fetchFeatureBySlug } from 'src/api/features';
import { FeatureQueryResponse } from 'src/api/features/types';
import { Error } from 'src/components/error';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import { SiteConfig } from 'src/components/page-container/types';
import Main from 'src/views/features/components/Main';
import { TableOfContents } from 'src/views/features/components/toc';

const siteConfig = SITE_CONFIG as SiteConfig;

const FeaturedPage: NextPage<{
  slug: string[];
}> = props => {
  // Fetch all featured pages from API for index.
  const { data: featuredPages } = useQuery<
    FeatureQueryResponse[],
    any,
    FeatureQueryResponse[]
  >({
    queryKey: ['featured'],
    queryFn: () => fetchAllFeatures(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Fetch current feature page from API using the route slug.
  const { isLoading, error, data } = useQuery<
    FeatureQueryResponse | null,
    any,
    FeatureQueryResponse | null
  >({
    queryKey: ['featured', { slug: props.slug }],
    queryFn: () => fetchFeatureBySlug(props.slug),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const pageTitle = data?.title || 'Features';
  return (
    <PageContainer
      meta={getPageSeoConfig('/features', {
        title:
          data?.metaFields?.title ||
          data?.title ||
          siteConfig.pages['/features'].seo.title,
        description:
          data?.metaFields?.description ||
          siteConfig.pages['/features'].seo.description,
        keywords:
          data?.metaFields?.keywords ||
          siteConfig.pages['/features'].seo.keywords,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/features/${
          props.slug?.[0] || ''
        }`,
      })}
      breadcrumbsTitle={pageTitle}
      px={0}
      py={0}
    >
      {error ? (
        <Error>
          <Flex flexDirection='column' justifyContent='center'>
            <Text fontWeight='light' color='gray.600' fontSize='lg'>
              API Request:{' '}
              {error?.message ||
                'It’s possible that the server is experiencing some issues.'}{' '}
            </Text>
          </Flex>
        </Error>
      ) : (
        <>
          {props.slug ? (
            <>
              <Flex>
                {/* Banner img */}
                {(isLoading || data?.banner) && (
                  <Skeleton
                    loading={!isLoading}
                    backgroundImage={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${data?.banner?.url}`}
                    backgroundSize='cover'
                    display={{ base: 'none', sm: 'flex' }}
                    width={{
                      base: 'none',
                      sm: '50px',
                      md: '150px',
                      lg: '300px',
                    }}
                  />
                )}

                <Flex
                  justifyContent='center'
                  bg='whiteAlpha.900'
                  p={0}
                  flex={1}
                  flexDirection={{ base: 'column', md: 'row' }}
                >
                  <PageContent
                    id='features-content'
                    bg='#fff'
                    maxW={{ base: 'unset', lg: '1600px' }}
                    margin={{ base: 'unset', md: '0 auto' }}
                    px={4}
                    py={4}
                    justifyContent='center'
                    mb={32}
                    flex={1}
                  >
                    {/* <Main isLoading={isLoading} data={data} /> */}
                  </PageContent>
                </Flex>
              </Flex>
            </>
          ) : (
            <TableOfContents data={featuredPages} />
          )}
        </>
      )}
    </PageContainer>
  );
};

export const getStaticProps: GetStaticProps = async context => {
  if (!context || !context.params || !context.params.slug) {
    return { props: { slug: '' } };
  }
  const { slug } = context.params;

  return { props: { slug } };
};

export async function getStaticPaths() {
  // Call an external API endpoint to get featured pages.
  const featuredPages = await fetchAllFeatures();
  if (!featuredPages.length) {
    return { paths: [], fallback: false };
  }
  // Get the paths we want to prerender based on posts
  // In production environments, prerender all pages
  // (slower builds, but faster initial page load)
  const paths = [
    { params: { slug: undefined } }, // handles /featured (without slug) route.
    ...featuredPages
      .filter(doc => !!doc.slug)
      .map(doc => ({
        params: { slug: [doc.slug] },
      })),
  ];

  // { fallback: false } means other routes should 404
  return { paths, fallback: false };
}

export default FeaturedPage;
