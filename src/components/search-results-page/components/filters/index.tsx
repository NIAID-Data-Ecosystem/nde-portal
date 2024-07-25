import React from 'react';
import { Params } from 'src/utils/api';
import { SelectedFilterType } from 'src/components/filters/types';
import { useFilterQueries } from './hooks/useFilterQueries';

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
  // Use custom hook to get filter query results
  const { initialResults, filteredResults } = useFilterQueries(queryParams);

  // console.log('initialResults', initialResults);
  // console.log('filteredResults', filteredResults);

  return <div>filters</div>;
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
// return (
//   <FiltersContainer
//     title='Filters'
//     error={error}
//     filtersConfig={FILTERS_CONFIG}
//     selectedFilters={selectedFilters}
//     removeAllFilters={removeAllFilters}
//   >
//     {facets.map(facet => {
//       const { name, glyph, property } = FILTERS_CONFIG[facet];
//       const facetTerms = data[facet]?.sort((a, b) => b.count - a.count);
//       const selected = selectedFilters?.[facet]?.map(filter => {
//         if (typeof filter === 'object') {
//           return Object.keys(filter)[0];
//         } else {
//           return filter;
//         }
//       });
//       if (facet === 'date') {
//         return (
//           <FiltersDateSlider
//             key={facet}
//             colorScheme={colorScheme}
//             queryParams={queryParams}
//             filters={selectedFilters}
//             selectedData={data?.date || []}
//             selectedDates={selected || []}
//             handleSelectedFilter={values =>
//               handleSelectedFilters(values, facet)
//             }
//             resetFilter={() => handleSelectedFilters([], facet)}
//           />
//         );
//       }
//       return (
//         <FiltersSection
//           key={facet}
//           name={name}
//           description={FILTERS_CONFIG[facet]['description']}
//         >
//           <FiltersList
//             colorScheme={colorScheme}
//             searchPlaceholder={`Search ${name.toLowerCase()} filters`}
//             terms={facetTerms}
//             property={property}
//             selectedFilters={selected || []}
//             handleSelectedFilters={values =>
//               handleSelectedFilters(values, facet)
//             }
//             isLoading={isLoading}
//             isUpdating={isUpdating}
//           />
//         </FiltersSection>
//       );
//     })}
//   </FiltersContainer>
// );
