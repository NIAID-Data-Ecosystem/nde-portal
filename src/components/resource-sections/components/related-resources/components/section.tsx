import { StackSeparator, VStack } from '@chakra-ui/react';
import React from 'react';
import {
  ScrollContainer,
  ScrollContainerProps,
} from 'src/components/scroll-container';

interface RelatedResourceSectionWrapperProps extends ScrollContainerProps {}
/**
 * A wrapper for the related resource section, which includes a scroll container
 * and a stack divider.
 */
export const RelatedResourceSectionWrapper = ({
  children,
  ...props
}: RelatedResourceSectionWrapperProps) => {
  return (
    <ScrollContainer
      maxHeight={500}
      alignItems='flex-start'
      border='1px solid'
      borderColor='gray.200'
      borderRadius='base'
      flexDirection='column'
      {...props}
    >
      <VStack separator={<StackSeparator />} gap={0}>
        {children}
      </VStack>
    </ScrollContainer>
  );
};
