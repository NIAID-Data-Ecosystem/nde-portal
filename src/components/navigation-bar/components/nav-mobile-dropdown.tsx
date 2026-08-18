import React from 'react';
import { Box, Collapsible, Stack } from '@chakra-ui/react';
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
    <Box
      borderRadius='semi'
      boxShadow='base'
      overflow='hidden'
      display={{ base: 'block', md: 'none' }}
    >
      <Collapsible.Root open={isOpen}>
        <Collapsible.Content>
          <Stack bg='white' p={2} alignItems='end'>
            {routes &&
              routes.map(route => (
                <MobileNavItem key={route.label} {...route} />
              ))}
            <MobileAuthAction />
          </Stack>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
};
