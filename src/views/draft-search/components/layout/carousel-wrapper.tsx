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
        base: 12,
        sm: 10,
        md: 14,
        lg: 16,
        xl: 16,
      }}
      minH={{
        base: '355px',
        sm: '300px',
        md: '330px',
        lg: '340px',
        xl: '335px',
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
