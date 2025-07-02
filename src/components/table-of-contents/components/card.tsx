import React from 'react';
import { FaChevronRight } from 'react-icons/fa6';
import NextLink from 'next/link';
import type { UrlObject } from 'url';
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
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MDXComponents as DefaultMDXComponents } from 'src/components/mdx/components';

/**
 * StyledCard component
 * @description A component that displays a card with an image, title, subtitle, tags, and an optional button. It is used in the table of contents style pages.
 * @returns {JSX.Element} The rendered StyledCard component.
 */

interface StyledCardProps extends StackProps {
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  tags?: React.ReactNode;
  thumbnail?: { url: string; alternativeText: string };
  renderCTA?: () => React.ReactNode;
}

export const StyledCard: React.FC<StyledCardProps> = ({
  id,
  isLoading,
  title,
  subtitle,
  children,
  tags,
  thumbnail,
  renderCTA,
}) => {
  return (
    <StyledCardWrapper id={id} isLoading={isLoading}>
      <VStack alignItems='flex-start' lineHeight='short' mt={2}>
        <Stack
          spacing={{ base: 4, lg: 6, xl: 10 }}
          flexDirection='row'
          alignItems='unset'
          flexWrap='wrap-reverse'
        >
          <Stack
            flexDirection='column'
            alignItems='unset'
            minWidth={250}
            flex={1}
          >
            {/* Main Heading */}
            <Box>
              <HStack>
                {title && <StyleCardLabel>{title}</StyleCardLabel>}

                {/* Tags */}
                {tags}
              </HStack>

              {/* Sub Heading */}
              {subtitle && <StyleCardSubLabel>{subtitle}</StyleCardSubLabel>}
            </Box>
            {/* Main content */}
            {children}
          </Stack>

          {/* Thumnail image */}
          {thumbnail?.url && (
            <Flex
              minWidth={200}
              maxWidth={{ base: 'unset', xl: '25%' }}
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
    <VStack spacing={6} mt={4} alignItems='flex-start' {...props}>
      {children}
    </VStack>
  );
};

export const StyledCardWrapper: React.FC<
  StackProps & { isLoading?: boolean }
> = ({ children, id, isLoading, ...props }) => {
  return (
    <Skeleton
      as='section'
      id={id}
      isLoaded={!isLoading}
      minHeight={isLoading ? '200px' : 'unset'}
      w='100%'
      boxShadow='low'
      borderRadius='semi'
      borderColor='gray.200'
      py={4}
      px={[4, 6, 8]}
      fontSize='sm'
      {...props}
    >
      {children}
    </Skeleton>
  );
};

export const StyleCardLabel: React.FC<{ children: string }> = ({
  children,
}) => {
  return (
    <Text fontWeight='bold' color='text.heading' fontSize='xl'>
      {children}
    </Text>
  );
};

export const StyleCardSubLabel: React.FC<{ children: string }> = ({
  children,
}) => {
  return (
    <Text fontWeight='mediunm' fontSize='sm' lineHeight='short' opacity='0.8'>
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
    <Box as={NextLink} href={href} passHref legacyBehavior>
      <Button
        as='a'
        size='sm'
        rightIcon={
          <Icon
            as={FaChevronRight}
            boxSize={3}
            ml={1}
            transition='all .3s ease'
            transform='translateX(-5px)'
          />
        }
        wordBreak='break-word'
        whiteSpace='normal'
        textAlign='center'
        height='unset'
        width={{ base: '100%', md: 'unset' }}
        colorScheme='primary'
        sx={{
          '&:hover': {
            svg: {
              transform: 'translateX(0)',
              transition: 'all .3s ease',
            },
          },
        }}
        mt={2}
        {...props}
      >
        {children}
      </Button>
    </Box>
  );
};
