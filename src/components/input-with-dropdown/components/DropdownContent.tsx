import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import { useDropdownContext } from '..';
import { ScrollContainer } from 'src/components/scroll-container';

interface DropdownContentProps extends BoxProps {}

// List wrapper that opens when an input is entered and results are found.
export const DropdownContent: React.FC<DropdownContentProps> = ({
  children,
  maxHeight,
  ...props
}) => {
  const { isOpen } = useDropdownContext();

  if (!isOpen) {
    return <></>;
  }

  return (
    <Box position='relative'>
      <ScrollContainer
        position='absolute'
        w='100%'
        zIndex='dropdown'
        boxShadow='lg'
        bg='white'
        borderRadius='base'
        overflow='auto'
        maxHeight='500px'
        left={0}
        {...props}
      >
        {children}
      </ScrollContainer>
    </Box>
  );
};
