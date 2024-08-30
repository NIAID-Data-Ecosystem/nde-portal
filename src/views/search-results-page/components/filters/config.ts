import {
  APIResourceType,
  formatResourceTypeForDisplay,
} from 'src/utils/formatting/formatResourceType';
import { FilterConfig, FacetTermWithDetails } from './types';
import { buildQueries, buildSourceQueries } from './utils/query-builders';
import { formatDate, formatISOString } from 'src/utils/api/helpers';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import {
  createCommonQuery,
  createNotExistsQuery,
  structureQueryData,
} from './utils/queries';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

/**
 * Get the description for a given schema property.
 *
 * @param property - The schema property to get the description for.
 * @returns The description for the schema property.
 */
const getSchemaDescription = (property: string) => {
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
    name: 'Date',
    property: 'date',
    isDefaultOpen: true,
    description: getSchemaDescription('hist_dates'),
    createQueries: (params, options) => {
      // Destructure options to exclude queryKey and gather other options, with defaults
      const { queryKey = [], ...queryOptions } = options || {};

      return [
        createCommonQuery({
          queryKey,
          params: {
            ...params,
            hist: 'date',
            facets: '',
          },
          ...queryOptions,
          placeholderData: undefined,
          select: (data: FetchSearchResultsResponse) => {
            return structureQueryData(data, 'hist_dates', 'date');
          },
        }),
        createNotExistsQuery({
          queryKey,
          params: { ...params, facets: 'date' },
          ...queryOptions,
        }),
      ];
    },

    transformData: (item): FacetTermWithDetails => {
      if (item.term.includes('_exists_')) {
        return { ...item, label: item.label || '' };
      }
      return {
        ...item,
        label: formatDate(item.term)?.split('-')[0] || item.term,
        term: formatISOString(item.term),
      };
    },
  },
  {
    name: 'Type',
    property: '@type',
    description:
      'Type is used to categorize the nature of the content of the resource',
    createQueries: buildQueries('@type'),
    transformData: (item): FacetTermWithDetails => ({
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
    groupBy: [
      {
        property: 'IID',
        label: 'IID Repositories',
      },
      {
        property: 'Generalist',
        label: 'Generalist Repositories',
      },
    ],
  },
  {
    name: 'Program Collections',
    property: 'sourceOrganization.name',
    description: getSchemaDescription('sourceOrganization.name'),
    createQueries: (params, options) =>
      buildQueries('sourceOrganization.name')!(
        {
          ...params,
          multi_terms_fields:
            'sourceOrganization.parentOrganization,sourceOrganization.name',
          multi_terms_size: '100',
        },
        options,
      ),
    transformData: (item): FacetTermWithDetails => {
      let label = item.label || item.term;
      if (label.toLocaleLowerCase().includes('creid')) {
        label = label.replace(/creid/g, 'CREID');
      }
      if (label.toLocaleLowerCase().includes('niaid')) {
        label = label.replace(/niaid/g, 'NIAID');
      }
      return { ...item, label };
    },
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
  },
  {
    name: 'Host Species',
    property: 'species.displayName',
    description: getSchemaDescription('species'),
    createQueries: buildQueries('species.displayName'),
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
    property: 'variableMeasured.name',
    description: getSchemaDescription('variableMeasured.name'),
    createQueries: buildQueries('variableMeasured.name'),
  },
  {
    name: 'Measurement Technique',
    property: 'measurementTechnique.name',
    description: getSchemaDescription('measurementTechnique'),
    createQueries: buildQueries('measurementTechnique.name'),
  },
];
