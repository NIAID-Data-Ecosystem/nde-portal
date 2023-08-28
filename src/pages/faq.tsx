import { Flex, Heading, Text } from 'nde-design-system';
import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { Error } from 'src/components/error';
import { useMDXComponents } from 'mdx-components';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import Empty from 'src/components/empty';

interface FrequentlyAskedProps {
  data: {
    compiledMDX: MDXRemoteSerializeResult;
    id: string;
    attributes: {
      description: string;
      name: string;
      createdAt: string;
      publishedAt: string;
      updatedAt: string;
    };
  } | null;
  error?: { message: string };
}

const FrequentlyAsked: NextPage<FrequentlyAskedProps> = props => {
  const { data, error } = props;
  const MDXComponents = useMDXComponents({});
  return (
    <PageContainer
      hasNavigation
      title='FAQ'
      metaDescription='Frequenty asked questions.'
      px={0}
      py={0}
      disableSearchBar
    >
      <PageContent justifyContent='center'>
        {error ? (
          <Error>
            <Flex flexDirection='column' alignItems='center'>
              <Text>{data?.attributes.name}</Text>
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
              {data.attributes.description}
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
    const body = await data.attributes.description;

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
