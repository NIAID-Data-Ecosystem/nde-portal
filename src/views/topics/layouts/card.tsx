import React from 'react';
import { Box } from '@chakra-ui/react';

export const CardWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Box
      boxShadow='base'
      borderRadius='semi'
      borderWidth={1}
      borderColor='gray.100'
      p={4}
    >
      {children}
    </Box>
  );
};
