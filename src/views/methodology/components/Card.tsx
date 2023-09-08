import React from 'react';
import { Box, Flex, Image } from 'nde-design-system';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useMDXComponents } from 'mdx-components';
import type { Card } from '../types';
import { styledMdxComponents } from './Blocks';

interface StepCardProps extends Card {
  children?: React.ReactNode;
}

export const StepCard = ({ children, content, icon }: StepCardProps) => {
  const MDXComponents = useMDXComponents({
    ...styledMdxComponents,
  });

  return (
    <Box
      border='1px solid'
      borderColor='gray.100'
      borderRadius='semi'
      my={2}
      textAlign='left'
    >
      <Flex p={4} position='relative'>
        {icon && (
          <Box>
            <Box bg='page.alt' p={4} borderRadius='semi'>
              <Image
                w='40px'
                h='40px'
                src={`${process.env.NEXT_PUBLIC_STRAPI_ASSETS_URL}${icon.data.attributes.url}`}
                alt={icon.data.attributes.alternativeText}
              />
            </Box>
          </Box>
        )}
        <Box
          flex={1}
          px={4}
          sx={{
            '*': { fontSize: 'sm' },
            h4: { color: 'text.body' },
            ul: { maxW: '400px', margin: '0 auto' },
            ol: { maxW: '400px', margin: '0 auto' },
          }}
        >
          {content && (
            <ReactMarkdown
              rehypePlugins={[rehypeRaw, remarkGfm]}
              components={MDXComponents}
            >
              {content}
            </ReactMarkdown>
          )}
        </Box>
      </Flex>
    </Box>
  );
};
