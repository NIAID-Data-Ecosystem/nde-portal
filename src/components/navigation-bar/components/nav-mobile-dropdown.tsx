import React from 'react';
import { Box, Collapse, Stack } from '@chakra-ui/react';
import { TransformedNavigationDropdown } from '../types';
import { MobileAuthAction } from './nav-auth-action';
import { MobileNavItem } from 'src/components/navigation-bar/components/nav-mobile-item';

export const MobileNavDropdown = ({
  isOpen,
  routes,
}: {
  isOpen: boolean;
  routes: TransformedNavigationDropdown[];
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
