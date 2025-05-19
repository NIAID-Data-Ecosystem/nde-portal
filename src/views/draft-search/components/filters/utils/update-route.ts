import { NextRouter } from 'next/router';

// Given a query object, update the route to reflect the change.
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
      scroll: true,
    },
  );
};
