import {
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  IconProps,
} from '@chakra-ui/react';
import React from 'react';

interface EmptyProps extends FlexProps {
  icon?: string;
  message?: string;
  iconProps?: IconProps;
  headingProps?: HeadingProps;
}

// Empty state display component.
const Empty: React.FC<EmptyProps> = ({
  children,
  icon = 'empty',
  message,
  iconProps,
  headingProps,
  ...rest
}) => {
  return (
    <Flex
      w='100%'
      h='100%'
      alignItems='center'
      justifyContent='center'
      direction='column'
      {...rest}
    >
      <Heading
        as='h2'
        fontFamily='body'
        mt={4}
        color='inherit'
        {...headingProps}
      >
        {message}
      </Heading>
      {children}
    </Flex>
  );
};

export default Empty;
