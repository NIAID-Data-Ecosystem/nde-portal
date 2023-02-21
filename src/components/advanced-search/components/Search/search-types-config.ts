import { wildcardQueryString } from '../../utils/query-helpers';
import MetadataFieldsConfig from 'configs/resource-fields.json';
import { QueryValue } from '../../types';

/**
 * @interface SearchTypesConfigProps:
 *
 * @id Unique ID for the search type.
 * @label String used for display for the search type.
 * @description Description of the search type.
 * @example Example of how to use the search type.
 * @additionalInfo Additional warnings/information to be displayed in tooltip.
 * @options Optional list of sub items. If present, this search type will be a dropdown.
 * @isDefault Boolean to indicate if this search type should be the default for the field type.
 * @transformValue Function to transform the value(field, querystring, term, union) using the search type.
 * @shouldDisable Function to determine if the search type should be disabled.
 * @shouldOmit Function to determine if the search type should be omitted.
 */

export interface SearchTypesConfigProps {
  id: string;
  label: string;
  description: string;
  example?: string;
  additionalInfo?: string;
  isDefault?: boolean;
  options?: SearchTypesConfigProps[];
  transformValue?: (query: QueryValue) => QueryValue;
  shouldDisable?: (query: Partial<QueryValue>) => boolean;
  shouldOmit?: (query: Partial<QueryValue>) => boolean;
}

// remove any symbols that could impact the transformation
// const stripQuerystring = (str: string) => {

//   if(str)
// }

