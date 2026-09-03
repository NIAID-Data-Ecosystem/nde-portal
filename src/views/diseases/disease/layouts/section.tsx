import {
  Flex,
  FlexProps,
  Heading,
  Separator,
  SkeletonText,
  Text,
  TextProps,
} from '@chakra-ui/react';
import Link from 'next/link';
import React from 'react';
import { HeadingWithLinkStyles } from 'src/components/heading-with-link/components/HeadingWithLink';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

export const headingStyles: Record<
  HeadingLevel,
  {
    fontSize: string;
    skeletonHeight: number;
    mb?: number;
    fontWeight?: string;
    color?: string;
  }
> = {
  h1: { fontSize: '4xl', skeletonHeight: 10 },
  h2: { fontSize: '2xl', skeletonHeight: 7, mb: 4 },
  h3: { fontSize: 'lg', skeletonHeight: 6 },
  h4: { fontSize: 'md', skeletonHeight: 5, mb: 2, fontWeight: 'semibold' },
  h5: {
    fontSize: 'sm',
    skeletonHeight: 5,
    mb: 2,
    fontWeight: 'medium',
    color: 'text.body',
  },
};

export const SectionTitle = ({
  as,
  children,
  loading,
  slug,
  ...props
}: {
  as?: HeadingLevel | string;
  children?: string;
  loading?: boolean;
  slug?: string;
} & TextProps) => {
  if (!children && !loading) return null;

  if (as && ['h1', 'h2', 'h3', 'h4', 'h5'].includes(as)) {
    const { fontSize, skeletonHeight, mb, fontWeight, color } =
      headingStyles[as as HeadingLevel];

    const heading = (
      <Heading
        as={as as HeadingLevel}
        fontSize={fontSize}
        fontWeight={fontWeight}
        color={color}
        {...props}
      >
        {children}
      </Heading>
    );

    return (
      <>
        <SkeletonText
          loading={loading}
          noOfLines={1}
          height={skeletonHeight}
          width='100%'
          mb={mb}
        >
          {slug ? (
            <SectionTitleWithLink slug={slug}>{heading}</SectionTitleWithLink>
          ) : (
            heading
          )}
        </SkeletonText>
        {as === 'h3' && <Separator mt={2} mb={4} borderColor='gray.600' />}
      </>
    );
  }

  return (
    <SkeletonText loading={loading} noOfLines={4} height={4} width='100%'>
      <Text as={as} {...props}>
        {children}
      </Text>
    </SkeletonText>
  );
};

export const SectionTitleWithLink = ({
  children,
  slug,
}: {
  children: React.ReactNode;
  slug: string;
}) => (
  <Flex asChild alignItems='center' css={HeadingWithLinkStyles}>
    <Link href={slug}>
      {children}
      <Text as='span' fontWeight='bold' fontSize='inherit'>
        #
      </Text>
    </Link>
  </Flex>
);

export const SectionWrapper: React.FC<
  FlexProps & {
    as?: HeadingLevel;
    children?: React.ReactNode;
    id: string;
    loading?: boolean;
    slug?: string;
    title: string;
  }
> = ({ as = 'h2', id, children, loading, slug, title, ...props }) => (
  <Flex as='section' id={id} mt={4} mb={4} flexDirection='column' {...props}>
    <SectionTitle as={as} loading={loading} slug={slug}>
      {title}
    </SectionTitle>
    {children}
  </Flex>
);

export const SectionDescription: React.FC<TextProps> = ({
  children,
  ...props
}) => {
  return (
    <Text lineHeight='moderate' mb={2} {...props}>
      {children}
    </Text>
  );
};
