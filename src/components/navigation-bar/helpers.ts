import { SiteConfig } from '../page-container/types';
import { TransformedNavigationMenu } from './types';

export function filterRoutesByEnv(
  navigation: TransformedNavigationMenu[],
  environment: string,
): TransformedNavigationMenu[] {
  // If no environment is provided, return the original navigation
  if (!environment) {
    return navigation;
  }
  function filter(
    routes: TransformedNavigationMenu[],
  ): TransformedNavigationMenu[] {
    return routes
      .filter(route => {
        // Remove routes with an env array that doesn't include the current env
        if (route.env && !route.env.includes(environment)) {
          return false;
        }
        return true;
      })
      .map(route => {
        // If nested routes exist, filter them too
        if (route.routes) {
          const filteredNestedRoutes = filter(route.routes);
          return { ...route, routes: filteredNestedRoutes };
        }
        return route;
      });
  }

  return navigation && filter(navigation);
}
// Helper function to build navigation structure from config
export const buildNavigationFromConfig = (config: SiteConfig) => {
  const navigationRoutes = config.navigation.primary.reduce(
    (navRoutes, item) => {
      if (item.routes) {
        // This is a parent with children
        navRoutes.push({
          label: item.label,
          routes: item.routes.map(route => {
            return {
              ...config.pages[route.page]?.nav,
              env: config.pages[route.page]?.env,
            } as TransformedNavigationMenu;
          }),
        });
      } else if (item.page) {
        // This is a direct route
        const pageData = {
          ...config.pages[item.page]?.nav,
          label: item.label,
          href: item.page,
        } as TransformedNavigationMenu;

        pageData && navRoutes.push(pageData);
      }
      return navRoutes;
    },
    [] as TransformedNavigationMenu[],
  );

  return navigationRoutes;
};
