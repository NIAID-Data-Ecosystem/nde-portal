import axios from 'axios';
import { useQuery } from 'react-query';
import React, { useEffect, useState } from 'react';
import { useMDXComponents } from 'mdx-components';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Box, Divider, Flex, Heading, Text } from 'nde-design-system';
import { remark } from 'remark';
import Navigation from 'src/components/resource-sections/components/navigation';
import mdxComponents from './mdx';
import { transformString2Hash } from './helpers';
import { Error } from 'src/components/error';
import Empty from 'src/components/empty';

export interface DocumentationProps {
  id: number;
  attributes: {
    name: string;
    description: string;
    subtitle: string;
    slug: string | string[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    category: {
      data: {
        id: number;
        attributes: {
          name: string;
          createdAt: string;
          updatedAt: string;
          publishedAt: string;
        };
      };
    };
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

          if (child.type === 'heading' && child.depth <= maxDepth)
            headings.push({
              title: child.children[0].value.replace(/[^a-zA-Z\s]/g, '') || '',
              hash: transformString2Hash(child.children[0].value) || '',
              depth: child.depth,
            });
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

const MainContent = ({ slug, data: initialData }: MainContentProps) => {
  // used to determine what levels of heading to add to table of contents.
  const MAX_HEADING_DEPTH = 3;
  const [tocSections, setTocSections] = useState<ContentHeading[]>([]);

  const [data, setData] = useState(initialData);
  // Fetch documentation from API.
  const fetchDocumentation = async () => {
    try {
      const docs = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/docs?populate=*&filters[$and][0][slug][$eqi]=${slug}`,
      );

      return docs.data.data as DocumentationProps[];
    } catch (err: any) {
      throw err.response;
    }
  };
  const { isLoading, error } = useQuery<DocumentationProps[] | undefined, any>(
    ['doc', { slug }],
    fetchDocumentation,
    {
      onSuccess(data) {
        if (!data || !data[0]) {
          return {};
        }
        setData(data[0]);
        const markdownSections = extractMarkdownHeadings(
          data[0].attributes.description,
          MAX_HEADING_DEPTH,
        );
        setTocSections([
          {
            title: data[0].attributes.name,
            hash: transformString2Hash(data[0].attributes.name),
            depth: 1,
          },
          ...markdownSections,
        ]);
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  // Date formatting for last content update date.
  const [updatedAt, setUpdatedAt] = useState('');
  useEffect(() => {
    if (data && data.attributes && data.attributes.updatedAt) {
      const date = new Date(data.attributes.updatedAt).toLocaleString([], {
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
                {error?.statusText ||
                  'It’s possible that the server is experiencing some issues.'}{' '}
              </Text>
            </Flex>
          </Error>
        ) : data?.id ? (
          <>
            <Box mt={8} mb={4}>
              <Heading
                id={transformString2Hash(data.attributes.name)}
                as='h1'
                size='xl'
                mb={2}
              >
                {data.attributes.name}
              </Heading>
              <Text color='niaid.placeholder'>{data.attributes.subtitle}</Text>
            </Box>
            <ReactMarkdown
              rehypePlugins={[rehypeRaw, remarkGfm]}
              components={MDXComponents}
            >
              {data.attributes.description}
            </ReactMarkdown>
            <Divider orientation='horizontal' mt={8} mb={4} />
            <Text
              fontStyle='italic'
              fontSize='xs'
              color='gray.600'
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
          <Box
            position='sticky'
            top='0px'
            px={4}
            overflow='auto'
            maxH='100%'
            sx={{
              '&::-webkit-scrollbar': {
                width: '7px',
                height: '7px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'blackAlpha.100',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'gray.300',
                borderRadius: '10px',
              },
              _hover: {
                '&::-webkit-scrollbar-thumb': {
                  background: 'niaid.placeholder',
                },
              },
            }}
          >
            {tocSections.length ? (
              <Navigation
                intersectionObserverOptions={{
                  rootMargin: '0% 0px -40% 0px',
                  threshold: 0.5,
                }}
                routes={tocSections}
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
    </>
  );
};

export default MainContent;
