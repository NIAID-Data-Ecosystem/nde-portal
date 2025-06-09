import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useMDXComponents } from 'mdx-components';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Box, Divider, Flex, Heading, Text } from '@chakra-ui/react';
import { remark } from 'remark';
import Navigation from 'src/components/resource-sections/components/navigation';
import mdxComponents from './mdx';
import { transformString2Hash } from './helpers';
import { Error } from 'src/components/error';
import Empty from 'src/components/empty';
import { ScrollContainer } from 'src/components/scroll-container';

export interface DocumentationProps {
  id: number;
  name: string;
  description: string;
  subtitle: string;
  slug: string | string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  category: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

interface ContentHeading {
  title: string;
  hash: string;
  depth: number;
}

const extractMarkdownHeadings = (
  content: string,
  maxDepth: number,
  ignoreDetailsContent = true,
): ContentHeading[] => {
  const headings: ContentHeading[] = [];
  remark()
    .use(() => {
      let isInsideDetailsTag = false;
      return (root: any) => {
        root.children.map((child: any) => {
          if (ignoreDetailsContent && child.type === 'html') {
            if (child.value.startsWith('<details>')) {
              isInsideDetailsTag = true;
            } else if (child.value.startsWith('</details>')) {
              isInsideDetailsTag = false;
            }
          }
          //ignore headings within <details> html tag
          if (ignoreDetailsContent && isInsideDetailsTag) return;

          if (child.type === 'heading' && child.depth <= maxDepth) {
            headings.push({
              title: child.children[0].value?.replace(/[^a-zA-Z\s]/g, '') || '',
              hash: transformString2Hash(child.children[0].value) || '',
              depth: child.depth,
            });
          }
        });
      };
    })
    .process(content);
  return headings;
};

interface MainContentProps {
  id: number;
  slug: string[];
  data: DocumentationProps;
}

// Fetch documentation from API.
const fetchDocumentation = async (slug: string[]) => {
  try {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    const docs = await axios.get(
      `${
        process.env.NEXT_PUBLIC_STRAPI_API_URL
      }/api/docs?populate=*&filters[$and][0][slug][$eqi]=${slug}&publicationState=${
        isProd ? 'live' : 'preview'
      }`,
    );
    return docs.data.data as DocumentationProps[];
  } catch (err: any) {
    throw err.response;
  }
};
// used to determine what levels of heading to add to table of contents.
const MAX_HEADING_DEPTH = 3;

const MainContent = ({ slug, data: initialData }: MainContentProps) => {
  const {
    data: queryData,
    isLoading,
    error,
  } = useQuery<
    DocumentationProps[] | null,
    Error,
    { data: DocumentationProps; tocSections: ContentHeading[] }
  >({
    queryKey: ['doc', { slug }],
    queryFn: () => fetchDocumentation(slug),
    placeholderData: [initialData],
    select: data => {
      if (!data || !data[0]) {
        return {
          data: initialData,
          tocSections: [],
        };
      }
      const markdownSections = extractMarkdownHeadings(
        data[0].description,
        MAX_HEADING_DEPTH,
      );

      return {
        data: data[0],
        tocSections: [
          {
            title: data[0].name,
            hash: transformString2Hash(data[0].name),
            depth: 1,
          },
          ...markdownSections,
        ],
      };
    },
    refetchOnWindowFocus: false,
  });

  // Date formatting for last content update date.
  const [updatedAt, setUpdatedAt] = useState('');
  const tocSections = queryData?.tocSections || [];
  const data = queryData?.data;
  useEffect(() => {
    if (data && data && data.updatedAt) {
      const date = new Date(data.updatedAt).toLocaleString([], {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setUpdatedAt(date);
    }
  }, [data]);

  const MDXComponents = useMDXComponents(mdxComponents);
  return (
    <>
      <Flex
        flexDirection='column'
        flex={1}
        pb={32}
        maxW={{ base: 'unset', lg: '70%' }}
        width='100%'
        m='0 auto'
      >
        {error ? (
          <Error>
            <Flex flexDirection='column' alignItems='center'>
              <Text fontWeight='light' color='gray.600' fontSize='lg'>
                API Request:{' '}
                {error?.message ||
                  'It’s possible that the server is experiencing some issues.'}{' '}
              </Text>
            </Flex>
          </Error>
        ) : data?.id ? (
          <>
            <Box mt={8} mb={4}>
              <Heading
                id={transformString2Hash(data.name)}
                as='h1'
                size='xl'
                mb={2}
              >
                {data.name}
              </Heading>
              <Text color='gray.700'>{data.subtitle}</Text>
            </Box>
            <ReactMarkdown
              rehypePlugins={[rehypeRaw, remarkGfm]}
              components={MDXComponents}
            >
              {data.description}
            </ReactMarkdown>
            <Divider orientation='horizontal' mt={8} mb={4} />
            <Text
              fontStyle='italic'
              fontSize='xs'
              color='gray.800'
              textAlign='end'
            >
              Last updated on{' '}
              <Text as='span' fontWeight='semibold'>
                {updatedAt}
              </Text>
            </Text>
          </>
        ) : (
          <Empty>No documentation for this page exists.</Empty>
        )}
      </Flex>

      {/* TABLE OF CONTENTS */}
      <Box
        flex={1}
        position='sticky'
        top='0px'
        w='100%'
        h='100vh'
        maxW='350px'
        display={{ base: 'none', xl: 'block' }}
        flexDirection='column'
        px={2}
      >
        {tocSections.length > 1 || isLoading ? (
          <ScrollContainer
            position='sticky'
            top='0px'
            px={4}
            overflow='auto'
            maxH='100%'
          >
            {tocSections.length ? (
              <Navigation
                intersectionObserverOptions={{
                  rootMargin: '0% 0px -40% 0px',
                  threshold: 0.5,
                }}
                routes={tocSections}
                itemProps={{
                  color: 'primary.500',
                  borderLeftColor: 'primary.400',
                }}
              />
            ) : (
              <></>
            )}
          </ScrollContainer>
        ) : (
          <></>
        )}
      </Box>
    </>
  );
};

export default MainContent;
