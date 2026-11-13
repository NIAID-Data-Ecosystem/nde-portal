import { Box, Flex, Heading, Separator, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import Empty from 'src/components/empty';
import { Error } from 'src/components/error';
import { MDXComponents as DefaultMDXComponents } from 'src/components/mdx/components';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';

import { useDocumentation } from '../hooks/useDocumentation';
import type { DocumentationProps } from '../types';
import { transformString2Hash } from '../utils/markdown';

/*
Borders every image and video unless it has the `unstyled` class. Defined once
here rather than inline, so the components stay stable across renders and a
playing video isn't remounted.
*/
const mdxOverrides = {
  img: (props: any) =>
    DefaultMDXComponents.img({
      ...props,
      className: props?.className?.includes('unstyled')
        ? props.className
        : [props?.className, 'border'].filter(Boolean).join(' '),
    }),
};

interface MainContentProps {
  id: number;
  slug: string[];
  data: DocumentationProps;
}

const MainContent = ({ slug, data: initialData }: MainContentProps) => {
  const { data, isLoading, error } = useDocumentation({
    slug,
    initialData,
  });

  const [updatedAt, setUpdatedAt] = useState('');

  // Date formatting for last content update date
  useEffect(() => {
    if (data?.updatedAt) {
      const date = new Date(data.updatedAt).toLocaleString([], {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setUpdatedAt(date);
    }
  }, [data?.updatedAt]);

  const MDXComponents = useMDXComponents(mdxOverrides);

  if (error) {
    return (
      <Error>
        <Flex flexDirection='column' alignItems='center'>
          <Text fontWeight='light' color='gray.600' fontSize='lg'>
            API Request:{' '}
            {error?.message ||
              "It's possible that the server is experiencing some issues."}{' '}
          </Text>
        </Flex>
      </Error>
    );
  }

  if (!data?.id) {
    return <Empty>No documentation for this page exists.</Empty>;
  }

  return (
    <Flex
      flexDirection='column'
      flex={1}
      pb={32}
      maxW={{ base: 'unset', lg: '85%' }}
      width='100%'
      m='0 auto'
    >
      <Box mt={8} mb={4}>
        <Heading id={transformString2Hash(data.name)} as='h1' size='xl' mb={2}>
          {data.name}
        </Heading>
        <Text color='gray.500'>{data.subtitle}</Text>
      </Box>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, remarkGfm]}
        components={MDXComponents}
      >
        {data.description}
      </ReactMarkdown>
      <Separator orientation='horizontal' mt={8} mb={4} />
      <Text fontStyle='italic' fontSize='xs' color='gray.600' textAlign='end'>
        Last updated on{' '}
        <Text as='span' fontWeight='semibold'>
          {updatedAt}
        </Text>
      </Text>
    </Flex>
  );
};

export default MainContent;
