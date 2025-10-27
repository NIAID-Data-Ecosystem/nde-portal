import {
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  Separator,
  Text,
  TextProps,
} from '@chakra-ui/react';
import React from 'react';

import { SectionButton, SectionButtonGroup } from './components/buttons';
import { SectionSearch } from './components/search';
import { SectionWrapperProps } from './types';

const SectionHeading = ({ children, ...props }: HeadingProps) => (
  <Heading as='h2' textStyle='h5' mb={4} fontWeight='semibold' {...props}>
    {children}
  </Heading>
);

const SectionSubheading = ({ children }: TextProps) => (
  <Text lineHeight='short' mb={4}>
    {children}
  </Text>
);

const SectionBody = ({ children, ...props }: FlexProps) => (
  <Flex
    flexDirection='row'
    gap={{ base: 6, xl: 4 }}
    flexWrap='wrap'
    width='100%'
    justifyContent='space-between'
    {...props}
  >
    {children}
  </Flex>
);

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  heading,
  subheading,
  hasSeparator,
  children,
  ...props
}) => {
  return (
    <Flex flexDirection='column' {...props}>
      {heading ? (
        typeof heading === 'string' ? (
          <SectionHeading>{heading}</SectionHeading>
        ) : (
          heading
        )
      ) : (
        <></>
      )}
      {subheading && <SectionSubheading>{subheading}</SectionSubheading>}
      {hasSeparator && <Separator mb={4} />}
      <SectionBody>{children}</SectionBody>
    </Flex>
  );
};

const Section = {
  Wrapper: SectionWrapper,
  Search: SectionSearch,
  Body: SectionBody,
  Heading: SectionHeading,
  Subheading: SectionSubheading,
  ButtonGroup: SectionButtonGroup,
  Button: SectionButton,
};

export { Section };
