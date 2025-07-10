import ROUTES_CONFIG from 'src/components/navigation-bar/routes.json';
import { RouteProps } from '../navigation-bar/types';

/**
 * Recursively searches for a route label based on the provided path.
 *
 * @param path - The path to search for.
 * @param routes - The array of route objects to search within.
 * @returns The label of the route if found, otherwise undefined.
 */
export const getLabelFromRoute = (
  path: string,
  routes: RouteProps[] = ROUTES_CONFIG.routes,
): string | undefined => {
  for (const route of routes) {
    if (route.href === path) {
      return route.label;
    }
    if (route.routes) {
      const found = getLabelFromRoute(path, route.routes);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * Formats a slug by replacing hyphens and underscores with spaces
 * and capitalizing the first letter of each word. Should be used as a fallback
 *
 * @param slug - The slug to format.
 * @returns The formatted string.
 */
export const formatSlug = (slug: string): string => {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};
