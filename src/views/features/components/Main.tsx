import React, { useEffect, useState } from 'react';
import { useMDXComponents } from 'mdx-components';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import {
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  ImageProps,
  Skeleton,
  SkeletonText,
  Tag,
  Text,
} from '@chakra-ui/react';
import mdxComponents from '../../docs/components/mdx';
import Empty from 'src/components/empty';
import { FeaturedPageProps } from '../types';

interface MainContentProps {
  isLoading?: boolean;
  data?: FeaturedPageProps | null;
}

const Main = ({ data, isLoading }: MainContentProps) => {
  // Date formatting for last content update date.
  const [updatedAt, setUpdatedAt] = useState('');

  useEffect(() => {
    if (data && data.updatedAt) {
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
        pt={8}
        maxW={{ base: 'unset', lg: '70%' }}
        width='100%'
        m='0 auto'
      >
        {isLoading || data ? (
          <>
            <SkeletonText
              isLoaded={!isLoading}
              mb={2}
              noOfLines={1}
              skeletonHeight={10}
            >
              <Heading as='h1' size='xl'>
                {data?.title || ''}
              </Heading>
            </SkeletonText>
            <SkeletonText
              isLoaded={!isLoading}
              mb={4}
              noOfLines={1}
              skeletonHeight={6}
            >
              <Text color='gray.700' lineHeight='short'>
                {data?.subtitle || ''}
              </Text>
            </SkeletonText>

            <Skeleton
              isLoaded={!isLoading}
              height='100%'
              display='flex'
              flexDirection='column'
            >
              <ReactMarkdown
                rehypePlugins={[rehypeRaw, remarkGfm]}
                components={MDXComponents}
              >
                {data?.content || ''}
              </ReactMarkdown>
              {data?.categories && data?.categories?.length > 0 && (
                <HStack spacing={2} mt={8}>
                  {data.categories.map(({ id, name }) => (
                    <Tag
                      key={id}
                      variant='outline'
                      size='sm'
                      colorScheme='accent'
                    >
                      {name}
                    </Tag>
                  ))}
                </HStack>
              )}
            </Skeleton>

            <Divider orientation='horizontal' my={4} />
            <SkeletonText
              isLoaded={!isLoading}
              noOfLines={1}
              skeletonHeight={4}
            >
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
            </SkeletonText>
          </>
        ) : (
          <Empty>No content for this page exists.</Empty>
        )}
      </Flex>
    </>
  );
};

export default Main;
