import { FiltersConfigProps } from 'src/components/filters/types';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';

// Default facet size
export const FACET_SIZE = 1000;

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;
const getSchemaDescription = (property: string) => {
  const schemaProperty = schema[property];
  return (
    schemaProperty?.abstract?.['Dataset'] ||
    schemaProperty?.description?.['Dataset'] ||
    ''
  );
};

/*
Config for the naming/text of a filter.
[NOTE]: Order matters here as the filters will be rendered in the order of the keys.
*/

export const FILTERS_CONFIG: FiltersConfigProps = {
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
