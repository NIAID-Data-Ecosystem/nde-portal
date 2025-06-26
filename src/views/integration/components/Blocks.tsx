import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Box, BoxProps, Flex, Image } from '@chakra-ui/react';
import { useMDXComponents } from 'mdx-components';
import type { SectionProps } from 'src/views/integration/types';
import { HeadingWithLink } from 'src/components/heading-with-link/components/HeadingWithLink';
import { MDXComponents as DefaultMDX } from 'src/components/mdx/components';

export const customMDX = {
  li: (props: any) => {
    const childText = React.Children.toArray(props.children)
      .map(child => (typeof child === 'string' ? child : ''))
      .join('')
      .trim();

    const startsWithEmoji = /^\p{Extended_Pictographic}/u.test(childText);

    return DefaultMDX.li({
      ...props,
      listStyleType: startsWithEmoji ? 'none' : 'inherit',
    });
  },
};

interface ParagraphSectionProps
  extends Omit<BoxProps, 'id' | 'title'>,
    SectionProps {
  imagePosition?: 'left' | 'right';
  children?: React.ReactNode;
}

export const ParagraphSection = ({
  id,
  title,
  children,
  description,
  image,
  imagePosition = 'right',
  slug,
  ...props
}: ParagraphSectionProps) => {
  const MDXComponents = useMDXComponents(customMDX);

  return (
    <Box id={slug || id} as='section' scrollMarginTop='-0.5rem' {...props}>
      <Flex
        flexDirection={{
          base: 'column-reverse',
          md: imagePosition == 'left' ? 'row-reverse' : 'row',
        }}
        py={{ base: 4, md: 6, lg: 10 }}
      >
        <Flex flexDirection='column' flex={1}>
          {title && (
            <DefaultMDX.h3 slug={slug ? slug : ''}>{title}</DefaultMDX.h3>
          )}
          {description && (
            <ReactMarkdown
              rehypePlugins={[rehypeRaw, remarkGfm]}
              components={MDXComponents}
            >
              {description}
            </ReactMarkdown>
          )}
        </Flex>
        {image && (
          <Image
            ml={
              imagePosition === 'right'
                ? { base: 0, md: 8, lg: 10 }
                : { base: 0 }
            }
            mr={
              imagePosition === 'left'
                ? { base: 'auto', md: 8, lg: 10 }
                : { base: 'auto' }
            }
            w='auto'
            h='200px'
            src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${image.url}`}
            alt={image.alternativeText}
          />
        )}
      </Flex>
      {children}
    </Box>
  );
};

export const ListBlock = ({ children }: { children?: string }) => {
  const MDXComponents = useMDXComponents(customMDX);

  return (
    <Flex
      flexDirection='column'
      alignItems='center'
      bg='#fcfcfc'
      borderRadius='semi'
      px={4}
      py={[4, 8]}
      w='100%'
    >
      <Box margin='0 auto' maxW='500px'>
        {children && (
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, remarkGfm]}
            components={MDXComponents}
          >
            {children}
          </ReactMarkdown>
        )}
      </Box>
    </Flex>
  );
};
