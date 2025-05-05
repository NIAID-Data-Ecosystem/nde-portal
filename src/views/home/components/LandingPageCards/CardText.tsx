import React from 'react';
import { Text, TextProps } from '@chakra-ui/react';

export const CardText: React.FC<TextProps> = ({ children, ...props }) => (
  <Text fontWeight='400' lineHeight='short' fontSize='md' {...props}>
    {children}
  </Text>
);
