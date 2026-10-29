import {
  Flex,
  Heading,
  HStack,
  Separator,
  Skeleton,
  SkeletonText,
  Tag,
  Text,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import Empty from 'src/components/empty';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';

import { FeaturedPageProps } from '../types';

interface MainContentProps {
  loading?: boolean;
  data?: FeaturedPageProps | null;
}

const Main = ({ data, loading }: MainContentProps) => {
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

  const MDXComponents = useMDXComponents();

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
        {loading || data ? (
          <>
            {/* v3 spreads `height` onto the loaded content too, so only pass it while loading (v2's `skeletonHeight`). */}
            <SkeletonText
              loading={loading}
              noOfLines={1}
              height={loading ? 10 : undefined}
              rootProps={{ mb: 2 }}
            >
              <Heading as='h1' size='xl'>
                {data?.title || ''}
              </Heading>
            </SkeletonText>
            <SkeletonText
              loading={loading}
              noOfLines={1}
              height={loading ? 6 : undefined}
              rootProps={{ mb: 4 }}
            >
              <Text color='gray.700' lineHeight='moderate'>
                {data?.subtitle || ''}
              </Text>
            </SkeletonText>

            <Skeleton
              loading={!!loading}
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
                <HStack gap={2} mt={8}>
                  {data.categories.map(({ id, name }) => (
                    <Tag.Root
                      key={id}
                      variant='surface'
                      size='sm'
                      colorPalette='accent'
                    >
                      <Tag.Label>{name}</Tag.Label>
                    </Tag.Root>
                  ))}
                </HStack>
              )}
            </Skeleton>

            <Separator orientation='horizontal' my={4} />
            <SkeletonText loading={loading} noOfLines={1}>
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
