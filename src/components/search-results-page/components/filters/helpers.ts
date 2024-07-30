import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { FiltersConfigProps } from 'src/components/filters/types';
import { getSchemaDescription } from './config';
import { FilterTerm } from './types';

/**
 * Format the terms returned from the fetchSearchResults.
 *
 * @param data - The data returned from the fetchSearchResults API.
 * @param facetField - The facet field being processed.
 * @param formatLabel - Function to format the label of the facet terms.
 * @returns Formatted terms array.
 */
export const formatTerms = (
  data: FetchSearchResultsResponse,
  facetField: string,
  formatLabel: (term: string) => string = (term: string) => term,
) => {
  const { total, facets } = data;
  if (!facets) {
    throw new Error('No facets returned from fetchSearchResults');
  }

  const terms = facets[facetField].terms.map(
    (item: { term: string; count: number }) =>
      ({
        label: formatLabel(item.term),
        term: item.term,
        count: item.count,
        facet: facetField,
      } as FilterTerm),
  );

  if (facets?.multi_terms_agg) {
    facets.multi_terms_agg.terms.forEach(({ term: multiTerm }) => {
      const [groupBy, term] = multiTerm.split('|');
      const matchIndex = terms.findIndex(t => t.term === term);
      if (matchIndex > -1) {
        terms[matchIndex] = { ...terms[matchIndex], groupBy };
      }
    });
  }

  return {
    facet: facetField,
    results: [
      {
        label: 'Any Specified',
        term: '_exists_',
        count: total,
        facet: facetField,
      },
      ...terms,
    ],
  };
};

/*
Config for the naming/text of a filter.
[NOTE]: Order matters here as the filters will be rendered in the order of the keys.
*/

export const OLD_FILTERS_CONFIG: FiltersConfigProps = {
  date: {
    name: 'Date ',
    glyph: 'date',
    property: 'date',
    isDefaultOpen: true,
    description: getSchemaDescription('date'),
  },
  '@type': {
    name: 'Type',
    property: '@type',
    description:
      'Type is used to categorize the nature of the content of the resource',
  },
  'includedInDataCatalog.name': {
    name: 'Sources',
    glyph: 'info',
    property: 'includedInDataCatalog',
    description: getSchemaDescription('includedInDataCatalog'),
  },
  'healthCondition.name': {
    name: 'Health Condition',
    glyph: 'healthCondition',
    property: 'healthCondition',
    description: getSchemaDescription('healthCondition'),
  },

  'infectiousAgent.displayName': {
    name: 'Pathogen Species',
    glyph: 'infectiousAgent',
    property: 'infectiousAgent',
    description: getSchemaDescription('infectiousAgent'),
  },

  'species.displayName': {
    name: 'Host Species',
    glyph: 'species',
    property: 'species',
    description: getSchemaDescription('species'),
  },
  'funding.funder.name': {
    name: 'Funding',
    glyph: 'funding',
    property: 'funding',
    description: getSchemaDescription('funding'),
  },
  conditionsOfAccess: {
    name: 'Conditions of Access',
    glyph: 'info',
    property: 'conditionsOfAccess',
    description: getSchemaDescription('conditionsOfAccess'),
  },
  variableMeasured: {
    name: 'Variable Measured',
    glyph: 'variableMeasured',
    property: 'variableMeasured',
    description: getSchemaDescription('variableMeasured'),
  },
  'measurementTechnique.name': {
    name: 'Measurement Technique',
    glyph: 'measurementTechnique',
    property: 'measurementTechnique',
    description: getSchemaDescription('measurementTechnique'),
  },
};
