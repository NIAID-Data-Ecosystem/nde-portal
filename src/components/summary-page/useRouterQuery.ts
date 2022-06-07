import React, { useEffect, useMemo, useState } from 'react';
import { NextRouter, useRouter } from 'next/router';
import { encodeString } from 'src/utils/querystring-helpers';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from 'src/components/search-results-page/components/filters/helpers';

export type SelectedFilterType = {
  [key: string]: string[];
};

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

export const useQueryString = (
  defaultQueryString: string = '__all__',
): [string, (arg: string) => void] => {
  const router = useRouter();

  // Current querystring.
  const [queryString, setQueryString] = useState(defaultQueryString);
  // Update the route to reflect changes on page without re-render.
  const updateRoute = (update: {}) => {
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

  useEffect(() => {
    const { q } = router.query;
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

  const updateQueryString = (q: string) => {
    updateRoute({ q, from: 1 });
  };

  return [queryString, q => updateQueryString(q)];
};

// Handle filters
export const useFilterString = (
  facets: {
    [key: string]: {
      name: string;
    };
  },
  facetSize: number,
): [SelectedFilterType, (arg: string) => void] => {
  const router = useRouter();
  const defaultFilters = Object.keys(facets).reduce(
    (r, k) => ({ ...r, [k]: [] }),
    {},
  );

  const [selectedFilters, setSelectedFilters] =
    useState<SelectedFilterType>(defaultFilters);

  useEffect(() => {
    const { filters } = router.query;

    setSelectedFilters(prev => {
      let queryObject = queryFilterString2Object(filters);
      return {
        ...prev,
        ...queryObject,
      };
    });
  }, [router]);

  // Update the route to reflect changes on page without re-render.
  const updateRoute = (update: {}) => {
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

  const removeAllFilters = () => {
    return updateRoute({
      from: 1,
      filters: defaultFilters,
    });
  };

  return [selectedFilters, removeAllFilters];
};
