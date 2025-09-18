import { Flex, Heading } from '@chakra-ui/react';
import React from 'react';

interface LandingPageWrapperProps {
  heading?: string;
  children: React.ReactNode;
}

export const LandingPageWrapper: React.FC<LandingPageWrapperProps> = ({
  heading,
  children,
}) => {
  return (
    <>
      {heading && (
        <Heading as='h2' fontSize='2xl' fontWeight='semibold' mb={4}>
          {heading}
        </Heading>
      )}
      <Flex
        flexDirection='row'
        gap={{ base: 6, xl: 4 }}
        flexWrap='wrap'
        width='100%'
        mt={4}
        justifyContent='space-between'
      >
        {children}
      </Flex>
    </>
  );
};
