import React from 'react';
import { Flex, FlexProps, keyframes, Text, TextProps } from 'nde-design-system';

// Styles for the home page
export const fade = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0px);
  }
`;

interface StyledSectionProps extends FlexProps {
  children: React.ReactNode;
}

export const StyledSection: React.FC<StyledSectionProps> = ({
  children,
  ...props
}) => {
  return (
    <Flex
      as='section'
      w='100%'
      px={[2, 4, 6]}
      py={[2, 4, 8]}
      flexWrap={['wrap', 'wrap', 'nowrap']}
      flexDirection={['column', 'column', 'row']}
      alignItems={['flex-start', 'center', 'center']}
      justifyContent={['center', 'center', 'center', 'space-between']}
      maxWidth={['100%', '100%', '1280px']}
      {...props}
    >
      {children}
    </Flex>
  );
};

interface StyledTextProps extends TextProps {
  children: React.ReactNode;
}
export const StyledText: React.FC<StyledTextProps> = ({
  children,
  ...props
}) => {
  return (
    <Text mt={4} fontSize='lg' fontWeight='light' lineHeight='short' {...props}>
      {children}
    </Text>
  );
};
