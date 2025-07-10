export interface TransformedNavigationMenu extends NavigationItem {
  routes?: Array<TransformedNavigationMenu>;
}

export interface NavigationItem {
  label: string;
  href?: string;
  subLabel?: string;
  env?: string[];
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
