import React from 'react';
import { TransformedNavigationDropdown } from '../types';
import { NavTopLevelLink } from './nav-desktop-top-level-link';
import { NavDropdownMenu, NavDropdownTrigger } from './nav-desktop-dropdown';

interface NavBarItemProps extends TransformedNavigationDropdown {
  isActive?: boolean;
}

/*
The main component that decides whether to render a simple NavTopLevelLink or a NavDropdownTrigger based on whether there are child routes.
*/
export const NavBarItem = ({
  label,
  routes,
  href,
  isExternal,
  isActive,
}: NavBarItemProps) => {
  if (!routes) {
    return (
      <NavTopLevelLink
        label={label}
        href={href}
        isExternal={isExternal}
        isActive={isActive}
      />
    );
  }

  return (
    <NavDropdownTrigger label={label}>
      <NavDropdownMenu routes={routes} />
    </NavDropdownTrigger>
  );
};
