import React, { useCallback } from 'react';
import { Params } from 'src/utils/api';
import { SelectedFilterType } from 'src/components/filters/types';
import { useFilterQueries } from './hooks/useFilterQueries';
import { OLD_FILTERS_CONFIG } from './helpers';
import { FILTER_CONFIGS } from './config';

import {
  FiltersContainer,
  FiltersList,
  FiltersSection,
  queryFilterObject2String,
  updateRoute,
} from 'src/components/filters';
import { useRouter } from 'next/router';

// Interface for Filters component props
interface FiltersProps {
  colorScheme?: string;
  queryParams: Params;
  selectedFilters: SelectedFilterType;
  removeAllFilters?: () => void;
}

// Filters component
export const Filters: React.FC<FiltersProps> = ({
  colorScheme = 'primary',
  queryParams,
  removeAllFilters,
  selectedFilters,
}) => {
  const router = useRouter();

  // Use custom hook to get filter query results
  const { results, error, isLoading, isUpdating } =
    useFilterQueries(queryParams);

  const handleUpdate = useCallback(
    (update: {}) => updateRoute(update, router),
    [router],
  );

  const handleSelectedFilters = useCallback(
    (values: string[], facet: string) => {
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
    },
    [selectedFilters, handleUpdate],
  );

  return (
    <FiltersContainer
      title='Search Filters'
      error={error}
      filtersList={FILTER_CONFIGS}
      selectedFilters={selectedFilters}
      removeAllFilters={removeAllFilters}
    >
      {FILTER_CONFIGS.map(facet => {
        const { name, property } = facet;
        const selected = selectedFilters?.[property]?.map(filter => {
          if (typeof filter === 'object') {
            return Object.keys(filter)[0];
          } else {
            return filter;
          }
        });
        return (
          <FiltersSection
            key={facet.name}
            name={facet.name}
            description={facet.description}
          >
            <FiltersList
              colorScheme={colorScheme}
              searchPlaceholder={`Search ${name.toLowerCase()} filters`}
              terms={results[property]}
              property={property}
              selectedFilters={selected || []}
              handleSelectedFilters={values =>
                handleSelectedFilters(values, property)
              }
              isLoading={isLoading}
              isUpdating={isUpdating}
            />
          </FiltersSection>
        );
      })}
      {/* {facets.map(facet => {
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
        })} */}
    </FiltersContainer>
  );
};

// const router = useRouter();
// const [{ data, error, isLoading, isUpdating }] = useFacetsData({
//   queryParams,
//   facets: facets.filter(facet => facet !== 'date'),
// });
// const handleUpdate = useCallback(
//   (update: {}) => updateRoute(update, router),
//   [router],
// );
// const handleSelectedFilters = (values: string[], facet: string) => {
//   const updatedValues = values.map(value => {
//     // return object with inverted facet + key for exists values
//     if (value === '-_exists_' || value === '_exists_') {
//       return { [value]: [facet] };
//     }
//     return value;
//   });
//   let updatedFilterString = queryFilterObject2String({
//     ...selectedFilters,
//     ...{ [facet]: updatedValues },
//   });
//   handleUpdate({
//     from: 1,
//     filters: updatedFilterString,
//   });
// };
//
