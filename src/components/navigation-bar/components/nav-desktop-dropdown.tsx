import React from 'react';
import { FaCaretDown } from 'react-icons/fa6';
import {
  Button,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverArrow,
  PopoverContent,
  PopoverBody,
  Stack,
} from '@chakra-ui/react';
import { TransformedNavigationDropdown } from '../types';
import { NavDropdownItem } from './nav-dropdown-item';
import { SHARED_DESKTOP_ACTION_STYLES } from './styles';

/*
This file contains the components for the desktop dropdown menu in the navigation bar. It includes:
- NavDropdownTrigger: A component that serves as a trigger for a dropdown menu. It displays a label and an icon indicating that it has a dropdown.
- NavDropdown: A component that renders the content of the dropdown menu in a Popover.
- NavDropdownMenu: A component that takes an array of routes and renders them as items in the dropdown menu.
*/

export const NavDropdownTrigger = ({
  isLoading,
  label,
  children,
}: {
  isLoading?: boolean;
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <Popover
      trigger='click'
      placement='bottom-start'
      autoFocus
      closeOnEsc
      isLazy
    >
      {({ isOpen }) => (
        <>
          <PopoverTrigger>
            <Button
              isLoading={isLoading}
              __css={SHARED_DESKTOP_ACTION_STYLES}
              _hover={{ bg: 'whiteAlpha.300', color: 'white' }}
            >
              {label}
              <Icon as={FaCaretDown} ml={1} w={4} h={4} />
            </Button>
          </PopoverTrigger>

          {isOpen && children}
        </>
      )}
    </Popover>
  );
};

export const NavDropdown = ({ children }: { children: React.ReactNode }) => {
  return (
    <PopoverContent
      border={0}
      boxShadow='xl'
      bg='white'
      py={2}
      rounded='xl'
      minW='sm'
    >
      <PopoverArrow />
      <PopoverBody>
        <Stack>{children}</Stack>
      </PopoverBody>
    </PopoverContent>
  );
};

export const NavDropdownMenu = ({
  routes,
}: {
  routes: TransformedNavigationDropdown[];
}): JSX.Element | null => {
  if (!routes || routes.length === 0) return null;

  return (
    <NavDropdown>
      {routes.map(route => (
        <NavDropdownItem key={`${route.href ?? route.label}`} {...route} />
      ))}
    </NavDropdown>
  );
};
