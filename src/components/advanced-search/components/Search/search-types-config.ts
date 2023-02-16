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
  shouldDisable?: (field: QueryValue['field']) => boolean;
  shouldOmit?: (field: QueryValue['field']) => boolean;
}

export const SEARCH_TYPES_CONFIG: SearchTypesConfigProps[] = [
  {
    id: '_exists_',
    label: 'Field exists',
    description: 'Matches where selected field has a value.',
    isDefault: false,
    shouldDisable: (field: QueryValue['field']) => {
      return !field;
    },
    transformValue: (query: QueryValue) => {
      /* For "exists" type queries, we want a format of _exists_: {field}, meaning:
       * [field] is set to "_exists_"
       * [term] and [querystring] are set to the field name
       */
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
    shouldDisable: (field: QueryValue['field']) => {
      return !field;
    },
    transformValue: (query: QueryValue) => {
      /* For "-_exists_" type queries, we want a format of -_exists_: {field}, meaning:
       * [field] is set to "-_exists_"
       * [term] and [querystring] are set to the field name
       */
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
    shouldOmit: (field: QueryValue['field']) => {
      if (!field) {
        return true;
      }
      const fieldDetails = MetadataFieldsConfig.find(f => {
        // if(field==="_exists_" || field==="-_exists_") {
        //   return f.property === querystring
        // }
        return f.property === field;
      });

      if (fieldDetails?.format === 'enum' || fieldDetails?.format === 'date') {
        return false;
      }
      return fieldDetails?.type === 'keyword' || fieldDetails?.type === 'text';
    },
  },
  {
    id: 'contains-multi',
    label: 'MultiField contains',
    description: 'Contains this term or phrase',
    shouldOmit: (field: QueryValue['field']) => {
      if (!field) {
        return false;
      }
      const fieldDetails = MetadataFieldsConfig.find(f => f.property === field);

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
        transformValue: (query: QueryValue) => {
          // escape double quotes.
          const querystring = query.term.replace(/"/g, '\\"');
          return { ...query, querystring: `"${querystring}"` };
        },
        shouldOmit: (field: QueryValue['field']) => {
          if (!field) {
            return false;
          }
          const fieldDetails = MetadataFieldsConfig.find(
            f => f.property === field,
          );

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
        transformValue: (query: QueryValue) => {
          return {
            ...query,
            querystring: wildcardQueryString({
              value: query.term,
              field: query.field,
            }),
          };
        },
        shouldOmit: (field: QueryValue['field']) => {
          if (!field) {
            return false;
          }
          const fieldDetails = MetadataFieldsConfig.find(
            f => f.property === field,
          );

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
        transformValue: (query: QueryValue) => {
          return {
            ...query,
            querystring: wildcardQueryString({
              value: query.term,
              field: query.field,
              wildcard: 'end',
            }),
          };
        },
        shouldOmit: (field: QueryValue['field']) => {
          if (!field) {
            return false;
          }
          const fieldDetails = MetadataFieldsConfig.find(
            f => f.property === field,
          );

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
        transformValue: (query: QueryValue) => {
          return {
            ...query,
            querystring: wildcardQueryString({
              value: query.term,
              field: query.field,
              wildcard: 'start',
            }),
          };
        },
        shouldOmit: (field: QueryValue['field']) => {
          if (!field) {
            return false;
          }
          const fieldDetails = MetadataFieldsConfig.find(
            f => f.property === field,
          );

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
