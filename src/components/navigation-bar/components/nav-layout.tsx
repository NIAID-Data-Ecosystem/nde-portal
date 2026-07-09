import React from 'react';
import {
  Box,
  BoxProps,
  Flex,
  IconButton,
  FlexProps,
  Icon,
} from '@chakra-ui/react';
import { FaBars, FaXmark } from 'react-icons/fa6';
import { Logo } from 'src/components/logos';

/*
This file contains the layout components for the navigation bar, including:
- Wrapper: The main container for the navigation bar, which is a <nav> element with appropriate ARIA attributes for accessibility.
- Bar: The horizontal bar that contains the logo and navigation items. It has a background color, padding, and border styling.
- Toggle: A button that appears on mobile view to toggle the visibility of the mobile navigation menu. It changes its icon based on whether the menu is open or closed.
*/

const Wrapper: React.FC<BoxProps> = ({ children, ...props }) => {
  return (
    <Box
      id='nde-navigation'
      as='nav'
      w='100%'
      minW={300}
      zIndex='modal'
      aria-label='Main navigation'
      {...props}
    >
      {children}
    </Box>
  );
};

const Bar: React.FC<FlexProps> = ({ children }) => {
  return (
    <Flex
      bg='niaid.500'
      color='white'
      minH='60px'
      pl={6}
      pr={4}
      borderBottom={1}
      borderStyle='solid'
      borderColor='gray.200'
      alignItems={{ base: 'center', md: 'center' }}
    >
      <Logo href='/' />
      {children}
    </Flex>
  );
};

// Used to toggle the mobile menu
const Toggle: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
}> = ({ isOpen, onToggle }) => {
  return (
    <IconButton
      display={{ base: 'flex', md: 'none' }}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      icon={
        isOpen ? (
          <Icon as={FaXmark} w={5} h={5} />
        ) : (
          <Icon as={FaBars} w={4} h={4} />
        )
      }
      onClick={onToggle}
      colorScheme='niaid'
      color='white'
      _hover={{ bg: 'whiteAlpha.500' }}
      variant='ghost'
      size='md'
    />
  );
};

export const Layout = {
  Wrapper,
  Bar,
  Toggle,
};
