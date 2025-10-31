import {
  BoxProps,
  Card,
  CardRootProps,
  Skeleton,
  Text,
  TextProps,
} from '@chakra-ui/react';
import NextLink, { LinkProps } from 'next/link';
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
interface BaseProps extends Omit<CardRootProps, 'children' | 'as'> {
  isLoading?: boolean;
  children: ReactNode;
}

const Base = ({ isLoading = false, children, ...cardProps }: BaseProps) => {
  return (
    <Card.Root
      variant='outline'
      overflow='hidden'
      height={CARD_HEIGHTS}
      size='sm'
      {...cardProps}
    >
      {children}
    </Card.Root>
  );
};

// Banner component
interface BannerProps extends TypeBannerProps {
  isLoading?: boolean;
}

const Banner = ({
  label,
  type,
  isNiaidFunded,
  isLoading = false,
  ...props
}: BannerProps) => {
  return (
    <Skeleton
      loading={isLoading}
      height={isLoading ? '40px' : 'auto'}
      borderTopRadius='md'
    >
      <TypeBanner
        isNiaidFunded={isNiaidFunded}
        label={label}
        type={type}
        {...props}
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
    <Card.Header {...boxProps}>
      <Skeleton loading={isLoading} minHeight='50px' flex={1}>
        {!isLoading && children}
      </Skeleton>
    </Card.Header>
  );
};

interface TitleProps extends Omit<TextProps, 'children'> {
  children: string;
  linkProps?: LinkProps;
}

const Title = ({ children, linkProps, ...textProps }: TitleProps) => {
  return (
    <Text
      asChild={!!linkProps}
      color={linkProps ? 'link.default' : 'inherit'}
      lineClamp={3}
      fontWeight='semibold'
      fontSize='md'
      lineHeight='short'
      w='100%'
      textDecoration='underline'
      _hover={{
        textDecoration: 'none',
      }}
      {...textProps}
    >
      {linkProps ? <NextLink {...linkProps}>{children}</NextLink> : children}
    </Text>
  );
};

// Body wrapper component
interface BodyProps extends BoxProps {
  children: ReactNode;
}

const Body = ({ children, ...boxProps }: BodyProps) => {
  return (
    <Card.Body pt={2} {...boxProps}>
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
