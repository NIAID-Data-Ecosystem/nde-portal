import { RouteProps } from './types';

export function filterRoutesByEnv(
  navigation: RouteProps,
  environment: string,
): RouteProps {
  // If no environment is provided, return the original navigation
  if (!environment) {
    return navigation;
  }
  function filter(routes: RouteProps[]): RouteProps[] {
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

  return {
    ...navigation,
    routes: navigation?.routes && filter(navigation.routes),
  };
}
