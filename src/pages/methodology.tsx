import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Image,
  ListIcon,
  ListItem,
  Text,
} from 'nde-design-system';
import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { useMDXComponents } from 'mdx-components';
import LocalNavigation from 'src/components/resource-sections/components/navigation';
import { HashedHeading } from 'src/views/docs/components/mdx';
import IntegrationContent from 'content/integration.mdx';
import { MDXProvider } from '@mdx-js/react';
import { useQuery } from 'react-query';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import type { ContentProps } from 'src/views/methodology/types';
import { Error } from 'src/components/error';
import Empty from 'src/components/empty';
import { FaCheckCircle, FaStar } from 'react-icons/fa';

interface MethodologyProps {
  data: { page: ContentProps };
  error?: { message: string };
}

const Methodology: NextPage<MethodologyProps> = props => {
  const [content, setContent] = useState(props?.data?.page || null);
  const [error, setError] = useState(props?.error || null);

  const { isLoading } = useQuery<
    {
      page: ContentProps;
    },
    any,
    { page: ContentProps }
  >(['integration-page'], () => fetchPageContent(), {
    onSuccess(data) {
      if (!data || !data.page) {
        return null;
      }
      setContent(data.page);
    },
    onError(err) {
      setError({ message: err.message });
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const MDXComponents = useMDXComponents({
    p: (props: any) => (
      <Text my={4} lineHeight='tall' color='text.body' {...props} />
    ),
    blockquote: (props: any) => {
      return (
        <Flex
          justifyContent='center'
          borderRadius='semi'
          bg='page.alt'
          px={4}
          py={4}
          my={8}
          sx={{ ul: { listStyleType: 'none', maxWidth: '70%' } }}
          {...props}
        >
          <Box maxWidth='500px'>{props.children}</Box>
        </Flex>
      );
    },
    li: (props: any) => {
      return (
        <ListItem
          listStyleType='inherit'
          fontSize='sm'
          lineHeight='shorter'
          sx={{ input: { display: 'none' } }}
          pb={4}
          display='flex'
        >
          {props.checked !== null ? (
            <ListIcon
              as={props.checked ? FaCheckCircle : FaStar}
              color={props.checked ? 'green.500' : 'yellow.400'}
              boxSize={4}
              my={1}
              mx={3}
            />
          ) : (
            <></>
          )}
          <Box>{props.children}</Box>
        </ListItem>
      );
    },
  });

  const sections = [
    ...(content?.attributes?.overview?.map(({ title, slug }) => ({
      title,
      hash: slug,
    })) || []),
    {
      title: content?.attributes?.tabs?.title || '',
      hash: content?.attributes?.tabs?.slug || '',
    },
  ];

  return (
    <PageContainer
      hasNavigation
      title='Methodology'
      metaDescription='Information on integrating your data into the NIAID Data Ecosystem Discovery Portal.'
      px={0}
      py={0}
      disableSearchBar
    >
      <PageContent
        bg='#fff'
        maxW={{ base: 'unset', lg: '1600px' }}
        margin='0 auto'
        mb={32}
        px={0}
        py={[4, 6]}
        justifyContent='center'
        flex={1}
      >
        <Flex
          flexDirection='column'
          // alignItems='center'
          // px={[0, 8]}
          maxW={{ base: 'unset', lg: '60%' }}
          flex={1}
          width='100%'
          m='0 auto'
        >
          {error ? (
            <Error bg='#fff'>
              <Flex flexDirection='column' alignItems='center'>
                <Text fontWeight='light' color='gray.600' fontSize='lg'>
                  API Request:{' '}
                  {error?.message ||
                    'It’s possible that the server is experiencing some issues.'}{' '}
                </Text>
              </Flex>
            </Error>
          ) : content.attributes ? (
            <Flex flexDirection='column'>
              <Heading as='h1' size='xl' mb={2}>
                {content.attributes.title}
              </Heading>
              <ReactMarkdown
                rehypePlugins={[rehypeRaw, remarkGfm]}
                components={MDXComponents}
              >
                {content.attributes.description}
              </ReactMarkdown>
              {/* Overview */}
              {content.attributes.overview?.map(
                ({ id, title, description, slug, image }) => (
                  <Box
                    key={id}
                    id={slug}
                    as='section'
                    scrollMarginTop='-0.5rem'
                  >
                    <Flex
                      flexDirection={{ base: 'column-reverse', md: 'row' }}
                      py={8}
                    >
                      <Box flex={1}>
                        <HashedHeading
                          as='h3'
                          hash={slug}
                          id={`${id}-heading`}
                          fontSize='lg'
                          mt={6}
                          mb={2}
                        >
                          {title}
                        </HashedHeading>
                        {description && (
                          <ReactMarkdown
                            rehypePlugins={[rehypeRaw, remarkGfm]}
                            components={MDXComponents}
                          >
                            {description}
                          </ReactMarkdown>
                        )}
                      </Box>
                      {image && (
                        <Image
                          ml={[4, 8, 10]}
                          mb={[4, 8, 10]}
                          w='200px'
                          height='200px'
                          src={`${process.env.NEXT_PUBLIC_STRAPI_ASSETS_URL}${image.data.attributes.url}`}
                          alt='repository icon'
                        />
                      )}
                    </Flex>
                  </Box>
                ),
              )}
            </Flex>
          ) : (
            <Empty>No content for this page exists.</Empty>
          )}
        </Flex>
        <Box
          flex={1}
          position='sticky'
          top='0px'
          w='100%'
          h='100vh'
          minW='250px'
          maxW='350px'
          display={{ base: 'none', lg: 'block' }}
          flexDirection='column'
        >
          {sections.length || isLoading ? (
            <Box position='sticky' top='0px' py={4}>
              {sections.length ? (
                <LocalNavigation
                  routes={sections}
                  itemProps={{
                    borderLeftColor: 'primary.400',
                  }}
                />
              ) : (
                <></>
              )}
            </Box>
          ) : (
            <></>
          )}
        </Box>
      </PageContent>
    </PageContainer>
  );
};

interface QueryParams {
  publicationState?: string;
  fields?: string[];
  populate?:
    | {
        [key: string]: {
          fields: string[];
        };
      }
    | string;
  sort?: string;
  paginate?: { page?: number; pageSize?: number };
}

const fetchPageContent = async (
  params?: QueryParams,
): Promise<{
  page: ContentProps;
}> => {
  try {
    // in dev/staging mode, show drafts.
    const isProd = process.env.NODE_ENV;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/integration-page`,
      {
        params: {
          publicationState: isProd ? 'preview' : '',
          populate: [
            'overview.image',
            'tabs.panels.cards.icon',
            'tabs.panels.cards.tabItems.icon',
          ],
          ...params,
        },
      },
    );
    return { page: response.data.data };
  } catch (err: any) {
    throw err;
  }
};

export async function getStaticProps() {
  try {
    const data = await fetchPageContent()
      .then(res => res)
      .catch(err => {
        return {
          page: null,
          error: {
            message: `${err.response.status} : ${err.response.statusText}`,
            status: err.response.status,
          },
        };
      });

    return { props: { data } };
  } catch (err: any) {
    return {
      props: {
        data: [],
        error: {
          type: 'error',
          message: '' + err,
        },
      },
    };
  }
}

export default Methodology;
