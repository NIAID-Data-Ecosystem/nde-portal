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
  Text,
  UnorderedList,
} from 'nde-design-system';
import { useMDXComponents } from 'mdx-components';
import type { OverviewProps } from 'src/views/methodology/types';
import { FaCheckCircle, FaStar } from 'react-icons/fa';
import { HeadingWithLink } from 'src/components/heading-with-link/components/HeadingWithLink';

interface ParagraphSectionProps extends OverviewProps {
  imagePosition?: 'left' | 'right';
}

export const ParagraphSection = ({
  title,
  description,
  image,
  imagePosition = 'right',
  slug,
}: ParagraphSectionProps) => {
  const MDXComponents = useMDXComponents({
    ul: (props: any) => (
      <UnorderedList as='ul' listStyleType='none' ml={0} mx={2} {...props} />
    ),
    li: (props: any) => {
      return (
        <ListItem
          listStyleType='inherit'
          lineHeight='tall'
          sx={{ input: { display: 'none' } }}
          pb={4}
          display='flex'
        >
          {props.checked !== null ? (
            <ListIcon
              as={props.checked ? FaCheckCircle : FaStar}
              color={props.checked ? 'whatsapp.500' : 'orange.300'}
              boxSize={4}
              my={0.5}
              mx={4}
            />
          ) : (
            <></>
          )}
          <Box>{props.children}</Box>
        </ListItem>
      );
    },
    p: (props: any) => (
      <Text my={4} lineHeight='tall' color='text.body' {...props} />
    ),
  });

  const [descriptionText, additionalContent] =
    description?.split('<hr/>') || [];

  return (
    <Box
      id={slug}
      as='section'
      scrollMarginTop='-0.5rem'
      my={{ base: 4, md: 6, lg: 8 }}
    >
      <Flex
        flexDirection={{
          base: 'column-reverse',
          md: imagePosition == 'left' ? 'row-reverse' : 'row',
        }}
        py={{ base: 4, md: 6, lg: 6 }}
      >
        <Box flex={1}>
          <HeadingWithLink
            as='h3'
            slug={`#${slug}`}
            fontSize='lg'
            mt={6}
            mb={2}
          >
            {title}
          </HeadingWithLink>
          {descriptionText && (
            <ReactMarkdown
              rehypePlugins={[rehypeRaw, remarkGfm]}
              components={MDXComponents}
            >
              {descriptionText}
            </ReactMarkdown>
          )}
        </Box>
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
      {additionalContent && (
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
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, remarkGfm]}
            components={MDXComponents}
          >
            {additionalContent}
          </ReactMarkdown>
        </Flex>
      )}
    </Box>
  );
};
