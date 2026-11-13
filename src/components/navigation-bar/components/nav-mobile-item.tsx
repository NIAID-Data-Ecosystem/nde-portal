import { Collapsible, Stack, useDisclosure } from '@chakra-ui/react';
import React from 'react';

import { TransformedNavigationDropdown } from '../types';
import { NavDropdownItem } from './nav-dropdown-item';

export const MobileNavItem = ({
  label,
  icon,
  routes,
  href,
  isExternal,
}: TransformedNavigationDropdown) => {
  const { open, onToggle } = useDisclosure();

  return (
    <Stack w='100%' gap={2} cursor={routes ? 'pointer' : 'default'}>
      {Boolean(routes) ? (
        <NavDropdownItem
          label={label}
          icon={icon}
          isOpen={open}
          onClick={onToggle}
        />
      ) : (
        <NavDropdownItem
          label={label}
          icon={icon}
          href={href}
          isExternal={isExternal}
        />
      )}
      {routes?.length ? (
        <Collapsible.Root open={open}>
          <Collapsible.Content>
            <Stack
              mt={0}
              pl={2}
              ml={2}
              borderLeft={2}
              borderStyle='solid'
              borderColor='gray.200'
              align='start'
            >
              {routes.map(route => (
                <MobileNavItem
                  key={`${route.href ?? route.label}`}
                  {...route}
                />
              ))}
            </Stack>
          </Collapsible.Content>
        </Collapsible.Root>
      ) : null}
    </Stack>
  );
};
