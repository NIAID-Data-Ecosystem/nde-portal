import React from 'react';
import { VStack, StackProps } from '@chakra-ui/react';

export const CardWrapper: React.FC<
  { children: React.ReactNode } & StackProps
> = ({ children, ...props }) => {
  return (
    <VStack
      alignItems='flex-start'
      boxShadow='sm'
      borderRadius='semi'
      borderWidth={1}
      borderColor='gray.100'
      p={4}
      spacing={6}
      {...props}
    >
      {children}
    </VStack>
  );
};
