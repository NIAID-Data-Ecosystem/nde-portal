import React from 'react';
import { Box, Collapse, Stack, useDisclosure } from '@chakra-ui/react';
import { TransformedNavigationMenu } from '../types';
import { MobileAuthAction } from './nav-auth-action';
import { NavMenuItem } from './nav-menu-item';

const MobileNavItem = ({
  label,
  routes,
  href,
  isExternal,
}: TransformedNavigationMenu) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack w='100%' spacing={2} cursor={routes ? 'pointer' : 'default'}>
      {Boolean(routes) ? (
        <NavMenuItem label={label} isOpen={isOpen} onClick={onToggle} />
      ) : (
        <NavMenuItem label={label} href={href} isExternal={isExternal} />
      )}

      {routes?.length ? (
        <Collapse in={isOpen} animateOpacity>
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
              <MobileNavItem key={`${route.href ?? route.label}`} {...route} />
            ))}
          </Stack>
        </Collapse>
      ) : null}
    </Stack>
  );
};

export const MobileNavMenu = ({
  isOpen,
  routes,
}: {
  isOpen: boolean;
  routes: TransformedNavigationMenu[];
}) => {
  return (
    <Box borderRadius='semi' boxShadow='base' overflow='hidden'>
      <Collapse in={isOpen} animateOpacity>
        <Stack bg='white' p={2} alignItems='end'>
          {routes &&
            routes.map(navItem => (
              <MobileNavItem key={navItem.label} {...navItem} />
            ))}
          <MobileAuthAction />
        </Stack>
      </Collapse>
    </Box>
  );
};
