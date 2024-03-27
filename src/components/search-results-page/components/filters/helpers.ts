import { FiltersConfigProps } from 'src/components/filters/types';

// Default facet size
export const FACET_SIZE = 1000;

/*
Config for the naming/text of a filter.
[NOTE]: Order matters here as the filters will be rendered in the order of the keys.
*/
export const FILTERS_CONFIG: FiltersConfigProps = {
  date: { name: 'Date ', glyph: 'date', property: 'date', isDefaultOpen: true },
  '@type': { name: 'Type', property: '@type' },
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

  'infectiousAgent.displayName': {
    name: 'Pathogen Species',
    glyph: 'infectiousAgent',
    property: 'infectiousAgent',
  },

  'species.displayName': {
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
