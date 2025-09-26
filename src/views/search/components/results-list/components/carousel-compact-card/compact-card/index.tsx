import React, { ReactNode } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardProps,
  BoxProps,
  TextProps,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { TypeBanner } from 'src/components/resource-sections/components';
import { DisplayHTMLContent } from 'src/components/html-content';
import { Skeleton } from 'src/components/skeleton';
import { AllResourceType } from 'src/utils/formatting/formatResourceType';

const CARD_HEIGHTS = {
  base: '310px',
  sm: '280px',
  md: '305px',
  lg: '305px',
  xl: '310px',
} as const;

// Base compact card wrapper component
interface BaseProps extends Omit<CardProps, 'children' | 'as'> {
  isLoading?: boolean;
  children: ReactNode;
}

const Base = ({ isLoading = false, children, ...cardProps }: BaseProps) => {
  return (
    <Card
      variant='niaid'
      boxShadow='none'
      border='1px solid'
      borderColor='gray.200'
      height={CARD_HEIGHTS}
      {...cardProps}
    >
      {children}
    </Card>
  );
};

// Banner component
interface BannerProps extends BoxProps {
  type?: AllResourceType;
  isNiaidFunded?: boolean;
  isLoading?: boolean;
}

const Banner = ({
  type,
  isNiaidFunded,
  isLoading = false,
  ...boxProps
}: BannerProps) => {
  return (
    <Skeleton
      isLoaded={!isLoading}
      height={isLoading ? '40px' : 'auto'}
      borderTopRadius='md'
    >
      <TypeBanner
        type={type}
        p={0}
        pl={[2, 4, 6]}
        flexDirection={['column', 'row']}
        isNiaidFunded={isNiaidFunded}
        {...boxProps}
      />
    </Skeleton>
  );
};

// Header wrapper component
interface HeaderProps extends BoxProps {
  isLoading?: boolean;
  children: ReactNode;
}

const Header = ({ isLoading = false, children, ...boxProps }: HeaderProps) => {
  return (
    <CardHeader
      bg='transparent'
      position='relative'
      px={2}
      pt={1}
      pb={1}
      w='100%'
      color='link.color'
      _hover={{
        p: { textDecoration: 'none' },
        svg: {
          transform: 'translate(0px)',
          opacity: 0.9,
          transition: '0.2s ease-in-out',
        },
      }}
      _visited={{
        color: 'link.color',
        svg: { color: 'link.color' },
      }}
      {...boxProps}
    >
      <Skeleton isLoaded={!isLoading} minHeight='27px' flex={1}>
        {!isLoading && children}
      </Skeleton>
    </CardHeader>
  );
};

// Title component with optional markdown support
interface LinkProps {
  href: string | { pathname: string; query: Record<string, any> };
  as?: string;
}

interface TitleProps extends Omit<TextProps, 'children'> {
  children: string;
  hasMarkdown?: boolean;
  linkProps?: LinkProps;
  highlightProps?: {
    query: string | string[];
  };
}

const Title = ({
  children,
  hasMarkdown = false,
  linkProps,
  highlightProps,
  ...textProps
}: TitleProps) => {
  const content = hasMarkdown ? (
    <DisplayHTMLContent
      noOfLines={3}
      content={children}
      fontWeight='semibold'
      color='inherit'
      fontSize='md'
      lineHeight='short'
      w='100%'
      textDecoration='underline'
      _hover={{
        textDecoration: 'none',
      }}
      reactMarkdownProps={{
        linkTarget: '_blank',
        disallowedElements: ['a'],
      }}
      highlightProps={highlightProps}
      {...textProps}
    />
  ) : (
    <DisplayHTMLContent
      noOfLines={3}
      content={children}
      fontWeight='semibold'
      color='inherit'
      fontSize='md'
      lineHeight='short'
      w='100%'
      textDecoration='underline'
      _hover={{
        textDecoration: 'none',
      }}
      {...textProps}
    />
  );

  if (!linkProps) {
    return content;
  }

  return (
    <NextLink
      href={linkProps.href}
      as={linkProps.as}
      passHref
      prefetch={false}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {content}
    </NextLink>
  );
};

// Body wrapper component
interface BodyProps extends BoxProps {
  children: ReactNode;
}

const Body = ({ children, ...boxProps }: BodyProps) => {
  return (
    <CardBody
      p={2}
      sx={{
        '>*': {
          my: 0,
        },
      }}
      flex='1'
      display='flex'
      flexDirection='column'
      {...boxProps}
    >
      {children}
    </CardBody>
  );
};

// Export compound component
export const CompactCard = {
  Base,
  Banner,
  Header,
  Title,
  Body,
};
