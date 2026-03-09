import dynamic from 'next/dynamic';
import { Layout } from './nav-layout';

export const Nav = {
  Wrapper: Layout.Wrapper,
  Bar: Layout.Bar,
  Toggle: Layout.Toggle,
  MobileMenu: dynamic(
    () => import('./nav-mobile-dropdown').then(mod => mod.MobileNavDropdown),
    {
      loading: () => null,
    },
  ),

  DesktopNavItem: dynamic(
    () => import('./nav-desktop-item').then(mod => mod.NavBarItem),
    {
      loading: () => null,
    },
  ),
};
