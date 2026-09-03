import { BoxProps, Card, Skeleton, Text, TextProps } from '@chakra-ui/react';
import NextLink from 'next/link';
import React, { ReactNode } from 'react';
import { Link } from 'src/components/link';
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
      variant='outline'
      boxShadow='none'
      height={CARD_HEIGHTS}
      size='xs'
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
    <Card.Header {...boxProps}>
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
    <Card.Title lineClamp={3} color='inherit' textStyle='md' {...textProps}>
      {children}
    </Card.Title>
  );

  if (!linkProps) {
    return content;
  }

  return (
    <Link asChild>
      <NextLink
        href={linkProps.href}
        as={linkProps.as}
        prefetch={false}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {content}
      </NextLink>
    </Link>
  );
};

// Body wrapper component
interface BodyProps extends BoxProps {
  children: ReactNode;
}

const Body = ({ children, ...boxProps }: BodyProps) => {
  return <Card.Body {...boxProps}>{children}</Card.Body>;
};

// Export compound component
export const CompactCard = {
  Base,
  Banner,
  Header,
  Title,
  Body,
};
