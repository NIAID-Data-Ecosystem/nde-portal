export interface TransformedNavigationMenu extends NavigationItem {
  env?: string[];
  routes?: Array<TransformedNavigationMenu>;
}

export interface NavigationItem {
  label: string;
  subLabel?: string;
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
