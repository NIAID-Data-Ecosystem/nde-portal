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

import { LandingPageCard } from './card';
import { LandingPageSections } from './types';

const SectionHeading = ({ children, ...props }: HeadingProps) => (
  <Heading as='h2' textStyle='h5' mb={4} fontWeight='semibold' {...props}>
    {children}
  </Heading>
);

const SectionSubheading = ({ children }: TextProps) => (
  <Text lineHeight='short'>{children}</Text>
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

// extract the value type
type SectionConfig = LandingPageSections[keyof LandingPageSections];

// props for the component
interface SectionWrapperProps extends SectionConfig {
  children: React.ReactNode;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  heading,
  subheading,
  hasSeparator,
  children,
  ...props
}) => {
  return (
    <Flex flexDirection='column' {...props}>
      {heading && <SectionHeading>{heading}</SectionHeading>}
      {subheading && <SectionSubheading>{subheading}</SectionSubheading>}
      {hasSeparator && <Separator my={4} />}
      <SectionBody>{children}</SectionBody>
    </Flex>
  );
};

const LandingPageSection = {
  Body: SectionBody,
  Card: LandingPageCard,
  Heading: SectionHeading,
  Subheading: SectionSubheading,
  Wrapper: SectionWrapper,
};

export { LandingPageSection };