export const SEARCH_TYPES_CONFIG: SearchTypesConfigProps[] = [
  {
    id: '_exists_',
    label: 'Field exists',
    description: 'Matches where selected field has a value.',
    isDefault: false,
    shouldDisable: queryValue => {
      return !queryValue?.field;
    },
    transformValue: query => {
      /* For "exists" type queries, we want a format of _exists_: {field}, meaning:
       * [field] is set to "_exists_"
       * [term] and [querystring] are set to the field name
       */
      if (query.field === '_exists_' || query.field === '-_exists_') {
        return {
          ...query,
          field: '_exists_',
        };
      }
      return {
        ...query,
        field: '_exists_',
        term: query.field,
        querystring: query.field,
      };
    },
  },
  {
    id: '-_exists_',
    label: "Field doesn't exist",
    description: 'Matches where selected field has no set value.',
    isDefault: false,
    shouldDisable: queryValue => {
      return !queryValue.field;
    },
    transformValue: query => {
      /* For "-_exists_" type queries, we want a format of -_exists_: {field}, meaning:
       * [field] is set to "-_exists_"
       * [term] and [querystring] are set to the field name
       */
      if (query.field === '_exists_' || query.field === '-_exists_') {
        return {
          ...query,
          field: '-_exists_',
        };
      }
      return {
        ...query,
        field: '-_exists_',
        term: query.field,
        querystring: query.field,
      };
    },
  },
  {
    id: 'contains',
    label: 'Field contains',
    description: 'Contains this term or phrase',
    isDefault: true,
    shouldOmit: queryValue => {
      if (!queryValue.field) {
        return true;
      }
      const fieldDetails = MetadataFieldsConfig.find(f => {
        if (
          queryValue.field === '_exists_' ||
          queryValue.field === '-_exists_'
        ) {
          return f.property === queryValue.querystring;
        }
        return f.property === queryValue.field;
      });

      if (fieldDetails?.format === 'enum' || fieldDetails?.format === 'date') {
        return false;
      }
      return fieldDetails?.type === 'keyword' || fieldDetails?.type === 'text';
    },

    transformValue: query => {
      if (query.field === '_exists_' || query.field === '-_exists_') {
        return {
          ...query,
          field: query.term,
        };
      }
      return query;
    },
  },
  {
    id: 'contains-multi',
    label: 'MultiField contains',
    description: 'Contains this term or phrase',
    shouldOmit: queryValue => {
      if (!queryValue.field) {
        return false;
      }
      const fieldDetails = MetadataFieldsConfig.find(f => {
        if (
          queryValue.field === '_exists_' ||
          queryValue.field === '-_exists_'
        ) {
          return f.property === queryValue.querystring;
        }
        return f.property === queryValue.field;
      });

      return (
        fieldDetails?.format === 'enum' ||
        fieldDetails?.format === 'date' ||
        fieldDetails?.type === 'boolean' ||
        fieldDetails?.type === 'unsigned_long' ||
        fieldDetails?.type === 'integer' ||
        fieldDetails?.type === 'double' ||
        fieldDetails?.type === 'float'
      );
    },
    isDefault: true,
    options: [
      {
        id: 'exact',
        label: 'Exact Match',
        description: 'Contains the exact term or phrase.',
        isDefault: true,
        example: `west siberian virus · contains the exact phrase 'west siberian virus'`,
        transformValue: query => {
          const qs =
            query.term.charAt(0) === '"' &&
            query.term.charAt(query.term.length - 1) === '"'
              ? query.term.substring(1, query.term.length - 1)
              : query.term;
          return {
            ...query,
            querystring: `"${qs.replace(/"/g, '\\"')}"`,
          };
        },
        shouldOmit: queryValue => {
          if (!queryValue.field) {
            return false;
          }
          const fieldDetails = MetadataFieldsConfig.find(f => {
            if (
              queryValue.field === '_exists_' ||
              queryValue.field === '-_exists_'
            ) {
              return f.property === queryValue.querystring;
            }
            return f.property === queryValue.field;
          });

          return (
            fieldDetails?.format === 'enum' ||
            fieldDetails?.format === 'date' ||
            fieldDetails?.type === 'boolean' ||
            fieldDetails?.type === 'unsigned_long' ||
            fieldDetails?.type === 'integer' ||
            fieldDetails?.type === 'double' ||
            fieldDetails?.type === 'float'
          );
        },
      },

      {
        id: 'contains-option',
        label: 'Contains',
        description:
          'Field contains value that starts or ends with given term. Note that when given multiple terms, terms wil be searched for separately and not grouped together.',
        example: `oronaviru · contains results that contain the string fragment 'oronaviru' such as 'coronavirus'.
    immune dis · contains results that contain the string fragment 'immune' and 'dis' - though not always sequentially.
    `,
        additionalInfo:
          'Querying for records containing phrase fragments can be slow. "Exact" matching yields quicker results.',
        isDefault: false,
        transformValue: query => {
          return {
            ...query,
            querystring: wildcardQueryString({
              value: query.querystring || query.term,
              field: query.field,
            }),
          };
        },
        shouldOmit: queryValue => {
          if (!queryValue.field) {
            return false;
          }
          const fieldDetails = MetadataFieldsConfig.find(f => {
            if (
              queryValue.field === '_exists_' ||
              queryValue.field === '-_exists_'
            ) {
              return f.property === queryValue.querystring;
            }
            return f.property === queryValue.field;
          });

          return (
            fieldDetails?.format === 'enum' ||
            fieldDetails?.format === 'date' ||
            fieldDetails?.type === 'boolean' ||
            fieldDetails?.type === 'unsigned_long' ||
            fieldDetails?.type === 'integer' ||
            fieldDetails?.type === 'double' ||
            fieldDetails?.type === 'float'
          );
        },
      },

      {
        id: 'starts-with',
        label: 'Starts With',
        description: 'Field contains value that starts with given term.',
        example: `covid · contains results beginning with 'covid' such as 'covid-19`,
        isDefault: false,
        transformValue: query => {
          return {
            ...query,
            querystring: wildcardQueryString({
              value: query.querystring || query.term,
              field: query.field,
              wildcard: 'end',
            }),
          };
        },
        shouldOmit: queryValue => {
          if (!queryValue.field) {
            return false;
          }
          const fieldDetails = MetadataFieldsConfig.find(f => {
            if (
              queryValue.field === '_exists_' ||
              queryValue.field === '-_exists_'
            ) {
              return f.property === queryValue.querystring;
            }
            return f.property === queryValue.field;
          });

          return (
            fieldDetails?.format === 'enum' ||
            fieldDetails?.format === 'date' ||
            fieldDetails?.type === 'boolean' ||
            fieldDetails?.type === 'unsigned_long' ||
            fieldDetails?.type === 'integer' ||
            fieldDetails?.type === 'double' ||
            fieldDetails?.type === 'float'
          );
        },
      },

      {
        id: 'ends-with',
        label: 'Ends With',
        description: 'Field contains value that ends with given term.',
        example: `osis · contains results ending with 'osis' such as 'tuberculosis'`,
        isDefault: false,
        transformValue: query => {
          return {
            ...query,
            querystring: wildcardQueryString({
              value: query.querystring || query.term,
              field: query.field,
              wildcard: 'start',
            }),
          };
        },
        shouldOmit: queryValue => {
          if (!queryValue.field) {
            return false;
          }
          const fieldDetails = MetadataFieldsConfig.find(f => {
            if (
              queryValue.field === '_exists_' ||
              queryValue.field === '-_exists_'
            ) {
              return f.property === queryValue.querystring;
            }
            return f.property === queryValue.field;
          });

          return (
            fieldDetails?.format === 'enum' ||
            fieldDetails?.format === 'date' ||
            fieldDetails?.type === 'boolean' ||
            fieldDetails?.type === 'unsigned_long' ||
            fieldDetails?.type === 'integer' ||
            fieldDetails?.type === 'double' ||
            fieldDetails?.type === 'float'
          );
        },
      },
    ],
  },
];
