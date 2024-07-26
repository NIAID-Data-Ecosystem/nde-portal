import { FiltersConfigProps } from 'src/components/filters/types';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { fetchSearchResults } from 'src/utils/api';
import { encodeString } from 'src/utils/querystring-helpers';
import {
  APIResourceType,
  formatResourceTypeForDisplay,
} from 'src/utils/formatting/formatResourceType';
import { Params } from 'src/utils/api';
import { FilterConfig } from './types';

// Default facet size
export const FACET_SIZE = 1000;

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

/**
 * Get the description for a given schema property.
 *
 * This function retrieves the description for a schema property from the schema definitions.
 * If the property has an abstract or description in the 'Dataset' context, it returns that. Otherwise, it returns an empty string.
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
 * Helper function to create common query parameters.
 *
 * This function generates the common query parameters required for making the API call.
 * It handles encoding the search query, setting facet filters, and other parameters.
 *
 * @param params - The parameters used in the query.
 * @param facetField - The facet field to filter by.
 * @returns The common query parameters.
 */

const buildCommonParams = (params: Params, facetField: string) => ({
  ...params,
  q: params?.advancedSearch === 'true' ? params.q : encodeString(params.q),
  extra_filter: params?.extra_filter
    ? `${params.extra_filter} AND _exists_:${facetField}`
    : `_exists_:${facetField}`,
  size: 0,
  facet_size: 1000,
  facets: facetField,
  sort: undefined,
});

/**
 * Helper function to create queries for a given facet field.
 *
 * This function generates the query options for a given facet field. It creates two queries:
 * 1. A query to fetch aggregated results where the facet field exists.
 * 2. A query to fetch aggregated results where the facet field does not exist.
 *
 * The results are then transformed to a more usable format.
 *
 * @param facetField - The facet field to filter by.
 * @param formatLabel - A function to format the label of the facet terms, using the total for the "Any Specified field".
 * @returns A function that takes query parameters and options, and returns an array of query options.
 */
const buildQueries =
  (
    facetField: string,
    formatLabel: (term: string) => string,
  ): FilterConfig['createQueries'] =>
  (params, options) => {
    const commonParams = buildCommonParams(params, facetField);

    // Destructure options to exclude queryKey and gather other options, with defaults
    const { queryKey: optionsQueryKey = [], ...otherOptions } = options || {};
    return [
      {
        queryKey: [...optionsQueryKey, commonParams],
        queryFn: async () => {
          const data = await fetchSearchResults(commonParams);
          if (!data) {
            throw new Error('No data returned from fetchSearchResults');
          }
          return data;
        },
        select: data => {
          const { total, facets } = data;
          const terms = facets[facetField].terms.map(
            (item: { term: string; count: number }) => ({
              label: formatLabel(item.term),
              term: item.term,
              count: item.count,
              facet: facetField,
            }),
          );
          if (facetField === '@type') {
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
        },
        ...otherOptions,
      },
      {
        queryKey: [
          ...optionsQueryKey,
          {
            ...commonParams,
            extra_filter: params?.extra_filter
              ? `${params.extra_filter} AND -_exists_:@type`
              : `-_exists_:@type`,
            facet_size: 0,
          },
        ],
        queryFn: async () => {
          const data = await fetchSearchResults({
            ...commonParams,
            extra_filter: params?.extra_filter
              ? `${params.extra_filter} AND -_exists_:@type`
              : `-_exists_:@type`,
            facet_size: 0,
          });
          if (!data) {
            throw new Error('No data returned from fetchSearchResults');
          }
          return data;
        },
        select: data => ({
          facet: facetField,
          results: [
            {
              label: 'Not Specified',
              term: '-_exists_',
              count: data.total,
              facet: facetField,
            },
          ],
        }),
        ...otherOptions,
      },
    ];
  };

// Filter configuration array. Order matters here as the filters will be rendered in the same order.
export const FILTER_CONFIGS: FilterConfig[] = [
  {
    name: 'Type',
    property: '@type',
    description:
      'Type is used to categorize the nature of the content of the resource',
    createQueries: buildQueries('@type', term =>
      formatResourceTypeForDisplay(term as APIResourceType),
    ),
  },
  {
    name: 'Sources',
    property: 'includedInDataCatalog.name',
    description: getSchemaDescription('includedInDataCatalog'),
    createQueries: buildQueries('includedInDataCatalog.name', term => term),
  },
];

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
