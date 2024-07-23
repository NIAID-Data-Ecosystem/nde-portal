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

import { useQueries } from 'react-query';
import { FiltersConfigProps } from 'src/components/filters/types';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { fetchSearchResults } from 'src/utils/api';
import { encodeString } from 'src/utils/querystring-helpers';
import { getSchemaDescription } from './helpers';
import { r } from 'node_modules/msw/lib/glossary-de6278a9';

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

export const fetchFacetCounts = async params => {
  return await fetchSearchResults(params).then(res => res);
};

export const fetchFacetMissingCounts = async params => {
  return await fetchSearchResults(params);
};

export const FILTERS_CONFIG_ARR = [
  {
    name: 'Type',
    property: '@type',
    description:
      'Type is used to categorize the nature of the content of the resource',
    queries: (params: any) => {
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
          queryKey: ['search-results', params.q, params.extra_filter],
          queryFn: () => fetchFacetCounts(commonParams),
        },
        {
          queryKey: ['search-facets', '@type', '-_exists_'],
          queryFn: () =>
            fetchFacetMissingCounts({
              ...commonParams,
              extra_filter: params?.extra_filter
                ? `${params.extra_filter} AND -_exists_:@type`
                : `-_exists_:@type`,
              facet_size: 0,
            }),
        },
      ];
    },
  },
  {
    name: 'Sources',
    property: 'includedInDataCatalog.name',
    description: getSchemaDescription('includedInDataCatalog'),
    queries: (params: any) => {
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
          queryKey: ['search-results', params.q, params.extra_filter],
          queryFn: () => fetchFacetCounts(commonParams),
        },
        {
          queryKey: [
            'search-facets',
            'includedInDataCatalog.name',
            '-_exists_',
          ],
          queryFn: () =>
            fetchFacetMissingCounts({
              ...commonParams,
              extra_filter: params?.extra_filter
                ? `${params.extra_filter} AND -_exists_:includedInDataCatalog.name`
                : `-_exists_:includedInDataCatalog.name`,
              facet_size: 0,
            }),
        },
      ];
    },
  },
  {
    name: 'Health Condition',
    property: 'healthCondition.name',
    description: getSchemaDescription('healthCondition.name'),
    queries: (params: any) => {
      const commonParams = {
        ...params,
        q:
          params?.advancedSearch === 'true' ? params.q : encodeString(params.q),
        extra_filter: params?.extra_filter
          ? `${params.extra_filter} AND _exists_:healthCondition.name`
          : `_exists_:healthCondition.name`,
        size: 0,
        facet_size: 1000,
        facets: 'healthCondition.name',
        sort: undefined,
      };
      return [
        {
          queryKey: ['search-results', params.q, params.extra_filter],
          queryFn: () => fetchFacetCounts(commonParams),
        },
        {
          queryKey: ['search-facets', 'healthCondition.name', '-_exists_'],
          queryFn: () =>
            fetchFacetMissingCounts({
              ...commonParams,
              extra_filter: params?.extra_filter
                ? `${params.extra_filter} AND -_exists_:healthCondition.name`
                : `-_exists_:healthCondition.name`,
              facet_size: 0,
            }),
        },
      ];
    },
  },
  {
    name: 'Pathogen Species',
    property: 'infectiousAgent.displayName',
    description: getSchemaDescription('infectiousAgent.displayName'),
    queries: (params: any) => {
      const commonParams = {
        ...params,
        q:
          params?.advancedSearch === 'true' ? params.q : encodeString(params.q),
        extra_filter: params?.extra_filter
          ? `${params.extra_filter} AND _exists_:infectiousAgent.displayName`
          : `_exists_:infectiousAgent.displayName`,
        size: 0,
        facet_size: 1000,
        facets: 'infectiousAgent.displayName',
        sort: undefined,
      };
      return [
        {
          queryKey: ['search-results', params.q, params.extra_filter],
          queryFn: () => fetchFacetCounts(commonParams),
        },
        {
          queryKey: [
            'search-facets',
            'infectiousAgent.displayName',
            '-_exists_',
          ],
          queryFn: () =>
            fetchFacetMissingCounts({
              ...commonParams,
              extra_filter: params?.extra_filter
                ? `${params.extra_filter} AND -_exists_:infectiousAgent.displayName`
                : `-_exists_:infectiousAgent.displayName`,
              facet_size: 0,
            }),
        },
      ];
    },
  },
  {
    name: 'Funding',
    property: 'funding.funder.name',
    description: getSchemaDescription('funding.funder.name'),
    queries: (params: any) => {
      const commonParams = {
        ...params,
        q:
          params?.advancedSearch === 'true' ? params.q : encodeString(params.q),
        extra_filter: params?.extra_filter
          ? `${params.extra_filter} AND _exists_:funding.funder.name`
          : `_exists_:funding.funder.name`,
        size: 0,
        facet_size: 1000,
        facets: 'funding.funder.name',
        sort: undefined,
      };
      return [
        {
          queryKey: ['search-results', params.q, params.extra_filter],
          queryFn: () => fetchFacetCounts(commonParams),
        },
        {
          queryKey: ['search-facets', 'funding.funder.name', '-_exists_'],
          queryFn: () =>
            fetchFacetMissingCounts({
              ...commonParams,
              extra_filter: params?.extra_filter
                ? `${params.extra_filter} AND -_exists_:funding.funder.name`
                : `-_exists_:funding.funder.name`,
              facet_size: 0,
            }),
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
  console.log('queryparams:', queryParams);
  // Memoize queries to prevent unnecessary recalculations
  const queries = useMemo(() => {
    return FILTERS_CONFIG_ARR.flatMap(facet => facet.queries(queryParams));
  }, [queryParams]);
  console.log('queries', queries);

  const results = useQueries(queries);
  console.log('results:', results);
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
