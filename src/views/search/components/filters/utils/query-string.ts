import { SelectedFilterType, SelectedFilterValueType } from '../types';
import { formatResourceTypeForAPI } from 'src/utils/formatting/formatResourceType';

/**
 * Convert selected filters object to a query string for API calls
 */
export const filtersToQueryString = (
  selectedFilters: SelectedFilterType,
): string | null => {
  const filterParts = Object.entries(selectedFilters)
    .filter(([_, values]) => values.length > 0)
    .map(([filterName, values]) => {
      // Separate string values from object values (for _exists_ filters)
      const stringValues = values.filter(
        (v): v is string => typeof v === 'string' && v !== '',
      );
      const objectValues = values.filter(
        (v): v is { [key: string]: string[] } => typeof v === 'object',
      );

      let valueString = '';

      // Handle @type specially - needs API formatting
      if (stringValues.length > 0 && filterName === '@type') {
        valueString = `("${stringValues
          .map(type => formatResourceTypeForAPI(type))
          .join('" OR "')}")`;
      }
      // Handle date - single value is exact match, multiple is range
      else if (filterName === 'date') {
        if (stringValues.length === 1) {
          valueString = stringValues[0];
        } else if (stringValues.length > 1) {
          valueString = `["${stringValues.join('" TO "')}"]`;
        }
      }
      // Standard OR query for other filters
      else if (stringValues.length > 0) {
        valueString = `("${stringValues.join('" OR "')}")`;
      }

      // Handle object values (e.g., { '-_exists_': ['facet'] })
      if (objectValues.length > 0) {
        const objectStrings = objectValues.map(obj =>
          filtersToQueryString(obj),
        );
        if (valueString) {
          valueString += ' OR ' + objectStrings.join(' OR ');
        } else {
          valueString = objectStrings.join(' OR ') || '';
        }
      }

      return valueString ? `(${filterName}:${valueString})` : null;
    })
    .filter(Boolean);

  return filterParts.length > 0 ? filterParts.join(' AND ') : null;
};

/**
 * Parse a query string back into a filters object
 */
export const queryStringToFilters = (
  queryString?: string | string[],
): SelectedFilterType | null => {
  if (!queryString || Array.isArray(queryString)) {
    return null;
  }

  const filterParts = queryString.includes(' AND ')
    ? queryString.split(' AND ')
    : [queryString];

  return filterParts.reduce((acc, part) => {
    // Remove outer parentheses
    let cleanPart = part;
    if (cleanPart.startsWith('(') && cleanPart.endsWith(')')) {
      cleanPart = cleanPart.slice(1, -1);
    }

    // Split on first colon to get key and value
    const colonIndex = cleanPart.indexOf(':');
    if (colonIndex === -1) return acc;

    const key = cleanPart.slice(0, colonIndex).replace(/[("]/g, '');
    const valueString = cleanPart.slice(colonIndex + 1);

    // Parse the value string
    const values = parseFilterValues(valueString, key);
    if (values.length > 0) {
      acc[key] = values;
    }

    return acc;
  }, {} as SelectedFilterType);
};

/**
 * Parse filter values from a query string value
 */
const parseFilterValues = (
  valueString: string,
  key: string,
): SelectedFilterValueType[] => {
  // Clean up the value string
  let cleaned = valueString
    .replace(/^\(?"?/, '')
    .replace(/"?\)?$/, '')
    .replace(/^\[?"?/, '')
    .replace(/"?\]?$/, '');

  // Handle exists filters
  if (cleaned.startsWith('_exists_') || cleaned.startsWith('-_exists_')) {
    return [{ [cleaned.includes('-') ? '-_exists_' : '_exists_']: [key] }];
  }

  // Split by OR or TO (for date ranges)
  const separator = key === 'date' ? /" TO "| TO / : /" OR "/;
  const parts = cleaned.split(separator).filter(Boolean);

  return parts.map(part => part.replace(/^"|"$/g, ''));
};

/**
 * Normalize filter values - converts _exists_ strings to objects
 */
export const normalizeFilterValues = (
  values: SelectedFilterValueType[],
  facet: string,
): SelectedFilterValueType[] => {
  return values.map(value => {
    if (value === '_exists_' || value === '-_exists_') {
      return { [value]: [facet] };
    }
    return value;
  });
};

/**
 * Get the display values from selected filters (flattening object values)
 */
export const getSelectedFilterDisplay = (
  values: SelectedFilterValueType[],
): string[] => {
  return values.map(value => {
    if (typeof value === 'object') {
      return Object.keys(value)[0];
    }
    return value;
  });
};

/**
 * Convert a filter object to a query string
 * Used by DateFilter to build filter strings
 */
export const queryFilterObject2String = (
  filters?: Record<string, SelectedFilterValueType[]>,
): string => {
  if (!filters) {
    return '';
  }
  return filtersToQueryString(filters) || '';
};

/**
 * Parse a query string to a filter object
 * Used by DateFilter to parse existing filters
 */
export const queryFilterString2Object = (
  queryString?: string | string[],
): SelectedFilterType => {
  if (!queryString || Array.isArray(queryString)) {
    return {};
  }
  return queryStringToFilters(queryString) || {};
};
