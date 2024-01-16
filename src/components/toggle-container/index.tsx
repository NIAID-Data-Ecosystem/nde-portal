import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Button,
  Icon,
  Flex,
  SystemProps,
  useDisclosure,
  ButtonProps,
} from '@chakra-ui/react';
import { FaAngleDown } from 'react-icons/fa6';

// Expandable container.
export interface ToggleContainerProps extends ButtonProps {
  defaultIsOpen?: boolean;
  // can be a number describing the minimum num of lines or a minmax tuple.
  noOfLines?: [number, number] | number;
  ariaLabel: string;
  alignIcon?: SystemProps['alignItems'];
  variant?: 'border';
}

export const ToggleContainer: React.FC<ToggleContainerProps> = ({
  children,
  defaultIsOpen = false,
  alignIcon = 'center',
  noOfLines,
  minHeight,
  ariaLabel,
  variant,
  ...props
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen });

  // Set minimum number of lines shown when container is not expanded
  const minNoOfLines = Array.isArray(noOfLines)
    ? noOfLines[0]
    : typeof noOfLines === 'number'
    ? noOfLines
    : undefined;
  // Set maximum number of lines shown when container is expanded, if undefined, show all text.
  const maxNoOfLines = Array.isArray(noOfLines) ? noOfLines[1] : undefined;

  /**
   * Detect whether to allow toggle by checking if container is larger than set height.
   */
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const handleOverflow = useCallback(() => {
    const container = containerRef.current;
    setIsOverflowing(() => {
      if (container) {
        return container.scrollHeight > container.clientHeight;
      }
      return false;
    });
  }, [containerRef]);

  useEffect(() => {
    handleOverflow();
    window.addEventListener('resize', handleOverflow);
    return () => window.removeEventListener('resize', handleOverflow);
  }, [handleOverflow]);

  useEffect(() => {
    handleOverflow();
  }, [isOpen, handleOverflow]);

  // Possible to toggle drawer when drawer is close with oversized inner content or is open.
  const isExpandable = (isOverflowing && !isOpen) || isOpen;
  return (
    <Button
      variant={variant}
      bg={isOpen ? 'blackAlpha.50' : 'white'}
      onClick={() => (isOpen ? onClose() : onOpen())}
      flexWrap={['wrap', 'nowrap']}
      aria-label={ariaLabel}
      alignItems={alignIcon}
      isDisabled={!isExpandable}
      px={[2, 4, 8, 10]}
      py={[2, 4, 6]}
      transition='all 0.2s ease-in-out'
      whiteSpace='normal'
      color='text.body'
      lineHeight='inherit'
      height='unset'
      textAlign='unset'
      borderRadius='none'
      borderTop={variant === 'border' ? '1px solid' : undefined}
      borderBottom={variant === 'border' ? '1px solid' : undefined}
      borderColor={variant === 'border' ? 'gray.200' : 'transparent'}
      _hover={{
        bg: 'blackAlpha.50',
        transition: 'all 0.2s ease-in-out',
      }}
      _disabled={{
        opacity: 1,
        bg: 'white',
        _hover: { bg: 'white', cursor: 'default' },
        _active: { bg: 'white' },
      }}
      _active={{
        bg: 'blackAlpha.100',
      }}
      {...props}
    >
      <Flex
        ref={containerRef}
        overflow={'hidden'}
        height={isOpen ? undefined : minHeight}
        noOfLines={isOpen ? maxNoOfLines : minNoOfLines}
      >
        {children}
      </Flex>
      {(isOpen || (!isOpen && isOverflowing)) && (
        <Flex
          className='icon'
          flexDirection='column'
          w={['100%', 'unset']}
          h='100%'
          alignItems='center'
          pl={[2, 4]}
          pt={[2, 0]}
          justifyContent={alignIcon}
        >
          <Icon
            w={3}
            h={3}
            color='gray.700'
            as={FaAngleDown}
            transform={isOpen ? 'rotate(-180deg)' : undefined}
            transformOrigin='center'
            transition='transform 0.2s'
          />
        </Flex>
      )}
    </Button>
  );
};
