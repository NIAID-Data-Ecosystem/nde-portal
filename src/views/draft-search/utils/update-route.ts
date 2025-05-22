import { NextRouter } from 'next/router';

// Given a query object, update the route to reflect the change.
export const updateRoute = (router: NextRouter, update: {}) => {
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
      scroll: true,
    },
  );
};
