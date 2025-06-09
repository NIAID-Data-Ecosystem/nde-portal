import { Flex, Heading, Text } from '@chakra-ui/react';
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

interface DisclaimerContent {
  name: string;
  description: string;
  subtitle: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

const fetchContent = async (): Promise<DisclaimerContent> => {
  try {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    const { data } = await axios.get(
      `${
        process.env.NEXT_PUBLIC_STRAPI_API_URL
      }/api/disclaimer-page?populate=*&publicationState=${
        isProd ? 'live' : 'preview'
      }`,
    );

    return data.data;
  } catch (err: any) {
    throw {
      ...err.response,
      message: '' + (err?.status || '') + err.message,
      name: '' + (err?.status || '') + err.name,
    };
  }
};

interface DisclaimerProps {
  data: DisclaimerContent;
  error: any;
}

const Disclaimer: NextPage<DisclaimerProps> = props => {
  const MDXComponents = useMDXComponents({});

  const [content, setContent] = useState<DisclaimerProps['data']>(props.data);
  const [contentError, setContentError] = useState<any>(props.error);

  const { error, data } = useQuery({
    queryKey: ['disclaimer-page'],
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
      title='Disclaimer'
      metaDescription='An overview of the NIAID Data Ecosystem Discovery Portal endorsement disclaimers and information disclaimers.'
      px={0}
      py={0}
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
          <Flex flexDirection='column' w='100%' maxW='1000px' mt={8} mb={32}>
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
          </Flex>
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

export default Disclaimer;
