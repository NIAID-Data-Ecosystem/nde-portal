import React, { useCallback } from 'react';
import { Params } from 'src/utils/api';
import { useFacetsData } from 'src/components/filters/hooks/useFacetsData';
import {
  FiltersContainer,
  FiltersList,
  FiltersSection,
  queryFilterObject2String,
  updateRoute,
} from 'src/components/filters';
import { SelectedFilterType } from 'src/components/filters/types';
import { useRouter } from 'next/router';

/*
[COMPONENT INFO]:
  Fetches all filters based on initial query string.
  Note: only the counts are updated when the user toggles a filter.
*/

// Default facet size
export const FACET_SIZE = 1000;

/*
Config for the naming/text of a filter.
[NOTE]: Order matters here as the filters will be rendered in the order of the keys.
*/
export const filtersConfig: Record<
  string,
  { name: string; glyph?: string; property?: string }
> = {
  '@type': { name: 'Type' },
  'includedInDataCatalog.name': {
    name: 'Source',
    glyph: 'info',
    property: 'includedInDataCatalog',
  },
  keywords: { name: 'Keywords', glyph: 'info', property: 'keywords' },
  date: { name: 'Date ', glyph: 'date', property: 'date' },
  'measurementTechnique.name': {
    name: 'Measurement Technique',
    glyph: 'measurementTechnique',
    property: 'measurementTechnique',
  },
  variableMeasured: {
    name: 'Variable Measured',
    glyph: 'variableMeasured',
    property: 'variableMeasured',
  },
  'funding.funder.name': {
    name: 'Funding',
    glyph: 'funding',
    property: 'funding',
  },
  'healthCondition.name': {
    name: 'Health Condition',
    glyph: 'healthCondition',
    property: 'healthCondition',
  },
  'infectiousAgent.name': {
    name: 'Pathogen',
    glyph: 'infectiousAgent',
    property: 'infectiousAgent',
  },
  'species.name': { name: 'Species', glyph: 'species', property: 'species' },
  // applicationCategory: {
  //   name: 'Software Category',
  //   glyph: 'applicationCategory',
  //   property: 'applicationCategory',
  // },
  // programmingLanguage: {
  //   name: 'Programming Language',
  //   glyph: 'programmingLanguage',
  //   property: 'programmingLanguage',
  // },
};

interface FiltersProps {
  // Params used in query.
  queryParams: Params;
  // Currently selected filters
  selectedFilters: SelectedFilterType;
  // fn to remove all selected filters
  removeAllFilters?: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
  queryParams,
  removeAllFilters,
  selectedFilters,
}) => {
  const facets = Object.keys(filtersConfig);
  const router = useRouter();

  const [{ data, error, isLoading, isUpdating }] = useFacetsData({
    queryParams,
    facets,
  });

  const handleUpdate = useCallback(
    (update: {}) => updateRoute(update, router),
    [router],
  );
  return (
    <FiltersContainer
      title='Filters'
      error={error}
      filtersConfig={filtersConfig}
      selectedFilters={selectedFilters}
      removeAllFilters={removeAllFilters}
    >
      {facets.map(facet => {
        const { name, glyph, property } = filtersConfig[facet];
        const selected = selectedFilters?.[facet]?.map(filter => {
          if (typeof filter === 'object') {
            return Object.keys(filter)[0];
          } else {
            return filter;
          }
        });
        return (
          <FiltersSection
            key={facet}
            name={name}
            icon={glyph}
            property={property || ''}
          >
            <FiltersList
              searchPlaceholder={`Search ${name.toLowerCase()} filters`}
              terms={data[facet]?.sort((a, b) => b.count - a.count)}
              selectedFilters={selected || []}
              handleSelectedFilters={values => {
                const updatedValues = values.map(value => {
                  // return object with inverted facet + key for exists values
                  if (value === '-_exists_') {
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
              }}
              isLoading={isLoading}
              isUpdating={isUpdating}
            ></FiltersList>
          </FiltersSection>
        );
      })}
    </FiltersContainer>
  );
};
