import { SelectedFilterType, SelectedFilterValueType } from '../types';
import { formatResourceTypeForAPI } from 'src/utils/formatting/formatResourceType';

// Regex to split filter values by quoted/bare OR and TO separators.
// Matches: " OR ", OR, " TO ", TO (used in both date ranges and multi-value filters)
const VALUE_SPLIT_PATTERN = /(?:" OR ")| OR |(?:" TO ")| TO /;

/**
 * Convert a filters object to an API-compatible query string.
 *
 * Produces strings like:
 *   (topic:("Genomics" OR "Proteomics")) AND (@type:("Dataset"))
 *   (date:["2020-01-01" TO "2023-12-31"])
 *   (keywords:(-_exists_:("keywords")))
 */
export const queryFilterObject2String = (
  selectedFilters?: SelectedFilterType,
): string | null => {
  const filterParts = Object.entries(selectedFilters || {})
    .filter(([_, values]) => values.length > 0)
    .map(([filterName, values]) => {
      const stringValues = values.filter(
        (v): v is string => typeof v === 'string' && v !== '',
      );
      const objectValues = values.filter(
        (v): v is { [key: string]: string[] } => typeof v === 'object',
      );

      let valueString = '';

      if (stringValues.length > 0 && filterName === '@type') {
        // @type values need API-specific formatting (e.g., "Dataset" -> "schema:Dataset")
        valueString = `("${stringValues
          .map(type => formatResourceTypeForAPI(type))
          .join('" OR "')}")`;
      } else if (filterName === 'date') {
        // Single date = exact match; multiple dates = range with TO
        if (stringValues.length === 1) {
          valueString = stringValues[0];
        } else if (stringValues.length > 1) {
          valueString = `["${stringValues.join('" TO "')}"]`;
        }
      } else if (stringValues.length > 0) {
        valueString = `("${stringValues.join('" OR "')}")`;
      }

      // Object values represent _exists_ / -_exists_ checks, recurse to build their query strings
      if (objectValues.length > 0) {
        const objectStrings = objectValues
          .map(obj => queryFilterObject2String(obj))
          .filter((s): s is string => s !== null);
        if (objectStrings.length > 0) {
          valueString = valueString
            ? valueString + ' OR ' + objectStrings.join(' OR ')
            : objectStrings.join(' OR ');
        }
      }

      return valueString ? `(${filterName}:${valueString})` : null;
    })
    .filter(Boolean);

  return filterParts.length > 0 ? filterParts.join(' AND ') : null;
};

/**
 * Parse an API query string back into a filters object.
 * Inverse of `queryFilterObject2String`.
 */
export const queryFilterString2Object = (
  queryString?: string | string[],
): SelectedFilterType | null => {
  if (!queryString || Array.isArray(queryString)) {
    return null;
  }

  const filterParts = queryString.includes(' AND ')
    ? queryString.split(' AND ')
    : [queryString];

  return filterParts.reduce((acc, part) => {
    // Strip outer parentheses: "(key:value)" -> "key:value"
    let cleanPart = part;
    if (cleanPart.startsWith('(') && cleanPart.endsWith(')')) {
      cleanPart = cleanPart.slice(1, -1);
    }

    // Split on first colon to separate key from value
    const colonIndex = cleanPart.indexOf(':');
    if (colonIndex === -1) return acc;

    const key = cleanPart.slice(0, colonIndex).replace(/[("]/g, '');
    const rawValue = cleanPart.slice(colonIndex + 1);

    const values = parseFilterValues(rawValue);
    if (values.length > 0) {
      acc[key] = values;
    }

    return acc;
  }, {} as SelectedFilterType);
};

/**
 * Parse the value portion of a single "key:value" filter expression.
 * Strips wrapper quotes/brackets, splits on OR/TO, and recursively
 * parses any nested _exists_ sub-expressions.
 */
const parseFilterValues = (valueString: string): SelectedFilterValueType[] => {
  // Strip first-occurrence-only wrappers to preserve nested structures
  const cleaned = valueString
    .replace('("', '')
    .replace('")', '')
    .replace('["', '')
    .replace('"]', '');

  return cleaned
    .split(VALUE_SPLIT_PATTERN)
    .filter(Boolean)
    .map(part => {
      if (part.includes('_exists_')) {
        return queryFilterString2Object(
          part,
        ) as unknown as SelectedFilterValueType;
      }
      return part;
    });
};

/**
 * Convert bare _exists_ / -_exists_ strings into the object form
 * expected by the filter state: { "_exists_": ["facetName"] }
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
 * Extract display-friendly labels from filter values.
 * String values pass through; object values (e.g., _exists_ filters) return the key.
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
