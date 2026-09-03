import {
  Box,
  Button,
  ButtonProps,
  Flex,
  HStack,
  Icon,
  Image,
  Skeleton,
  Stack,
  StackProps,
  Text,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { FaChevronRight } from 'react-icons/fa6';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MDXComponents as DefaultMDXComponents } from 'src/components/mdx/components';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';
import type { UrlObject } from 'url';

/**
 * StyledCard component
 * @description A component that displays a card with an image, title, subtitle, tags, and an optional button. It is used in the table of contents style pages.
 * @returns {JSX.Element} The rendered StyledCard component.
 */

interface StyledCardProps extends StackProps {
  loading?: boolean;
  title?: string;
  subtitle?: string;
  tags?: React.ReactNode;
  thumbnail?: { url: string; alternativeText: string } | null;
  renderCTA?: () => React.ReactNode;
}

export const StyledCard: React.FC<StyledCardProps> = ({
  id,
  loading,
  title,
  subtitle,
  children,
  tags,
  thumbnail,
  renderCTA,
}) => {
  return (
    <StyledCardWrapper id={id} loading={loading}>
      <VStack alignItems='flex-start' lineHeight='moderate'>
        <Stack flexDirection='row' alignItems='unset' flexWrap='wrap-reverse'>
          <Stack
            flexDirection='column'
            minWidth={{ base: '250px', sm: '350px' }}
            flex={1}
            gap={1.5}
          >
            {/* Main Heading */}
            <Box>
              <HStack>
                {title && <StyledCardLabel>{title}</StyledCardLabel>}

                {/* Tags */}
                {tags}
              </HStack>

              {/* Sub Heading */}
              {subtitle && <StyledCardSubLabel>{subtitle}</StyledCardSubLabel>}
            </Box>
            {/* Main content */}
            {children}
          </Stack>

          {/* Thumnail image */}
          {thumbnail?.url && (
            <Flex
              minWidth={250}
              maxWidth={{ base: 'unset', xl: '30%' }}
              flex={1}
              alignItems='flex-start'
            >
              <Image
                borderRadius='base'
                width='100%'
                height='auto'
                src={thumbnail.url}
                alt={thumbnail.alternativeText}
                objectFit='contain'
              />
            </Flex>
          )}
        </Stack>

        {/* Call to action button */}
        {renderCTA && (
          <Flex
            justifyContent={{ base: 'center', md: 'flex-end' }}
            width='100%'
          >
            {renderCTA()}
          </Flex>
        )}
      </VStack>
    </StyledCardWrapper>
  );
};

/**
 * StyledCardStack component
 * @description A component that displays a stack of cards with a specified spacing and margin. It is used in the table of contents style pages.
 *
 * @returns {JSX.Element} The rendered StyledCardStack component.
 */
export const StyledCardStack: React.FC<StackProps> = ({
  children,
  ...props
}) => {
  return (
    <VStack gap={4} alignItems='flex-start' {...props}>
      {children}
    </VStack>
  );
};

export const StyledCardWrapper: React.FC<
  StackProps & { loading?: boolean }
> = ({ children, id, loading, ...props }) => {
  return (
    <Skeleton
      as='section'
      id={id}
      loading={!!loading}
      minHeight={loading ? '200px' : 'unset'}
      w='100%'
      boxShadow='low'
      borderRadius='semi'
      borderColor='gray.200'
      p={[4, 6]}
      py={4}
      fontSize='sm'
      {...props}
    >
      {children}
    </Skeleton>
  );
};

export const StyledCardLabel: React.FC<{ children: string }> = ({
  children,
}) => {
  return (
    <Text fontWeight='semibold' color='text.heading' fontSize='lg'>
      {children}
    </Text>
  );
};

export const StyledCardSubLabel: React.FC<{ children: string }> = ({
  children,
}) => {
  return (
    <Text fontWeight='normal' fontSize='sm' lineHeight='moderate' opacity='0.8'>
      {children}
    </Text>
  );
};

export const StyledCardDescription: React.FC<{ children: string }> = ({
  children,
}) => {
  const MDXComponents = useMDXComponents({
    p: props => DefaultMDXComponents.p({ ...props, fontSize: 'sm', mt: 0 }),
  });

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw, remarkGfm]}
      components={MDXComponents}
    >
      {children}
    </ReactMarkdown>
  );
};

interface StyledCardButtonProps extends ButtonProps {
  href: UrlObject;
}

export const StyledCardButton: React.FC<StyledCardButtonProps> = ({
  children,
  href,
  ...props
}) => {
  return (
    <Button
      size='sm'
      wordBreak='break-word'
      whiteSpace='normal'
      textAlign='center'
      height='unset'
      width={{ base: '100%', md: 'unset' }}
      colorPalette='primary'
      asChild
      _hover={{
        '& svg': {
          transform: 'translateX(0)',
          transition: 'all .3s ease',
        },
      }}
      {...props}
    >
      <NextLink href={href}>{children}</NextLink>
    </Button>
  );
};
