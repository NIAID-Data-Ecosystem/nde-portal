import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import {
  APIResourceType,
  formatResourceTypeForDisplay,
} from 'src/utils/formatting/formatResourceType';
import { FilterConfig } from './types';
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
    createQueries: buildQueries('@type', term =>
      formatResourceTypeForDisplay(term as APIResourceType),
    ),
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
      buildQueries('sourceOrganization.name', term => term)(
        {
          ...params,
          multi_terms_fields:
            'sourceOrganization.alternateName,sourceOrganization.name',
          multi_terms_size: '100',
        },
        options,
      ),
  },
];
