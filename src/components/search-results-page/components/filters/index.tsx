import React, { useCallback, useMemo } from 'react';
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

import { useQueries } from '@tanstack/react-query';
import { FiltersConfigProps } from 'src/components/filters/types';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { fetchSearchResults } from 'src/utils/api';
import { encodeString } from 'src/utils/querystring-helpers';
import { getSchemaDescription } from './helpers';
import { formatResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';

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

export const FILTERS_CONFIG_ARR = [
  {
    name: 'Type',
    property: '@type',
    description:
      'Type is used to categorize the nature of the content of the resource',
    queries: (params: any, options: any) => {
      const commonParams = {
        ...params,
        q:
          params?.advancedSearch === 'true' ? params.q : encodeString(params.q),
        extra_filter: params?.extra_filter
          ? `${params.extra_filter} AND _exists_:@type`
          : `_exists_:@type`,
        size: 0,
        facet_size: 1000,
        facets: '@type',
        sort: undefined,
      };
      return [
        {
          queryKey: ['search-results', commonParams],
          queryFn: async () => {
            console.log('RAN');
            return await fetchSearchResults(commonParams);
          },
          select: data => {
            const { total, facets } = data;

            const terms = facets['@type']['terms'].map(datum => ({
              label: formatResourceTypeForDisplay(datum.term),
              term: datum.term,
              count: datum.count,
              facet: '@type',
            }));

            return {
              facet: '@type',
              results: [
                {
                  label: 'Any Specified',
                  term: '_exists_',
                  count: total,
                  facet: '@type',
                },
                ...terms,
              ],
            };
          },
          ...options,
        },
        {
          queryKey: [
            'search-results',
            {
              ...commonParams,
              extra_filter: params?.extra_filter
                ? `${params.extra_filter} AND -_exists_:@type`
                : `-_exists_:@type`,
              facet_size: 0,
            },
          ],
          queryFn: async () =>
            await fetchSearchResults({
              ...commonParams,
              extra_filter: params?.extra_filter
                ? `${params.extra_filter} AND -_exists_:@type`
                : `-_exists_:@type`,
              facet_size: 0,
            }),
          select: data => {
            const { total } = data;
            return {
              facet: '@type',
              results: [
                {
                  label: 'Not Specified',
                  term: '-_exists_',
                  count: total,
                  facet: '@type',
                },
              ],
            };
          },
          ...options,
        },
      ];
    },
  },
  {
    name: 'Sources',
    property: 'includedInDataCatalog.name',
    description: getSchemaDescription('includedInDataCatalog'),
    queries: (params: any, options: any) => {
      const commonParams = {
        ...params,
        q:
          params?.advancedSearch === 'true' ? params.q : encodeString(params.q),
        extra_filter: params?.extra_filter
          ? `${params.extra_filter} AND _exists_:includedInDataCatalog.name`
          : `_exists_:includedInDataCatalog.name`,
        size: 0,
        facet_size: 1000,
        facets: 'includedInDataCatalog.name',
        sort: undefined,
      };
      return [
        {
          queryKey: ['search-results', commonParams],
          queryFn: async () => await fetchSearchResults(commonParams),
          select: data => {
            const { total, facets } = data;

            const terms = facets['includedInDataCatalog.name']['terms'].map(
              datum => ({
                label: datum.term,
                term: datum.term,
                count: datum.count,
                facet: 'includedInDataCatalog.name',
              }),
            );

            return {
              facet: 'includedInDataCatalog.name',
              results: [
                {
                  label: 'Any Specified',
                  term: '_exists_',
                  count: total,
                  facet: 'includedInDataCatalog.name',
                },
                ...terms,
              ],
            };
          },
          ...options,
        },
        {
          queryKey: [
            'search-facets',
            {
              ...commonParams,
              extra_filter: params?.extra_filter
                ? `${params.extra_filter} AND -_exists_:includedInDataCatalog.name`
                : `-_exists_:includedInDataCatalog.name`,
              facet_size: 0,
            },
          ],
          queryFn: async () =>
            await fetchSearchResults({
              ...commonParams,
              extra_filter: params?.extra_filter
                ? `${params.extra_filter} AND -_exists_:includedInDataCatalog.name`
                : `-_exists_:includedInDataCatalog.name`,
              facet_size: 0,
            }),
          select: data => {
            const { total } = data;
            return {
              facet: 'includedInDataCatalog.name',
              results: [
                {
                  label: 'Not Specified',
                  term: '-_exists_',
                  count: total,
                  facet: 'includedInDataCatalog.name',
                },
              ],
            };
          },
          ...options,
        },
      ];
    },
  },
];

export const Filters: React.FC<FiltersProps> = ({
  colorScheme = 'primary',
  queryParams,
  removeAllFilters,
  selectedFilters,
}) => {
  // Memoize queries to prevent unnecessary recalculations.
  const queries = useMemo(() => {
    return FILTERS_CONFIG_ARR.flatMap(facet =>
      facet.queries({ ...queryParams, extra_filter: '' }),
    );
  }, [queryParams]);

  // Only run on mount without the extra_filters to get the "base" counts for the filters.
  const results = useQueries({
    queries,
    combine: queryResult => {
      return queryResult.reduce((acc, { data }) => {
        if (!data) return acc;
        const { facet, results } = data;
        if (!acc[facet]) {
          acc[facet] = results;
        } else {
          acc[facet] = acc[facet].concat(results);
        }

        return acc;
      }, {});
    },
  });

  // Update the queries with the selected filters.
  const updated_queries = useMemo(() => {
    return FILTERS_CONFIG_ARR.flatMap(facet =>
      facet.queries(queryParams, {
        enabled: !!(
          queryParams &&
          queryParams.extra_filter &&
          results &&
          Object.keys(results).length > 0
        ),
      }),
    );
  }, [queryParams, results]);

  // Get the updated results and counts with the selected filters.
  const updated_results = useQueries({
    queries: updated_queries,
    combine: queryResult => {
      return queryResult.reduce((acc, { data }) => {
        if (!data) return acc;
        const { facet, results } = data;
        if (!acc[facet]) {
          acc[facet] = results;
        } else {
          acc[facet] = acc[facet].concat(results);
        }

        return acc;
      }, {});
    },
  });

  console.log('updated_results', updated_results);

  return <div>filters</div>;
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
};
