import React, { useEffect } from 'react';
import type { GetStaticProps, NextPage } from 'next';
import {
  Flex,
  ListItem,
  Skeleton,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Error } from 'src/components/error';
import { Link } from 'src/components/link';
import { PageContainer, PageContent } from 'src/components/page-container';
import {
  fetchAllFeaturedPages,
  fetchFeaturedContent,
} from 'src/views/features/helpers';
import Main from 'src/views/features/components/Main';
import { FeaturedPageProps } from 'src/views/features/types';
import { useRouter } from 'next/router';

const FeaturedPage: NextPage<{
  slug: string[];
}> = props => {
  // Fetch all featured pages from API for index.
  const { data: featuredPages } = useQuery<
    FeaturedPageProps[],
    any,
    FeaturedPageProps[]
  >({
    queryKey: ['featured'],
    queryFn: () => fetchAllFeaturedPages(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Fetch current feature page from API using the route slug.
  const { isLoading, error, data } = useQuery<
    FeaturedPageProps | null,
    any,
    FeaturedPageProps | null
  >({
    queryKey: ['featured', { slug: props.slug }],
    queryFn: () => fetchFeaturedContent(props.slug),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // If the app is in production, redirect to a 404 page until search is fully implemented and approved.
  const router = useRouter();
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
      router.replace('/404');
    }
  }, [router]);

  return (
    <PageContainer
      title='Featured'
      metaDescription='Featured content for the portal.'
      px={0}
      py={0}
    >
      <Flex>
        {/* Banner img */}
        {(isLoading || data?.banner) && (
          <Skeleton
            isLoaded={!isLoading}
            backgroundImage={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${data?.banner?.url}`}
            backgroundSize='cover'
            display={{ base: 'none', sm: 'flex' }}
            width={{ base: 'none', sm: '50px', md: '150px', lg: '300px' }}
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
            {error ? (
              <Error bg='#fff'>
                <Flex flexDirection='column' alignItems='center'>
                  <Text fontWeight='light' color='gray.600' fontSize='lg'>
                    {error?.statusText ||
                      'It’s possible that the server is experiencing some issues.'}
                  </Text>
                </Flex>
              </Error>
            ) : props.slug ? (
              <Main isLoading={isLoading} data={data} />
            ) : (
              <UnorderedList>
                {/* [TO DO]: Add index page  */}
                {featuredPages &&
                  featuredPages.map(page => (
                    <ListItem key={page.slug}>
                      <Link href={`/features/${page.slug}`}>{page.title}</Link>
                    </ListItem>
                  ))}
              </UnorderedList>
            )}
          </PageContent>
        </Flex>
      </Flex>
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
  // Call an external API endpoint to get documentation
  const featuredPages = await fetchAllFeaturedPages();
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
