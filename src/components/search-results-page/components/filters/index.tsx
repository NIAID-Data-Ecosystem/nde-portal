import React from 'react';
import { fetchSearchResults, Params } from 'src/utils/api';
import { useFacetsData } from 'src/components/filters/hooks/useFacetsData';
import {
  FiltersContainer,
  FiltersList,
  FiltersSection,
} from 'src/components/filters';
import { SelectedFilterType } from 'src/components/filters/types';

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

export const filtersConfig: Record<string, { name: string; glyph?: string }> = {
  '@type': { name: 'Type' },
  'includedInDataCatalog.name': { name: 'Source' },
  date: { name: 'Date ' },
  keywords: { name: 'Keywords' },
  'measurementTechnique.name': {
    name: 'Measurement Technique',
    glyph: 'measurementTechnique',
  },
  variableMeasured: { name: 'Variable Measured', glyph: 'variableMeasured' },
  'funding.funder.name': { name: 'Funding', glyph: 'funding' },
  'healthCondition.name': {
    name: 'Health Condition',
    glyph: 'healthCondition',
  },
  'infectiousAgent.name': { name: 'Pathogen', glyph: 'infectiousAgent' },
  'species.name': { name: 'Species', glyph: 'species' },
};

interface FiltersProps {
  // Params used in query.
  queryParams: Params;
  // Currently selected filters
  selectedFilters: SelectedFilterType;
  // fn to remove all selected filters
  removeAllFilters?: () => void;
  // fn to update filter selection
  handleSelectedFilters: (arg: SelectedFilterType) => void;
}

export const Filters: React.FC<FiltersProps> = ({
  queryParams,
  selectedFilters,
  removeAllFilters,
  handleSelectedFilters,
}) => {
  const facets = Object.keys(filtersConfig);
  const [{ data, error, isLoading }] = useFacetsData({
    queryParams,
    facets,
  });

  return (
    <FiltersContainer
      title='Filters'
      error={error}
      filtersConfig={filtersConfig}
      selectedFilters={selectedFilters}
      removeAllFilters={removeAllFilters}
    >
      {facets.map(facet => {
        const { name, glyph } = filtersConfig[facet];
        return (
          <FiltersSection key={facet} name={name} icon={glyph}>
            <FiltersList
              searchPlaceholder={`Search ${name.toLowerCase()} filters`}
              filterOptions={data[facet]}
              selectedFilters={selectedFilters[facet]}
              handleSelectedFilters={handleSelectedFilters}
            ></FiltersList>
          </FiltersSection>
        );
      })}
    </FiltersContainer>
  );
};
