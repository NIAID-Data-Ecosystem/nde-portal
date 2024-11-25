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
import { FeaturedPageProps } from '../helpers';

interface MainContentProps {
  isLoading?: boolean;
  data?: FeaturedPageProps;
}

const Main = ({ data, isLoading }: MainContentProps) => {
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

  const MDXComponents = useMDXComponents({
    ...mdxComponents,
    br: () => <br />,
    p: (props: any) => {
      return (
        <Text mt={2} size='sm' lineHeight='tall' color='text.body' {...props} />
      );
    },
    img: (props: ImageProps) => {
      // Strapi image path retrieved from the API is a full path but we only need the relative path
      const relative_url =
        props.src && !props.src.startsWith('/')
          ? `/uploads/${props.src.split('/uploads/')[1]}`
          : props.src;

      let styles = {} as any;
      if (props.align === 'right' || props.float === 'right') {
        styles.pl = { base: 4, lg: 6 };
      } else if (props.align === 'left' || props.float === 'left') {
        styles.pr = { base: 4, lg: 6 };
      }
      return (
        <Image
          {...styles}
          {...props}
          my={2}
          src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${relative_url}`}
          alt={props.alt || 'image'}
        />
      );
    },
  });

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
        {isLoading || data?.id ? (
          <>
            <SkeletonText
              isLoaded={!isLoading}
              mb={2}
              noOfLines={1}
              skeletonHeight={10}
            >
              <Heading as='h1' size='xl'>
                {data?.attributes?.title || ''}
              </Heading>
            </SkeletonText>
            <SkeletonText
              isLoaded={!isLoading}
              mb={4}
              noOfLines={1}
              skeletonHeight={6}
            >
              <Text color='gray.700' lineHeight='short'>
                {data?.attributes?.subtitle || ''}
              </Text>
            </SkeletonText>

            <Skeleton isLoaded={!isLoading} height='100%'>
              <ReactMarkdown
                rehypePlugins={[rehypeRaw, remarkGfm]}
                components={MDXComponents}
              >
                {data?.attributes?.content || ''}
              </ReactMarkdown>
              {data?.attributes?.categories?.data &&
                data?.attributes?.categories?.data.length > 0 && (
                  <HStack spacing={2} mt={8}>
                    {data?.attributes.categories.data.map(
                      ({ id, attributes }) => (
                        <Tag
                          key={id}
                          variant='outline'
                          size='sm'
                          colorScheme='accent'
                        >
                          {attributes.name}
                        </Tag>
                      ),
                    )}
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
