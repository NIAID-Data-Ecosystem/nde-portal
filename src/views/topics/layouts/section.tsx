import React from 'react';
import {
  Divider,
  Flex,
  FlexProps,
  Heading,
  SkeletonText,
  Text,
  TextProps,
} from '@chakra-ui/react';

export const SectionTitle = ({
  as,
  children,
  isLoading,
  ...props
}: {
  children?: string;
  isLoading?: boolean;
} & TextProps) => {
  if (!children && !isLoading) return null;
  if (as === 'h1') {
    return (
      <SkeletonText isLoaded={!isLoading} noOfLines={1} skeletonHeight={10}>
        <Heading as={as} fontSize='4xl' {...props}>
          {children}
        </Heading>
      </SkeletonText>
    );
  } else if (as === 'h2') {
    return (
      <SkeletonText
        isLoaded={!isLoading}
        noOfLines={1}
        skeletonHeight={7}
        width='100%'
        mb={4}
      >
        <Heading as={as} fontSize='2xl' {...props}>
          {children}
        </Heading>
      </SkeletonText>
    );
  } else if (as === 'h3') {
    return (
      <>
        <SkeletonText
          isLoaded={!isLoading}
          noOfLines={1}
          skeletonHeight={6}
          width='100%'
        >
          <Heading as={as} fontSize='lg' {...props}>
            {children}
          </Heading>
        </SkeletonText>
        <Divider mt={2} mb={4} borderColor='page.placeholder' />
      </>
    );
  } else if (as === 'h4') {
    return (
      <SkeletonText
        isLoaded={!isLoading}
        noOfLines={1}
        skeletonHeight={5}
        width='100%'
        mb={2}
      >
        <Heading as={as} fontSize='md' fontWeight='semibold' {...props}>
          {children}
        </Heading>
      </SkeletonText>
    );
  } else if (as === 'h5') {
    return (
      <SkeletonText
        isLoaded={!isLoading}
        noOfLines={1}
        skeletonHeight={5}
        width='100%'
        mb={2}
      >
        <Heading
          as={as}
          fontSize='sm'
          fontWeight='medium'
          color='text.body'
          {...props}
        >
          {children}
        </Heading>
      </SkeletonText>
    );
  }
  return (
    <SkeletonText
      isLoaded={!isLoading}
      noOfLines={4}
      skeletonHeight={4}
      width='100%'
    >
      <Text as={as} {...props}>
        {children}
      </Text>
    </SkeletonText>
  );
};

export const SectionWrapper: React.FC<
  FlexProps & {
    as?: 'h2' | 'h3' | 'h4';
    children?: React.ReactNode;
    id: string;
    isLoading?: boolean;
    title: string;
  }
> = ({ as = 'h2', id, children, isLoading, title, ...props }) => {
  return (
    <Flex as='section' id={id} mt={4} mb={4} flexDirection='column' {...props}>
      <SectionTitle as={as} isLoading={isLoading}>
        {title}
      </SectionTitle>
      {children}
    </Flex>
  );
};
