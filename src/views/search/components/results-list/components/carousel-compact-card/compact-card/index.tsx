import { BoxProps, Card, Skeleton, Text, TextProps } from '@chakra-ui/react';
import NextLink from 'next/link';
import React, { ReactNode } from 'react';
import { TypeBanner } from 'src/components/resource-sections/components';
import { TypeBannerProps } from 'src/components/resource-sections/components/type-banner';

const CARD_HEIGHTS = {
  base: '310px',
  sm: '280px',
  md: '305px',
  lg: '305px',
  xl: '310px',
} as const;

// Base compact card wrapper component
interface BaseProps extends Omit<Card.RootProps, 'children' | 'as'> {
  loading?: boolean;
  children: ReactNode;
}

const Base = ({ loading = false, children, ...cardProps }: BaseProps) => {
  return (
    <Card.Root
      variant='niaid'
      boxShadow='none'
      border='1px solid'
      borderColor='gray.200'
      height={CARD_HEIGHTS}
      {...cardProps}
    >
      {children}
    </Card.Root>
  );
};

// Banner component
interface BannerProps extends TypeBannerProps {
  loading?: boolean;
}

const Banner = ({
  label,
  type,
  isNiaidFunded,
  loading = false,
  ...props
}: BannerProps) => {
  return (
    <Skeleton
      loading={loading}
      height={loading ? '40px' : 'auto'}
      borderTopRadius='md'
    >
      <TypeBanner
        label={label}
        type={type}
        p={0}
        pl={[2, 4, 6]}
        flexDirection={['column', 'row']}
        isNiaidFunded={isNiaidFunded}
        {...props}
      />
    </Skeleton>
  );
};

// Header wrapper component
interface HeaderProps extends BoxProps {
  loading?: boolean;
  children: ReactNode;
}

const Header = ({ loading = false, children, ...boxProps }: HeaderProps) => {
  return (
    <Card.Header
      bg='transparent'
      position='relative'
      px={2}
      pt={1}
      pb={1}
      w='100%'
      color='link'
      _hover={{
        '& p': { textDecoration: 'none' },
        '& svg': {
          transform: 'translate(0px)',
          opacity: 0.9,
          transition: '0.2s ease-in-out',
        },
      }}
      _visited={{
        color: 'link',
        '& svg': { color: 'link' },
      }}
      {...boxProps}
    >
      <Skeleton loading={loading} minHeight='27px' flex={1}>
        {!loading && children}
      </Skeleton>
    </Card.Header>
  );
};

// Title component
interface LinkProps {
  href: string | { pathname: string; query: Record<string, any> };
  as?: string;
}

interface TitleProps extends Omit<TextProps, 'children'> {
  children: string;
  linkProps?: LinkProps;
}

const Title = ({ children, linkProps, ...textProps }: TitleProps) => {
  const content = (
    <Text
      lineClamp={3}
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
    >
      {children}
    </Text>
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
    <Card.Body
      p={2}
      css={{
        '& >*': {
          my: 0,
        },
      }}
      flex='1'
      display='flex'
      flexDirection='column'
      {...boxProps}
    >
      {children}
    </Card.Body>
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
