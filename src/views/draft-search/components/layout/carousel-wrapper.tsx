import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

interface CarouselWrapperProps extends BoxProps {
  children: React.ReactNode;
}

export const CarouselWrapper = ({
  children,
  ...props
}: CarouselWrapperProps) => {
  return (
    <Box
      mt={0}
      p={0}
      pb={{
        base: 14,
        sm: 12,
        md: 16,
        lg: 18,
        xl: 14,
      }}
      minH={{
        base: '350px',
        sm: '320px',
        md: '345px',
        lg: '345px',
        xl: '350px',
      }}
      width='100%'
      maxW='100%'
      sx={{
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
