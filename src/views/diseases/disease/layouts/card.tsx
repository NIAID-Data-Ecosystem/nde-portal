import React from 'react';
import { Stack, StackProps } from '@chakra-ui/react';

export const CardWrapper: React.FC<
  { children: React.ReactNode } & StackProps
> = ({ children, ...props }) => {
  return (
    <Stack
      alignItems='flex-start'
      boxShadow='sm'
      borderRadius='semi'
      borderWidth={1}
      borderColor='gray.100'
      flexDirection='column'
      p={4}
      spacing={4}
      {...props}
    >
      {children}
    </Stack>
  );
};
