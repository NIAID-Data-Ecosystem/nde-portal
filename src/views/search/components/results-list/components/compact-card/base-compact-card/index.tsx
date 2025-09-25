import React, { ReactNode } from 'react';
import { Card, CardHeader, CardBody, CardProps } from '@chakra-ui/react';
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

interface LinkProps {
  href: string | { pathname: string; query: Record<string, any> };
  as?: string;
}

interface BaseCompactCardProps extends Omit<CardProps, 'children' | 'as'> {
  isLoading?: boolean;
  title?: string;
  linkProps?: LinkProps;
  typeBannerProps?: {
    type?: AllResourceType;
    isNiaidFunded?: boolean;
  };
  headerContent?: ReactNode;
  children: ReactNode;
}

export const BaseCompactCard = ({
  isLoading = false,
  title,
  linkProps,
  typeBannerProps,
  headerContent,
  children,
  ...cardProps
}: BaseCompactCardProps) => {
  return (
    <Card
      variant='niaid'
      boxShadow='none'
      border='1px solid'
      borderColor='gray.200'
      height={CARD_HEIGHTS}
      {...cardProps}
    >
      {/* TypeBanner */}
      <Skeleton
        isLoaded={!isLoading}
        height={isLoading ? '40px' : 'auto'}
        borderTopRadius='md'
      >
        <TypeBanner
          type={typeBannerProps?.type}
          p={0}
          pl={[2, 4, 6]}
          flexDirection={['column', 'row']}
          isNiaidFunded={typeBannerProps?.isNiaidFunded}
        />
      </Skeleton>

      {/* Header with Title */}
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
      >
        <Skeleton isLoaded={!isLoading} minHeight='27px' flex={1}>
          {!isLoading && title && linkProps ? (
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
              <DisplayHTMLContent
                noOfLines={3}
                content={title}
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
              />
            </NextLink>
          ) : null}
        </Skeleton>
        {headerContent}
      </CardHeader>

      {/* Body Content */}
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
      >
        {children}
      </CardBody>
    </Card>
  );
};
