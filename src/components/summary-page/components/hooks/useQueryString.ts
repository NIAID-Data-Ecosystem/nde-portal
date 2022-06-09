import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { encodeString } from 'src/utils/querystring-helpers';
import { updateRoute } from './helpers';

/*
  This hook takes a default query string.
  Returns an encoded query string (used for routing purposes) and a handler function to update the query string and route.
*/

export const useQueryString = (
  defaultQueryString: string = '__all__',
): [string, (arg: string) => void] => {
  const router = useRouter();
  const [queryString, setQueryString] = useState(defaultQueryString);

  useEffect(() => {
    const { q } = router.query;
    // Format the query string for routing.
    setQueryString(prev => {
      let querystring = q;

      if (querystring === undefined || querystring === prev) {
        return prev;
      }
      // if query string is empty we return all results
      if (querystring === '') {
        return defaultQueryString;
      }

      return Array.isArray(querystring)
        ? `(${querystring.map(s => encodeString(s.trim())).join('+')})`
        : `(${encodeString(querystring.trim())})`;
    });
  }, [router, defaultQueryString]);

  // When query updates we reset filters and pagination to default
  // [TO DO]: create default object for these parameters.
  const updateQueryString = (q: string) => {
    updateRoute({ q, from: 1, filters: '' }, router);
  };

  return [queryString, q => updateQueryString(q)];
};
