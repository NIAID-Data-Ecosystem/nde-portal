import { QueryValue } from 'src/components/advanced-search/types';
import { SearchTypesConfigProps } from '../../../Search/search-types-config';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';

/**
 * [getFieldDetails] Returns the metadata field config object for a given field property
 * @param field Field property
 * @param term Query string without wildcards or quotes, used as field property for exists type queries
 * @returns Metadata field config object
 */
export const getFieldDetails = (
  field: QueryValue['field'],
  term: QueryValue['term'],
) => {
  const dotfield = (
    field === '_exists_' || field === '-_exists_' ? term : field
  ) as keyof typeof SCHEMA_DEFINITIONS;
  return SCHEMA_DEFINITIONS[dotfield];
};

/**
 * [stripSearchTerm] Strips wildcards and quotes from a string
 * @param str query string
 * @returns string stripped of any wildcards or quotes
 */
export const stripSearchTerm = (str: QueryValue['querystring']) => {
  if (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') {
    return str.substring(1, str.length - 1);
  }

  const words = str.split(' ');

  return words
    .map(word => {
      if (word.charAt(0) === '*' && word.charAt(word.length - 1) === '*') {
        return word.substring(1, word.length - 1);
      } else if (word.charAt(0) === '*') {
        return word.substring(1, word.length);
      } else if (word.charAt(word.length - 1) === '*') {
        return word.substring(0, word.length - 1);
      } else {
        return word;
      }
    })
    .join(' ');
};

/**
 * [getSearchOptionsForField] Returns the search options available for a given field
 * @param query Partial Query object
 * @param options Search options config
 * @returns Search options available for a given field
 */
export const getSearchOptionsForField = (
  query: Partial<QueryValue>,
  options: SearchTypesConfigProps[],
) => {
  return options.filter(
    option =>
      !(option.shouldOmit && option.shouldOmit(query)) &&
      !(option.shouldDisable && option.shouldDisable(query)),
  );
};

/**
 * [getSearchType] Returns the search type for a given query
 * @param query Partial Query object
 * @param options Search options config
 * @returns Search type for a given query
 */
export const getSearchType = (
  query: Partial<QueryValue>,
  options: SearchTypesConfigProps[],
) => {
  if (query?.field === '_exists_' || query?.field === '-_exists_') {
    return options.find(({ id }) => id === query.field);
  } else if (query?.querystring) {
    if (query.querystring.startsWith('"') && query.querystring.endsWith('"')) {
      return options.find(({ id }) => id === 'exact');
    } else if (
      query.querystring.startsWith('*') &&
      query.querystring.endsWith('*')
    ) {
      return options.find(({ id }) => id.includes('contains'));
    } else if (query.querystring.startsWith('*')) {
      return options.find(({ id }) => id === 'ends-with');
    } else if (query.querystring.endsWith('*')) {
      return options.find(({ id }) => id === 'starts-with');
    } else {
      return options.find(({ id }) => id === 'contains');
    }
  }
};

/**
 * [transformQueryString] Transforms a query string into a date range object
 * @param str query string to transform
 * @param type field type
 * @returns date range object for date fields and string for all other fields
 */
export const transformQueryString = (str?: string, type?: string) => {
  if (!str) return '';
  if (type === 'date') {
    const [start, end] = str.replace('[', '').replace(']', '').split(' TO ');
    return {
      startDate: start === '*' ? '' : start,
      endDate: end === '*' ? '' : end,
    };
  }
  return str;
};
