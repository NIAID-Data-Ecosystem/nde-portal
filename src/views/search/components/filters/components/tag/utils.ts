import { TagInfo } from '.';

import { capitalize, has, isPlainObject } from 'lodash';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import {
  FilterConfig,
  SelectedFilterType,
  SelectedFilterValueType,
} from '../../types';
import {
  APIResourceType,
  formatAPIResourceTypeForDisplay,
} from 'src/utils/formatting/formatResourceType';
import { OR_FILTER_KEY } from '../../utils/query-string';

// Constants
const DISPLAY_NAME_SEPARATOR = ' | ';
const DATE_FILTER_KEY = 'date';
const EXISTS_PREFIX = '_exists_';
const NOT_EXISTS_PREFIX = '-_exists_';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

// Type guards
const isStringValue = (value: unknown): value is string =>
  typeof value === 'string';

const isObjectValue = (value: unknown): value is Record<string, unknown> =>
  isPlainObject(value);

const coerceTagValues = (values: unknown): SelectedFilterValueType[] => {
  if (Array.isArray(values)) {
    return values;
  }

  if (typeof values === 'string') {
    return values ? [values] : [];
  }

  if (isObjectValue(values)) {
    return [values as { [key: string]: string[] }];
  }

  return [];
};

const isDateRangeValues = (
  values: SelectedFilterValueType[],
): values is [string, string] =>
  values.length === 2 && isStringValue(values[0]) && isStringValue(values[1]);

// Helper Functions

// Formats a display name with common and scientific names
const formatDisplayName = (value: string): string => {
  if (!value.includes(DISPLAY_NAME_SEPARATOR)) {
    return value;
  }

  const [commonName, scientificName] = value.split(DISPLAY_NAME_SEPARATOR);
  return `${capitalize(scientificName)} (${capitalize(commonName)})`;
};

// Formats a date range for display
const formatDateRange = (startDate: string, endDate: string): string =>
  `From ${startDate} to ${endDate}`;

// Applies custom label transformation from filter config
const applyConfigTransform = (value: string, config?: FilterConfig): string => {
  if (!config?.transformData) {
    return value;
  }

  return config.transformData({ term: value, count: 0 })?.label || value;
};

// Controls how a selected filter is displayed in the tag
const getDisplayValue = (
  key: string,
  value: string | SelectedFilterValueType,
  values: SelectedFilterValueType[],
  index: number,
  config?: FilterConfig,
): string => {
  // Handle object values (exists/not exists queries)
  if (isObjectValue(value)) {
    const objectKey = Object.keys(value)[0];
    return objectKey?.startsWith(NOT_EXISTS_PREFIX) ? 'None' : 'Any';
  }

  // Handle date ranges (skip subsequent values in range)

  if (key === DATE_FILTER_KEY && isDateRangeValues(values)) {
    return index === 0 ? formatDateRange(values[0], values[1]) : '';
  }

  // Handle string values
  if (isStringValue(value)) {
    // Format display names
    if (key.includes('displayName')) {
      return formatDisplayName(value);
    }
    if (config?.transformData) {
      return applyConfigTransform(value, config);
    }
    // Apply type formatting for @type filters
    if (key === '@type') {
      return formatAPIResourceTypeForDisplay(value as APIResourceType);
    }
  }

  return String(value);
};

// Checks if a filter represents a date exists/not exists query
const stripDateExistsQuery = (values: SelectedFilterValueType[]) => {
  return values.filter(
    value =>
      !isObjectValue(value) &&
      !has(value, EXISTS_PREFIX) &&
      !has(value, NOT_EXISTS_PREFIX),
  );
};

// Creates a tag info object for a date range
const createDateRangeTag = (
  key: string,
  name: string,
  values: [string, string],
): TagInfo => ({
  key: `${key}-range`,
  filterKey: key,
  name,
  value: values,
  displayValue: formatDateRange(values[0], values[1]),
});

// Creates tag info objects for individual filter values
const createValueTags = (
  key: string,
  name: string,
  values: unknown,
  config?: FilterConfig,
): TagInfo[] => {
  const tagValues = coerceTagValues(values);
  if (tagValues.length === 0) {
    return [];
  }

  return tagValues
    .map((rawValue, index): TagInfo | null => {
      const displayValue = getDisplayValue(
        key,
        rawValue,
        tagValues,
        index,
        config,
      );

      if (!displayValue) {
        return null;
      }

      return {
        key: `${key}-${index}`,
        filterKey: key,
        name,
        value: rawValue,
        displayValue,
      };
    })
    .filter((tag): tag is TagInfo => tag !== null);
};

// Creates a single tag for a cross-field OR group (`OR_FILTER_KEY`). Labels it
// from the first entry that maps to a known facet (falling back to the first
// entry), so e.g. `[{ 'includedInDataCatalog.name': ['acd@NIAID'] }, { _id: [..] }]`
// renders as "Sources: acd@NIAID". The whole group is removed as one unit.
const createOrGroupTag = (
  values: SelectedFilterValueType[],
  configMap: Record<string, FilterConfig>,
): TagInfo[] => {
  const entries = values.filter((v): v is { [key: string]: string[] } =>
    isObjectValue(v),
  );
  if (entries.length === 0) {
    return [];
  }

  const primary =
    entries.find(entry => {
      const field = Object.keys(entry)[0];
      return Boolean(configMap[field] || schema?.[field]);
    }) ?? entries[0];

  const field = Object.keys(primary)[0];
  const displayValue = String(primary[field]?.[0] ?? '');
  if (!displayValue) {
    return [];
  }

  return [
    {
      key: `${OR_FILTER_KEY}-${field}`,
      filterKey: OR_FILTER_KEY,
      name: generateTagName(field, configMap[field]),
      value: values,
      displayValue,
    },
  ];
};

// Exported functions

// Generates a human-readable name for a filter key
export const generateTagName = (key: string, config?: FilterConfig): string => {
  return config?.name ?? schema?.[key]?.name ?? key;
};

// Generates a flat list of tag metadata objects from selected filters
export const generateTags = (
  selectedFilters: SelectedFilterType,
  configMap: Record<string, FilterConfig>,
): TagInfo[] => {
  return Object.entries(selectedFilters).flatMap(([key, values]) => {
    const config = configMap[key];
    const name = generateTagName(key, config);
    const tagValues = coerceTagValues(values);

    if (tagValues.length === 0) {
      return [];
    }

    // Handle a cross-field OR group as a single tag
    if (key === OR_FILTER_KEY) {
      return createOrGroupTag(tagValues, configMap);
    }

    // Handle date ranges as a single tag
    if (key === DATE_FILTER_KEY) {
      const cleanedDateValues = stripDateExistsQuery(tagValues);

      if (cleanedDateValues?.length === 0) {
        return [];
      }

      if (isDateRangeValues(cleanedDateValues)) {
        return [createDateRangeTag(key, name, cleanedDateValues)];
      }
      // If not a range, fall through to create individual tags
      return createValueTags(key, name, cleanedDateValues, config);
    }

    // Handle all other filters
    return createValueTags(key, name, values, config);
  });
};
