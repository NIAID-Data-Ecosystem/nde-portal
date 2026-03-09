export interface NavigationItem {
  label: string;
  description?: string;
  icon?: React.ElementType;
  isExternal?: boolean;
  href?: string;
  onClick?: () => void;
  isOpen?: boolean;
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

export interface TransformedNavigationDropdown extends NavigationItem {
  env?: string[];
  href?: string;
  routes?: TransformedNavigationDropdown[];
}
