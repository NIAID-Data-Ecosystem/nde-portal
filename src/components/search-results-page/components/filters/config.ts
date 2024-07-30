import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import {
  APIResourceType,
  formatResourceTypeForDisplay,
} from 'src/utils/formatting/formatResourceType';
import { FilterConfig, FacetTerm, FilterItem } from './types';
import { buildQueries, buildSourceQueries } from './utils/query-builders';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

/**
 * Get the description for a given schema property.
 *
 * @param property - The schema property to get the description for.
 * @returns The description for the schema property.
 */
export const getSchemaDescription = (property: string) => {
  const schemaProperty = schema[property];
  return (
    schemaProperty?.abstract?.['Dataset'] ||
    schemaProperty?.description?.['Dataset'] ||
    ''
  );
};

/**
 * Filter configuration array. Order matters here as the filters will be rendered in the same order.
 */
export const FILTER_CONFIGS: FilterConfig[] = [
  {
    name: 'Type',
    property: '@type',
    isDefaultOpen: true,
    description:
      'Type is used to categorize the nature of the content of the resource',
    createQueries: buildQueries('@type'),
    transformData: (item): FilterItem => ({
      ...item,
      label:
        item.label ||
        formatResourceTypeForDisplay(item.term as APIResourceType),
    }),
  },
  {
    name: 'Sources',
    property: 'includedInDataCatalog.name',
    description: getSchemaDescription('includedInDataCatalog'),
    createQueries: buildSourceQueries('includedInDataCatalog.name'),
  },
  {
    name: 'Collections',
    property: 'sourceOrganization.name',
    description: getSchemaDescription('sourceOrganization.name'),
    createQueries: (params, options) =>
      buildQueries('sourceOrganization.name')(
        {
          ...params,
          multi_terms_fields:
            'sourceOrganization.alternateName,sourceOrganization.name',
          multi_terms_size: '100',
        },
        options,
      ),
  },
  {
    name: 'Health Condition',
    property: 'healthCondition.name',
    description: getSchemaDescription('healthCondition'),
    createQueries: buildQueries('healthCondition.name'),
  },
  {
    name: 'Pathogen Species',
    property: 'infectiousAgent.displayName',
    description: getSchemaDescription('infectiousAgent'),
    createQueries: buildQueries('infectiousAgent.displayName'),
    transformData: (item): FilterItem => {
      if (item.term.includes(' | ')) {
        const [subLabel, label] = item.term.split(' | ');
        return { ...item, label, subLabel };
      }
      return {
        ...item,
        label: item.label || item.term,
      };
    },
  },
  {
    name: 'Host Species',
    property: 'species.displayName',
    description: getSchemaDescription('species'),
    createQueries: buildQueries('species.displayName'),
    transformData: (item): FilterItem => {
      if (item.term.includes(' | ')) {
        const [subLabel, label] = item.term.split(' | ');
        return { ...item, label, subLabel };
      }
      return {
        ...item,
        label: item.label || item.term,
      };
    },
  },
  {
    name: 'Funding',
    property: 'funding.funder.name',
    description: getSchemaDescription('funding'),
    createQueries: buildQueries('funding.funder.name'),
  },
  {
    name: 'Conditions of Access',
    property: 'conditionsOfAccess',
    description: getSchemaDescription('conditionsOfAccess'),
    createQueries: buildQueries('conditionsOfAccess'),
  },
  {
    name: 'Variable Measured',
    property: 'variableMeasured',
    description: getSchemaDescription('variableMeasured'),
    createQueries: buildQueries('variableMeasured'),
  },
  {
    name: 'Measurement Technique',
    property: 'measurementTechnique.name',
    description: getSchemaDescription('measurementTechnique'),
    createQueries: buildQueries('measurementTechnique.name'),
  },
];
