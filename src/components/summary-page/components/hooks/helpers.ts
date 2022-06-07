import { NextRouter } from 'next/router';

// Format queryString for display i.e. remove parenthesis, etc
export const displayQueryString = (str: string) => {
  if (!str) {
    return;
  }
  if (str === '__all__') {
    str = '';
  }
  if (str.charAt(0) === '(') {
    str = str.replace('(', '');
  }
  if (str.slice(-1) === ')') {
    str = str.replace(/.$/, '');
  }
  return str;
};

// Update the route to reflect changes on page without re-render.
export const updateRoute = (update: {}, router: NextRouter) => {
  router.push(
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
