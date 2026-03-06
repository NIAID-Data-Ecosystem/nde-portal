import dynamic from 'next/dynamic';
import { Layout } from './layout';

export const Nav = {
  Wrapper: Layout.Wrapper,
  Bar: Layout.Bar,
  Toggle: Layout.Toggle,
  MobileMenu: dynamic(
    () => import('./mobile-nav-menu').then(mod => mod.MobileNavMenu),
    {
      loading: () => null,
    },
  ),
  DesktopMenu: dynamic(
    () => import('./desktop-nav-item').then(mod => mod.DesktopNavMenu),
    {
      loading: () => null,
    },
  ),
  DesktopNavItem: dynamic(
    () => import('./desktop-nav-item').then(mod => mod.DesktopNavItem),
    {
      loading: () => null,
    },
  ),
};
