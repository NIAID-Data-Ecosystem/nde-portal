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
    _id: 'date',
    name: 'Date',
    property: 'date',
    isDefaultOpen: true,
    description: '',
    createQueries: (id, params, options) => {
      // Destructure options to exclude queryKey and gather other options, with defaults
      const { queryKey = [], ...queryOptions } = options || {};
      return [
        createCommonQuery({
          id,
          queryKey,
          params: {
            ...params,
            hist: 'date',
            facets: '',
          },
          ...queryOptions,
          placeholderData: undefined,
          select: (data: FetchSearchResultsResponse) => {
            return {
              id,
              facet: 'date',
              results: structureQueryData(data),
            };
          },
        }),
        createNotExistsQuery({
          id,
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
    _id: '__type',
    name: 'Type',
    property: '@type',
    description:
      'Type is used to categorize the nature of the content of the resource',
    createQueries: (id, params, options) => [
      createCommonQuery({
        id,
        queryKey: options?.queryKey || [],
        params,
        ...options,
      }),
    ],
    transformData: (item): FacetTermWithDetails => ({
      ...item,
      label:
        item.label ||
        formatResourceTypeForDisplay(item.term as APIResourceType),
    }),
  },
  {
    _id: 'includedInDataCatalog',
    name: 'Sources',
    property: 'includedInDataCatalog.name',
    description: getSchemaDescription('includedInDataCatalog'),
    createQueries: buildSourceQueries(),
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
    _id: 'sourceOrganization.name',
    name: 'Program Collection',
    property: 'sourceOrganization.name',
    description: getSchemaDescription('sourceOrganization.name'),
    createQueries: (id, params, options) => [
      createCommonQuery({
        id,
        queryKey: options?.queryKey || [],
        params: {
          ...params,
          facets: 'sourceOrganization.name.raw',
          multi_terms_fields:
            'sourceOrganization.parentOrganization,sourceOrganization.name.raw',
          multi_terms_size: '100',
        },
        ...options,
      }),
    ],
    // transformData: (item): FacetTermWithDetails => {
    //   let label = item.label || item.term;
    //   if (label.toLocaleLowerCase().includes('creid')) {
    //     label = label.replace(/creid/g, 'CREID');
    //   }
    //   if (label.toLocaleLowerCase().includes('niaid')) {
    //     label = label.replace(/niaid/g, 'NIAID');
    //   }
    //   return { ...item, label };
    // },
  },
  {
    _id: 'healthCondition.name.raw',
    name: 'Health Condition',
    property: 'healthCondition.name.raw',
    description: getSchemaDescription('healthCondition'),
    createQueries: buildQueries(),
  },
  {
    _id: 'infectiousAgent.displayName.raw',
    name: 'Pathogen Species',
    property: 'infectiousAgent.displayName.raw',
    description: getSchemaDescription('infectiousAgent'),
    createQueries: buildQueries(),
  },
  {
    _id: 'species.displayName.raw',
    name: 'Host Species',
    property: 'species.displayName.raw',
    description: getSchemaDescription('species'),
    createQueries: buildQueries(),
  },
  {
    _id: 'funding.funder.name.raw',
    name: 'Funding',
    property: 'funding.funder.name.raw',
    description: getSchemaDescription('funding'),
    createQueries: buildQueries(),
  },
  {
    _id: 'conditionsOfAccess',
    name: 'Conditions of Access',
    property: 'conditionsOfAccess',
    description: getSchemaDescription('conditionsOfAccess'),
    createQueries: buildQueries(),
  },
  {
    _id: 'variableMeasured.name.raw',
    name: 'Variable Measured',
    property: 'variableMeasured.name.raw',
    description: getSchemaDescription('variableMeasured.name'),
    createQueries: buildQueries(),
  },
  {
    _id: 'measurementTechnique.name.raw',
    name: 'Measurement Technique',
    property: 'measurementTechnique.name.raw',
    description: getSchemaDescription('measurementTechnique'),
    createQueries: buildQueries(),
  },
];
