import {
  Box,
  BoxProps,
  Flex,
  FlexProps,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import React from 'react';
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
      zIndex='popover'
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
      px={4}
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
      onClick={onToggle}
      colorPalette='niaid'
      color='white'
      _hover={{ bg: 'whiteAlpha.500' }}
      variant='ghost'
      size='md'
    >
      {isOpen ? (
        <Icon w={5} h={5} asChild>
          <FaXmark />
        </Icon>
      ) : (
        <Icon w={4} h={4} asChild>
          <FaBars />
        </Icon>
      )}
    </IconButton>
  );
};

export const Layout = {
  Wrapper,
  Bar,
  Toggle,
};
