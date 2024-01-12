import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import {
  Box,
  BoxProps,
  Flex,
  Image,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { useMDXComponents } from 'mdx-components';
import type { SectionProps } from 'src/views/integration/types';
import { HeadingWithLink } from 'src/components/heading-with-link/components/HeadingWithLink';

export const styledMdxComponents = {
  ol: ({ ordered, ...props }: any) => (
    <OrderedList p={[1, 2]}>{props.children}</OrderedList>
  ),
  ul: ({ ordered, ...props }: any) => (
    <UnorderedList listStyleType='none' py={[1, 2]} {...props}>
      {props.children}
    </UnorderedList>
  ),
  li: ({ ordered, ...props }: any) => {
    // Check if the first child of the list item is an emoji and style it accordingly.
    if (Array.isArray(props.children)) {
      const startsWithSymbol =
        props.children[0].charAt(0) === '✅' ||
        props.children[0].charAt(0) === '✨';
      if (startsWithSymbol) {
        return (
          <ListItem
            listStyleType='none'
            display='flex'
            lineHeight='tall'
            pb={4}
            {...props}
          >
            <Box>{props.children[0].charAt(0)}</Box>
            <Text ml={2}>{props.children[0].slice(1)}</Text>
          </ListItem>
        );
      }
    }
    return (
      <ListItem listStyleType='inherit' lineHeight='tall' pb={4} {...props}>
        {props.children}{' '}
      </ListItem>
    );
  },
  p: (props: any) => (
    <Text my={2} lineHeight='tall' color='text.body' {...props} />
  ),
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
  const MDXComponents = useMDXComponents(styledMdxComponents);

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
            <HeadingWithLink
              as='h3'
              slug={slug ? `#${slug}` : ''}
              fontSize='lg'
              mt={6}
              mb={2}
            >
              {title}
            </HeadingWithLink>
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
        {image && image.data && (
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
            src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${image.data.attributes.url}`}
            alt={image.data.attributes.alternativeText}
          />
        )}
      </Flex>
      {children}
    </Box>
  );
};

export const ListBlock = ({ children }: { children?: string }) => {
  const MDXComponents = useMDXComponents({
    ...styledMdxComponents,
    ul: (props: any) =>
      styledMdxComponents.ul({
        ...props,
        px: { base: 0, md: 10 },
      }),
  });

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
