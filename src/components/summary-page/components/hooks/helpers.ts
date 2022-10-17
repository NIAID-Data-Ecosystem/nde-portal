import { NextRouter } from 'next/router';

// Format queryString for display i.e. remove parenthesis, etc
export const displayQueryString = (str: string) => {
  if (!str) {
    return;
  }
  if (str === '__all__') {
    str = '';
  }
  return str;
};

// Update the route to reflect changes on page without re-render.
export const updateRoute = (update: {}, router: NextRouter) => {
  return router.push(
    {
      query: {
        ...router.query,
        ...update,
      },
    },
    undefined,
    {
      shallow: true,
    },
  );
};
