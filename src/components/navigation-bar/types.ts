export interface TransformedNavigationMenu extends NavigationItem {
  env?: string[];
  href?: string;
  routes?: Array<TransformedNavigationMenu>;
}

export interface NavigationItem {
  label: string;
  description?: string;
  isExternal?: boolean;
  href?: string;
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
