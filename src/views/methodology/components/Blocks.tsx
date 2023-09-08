import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import {
  Box,
  Flex,
  Image,
  ListIcon,
  ListItem,
  OrderedList,
  Text,
  TextProps,
  UnorderedList,
} from 'nde-design-system';
import { useMDXComponents } from 'mdx-components';
import type { OverviewProps } from 'src/views/methodology/types';
import { FaCheckCircle, FaStar } from 'react-icons/fa';
import { HeadingWithLink } from 'src/components/heading-with-link/components/HeadingWithLink';

export const styledMdxComponents = {
  ol: (props: any) => <OrderedList m={4}>{props.children}</OrderedList>,
  ul: (props: any) => (
    <UnorderedList
      listStyleType='none'
      m={4}
      sx={{ li: { display: 'flex', input: { display: 'none' } } }}
    >
      {props.children}
    </UnorderedList>
  ),
  li: (props: any) => {
    return (
      <ListItem listStyleType='inherit' lineHeight='tall' pb={4}>
        {props.checked !== null ? (
          <ListIcon
            as={props.checked ? FaCheckCircle : FaStar}
            color={props.checked ? 'whatsapp.500' : 'orange.300'}
            boxSize={4}
            my={1}
            mx={3}
          />
        ) : (
          <></>
        )}
        <Box>{props.children}</Box>
      </ListItem>
    );
  },
  p: (props: any) => (
    <Text my={2} lineHeight='tall' color='text.body' {...props} />
  ),
};

interface ParagraphSectionProps extends Omit<OverviewProps, 'id'> {
  imagePosition?: 'left' | 'right';
  textAlign?: TextProps['textAlign'];
  children?: React.ReactNode;
}

export const ParagraphSection = ({
  title,
  children,
  description,
  image,
  imagePosition = 'right',
  slug,
  textAlign,
}: ParagraphSectionProps) => {
  const MDXComponents = useMDXComponents(styledMdxComponents);

  return (
    <Box
      id={slug}
      as='section'
      scrollMarginTop='-0.5rem'
      my={{ base: 4, md: 6, lg: 8 }}
      textAlign={textAlign}
    >
      <Flex
        flexDirection={{
          base: 'column-reverse',
          md: imagePosition == 'left' ? 'row-reverse' : 'row',
        }}
        py={{ base: 4, md: 6, lg: 6 }}
      >
        <Flex flexDirection='column' flex={1}>
          {title && (
            <HeadingWithLink
              as='h3'
              slug={`#${slug}`}
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
        {image && (
          <Image
            ml={imagePosition === 'right' ? { base: 0, md: 8, lg: 10 } : {}}
            mr={imagePosition === 'left' ? { base: 0, md: 8, lg: 10 } : {}}
            w='200px'
            h='200px'
            src={`${process.env.NEXT_PUBLIC_STRAPI_ASSETS_URL}${image.data.attributes.url}`}
            alt={image.data.attributes.alternativeText}
          />
        )}
      </Flex>
      {children}
    </Box>
  );
};

export const ListBlock = ({ children }: { children?: string }) => {
  const MDXComponents = useMDXComponents(styledMdxComponents);

  return (
    <Flex
      flexDirection='column'
      alignItems='center'
      bg='tertiary.50'
      borderRadius='semi'
      px={4}
      py={[4, 8]}
      w='100%'
      sx={{
        '>*': { maxWidth: { base: 'unset', sm: '400px' } },
      }}
    >
      {children && (
        <ReactMarkdown
          rehypePlugins={[rehypeRaw, remarkGfm]}
          components={MDXComponents}
        >
          {children}
        </ReactMarkdown>
      )}
    </Flex>
  );
};
