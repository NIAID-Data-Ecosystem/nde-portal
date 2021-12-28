import React from 'react';
import {Box, BoxProps, Heading} from '@chakra-ui/react';
import {StyledSection} from '../styles';

interface SectionProps extends BoxProps {
  title: string;
}

const Section: React.FC<SectionProps> = ({children, title, ...props}) => {
  return (
    <StyledSection
      id={`${title
        .replace(/[^\w\s]/gi, '')
        .split(' ')
        .join('-')
        .toLowerCase()}`}
      as='section'
      {...props}
    >
      <Box borderBottom='2px solid' borderColor='gray.200'>
        <Heading size='h3' fontFamily='body'>
          {title}
        </Heading>
      </Box>
      <Box py={4}>{children}</Box>
    </StyledSection>
  );
};

export default Section;
