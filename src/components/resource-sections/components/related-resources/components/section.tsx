import React from 'react';
import {
  FlexProps,
  Heading,
  StackDivider,
  Text,
  VStack,
} from '@chakra-ui/react';

import { ScrollContainer } from 'src/components/scroll-container';

interface RelatedResourceSectionHeaderProps extends FlexProps {
  title: string;
  subtitle?: string;
}
/**
 * A header for the related resource section, which includes a title and subtitle.
 */
export const RelatedResourceSectionHeader = ({
  title,
  subtitle,
}: RelatedResourceSectionHeaderProps) => {
  return (
    <>
      <Heading as='h3' fontSize='sm'>
        {title}
      </Heading>
      <Text lineHeight='shorter' mt={0.5}>
        {subtitle}
      </Text>
    </>
  );
};

interface RelatedResourceSectionWrapperProps extends FlexProps {}
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
      as={VStack}
      maxHeight={500}
      alignItems='flex-start'
      border='1px solid'
      borderColor='gray.200'
      borderRadius='base'
      divider={<StackDivider borderColor='gray.200' />}
      flexDirection='column'
      spacing={0}
      pr={0}
      {...props}
    >
      {children}
    </ScrollContainer>
  );
};
