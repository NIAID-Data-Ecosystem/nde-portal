import React, { useCallback } from 'react';
import { Params } from 'src/utils/api';
import { useFacetsData } from 'src/components/filters/hooks/useFacetsData';
import { FiltersContainer } from 'src/components/filters/components/filters-container';
import { FiltersList } from 'src/components/filters/components/filters-list';
import { FiltersSection } from 'src/components/filters/components/filters-section';
import {
  queryFilterObject2String,
  updateRoute,
} from 'src/components/filters/helpers';
import { SelectedFilterType } from 'src/components/filters/types';
import { useRouter } from 'next/router';
import { FiltersDateSlider } from 'src/components/filters/components/filters-date-slider/';
import { FILTERS_CONFIG } from './helpers';

/*
[COMPONENT INFO]:
  Fetches all filters based on initial query string.
  Note: only the counts are updated when the user toggles a filter.
*/

interface FiltersProps {
  colorScheme?: string;
  // Params used in query.
  queryParams: Params;
  // Currently selected filters
  selectedFilters: SelectedFilterType;
  // fn to remove all selected filters
  removeAllFilters?: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
  colorScheme = 'primary',
  queryParams,
  removeAllFilters,
  selectedFilters,
}) => {
  const facets = Object.keys(FILTERS_CONFIG);
  const router = useRouter();
  const [{ data, error, isLoading, isUpdating }] = useFacetsData({
    queryParams,
    facets: facets.filter(facet => facet !== 'date'),
  });

  const handleUpdate = useCallback(
    (update: {}) => updateRoute(update, router),
    [router],
  );

  const handleSelectedFilters = (values: string[], facet: string) => {
    const updatedValues = values.map(value => {
      // return object with inverted facet + key for exists values
      if (value === '-_exists_' || value === '_exists_') {
        return { [value]: [facet] };
      }
      return value;
    });

    let updatedFilterString = queryFilterObject2String({
      ...selectedFilters,
      ...{ [facet]: updatedValues },
    });

    handleUpdate({
      from: 1,
      filters: updatedFilterString,
    });
  };

  return (
    <FiltersContainer
      title='Filters'
      error={error}
      filtersConfig={FILTERS_CONFIG}
      selectedFilters={selectedFilters}
      removeAllFilters={removeAllFilters}
    >
      {facets.map(facet => {
        const { name, glyph, property } = FILTERS_CONFIG[facet];
        const facetTerms = data[facet]?.sort((a, b) => b.count - a.count);
        const selected = selectedFilters?.[facet]?.map(filter => {
          if (typeof filter === 'object') {
            return Object.keys(filter)[0];
          } else {
            return filter;
          }
        });

        if (facet === 'date') {
          return (
            <FiltersDateSlider
              key={facet}
              colorScheme={colorScheme}
              queryParams={queryParams}
              filters={selectedFilters}
              selectedData={data?.date || []}
              selectedDates={selected || []}
              handleSelectedFilter={values =>
                handleSelectedFilters(values, facet)
              }
              resetFilter={() => handleSelectedFilters([], facet)}
            />
          );
        }

        return (
          <FiltersSection
            key={facet}
            name={name}
            description={FILTERS_CONFIG[facet]['description']}
          >
            <FiltersList
              colorScheme={colorScheme}
              searchPlaceholder={`Search ${name.toLowerCase()} filters`}
              terms={facetTerms}
              property={property}
              selectedFilters={selected || []}
              handleSelectedFilters={values =>
                handleSelectedFilters(values, facet)
              }
              isLoading={isLoading}
              isUpdating={isUpdating}
            />
          </FiltersSection>
        );
      })}
    </FiltersContainer>
  );
};
