import React, { useRef } from 'react';
import { Box, BoxProps, useOutsideClick } from 'nde-design-system';
import { useDropdownContext } from '..';

interface DropdownContentProps extends BoxProps {}

// List wrapper that opens when an input is entered and results are found.
export const DropdownContent: React.FC<DropdownContentProps> = ({
  children,
  maxHeight,
  ...props
}) => {
  const { isOpen, setIsOpen } = useDropdownContext();

  // Handles closing the dropdown list when clicking outside the element.
  const ref = useRef(null);
  useOutsideClick({
    ref: ref,
    handler: () => setIsOpen(false),
  });

  if (!isOpen) {
    return <></>;
  }

  return (
    <Box ref={ref} position='relative'>
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
