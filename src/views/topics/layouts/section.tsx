import React from 'react';
import { Divider, Flex, Heading, SkeletonText, Text } from '@chakra-ui/react';

export const SectionTitle = ({
  as,
  children,
  isLoading,
}: {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  children?: string;
  isLoading?: boolean;
}) => {
  if (!children && !isLoading) return null;
  if (as === 'h1') {
    return (
      <SkeletonText isLoaded={!isLoading} noOfLines={1} skeletonHeight={10}>
        <Heading as={as} fontSize='4xl'>
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
        <Heading as={as} fontSize='2xl'>
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
          <Heading as={as} fontSize='lg'>
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
        <Heading as={as} fontSize='md' fontWeight='semibold'>
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
      <Text>{children}</Text>
    </SkeletonText>
  );
};

export const SectionWrapper: React.FC<{
  as?: 'h2' | 'h3' | 'h4';
  children?: React.ReactNode;
  id: string;
  isLoading?: boolean;
  title: string;
}> = ({ as = 'h2', id, children, isLoading, title }) => {
  return (
    <Flex as='section' id={id} mt={4} mb={4} flexDirection='column'>
      <SectionTitle as={as} isLoading={isLoading}>
        {title}
      </SectionTitle>
      {children}
    </Flex>
  );
};
