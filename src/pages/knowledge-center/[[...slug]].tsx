import React, { useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  ListItem,
  SimpleGrid,
  SkeletonText,
  Text,
  UnorderedList,
  useMediaQuery,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import type { GetStaticProps, NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import DOCUMENTATION_COPY from 'configs/docs.json';
import { Error } from 'src/components/error';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import {
  SidebarContent,
  SidebarDesktop,
  SidebarMobile,
} from 'src/views/docs/components/Sidebar';
import SidebarContainer from 'src/views/docs/components/Sidebar';
import MainContent, {
  DocumentationProps,
} from 'src/views/docs/components/MainContent';
import Empty from 'src/components/empty';
import IntegrationMain from 'src/views/integration/components/Main';
import { DocsSearchBar } from 'src/views/docs/components/SearchBar';
import { HeroBanner } from 'src/views/docs/components/HeroBanner';

export interface DocumentationByCategories {
  id: number;
  name: string;
  createdAt: string;
  publishedAt: string;
  updatedAt: string;
  docs: {
    id: DocumentationProps['id'];
    name: DocumentationProps['name'];
    slug: DocumentationProps['slug'];
  }[];
}

// Fetch documentation from API.
export const fetchCategories = async () => {
  try {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    const docs = await axios.get(
      `${
        process.env.NEXT_PUBLIC_STRAPI_API_URL
      }/api/categories?filters[docs][name][$null]&populate[docs][fields][0]=name&populate[docs][fields][1]=slug&populate[docs][sort][1]=order:asc&pagination[page]=1&pagination[pageSize]=100&sort[0]=order:asc&publicationState=${
        isProd ? 'live' : 'preview'
      }`,
    );

    return docs.data.data;
  } catch (err: any) {
    throw err.response;
  }
};
const Docs: NextPage<{
  slug: string[];
  data: DocumentationProps;
}> = props => {
  const {
    data: documentationPagesList,
    isLoading,
    error,
  } = useQuery<DocumentationByCategories[], any, SidebarContent[]>({
    queryKey: ['docs'],
    queryFn: fetchCategories,
    select: (res: DocumentationByCategories[]) => {
      return res
        .map(({ id, name, ...data }) => {
          const docs =
            data?.docs?.map(doc => {
              return {
                id: doc.id,
                name: doc.name,
                slug: doc.slug,
                href: {
                  pathname: `/knowledge-center/${doc.slug}`,
                },
              };
            }) || [];
          return {
            id,
            name,
            items: docs,
          };
        })
        .filter(({ items }) => items.length > 0);
    },
    refetchOnWindowFocus: false,
  });

  const router = useRouter();

  const [isLargerThanSm] = useMediaQuery('(min-width: 48em)', {
    ssr: true,
    fallback: false, // return false on the server, and re-evaluate on the client side
  });

  const selectedPage = documentationPagesList?.reduce((r, page) => {
    const slug = Array.isArray(router.query.slug)
      ? router.query.slug[0]
      : router.query.slug;
    const currentItem = page.items.find(item => item.slug === slug);
    if (currentItem) {
      r = currentItem;
    }
    return r;
  }, {} as SidebarContent['items'][0]);

  const MAX_PAGES_PER_SECTION = 3;

  // Redirect to new "compatibility" slug if user is going to old "completeness" slug
  useEffect(() => {
    if (
      router.query.slug &&
      router.query.slug[0] === 'metadata-completeness-score'
    ) {
      router.push('/knowledge-center/metadata-compatibility-score');
    }
  });

  return (
    <PageContainer
      title='Knowledge Center'
      metaDescription='Documentation for the portal.'
      px={0}
      py={0}
    >
      <HeroBanner
        title={DOCUMENTATION_COPY.sections.hero.heading}
        subtitle={DOCUMENTATION_COPY.sections.hero.subtitle}
        body={!props.slug ? DOCUMENTATION_COPY.sections.hero.body : ''}
      />

      <Flex
        w='100%'
        justifyContent='flex-end'
        p={2}
        borderBottom='1px solid'
        borderBottomColor='gray.200'
      >
        <DocsSearchBar
          placeholder='Search Knowledge Center'
          ariaLabel='Search Knowledge Center'
        />
      </Flex>
      {error ? (
        <Error>
          <Flex flexDirection='column' justifyContent='center'>
            <Text fontWeight='light' color='gray.600' fontSize='lg'>
              API Request:{' '}
              {error?.statusText ||
                'It’s possible that the server is experiencing some issues.'}{' '}
            </Text>
          </Flex>
        </Error>
      ) : (
        <Flex
          justifyContent='center'
          bg='whiteAlpha.900'
          p={0}
          flexDirection={{ base: 'column', md: 'row' }}
        >
          {/* Documentation Pages Navigation */}
          {!props.slug || (!isLoading && !documentationPagesList?.length) ? (
            <></>
          ) : isLargerThanSm ? (
            <SidebarContainer>
              <SidebarDesktop
                isLoading={isLoading}
                sections={documentationPagesList}
                selectedSlug={
                  Array.isArray(router.query.slug)
                    ? router.query.slug[0]
                    : router.query.slug
                }
              />
            </SidebarContainer>
          ) : (
            <SidebarMobile
              isLoading={isLoading}
              menuTitle={selectedPage?.name || ''}
              selectedSlug={
                Array.isArray(router.query.slug)
                  ? router.query.slug[0]
                  : router.query.slug
              }
              sections={documentationPagesList}
            />
          )}
          {props.data?.id && props.slug ? (
            <Flex m='0 auto' flex={1}>
              {/* CONTENT */}
              <PageContent
                id='docs-content'
                bg='#fff'
                maxW={{ base: 'unset', lg: '1600px' }}
                margin='0 auto'
                px={4}
                py={4}
                justifyContent='center'
                mb={32}
                flex={1}
              >
                {props.slug[0] === 'integration' ? (
                  <IntegrationMain />
                ) : (
                  <MainContent
                    id={props.data.id}
                    data={props.data}
                    slug={props.slug}
                  />
                )}
              </PageContent>
            </Flex>
          ) : (
            <Box w='100%'>
              <PageContent id='general-docs' w='100%' bg='white'>
                {/* Empty state */}
                {!isLoading &&
                (!documentationPagesList || !documentationPagesList?.length) ? (
                  <Empty
                    message='No documentation currently available.'
                    alignItems='flex-start'
                    mt={8}
                    color='gray.500'
                    headingProps={{
                      fontSize: 'lg',
                      color: 'gray.600',
                    }}
                  />
                ) : (
                  // {/* List of categories with associated documents. */}
                  <SimpleGrid
                    columns={{ base: 1, md: 2, lg: 3 }}
                    spacing={{ base: 8, md: 10, lg: '50px' }}
                    margin='0 auto'
                    w={{ base: '100%', lg: '1000px' }}
                    gridAutoRows='min-content'
                  >
                    {documentationPagesList?.map((doc, i) => {
                      return (
                        <Box h='unset' key={doc.id}>
                          <Heading
                            as='h2'
                            fontSize='md'
                            color='text.body'
                            borderBottom='1px solid'
                            borderColor='gray.200'
                            pb={1}
                            mb={4}
                          >
                            {doc.name}
                          </Heading>
                          <UnorderedList ml={0}>
                            {doc.items
                              .slice(0, MAX_PAGES_PER_SECTION)
                              .map(item => {
                                return (
                                  <ListItem key={item.id} my={2}>
                                    <SkeletonText
                                      isLoaded={!isLoading}
                                      width={isLoading ? '75%' : '100%'}
                                    >
                                      <NextLink
                                        style={{
                                          display: 'flex',
                                          width: '100%',
                                        }}
                                        href={item.href}
                                        passHref
                                      >
                                        <Link
                                          as='span'
                                          w='100%'
                                          fontSize='sm'
                                          color='text.body!important'
                                          bg='transparent'
                                          lineHeight='tall'
                                          _selected={{
                                            color: 'niaid.600!important',
                                            bg: 'niaid.100',
                                          }}
                                          _hover={{
                                            [`&[aria-selected=false]`]: {
                                              bg: 'blackAlpha.50',
                                              borderRadius: 'base',
                                              transition: 'fast',
                                            },
                                          }}
                                        >
                                          {item.name}
                                        </Link>
                                      </NextLink>
                                    </SkeletonText>
                                  </ListItem>
                                );
                              })}

                            {/* show view more option when section has a lot of pages */}
                            {doc.items.length > MAX_PAGES_PER_SECTION && (
                              <ListItem my={2}>
                                <NextLink
                                  style={{ display: 'flex', width: '100%' }}
                                  href={doc.items[0].href}
                                  passHref
                                >
                                  <Link
                                    as='span'
                                    fontSize='sm'
                                    bg='transparent'
                                    lineHeight='tall'
                                  >
                                    View more...
                                  </Link>
                                </NextLink>
                              </ListItem>
                            )}
                          </UnorderedList>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                )}
              </PageContent>
            </Box>
          )}
        </Flex>
      )}
    </PageContainer>
  );
};

export const getStaticProps: GetStaticProps = async context => {
  if (!context || !context.params || !context.params.slug) {
    return { props: { slug: '', data: {} } };
  }
  const { slug } = context.params;
  const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
  const fetchDocumentation = async () => {
    try {
      const docs = await axios.get(
        `${
          process.env.NEXT_PUBLIC_STRAPI_API_URL
        }/api/docs?populate=*&filters[$and][0][slug][$eqi]=${slug}&publicationState=${
          isProd ? 'live' : 'preview'
        }`,
      );

      return docs.data.data;
    } catch (err: any) {
      throw err.response;
    }
  };
  // Fetch documentation from API.
  const [data] = await fetchDocumentation();
  return { props: { slug, data: data || {} } };
};

export async function getStaticPaths() {
  const fetchData = async () => {
    try {
      const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';

      const docs = await axios.get(
        `${
          process.env.NEXT_PUBLIC_STRAPI_API_URL
        }/api/docs?fields[0]=slug&publicationState=${
          isProd ? 'live' : 'preview'
        }`,
      );

      return {
        docs: docs.data.data as {
          id: number;
          documentId: string;
          slug: string;
        }[],
      };
    } catch (err) {
      throw err;
    }
  };

  // Call an external API endpoint to get documentation
  const { docs } = await fetchData();
  if (!docs.length) {
    return { paths: [], fallback: false };
  }
  // Get the paths we want to prerender based on posts
  // In production environments, prerender all pages
  // (slower builds, but faster initial page load)
  const paths = [
    { params: { slug: undefined } }, // handles /docs (without slug) route.
    { params: { slug: ['metadata-completeness-score'] } }, // handle removed completeness page
    ...docs
      .filter(doc => !!doc.slug)
      .map(doc => ({
        params: { slug: [doc.slug] },
      })),
  ];
  // { fallback: false } means other routes should 404
  return { paths, fallback: false };
}

export default Docs;
