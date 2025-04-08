import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

export const CardWrapper: React.FC<
  { children: React.ReactNode } & BoxProps
> = ({ children, ...props }) => {
  return (
    <Box
      boxShadow='sm'
      borderRadius='semi'
      borderWidth={1}
      borderColor='gray.100'
      p={4}
      {...props}
    >
      {children}
    </Box>
  );
};
