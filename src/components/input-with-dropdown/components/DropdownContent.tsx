import React from 'react';
import { Box, BoxProps } from 'nde-design-system';
import { useDropdownContext } from '..';

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
      <Box
        position='absolute'
        w='100%'
        zIndex='dropdown'
        boxShadow='lg'
        bg='white'
        borderRadius='base'
        overflow='hidden'
        left={0}
        {...props}
      >
        <Box overflow='auto' maxHeight='500px'>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
