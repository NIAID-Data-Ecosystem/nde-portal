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
import {
  FiltersConfigProps,
  SelectedFilterType,
} from 'src/components/filters/types';
import { useRouter } from 'next/router';
import { FiltersDateSlider } from 'src/components/filters/components/filters-date-slider/';
import { theme } from 'nde-design-system';

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
export const filtersConfig: FiltersConfigProps = {
  date: { name: 'Date ', glyph: 'date', property: 'date', isDefaultOpen: true },
  // '@type': { name: 'Type', isDefaultOpen: true },
  'includedInDataCatalog.name': {
    name: 'Repository',
    glyph: 'info',
    property: 'includedInDataCatalog',
  },
  'healthCondition.name': {
    name: 'Health Condition',
    glyph: 'healthCondition',
    property: 'healthCondition',
  },

  'infectiousAgent.name': {
    name: 'Pathogen Species',
    glyph: 'infectiousAgent',
    property: 'infectiousAgent',
  },

  'species.name': {
    name: 'Host Species',
    glyph: 'species',
    property: 'species',
  },
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
  'funding.funder.name': {
    name: 'Funding',
    glyph: 'funding',
    property: 'funding',
  },
  conditionsOfAccess: {
    name: 'Conditions of Access',
    glyph: 'info',
    property: 'conditionsOfAccess',
  },
  variableMeasured: {
    name: 'Variable Measured',
    glyph: 'variableMeasured',
    property: 'variableMeasured',
  },
  'measurementTechnique.name': {
    name: 'Measurement Technique',
    glyph: 'measurementTechnique',
    property: 'measurementTechnique',
  },
};

interface FiltersProps {
  colorScheme?: keyof typeof theme.colors;
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
      filtersConfig={filtersConfig}
      selectedFilters={selectedFilters}
      removeAllFilters={removeAllFilters}
    >
      {facets.map(facet => {
        const { name, glyph, property } = filtersConfig[facet];
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
            icon={glyph}
            property={property || ''}
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
