import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flex, Skeleton, Text } from '@chakra-ui/react';
import type { GetStaticProps, NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import axios from 'axios';
import Main from 'src/views/features/components/Main';
import { Error } from 'src/components/error';
import {
  FeaturedPageProps,
  fetchAllFeaturedPages,
} from 'src/views/features/helpers';

const fetchFeaturedContent = async (slug: string | string[]) => {
  try {
    const isProd =
      process.env.NEXT_PUBLIC_BASE_URL === 'https://data.niaid.nih.gov';
    const featured = await axios.get(
      `${
        process.env.NEXT_PUBLIC_STRAPI_API_URL
      }/api/features?populate=*&filters[$and][0][slug][$eqi]=${slug}&publicationState=${
        isProd ? 'live' : 'preview'
      }`,
    );
    return featured.data.data[0] as FeaturedPageProps;
  } catch (err: any) {
    throw err.response;
  }
};
const FeaturedPage: NextPage<{
  slug: string[];
}> = props => {
  // Fetch documentation from API.
  const { isLoading, error, data } = useQuery<
    FeaturedPageProps | undefined,
    any,
    FeaturedPageProps | undefined
  >({
    queryKey: ['featured', { slug: props.slug }],
    queryFn: () => fetchFeaturedContent(props.slug),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
  return (
    <PageContainer
      title='Featured'
      metaDescription='Featured content for the portal.'
      px={0}
      py={0}
      disableSearchBar
    >
      <Flex>
        {/* Banner img */}
        {(isLoading || data?.attributes?.banner?.data) && (
          <Skeleton
            isLoaded={!isLoading}
            backgroundImage={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${data?.attributes.banner.data?.attributes.url}`}
            backgroundSize='cover'
            display={{ base: 'none', sm: 'flex' }}
            width={{ base: 'none', sm: '50px', md: '150px', lg: '300px' }}
          ></Skeleton>
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
            margin='0 auto'
            px={4}
            py={4}
            justifyContent='center'
            mb={32}
            flex={1}
          >
            {error ? (
              <Error bg='#fff'>
                <Flex flexDirection='column' alignItems='center'>
                  <Text fontWeight='light' color='gray.600' fontSize='lg'>
                    {error?.statusText ||
                      'It’s possible that the server is experiencing some issues.'}{' '}
                  </Text>
                </Flex>
              </Error>
            ) : (
              <Main isLoading={isLoading} data={data} />
            )}
          </PageContent>
        </Flex>
      </Flex>
    </PageContainer>
  );
};

export const getStaticProps: GetStaticProps = async context => {
  if (!context || !context.params || !context.params.slug) {
    return { props: { slug: '', data: {} } };
  }
  const { slug } = context.params;

  // Fetch documentation from API.
  const data = await fetchFeaturedContent(slug);
  return { props: { slug } };
};

export async function getStaticPaths() {
  // Call an external API endpoint to get documentation
  const { data } = await fetchAllFeaturedPages();
  if (!data.length) {
    return { paths: [], fallback: false };
  }
  // Get the paths we want to prerender based on posts
  // In production environments, prerender all pages
  // (slower builds, but faster initial page load)
  const paths = [
    { params: { slug: undefined } }, // handles /featured (without slug) route.
    ...data.map(data => ({
      params: { slug: [data.attributes.slug] },
    })),
  ];

  // { fallback: false } means other routes should 404
  return { paths, fallback: false };
}

export default FeaturedPage;
