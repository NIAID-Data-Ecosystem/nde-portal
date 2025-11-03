import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';

export const CarouselWrapper = ({ children, ...props }: BoxProps) => {
  return (
    <Box
      mt={0}
      p={0}
      mb={4}
      minH={{
        base: '350px',
        sm: '320px',
        md: '345px',
        lg: '345px',
        xl: '350px',
      }}
      width='100%'
      maxW='100%'
      css={{
        contain: 'layout style size',
        '& *': {
          maxWidth: '100% !important',
          boxSizing: 'border-box !important',
        },
        height: 'auto',
        '& .padded-carousel': {
          height: 'auto',
          paddingLeft: '4px',
          paddingRight: '4px',
        },
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
