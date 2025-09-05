import { IconProps } from '@chakra-ui/react';

export interface TransformedNavigationMenu extends NavigationItem {
  env?: string[];
  href?: string;
  routes?: Array<TransformedNavigationMenu>;
  getIcon?: (props: IconProps) => React.ReactNode;
}

export interface NavigationItem {
  label: string;
  description?: string;
  isExternal?: boolean;
}

export interface NavigationRoute {
  page: string;
}

export interface NavigationSection {
  label: string;
  page?: string;
  routes?: NavigationRoute[];
}

export interface Navigation {
  primary: NavigationSection[];
}
