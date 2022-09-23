import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from 'src/components/filters/';
import { updateRoute } from './helpers';
import { SelectedFilterType } from 'src/components/filters/types';

/*
  This hook takes a filters object and transforms it into a string to use in the route.
  Maintains the state of the filters using that updated route.
  Returns a filters object[SelectedFilterType] and two handler functions (1. update filters 2.one to remove all filters.)
*/

export const useFilterString = (facets: {
  [key: string]: {
    name: string;
  };
}): [
  SelectedFilterType,
  (updatedFilters: SelectedFilterType) => void,
  () => void,
] => {
  const router = useRouter();

  // Base default filters.
  const defaultFilters = Object.keys(facets).reduce(
    (r, k) => ({ ...r, [k]: [] }),
    {},
  );

  const [selectedFilters, setSelectedFilters] =
    useState<SelectedFilterType>(defaultFilters);

  // Whenever the route updates, transform that string into a state object.
  useEffect(() => {
    const { filters } = router.query;
    setSelectedFilters(prev => {
      let queryObject = queryFilterString2Object(filters) || {};

      return {
        ...defaultFilters,
        ...queryObject,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Update route with new filter preferences. Note: resets pagination.
  const updateFilters = (updatedFilters: typeof selectedFilters) => {
    let filtersObject = {
      ...selectedFilters,
      ...updatedFilters,
    };
    let updatedFilterString = queryFilterObject2String(filtersObject);

    updateRoute(
      {
        from: 1,
        filters: updatedFilterString,
      },
      router,
    );
  };

  // Restore filter preferences to default. Note: resets pagination.
  const removeAllFilters = () => {
    updateRoute(
      {
        from: 1,
        filters: defaultFilters,
      },
      router,
    );
  };

  return [selectedFilters, updateFilters, removeAllFilters];
};
