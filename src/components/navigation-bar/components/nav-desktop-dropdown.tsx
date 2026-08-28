import { Button, ButtonProps, Icon, Popover, Stack } from '@chakra-ui/react';
import React from 'react';
import { FaCaretDown } from 'react-icons/fa6';

import { TransformedNavigationDropdown } from '../types';
import { NavDropdownItem } from './nav-dropdown-item';

/*
This file contains the components for the desktop dropdown menu in the navigation bar. It includes:
- NavDropdownTrigger: A component that serves as a trigger for a dropdown menu. It displays a label and an icon indicating that it has a dropdown.
- NavDropdown: A component that renders the content of the dropdown menu in a Popover.
- NavDropdownMenu: A component that takes an array of routes and renders them as items in the dropdown menu.
*/

export const NavDropdownTrigger = ({
  label,
  icon,
  children,
  ...buttonProps
}: ButtonProps & {
  label: TransformedNavigationDropdown['label'];
  icon?: TransformedNavigationDropdown['icon'];
  children: React.ReactNode;
}) => {
  return (
    <Popover.Root
      autoFocus
      closeOnEscape
      lazyMount
      positioning={{
        placement: 'bottom-start',
      }}
    >
      <Popover.Context>
        {({ open: isOpen }) => (
          <>
            <Popover.Trigger asChild>
              <Button
                fontSize='inherit'
                variant='unstyled'
                _hover={{ bg: 'whiteAlpha.300', color: 'white' }}
                gap={1.5}
                {...buttonProps}
              >
                {icon && <Icon as={icon} boxSize={4} />}
                {label}
                <Icon w={4} h={4} asChild>
                  <FaCaretDown />
                </Icon>
              </Button>
            </Popover.Trigger>

            {isOpen && children}
          </>
        )}
      </Popover.Context>
    </Popover.Root>
  );
};

export const NavDropdown = ({ children }: { children: React.ReactNode }) => {
  return (
    <Popover.Positioner>
      <Popover.Content
        border={0}
        boxShadow='xl'
        bg='white'
        rounded='xl'
        minW='sm'
      >
        <Popover.Arrow />
        <Popover.Body>
          <Stack>{children}</Stack>
        </Popover.Body>
      </Popover.Content>
    </Popover.Positioner>
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
