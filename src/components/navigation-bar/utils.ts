import { SiteConfig } from '../page-container/types';
import { TransformedNavigationMenu } from './types';

// Helper function to filter navigation routes display based on the current environment (development, staging, production).
export function filterRoutesByEnv(
  navigation: TransformedNavigationMenu[],
  environment: string,
): TransformedNavigationMenu[] {
  if (!environment) {
    return navigation;
  }

  const filter = (
    routes: TransformedNavigationMenu[],
  ): TransformedNavigationMenu[] => {
    return routes
      .filter(route => {
        if (route.env && !route.env.includes(environment)) {
          return false;
        }
        return true;
      })
      .map(route => {
        if (route.routes) {
          return { ...route, routes: filter(route.routes) };
        }
        return route;
      });
  };

  return filter(navigation);
}

export const buildNavigationFromConfig = (
  config: SiteConfig,
): TransformedNavigationMenu[] => {
  const navigationRoutes = config.navigation.primary.reduce(
    (navRoutes, item) => {
      if (item.routes) {
        navRoutes.push({
          label: item.label,
          routes: item.routes.map(route => {
            const pageConfig = config.pages[route.page];
            const itemHref = pageConfig?.nav?.href || route.page;

            return {
              ...pageConfig?.nav,
              href: itemHref,
              env: pageConfig?.env,
            } as TransformedNavigationMenu;
          }),
        });
      } else if (item.page) {
        const pageData = {
          ...config.pages[item.page]?.nav,
          label: item.label,
          href: item.page,
        } as TransformedNavigationMenu;

        navRoutes.push(pageData);
      }

      return navRoutes;
    },
    [] as TransformedNavigationMenu[],
  );

  return navigationRoutes;
};
