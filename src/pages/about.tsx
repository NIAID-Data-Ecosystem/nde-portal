import { Box, Heading, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMDXComponents } from 'mdx-components';
import type { GetStaticProps, NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { PageContainer, PageContent } from 'src/components/page-container';
import { Error } from 'src/components/error';

interface AboutContent {
  name: string;
  description: string;
  subtitle: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
interface AboutProps {
  data: AboutContent;
  error: any;
}

const fetchContent = async (): Promise<AboutContent> => {
  try {
    const isProd =
      process.env.NEXT_PUBLIC_BASE_URL === 'https://data.niaid.nih.gov';
    const { data } = await axios.get(
      `${
        process.env.NEXT_PUBLIC_STRAPI_API_URL
      }/api/about-page?populate=*&publicationState=${
        isProd ? 'live' : 'preview'
      }`,
    );

    return data.data.attributes;
  } catch (err: any) {
    throw {
      ...err.response,
      message: '' + (err?.status || '') + err.message,
      name: '' + (err?.status || '') + err.name,
    };
  }
};

const About: NextPage<AboutProps> = props => {
  const MDXComponents = useMDXComponents({});

  const [content, setContent] = useState<AboutProps['data']>(props.data);
  const [contentError, setContentError] = useState<any>(props.error);

  const { error, data } = useQuery({
    queryKey: ['about-page'],
    queryFn: () => fetchContent(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (error) {
      setContentError({
        message: error.message,
      });
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      setContent(data);
    }
  }, [content, data]);

  return (
    <PageContainer
      title='About'
      metaDescription='About page.'
      px={0}
      py={0}
      includeSearchBar
    >
      {contentError && !content && (
        <Error>
          <Text fontWeight='light' color='gray.600' fontSize='lg'>
            {contentError?.name || ''}{' '}
            {contentError?.message ||
              'It’s possible that the server is experiencing some issues.'}{' '}
          </Text>
        </Error>
      )}
      {content && (
        <PageContent
          w='100%'
          flexDirection='column'
          alignItems='center'
          bg='#fff'
        >
          <Box w='100%' maxW='1000px' mt={8} mb={32}>
            <Heading as='h1' fontSize='4xl'>
              {content.name || ''}
            </Heading>
            {content?.subtitle && (
              <Text color='gray.700'>{content.subtitle}</Text>
            )}

            <ReactMarkdown
              rehypePlugins={[rehypeRaw, remarkGfm]}
              components={MDXComponents}
            >
              {content?.description || ''}
            </ReactMarkdown>
          </Box>
        </PageContent>
      )}
    </PageContainer>
  );
};

export const getStaticProps: GetStaticProps = async context => {
  if (!context) {
    return {
      props: {
        data: {
          name: '',
          description: '',
          createdAt: '',
          updatedAt: '',
          publishedAt: '',
        },
      },
    };
  }
  const content = await fetchContent().catch(err => err);
  if (content?.data?.error) {
    return {
      props: {
        error: {
          message: content.data.error?.status
            ? `Request failed with status code ${content.data.error?.status}`
            : content.data.error.message,
        },
        data: null,
      },
    };
  }

  return { props: { data: content, error: null } };
};

export default About;
