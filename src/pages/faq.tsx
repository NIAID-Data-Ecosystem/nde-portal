import { Flex, Heading, Text } from '@chakra-ui/react';
import type { NextPage } from 'next';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { Error } from 'src/components/error';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import Empty from 'src/components/empty';

interface FrequentlyAskedProps {
  data: {
    compiledMDX: MDXRemoteSerializeResult;
    id: string;
    description: string;
    name: string;
    createdAt: string;
    publishedAt: string;
    updatedAt: string;
  } | null;
  error?: { message: string };
}

const FrequentlyAsked: NextPage<FrequentlyAskedProps> = props => {
  const { data, error } = props;
  const MDXComponents = useMDXComponents();
  return (
    <PageContainer meta={getPageSeoConfig('/faq')} px={0} py={0}>
      <PageContent justifyContent='center'>
        {error ? (
          <Error>
            <Flex flexDirection='column' alignItems='center'>
              <Text>{data?.name}</Text>
            </Flex>
          </Error>
        ) : data ? (
          <Flex maxW='1000px' flexDirection='column' mb={32}>
            <Heading as='h1' size='lg' mb={6}>
              Frequently Asked Questions
            </Heading>
            <ReactMarkdown
              components={MDXComponents}
              rehypePlugins={[rehypeRaw, remarkGfm]}
            >
              {data.description}
            </ReactMarkdown>
          </Flex>
        ) : (
          <Empty message='Nothing to display.' alignSelf='center' h='50vh' />
        )}
      </PageContent>
    </PageContainer>
  );
};

export async function getStaticProps() {
  const fetchDocs = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/docs?populate=*&filters[category][name][$eq]=FAQ`,
      );
      const { data } = response.data;
      return data[0];
    } catch (err) {
      throw err;
    }
  };
  try {
    const data = await fetchDocs();
    const body = await data.description;

    const compiledMDX = await serialize(body);

    return { props: { data: { ...data, compiledMDX } } };
  } catch (err) {
    return {
      props: {
        data: null,
        error: { message: 'Error retrieving data' },
      },
    };
  }
}

export default FrequentlyAsked;
