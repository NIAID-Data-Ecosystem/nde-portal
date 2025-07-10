export interface RouteProps {
  label: string;
  subLabel?: string;
  routes?: Array<RouteProps>;
  href?: string;
  env?: string[];
  isExternal?: boolean;
  isActive?: boolean;
}
