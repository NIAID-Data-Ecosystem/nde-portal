import { TagInfo } from '.';
import {
  FilterConfig,
  SelectedFilterType,
  SelectedFilterTypeValue,
} from '../../types';
import { capitalize, has, isPlainObject } from 'lodash';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';

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

const isDateRangeValues = (
  values: (string | SelectedFilterTypeValue)[],
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
  value: string | SelectedFilterTypeValue,
  values: (string | SelectedFilterTypeValue)[],
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

    // Apply config transformations for specific keys
    if (key === '@type' || key === 'conditionsOfAccess') {
      return applyConfigTransform(value, config);
    }
  }

  return String(value);
};

// Checks if a filter represents a date exists/not exists query
const isDateExistsQuery = (
  key: string,
  values: (string | SelectedFilterTypeValue)[],
): boolean => {
  if (key !== DATE_FILTER_KEY || values.length !== 1) {
    return false;
  }

  const value = values[0];
  return (
    isObjectValue(value) &&
    (has(value, EXISTS_PREFIX) || has(value, NOT_EXISTS_PREFIX))
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
  values: (string | SelectedFilterTypeValue)[],
  config?: FilterConfig,
): TagInfo[] => {
  const tags: TagInfo[] = [];

  for (let index = 0; index < values.length; index++) {
    const rawValue = values[index];
    const displayValue = getDisplayValue(key, rawValue, values, index, config);

    if (displayValue) {
      tags.push({
        key: `${key}-${index}`,
        filterKey: key,
        name,
        value: rawValue,
        displayValue,
      });
    }
  }

  return tags;
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

    // Skip date exists/not exists queries (they don't display as tags)
    if (isDateExistsQuery(key, values)) {
      return [];
    }

    // Handle date ranges as a single tag
    if (key === DATE_FILTER_KEY && isDateRangeValues(values)) {
      return [createDateRangeTag(key, name, values)];
    }

    // Handle all other filters
    return createValueTags(key, name, values, config);
  });
};
